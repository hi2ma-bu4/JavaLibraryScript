const StreamInterface = require("./StreamInterface.js");
const Stream = require("./Stream.js");

class AsyncStream extends StreamInterface {
	constructor(source) {
		super();
		this._iter = AsyncStream._normalize(source);
		this._pipeline = [];
	}

	static from(iterable) {
		return new AsyncStream(iterable);
	}

	static _normalize(input) {
		if (typeof input[Symbol.asyncIterator] === "function") return input;
		if (typeof input[Symbol.iterator] === "function") {
			return (async function* () {
				for (const x of input) yield x;
			})();
		}
		throw new TypeError("not (Async)Iterable");
	}

	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

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

	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	map(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) yield await fn(x);
		});
	}

	filter(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				if (await fn(x)) yield x;
			}
		});
	}

	flatMap(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				const sub = await fn(x);
				for await (const y of AsyncStream._normalize(sub)) yield y;
			}
		});
	}

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

	limit(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ < n) yield x;
				else break;
			}
		});
	}

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

	async forEach(fn) {
		for await (const x of this) {
			await fn(x);
		}
	}

	async toArray() {
		const result = [];
		for await (const x of this) {
			result.push(x);
		}
		return result;
	}

	async reduce(fn, init) {
		let acc = init;
		for await (const x of this) {
			acc = await fn(acc, x);
		}
		return acc;
	}

	count() {
		return this.reduce((acc) => acc + 1, 0);
	}

	// ==================================================
	// mapTo
	// ==================================================

	toLazy() {
		return new Promise(async (resolve) => {
			const arr = [];
			for await (const item of this) {
				arr.push(item);
			}
			resolve(new Stream(arr));
		});
	}
}

module.exports = AsyncStream;
