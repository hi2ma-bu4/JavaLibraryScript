const JavaLibraryScriptCore = require("../sys/JavaLibraryScriptCore");
const Interface = require("../../base/Interface");
const TypeChecker = require("../TypeChecker");

/**
 * キャッシュのオプション
 * @typedef {{ whitelist: string[] | null, blacklist: string[], maxSize: number, policy: CacheMapInterface }} CacheWrapperOptions
 */

/**
 * キャッシュ用のマップ
 * @class
 * @abstract
 * @interface
 */
class CacheMapInterface extends JavaLibraryScriptCore {
	/**
	 * @param {number} limit
	 */
	constructor(limit) {
		super();
		this._limit = limit;
		this._cache = new Map();
	}
}

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;

CacheMapInterface = Interface.convert(CacheMapInterface, {
	get: { args: [String], returns: Any },
	set: { args: [String, Any], returns: NoReturn },
	has: { args: [String], returns: Boolean },
	clear: { returns: NoReturn },
});

/**
 * FIFOキャッシュ
 * @class
 */
class FIFOCache extends CacheMapInterface {
	constructor(limit) {
		super(limit);
	}
	/**
	 * キーに対応する値を返却する
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		return this._cache.get(key);
	}
	/**
	 * キーに対応する値を設定する
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
		const c = this._cache;
		if (!c.has(key) && c.size >= this._limit) {
			const firstKey = c.keys().next().value;
			c.delete(firstKey);
		}
		c.set(key, value);
	}
	/**
	 * キーの存在を確認する
	 * @param {string} key
	 * @returns {boolean}
	 */
	has(key) {
		return this._cache.has(key);
	}
	/**
	 * キャッシュをクリアする
	 */
	clear() {
		this._cache.clear();
	}
}

/**
 * LFUキャッシュ
 * @class
 */
class LFUCache extends CacheMapInterface {
	/**
	 * @param {number} limit
	 */
	constructor(limit) {
		super(limit);
		this._freq = new Map(); // 使用回数追跡
	}
	/**
	 * キーに対応する値を返却する
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		const c = this._cache;
		if (!c.has(key)) return undefined;
		const freq = this.freq;
		freq.set(key, (freq.get(key) || 0) + 1);
		return c.get(key);
	}
	/**
	 * キーに対応する値を設定する
	 * @param {string} key
	 * @param {any} value
	 */
	set(key, value) {
		const c = this._cache;
		const freq = this._freq;
		if (!c.has(key) && c.size >= this._limit) {
			let leastUsedKey = null;
			let minFreq = Infinity;
			for (const k of c.keys()) {
				const f = freq.get(k) || 0;
				if (f < minFreq) {
					minFreq = f;
					leastUsedKey = k;
				}
			}
			if (leastUsedKey !== null) {
				c.delete(leastUsedKey);
				freq.delete(leastUsedKey);
			}
		}

		c.set(key, value);
		freq.set(key, (freq.get(key) || 0) + 1);
	}
	/**
	 * キーの存在を確認する
	 * @param {string} key
	 * @returns {boolean}
	 */
	has(key) {
		return this._cache.has(key);
	}
	/**
	 * キャッシュをクリアする
	 */
	clear() {
		this._cache.clear();
		this._freq.clear();
	}
}

/**
 * LRUキャッシュ
 * @class
 */
class LRUCache extends CacheMapInterface {
	/**
	 * @param {number} limit
	 */
	constructor(limit) {
		super(limit);
	}
	/**
	 * キーに対応する値を返却する
	 * @param {string} key
	 * @returns {any}
	 */
	get(key) {
		const c = this._cache;
		if (!c.has(key)) return undefined;
		const val = c.get(key);
		c.delete(key);
		c.set(key, val);
		return val;
	}
	/**
	 * キーに対応する値を設定する
	 * @param {string} key
	 * @param {any} val
	 */
	set(key, val) {
		const c = this._cache;
		if (c.has(key)) c.delete(key);
		else if (c.size === this._limit) {
			const oldestKey = c.keys().next().value;
			c.delete(oldestKey);
		}
		c.set(key, val);
	}
	/**
	 * キーの存在を確認する
	 * @param {string} key
	 * @returns {boolean}
	 */
	has(key) {
		return this._cache.has(key);
	}
	/**
	 * キャッシュをクリアする
	 */
	clear() {
		this._cache.clear();
	}
}

/**
 * クラスのstaticメゾットをキャッシュするクラス
 * @template T
 * @class
 */
class CacheWrapper extends JavaLibraryScriptCore {
	/**
	 * 先入れ先出し
	 * @type {FIFOCache}
	 * @static
	 * @readonly
	 */
	static POLICY_FIFO = FIFOCache;
	/**
	 * 最頻出順
	 * @type {LFUCache}
	 * @static
	 * @readonly
	 */
	static POLICY_LFU = LFUCache;
	/**
	 * 最近使った順
	 * @type {LRUCache}
	 * @static
	 * @readonly
	 */
	static POLICY_LRU = LRUCache;

	/**
	 * @type {WeakMap<object, number>}
	 * @static
	 * @readonly
	 */
	static _objectIdMap = new WeakMap();
	/**
	 * @type {number}
	 * @static
	 */
	static _objectIdCounter = 1;

