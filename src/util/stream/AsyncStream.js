const StreamInterface = require("./StreamInterface.js");
const Stream = require("./Stream.js");

/**
 * 非同期Stream (LazyAsyncList)
 * @extends {StreamInterface}
 * @class
 */
class AsyncStream extends StreamInterface {
	/**
	 * @param {Iterable | AsyncIterator} source
	 */
	constructor(source) {
		super();
		this._iter = AsyncStream._normalize(source);
		this._pipeline = [];
	}

	/**
	 * AsyncStream化
	 * @template {AsyncStream} T
	 * @this {new (iterable: Iterable | AsyncIterator) => T}
	 * @param {Iterable | AsyncIterator} iterable
	 * @returns {T}
	 * @static
	 */
	static from(iterable) {
		return new AsyncStream(iterable);
	}

	/**
	 * Iterable化
	 * @param {Iterable | AsyncIterator} input
	 * @returns {AsyncIterator}
	 */
	static _normalize(input) {
		if (typeof input[Symbol.asyncIterator] === "function") return input;
		if (typeof input[Symbol.iterator] === "function") {
			return (async function* () {
				for (const x of input) yield x;
			})();
		}
		throw new TypeError("not (Async)Iterable");
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	/**
	 * pipelineに追加
	 * @param {Generator} fn
	 * @returns {this}
	 */
	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	/**
	 * pipelineを圧縮
	 * @returns {this}
	 */
	flattenPipeline() {
		const flattenedFn = this._pipeline.reduceRight(
			(nextFn, currentFn) => {
				return async function* (iterable) {
					yield* currentFn(nextFn(iterable));
				};
			},
			async function* (x) {
				yield* x;
			}
		);
		const flat = new this.constructor([]);
		flat._iter = this._iter;
		flat._pipeline = [flattenedFn];
		return flat;
	}

	/**
	 * 処理を一括関数化
	 * @returns {Function}
	 */
	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	/**
	 * AsyncStreamをマップ
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	map(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) yield await fn(x);
		});
	}

	/**
	 * AsyncStreamをフィルタ
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	filter(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				if (await fn(x)) yield x;
			}
		});
	}

	/**
	 * AsyncStreamを展開
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	flatMap(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				const sub = await fn(x);
				for await (const y of AsyncStream._normalize(sub)) yield y;
			}
		});
	}

	/**
	 * AsyncStreamの重複を排除
	 * @param {Function | Promise} keyFn
	 * @returns {this}
	 */
	distinct(keyFn = (x) => x) {
		return this._use(async function* (iter) {
			const seen = new Set();
			for await (const x of iter) {
				const key = await keyFn(x);
				if (!seen.has(key)) {
					seen.add(key);
					yield x;
				}
			}
		});
	}

	/**
	 * AsyncStreamの要素は変更せずに関数のみを実行
	 * @param {Function} fn
	 * @returns {this}
	 */
	peek(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				fn(x);
				yield x;
			}
		});
	}

	/**
	 * AsyncStreamの要素数を先頭から制限
	 * @param {Number} n
	 * @returns {this}
	 */
	limit(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ < n) yield x;
				else break;
			}
		});
	}

	/**
	 * AsyncStreamの要素数を先頭からスキップ
	 * @param {Number} n
	 * @returns {this}
	 */
	skip(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ >= n) yield x;
			}
		});
	}

	// ==================================================
	// Iterator
	// ==================================================

	/**
	 * Streamをイテレータ化(非同期)
	 * @returns {AsyncIterator}
	 */
	[Symbol.asyncIterator]() {
		let iter = this._iter;
		for (const op of this._pipeline) {
			iter = op(iter);
		}
		return iter[Symbol.asyncIterator]();
	}
	// ==================================================
	// End
	// ==================================================

	/**
	 * AsyncStreamをforEach
	 * @param {Function | Promise} fn
	 * @async
	 */
	async forEach(fn) {
		for await (const x of this) {
			await fn(x);
		}
	}

	/**
	 * AsyncStreamを配列化
	 * @returns {Array}
	 * @async
	 */
	async toArray() {
		const result = [];
		for await (const x of this) {
			result.push(x);
		}
		return result;
	}

	/**
	 * AsyncStreamをreduce
	 * @param {Function | Promise} fn
	 * @param {any} initial
	 * @returns {any}
	 * @async
	 */
	async reduce(fn, initial) {
		let acc = initial;
		for await (const x of this) {
			acc = await fn(acc, x);
		}
		return acc;
	}

	/**
	 * AsyncStreamの要素数を取得
	 * @returns {Number}
	 * @async
	 */
	async count() {
		return await this.reduce((acc) => acc + 1, 0);
	}

	/**
	 * AsyncStreamで条件を満たす要素があるか検査
	 * @param {Function | Promise} fn
	 * @returns {Boolean}
	 * @async
	 */
	async some(fn) {
		for await (const x of this) {
			if (await fn(x)) return true;
		}
		return false;
	}

	/**
	 * Streamで全ての要素が条件を満たすか検査
	 * @param {Function | Promise} fn
	 * @returns {Boolean}
	 * @async
	 */
	async every(fn) {
		for await (const x of this) {
			if (!(await fn(x))) return false;
		}
		return true;
	}

	/**
	 * AsyncStreamから最初の要素を取得
	 * @returns {any}
	 * @async
	 */
	async findFirst() {
		for await (const item of this) return item;
		return undefined;
	}

	/**
	 * Streamから任意の要素を取得
	 * @returns {any}
	 * @async
	 */
	async find() {
		return await this.findFirst();
	}

	/**
	 * Java Collectors 相当
	 * @param {Function} collectorFn
	 * @returns {any}
	 */
	collectWith(collectorFn) {
		return collectorFn(this);
	}

	// ==================================================
	// mapTo
	// ==================================================

	/**
	 * AsyncStreamをStreamに変換
	 * @returns {Stream}
	 * @async
	 */
	async toLazy() {
		const arr = [];
		for await (const item of this) {
			arr.push(item);
		}
		return new Stream(arr);
	}
}

module.exports = AsyncStream;
