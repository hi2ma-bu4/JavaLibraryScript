const StreamInterface = require("./StreamInterface.js");
const Interface = require("../../base/Interface");
const TypeChecker = require("../../libs/TypeChecker");

const Any = TypeChecker.Any;

let NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (NumberStream) return;
	NumberStream = require("./NumberStream.js");
	StringStream = require("./StringStream.js");
	EntryStream = require("./EntryStream.js");
	AsyncStream = require("./AsyncStream.js");
}

/**
 * Streamオブジェクト(LazyList)
 * @class
 */
class Stream extends StreamInterface {
	/**
	 * @param {Iterable} source
	 */
	constructor(source) {
		super();
		this._iter = source[Symbol.iterator]();
		this._pipeline = [];

		init();
	}

	/**
	 * Stream化
	 * @param {Iterable} iterable
	 * @returns {Stream}
	 * @static
	 */
	static from(iterable) {
		return new this(iterable);
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	/**
	 * pipelineに追加
	 * @param {Generator} fn
	 * @returns {Stream}
	 */
	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	/**
	 * 他Streamに変換
	 * @param {Function} construct
	 * @param {Generator} fn
	 * @param {...any} args
	 * @returns {Stream}
	 */
	_convertToX(construct, fn, ...args) {
		const newStream = new construct([], ...args);
		newStream._iter = this._iter;
		newStream._pipeline = [...this._pipeline];
		if (fn) newStream._pipeline.push(fn);
		return newStream;
	}

	/**
	 * pipelineを圧縮
	 * @returns {Stream}
	 */
	flattenPipeline() {
		const flattenedFn = this._pipeline.reduceRight(
			(nextFn, currentFn) => {
				return function* (iterable) {
					yield* currentFn(nextFn(iterable));
				};
			},
			(x) => x
		);

		const flat = new this.constructor([]); // 継承クラス対応
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
	 * Streamをマップ
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	map(fn) {
		return this._use(function* (iter) {
			for (const item of iter) yield fn(item);
		});
	}

	/**
	 * Streamをフィルタ
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	filter(fn) {
		return this._use(function* (iter) {
			for (const item of iter) if (fn(item)) yield item;
		});
	}

	/**
	 * Streamを展開
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	flatMap(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				const sub = fn(item);
				yield* sub instanceof StreamInterface ? sub : sub[Symbol.iterator]();
			}
		});
	}

	/**
	 * Streamの重複を排除
	 * @param {Function} keyFn
	 * @returns {Stream}
	 */
	distinct(keyFn = JSON.stringify.bind(JSON)) {
		return this._use(function* (iter) {
			const seen = new Set();
			for (const item of iter) {
				const key = keyFn(item);
				if (!seen.has(key)) {
					seen.add(key);
					yield item;
				}
			}
		});
	}

	/**
	 * Streamをソート
	 * @param {Function} compareFn
	 * @returns {Stream}
	 */
	sorted(compareFn = (a, b) => (a > b ? 1 : a < b ? -1 : 0)) {
		return this._use(function* (iter) {
			const arr = [...iter].sort(compareFn);
			yield* arr;
		});
	}

	/**
	 * Streamの要素は変更せずに関数のみを実行
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	peek(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				fn(item);
				yield item;
			}
		});
	}

	/**
	 * Streamの要素数を先頭から制限
	 * @param {Number} n
	 * @returns {Stream}
	 */
	limit(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ >= n) break;
				yield item;
			}
		});
	}

	/**
	 * Streamの要素数を先頭からスキップ
	 * @param {Number} n
	 * @returns {Stream}
	 */
	skip(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ < n) continue;
				yield item;
			}
		});
	}

	/**
	 * Streamを分割
	 * @param {Number} size
	 * @returns {Stream}
	 */
	chunk(size) {
		return this._use(function* (iter) {
			let buf = [];
			for (const item of iter) {
				buf.push(item);
				if (buf.length === size) {
					yield buf;
					buf = [];
				}
			}
			if (buf.length) yield buf;
		});
	}

	/**
	 * Streamをスライド分割
	 * @param {Number} size
	 * @param {Number} step
	 * @returns {Stream}
	 */
	windowed(size, step = size) {
		return this._use(function* (iter) {
			const buffer = [];
			for (const item of iter) {
				buffer.push(item);
				if (buffer.length === size) {
					yield buffer.slice();
					buffer.splice(0, step); // スライド
				}
			}
		});
	}

	// ==================================================
	// Iterator
	// ==================================================

	/**
	 * Streamをイテレータ化
	 * @returns {Iterator}
	 */
	[Symbol.iterator]() {
		return this._pipeline.reduce((iter, fn) => fn(iter), this._iter);
	}

	/**
	 * Streamをイテレータ化(非同期)
	 * @returns {AsyncIterator}
	 */
	[Symbol.asyncIterator]() {
		let iter = this._pipeline.reduce((i, fn) => fn(i), this._iter);
		return {
			async next() {
				return Promise.resolve(iter.next());
			},
		};
	}

	// ==================================================
	// End
	// ==================================================

	/**
	 * StreamをforEach
	 * @param {Function} fn
	 */
	forEach(fn) {
		for (const item of this) fn(item);
	}

	/**
	 * Streamを配列化
	 * @returns {Array}
	 */
	toArray() {
		return Array.from(this);
	}

	/**
	 * Streamをreduce
	 * @param {Function} fn
	 * @param {any} initial
	 * @returns {any}
	 */
	reduce(fn, initial) {
		let acc = initial;
		for (const item of this) {
			acc = fn(acc, item);
		}
		return acc;
	}

	/**
	 * Streamの要素数を取得
	 * @returns {Number}
	 */
	count() {
		let c = 0;
		for (const _ of this) c++;
		return c;
	}

	/**
	 * Streamで条件を満たす要素があるか検査
	 * @param {Function} fn
	 * @returns {Boolean}
	 */
	some(fn) {
		for (const item of this) {
			if (fn(item)) return true;
		}
		return false;
	}

	/**
	 * Streamで全ての要素が条件を満たすか検査
	 * @param {Function} fn
	 * @returns {Boolean}
	 */
	every(fn) {
		for (const item of this) {
			if (!fn(item)) return false;
		}
		return true;
	}

	/**
	 * Streamから最初の要素を取得
	 * @returns {any}
	 */
	findFirst() {
		for (const item of this) return item;
		return undefined;
	}

	/**
	 * Streamから任意の要素を取得
	 * @returns {any}
	 */
	findAny() {
		return this.findFirst(); // 同義（非並列）
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
	 * StreamをNumberStreamに変換
	 * @param {Function} fn
	 * @returns {NumberStream}
	 */
	mapToNumber(fn) {
		return this._convertToX(NumberStream, function* (iter) {
			for (const item of iter) {
				const mapped = fn(item);
				if (typeof mapped !== "number") {
					throw new TypeError(`mapToNumber() must return number. Got ${typeof mapped}`);
				}
				yield mapped;
			}
		});
	}

	/**
	 * StreamをStringStreamに変換
	 * @param {Function} fn
	 * @returns {StringStream}
	 */
	mapToString(fn) {
		return this._convertToX(StringStream, function* (iter) {
			for (const item of iter) {
				const mapped = fn(item);
				if (typeof mapped !== "string") {
					throw new TypeError(`mapToString() must return string. Got ${typeof mapped}`);
				}
				yield mapped;
			}
		});
	}

	/**
	 * StreamをEntryStreamに変換
	 * @param {Function} fn
	 * @returns {EntryStream}
	 */
	mapToEntry(fn) {
		return this._convertToX(
			EntryStream,
			function* (iter) {
				for (const item of iter) {
					const entry = fn(item);
					if (!Array.isArray(entry) || entry.length !== 2) {
						throw new TypeError(`mapToEntry() must return [key, value] pair. Got: ${entry}`);
					}
					yield entry;
				}
			},
			Any,
			Any
		);
	}

	/**
	 * StreamをAsyncStreamに変換
	 * @param {Function} fn
	 * @returns {AsyncStream}
	 */
	mapToAsync(fn) {
		const input = this.flattenPipeline();
		const sourceIterable = input._pipeline[0](input._iter); // 実行（同期 generator）

		// AsyncStream に渡す非同期イテレータを構築
		const asyncIterable = (async function* () {
			for (const item of sourceIterable) {
				yield await fn(item);
			}
		})();

		return new AsyncStream(asyncIterable);
	}
}

module.exports = Stream;