	/**
	 * MurmurHash3 32bit ハッシュ関数 (36進数)
	 * @see https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
	 * @param {string} key
	 * @param {number} [seed=0]
	 * @returns {string}
	 * @static
	 */
	static _murmurhash3_32_gc(key, seed = 0) {
		const key_len = key.length;
		let remainder = key_len & 3;
		let bytes = key_len - remainder;
		let h1 = seed;
		let c1 = 0xcc9e2d51;
		let c2 = 0x1b873593;
		let i = 0;

		while (i < bytes) {
			let k1 = (key.charCodeAt(i) & 0xff) | ((key.charCodeAt(i + 1) & 0xff) << 8) | ((key.charCodeAt(i + 2) & 0xff) << 16) | ((key.charCodeAt(i + 3) & 0xff) << 24);
			i += 4;

			k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
			k1 = (k1 << 15) | (k1 >>> 17);
			k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;

			h1 ^= k1;
			h1 = (h1 << 13) | (h1 >>> 19);
			const h1b = ((h1 & 0xffff) * 5 + ((((h1 >>> 16) * 5) & 0xffff) << 16)) & 0xffffffff;
			h1 = (h1b & 0xffff) + 0x6b64 + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16);
		}

		let k1 = 0;
		switch (remainder) {
			case 3:
				k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
			case 2:
				k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
			case 1:
				k1 ^= key.charCodeAt(i) & 0xff;
				k1 = ((k1 & 0xffff) * c1 + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
				k1 = (k1 << 15) | (k1 >>> 17);
				k1 = ((k1 & 0xffff) * c2 + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
				h1 ^= k1;
		}

		h1 ^= key_len;

		// fmix(h1)
		h1 ^= h1 >>> 16;
		h1 = ((h1 & 0xffff) * 0x85ebca6b + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= h1 >>> 13;
		h1 = ((h1 & 0xffff) * 0xc2b2ae35 + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16)) & 0xffffffff;
		h1 ^= h1 >>> 16;

		return (h1 >>> 0).toString(36);
	}

	/**
	 * オブジェクトのIDを返す
	 * @param {Object} obj
	 * @returns {number}
	 * @static
	 */
	static _getObjectId(obj) {
		const oim = this._objectIdMap;
		if (!oim.has(obj)) {
			oim.set(obj, this._objectIdCounter++);
		}
		return oim.get(obj);
	}
	/**
	 * オブジェクトを文字列(key)に変換する
	 * @param {Object} obj
	 * @returns {string}
	 * @static
	 */
	static _toStringObject(obj) {
		if (obj === null) return "null";
		const type = typeof obj;
		if (type === "object" || type === "function") {
			return `#id:${this._getObjectId(obj)}`;
		}
		if (type === "bigint") {
			return `#bigint:${obj.toString()}`;
		}
		return `${type}:${String(obj)}`;
	}
	/**
	 * オブジェクト配列を文字列(key)に変換する
	 * @param {Object[]} args
	 * @returns {string}
	 * @static
	 */
	static _identityHash(args) {
		const key = args.map(this._toStringObject.bind(this)).join("|");
		return this._murmurhash3_32_gc(key);
	}

	static isGeneratorObject(obj) {
		if (!obj || !obj.constructor) return false;
		return obj.constructor.name === "Generator" || obj.constructor.name === "GeneratorFunction" || obj.constructor.name === "AsyncGenerator";
	}

	/**
	 * クラスを変換する
	 * @template T
	 * @param {new (...args: any[]) => T} BaseClass - 変換するクラス
	 * @param {CacheWrapperOptions} options
	 * @static
	 */
	static convert(BaseClass, { whitelist = null, blacklist = [], maxSize = 100, policy = LRUCache } = {}) {
		/** @type {Set<string> | null} */
		whitelist = whitelist && new Set(whitelist);
		/** @type {Set<string>} */
		blacklist = new Set(blacklist);

		if (!policy || !(policy.prototype instanceof CacheMapInterface)) throw new TypeError("policy must be instance of CacheMapInterface");

		// キャッシュを有効化するかどうか
		function _isCacheEnabled(methodName) {
			if (whitelist) return whitelist.has(methodName);
			return !blacklist.has(methodName);
		}

		const methodCaches = new Map();

		/** @type {typeof CacheWrapper} */
		const thisClass = this;

		const Wrapped = class extends BaseClass {
			static __clearCache(methodName) {
				if (methodName) {
					methodCaches.get(methodName)?.clear();
				} else {
					methodCaches.forEach((c) => c.clear());
				}
			}
			static __getCache(methodName) {
				return methodCaches.get(methodName);
			}
			static __getCacheDict() {
				return Object.fromEntries(methodCaches);
			}
			static __getCacheSize() {
				let sum = 0;
				for (const cache of methodCaches.values()) {
					sum += cache._cache.size;
				}
				return sum;
			}
		};

		const staticProps = Object.getOwnPropertyNames(BaseClass).filter((name) => {
			const fn = BaseClass[name];
			const isFunc = typeof fn === "function";
			const isGen = fn?.constructor?.name === "GeneratorFunction" || fn?.constructor?.name === "AsyncGeneratorFunction";
			return isFunc && !isGen && _isCacheEnabled(name);
		});

		for (const name of staticProps) {
			const original = BaseClass[name];
			const cache = new policy(maxSize);
			methodCaches.set(name, cache);

			Wrapped[name] = function (...args) {
				if (args.some(thisClass.isGeneratorObject)) {
					return original.apply(this, args);
				}

				const key = thisClass._identityHash(args);
				if (cache.has(key)) return cache.get(key);
				const result = original.apply(this, args);

				if (thisClass.isGeneratorObject(result)) {
					caches.delete(name);
					Wrapped[name] = original;
					return result;
				}
				cache.set(key, result);
				return result;
			};
		}

		Object.defineProperty(Wrapped, "name", { value: BaseClass.name });

		return Wrapped;
	}
}

module.exports = {
	CacheMapInterface,
	LRUCache,
	FIFOCache,
	LFUCache,
	CacheWrapper,
};
