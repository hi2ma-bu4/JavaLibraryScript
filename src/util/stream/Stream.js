const StreamInterface = require("./StreamInterface.js");

let NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (NumberStream) return;
	NumberStream = require("./NumberStream.js");
	StringStream = require("./StringStream.js");
	EntryStream = require("./EntryStream.js");
	AsyncStream = require("./AsyncStream.js");
}

class Stream extends StreamInterface {
	constructor(source) {
		super();
		this._iter = source[Symbol.iterator]();
		this._pipeline = [];

		init();
	}

	static from(iterable) {
		return new this(iterable);
	}

	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	_convertToX(construct, fn) {
		const newStream = new construct([]);
		newStream._iter = this._iter;
		newStream._pipeline = [...this._pipeline];
		if (fn) newStream._pipeline.push(fn);
		return newStream;
	}

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

	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	map(fn) {
		return this._use(function* (iter) {
			for (const item of iter) yield fn(item);
		});
	}

	filter(fn) {
		return this._use(function* (iter) {
			for (const item of iter) if (fn(item)) yield item;
		});
	}

	flatMap(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				const sub = fn(item);
				yield* sub instanceof StreamInterface ? sub : sub[Symbol.iterator]();
			}
		});
	}

	distinct() {
		return this._use(function* (iter) {
			const seen = new Set();
			for (const item of iter) {
				const key = JSON.stringify(item);
				if (!seen.has(key)) {
					seen.add(key);
					yield item;
				}
			}
		});
	}

	sorted(compareFn = (a, b) => (a > b ? 1 : a < b ? -1 : 0)) {
		return this._use(function* (iter) {
			const arr = [...iter].sort(compareFn);
			yield* arr;
		});
	}

	peek(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				fn(item);
				yield item;
			}
		});
	}

	limit(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ >= n) break;
				yield item;
			}
		});
	}

	skip(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ < n) continue;
				yield item;
			}
		});
	}

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

	[Symbol.iterator]() {
		return this._pipeline.reduce((iter, fn) => fn(iter), this._iter);
	}

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

	forEach(fn) {
		for (const item of this) fn(item);
	}

	toArray() {
		return Array.from(this);
	}

	reduce(fn, initial) {
		let acc = initial;
		for (const item of this) {
			acc = fn(acc, item);
		}
		return acc;
	}

	count() {
		let c = 0;
		for (const _ of this) c++;
		return c;
	}

	anyMatch(fn) {
		for (const item of this) {
			if (fn(item)) return true;
		}
		return false;
	}

	allMatch(fn) {
		for (const item of this) {
			if (!fn(item)) return false;
		}
		return true;
	}

	noneMatch(fn) {
		for (const item of this) {
			if (fn(item)) return false;
		}
		return true;
	}

	findFirst() {
		for (const item of this) return item;
		return undefined;
	}

	findAny() {
		return this.findFirst(); // 同義（非並列）
	}

	// Java Collectors 相当
	collectWith(collectorFn) {
		return collectorFn(this);
	}

	// ==================================================
	// mapTo
	// ==================================================

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

	mapToEntry(fn) {
		return this._convertToX(EntryStream, function* (iter) {
			for (const item of iter) {
				const entry = fn(item);
				if (!Array.isArray(entry) || entry.length !== 2) {
					throw new TypeError(`mapToEntry() must return [key, value] pair. Got: ${entry}`);
				}
				yield entry;
			}
		});
	}

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
