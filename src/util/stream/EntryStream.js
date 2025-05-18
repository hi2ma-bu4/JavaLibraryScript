const Stream = require("./Stream.js");
const StreamChecker = require("./StreamChecker");

/** @typedef {import("../HashMap.js")} HashMapType */

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap.js");
}

/**
 * Entry専用Stream (LazyList)
 * @template K, V
 * @extends {Stream}
 * @class
 */
class EntryStream extends Stream {
	/**
	 * @param {Iterable} source
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(source, KeyType, ValueType) {
		super(source);

		this.mapToEntry = undefined;
		this._KeyType = KeyType;
		this._ValueType = ValueType;
	}

	/**
	 * Stream化
	 * @param {Iterable} iterable
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 * @returns {this}
	 * @override
	 * @static
	 */
	static from(iterable, KeyType, ValueType) {
		return new this(iterable, KeyType, ValueType);
	}

	/**
	 * EntryStreamからキーのStreamを返却
	 * @returns {Stream}
	 */
	keys() {
		return this._convertToX(StreamChecker.typeToStream(this._KeyType)).map(([k, _]) => k);
	}

	/**
	 * EntryStreamから値のStreamを返却
	 * @returns {Stream}
	 */
	values() {
		return this._convertToX(StreamChecker.typeToStream(this._ValueType)).map(([_, v]) => v);
	}

	/**
	 * EntryStreamのキーをマップ
	 * @param {Function} fn
	 * @returns {this}
	 */
	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	/**
	 * EntryStreamの値をマップ
	 * @param {Function} fn
	 * @returns {this}
	 */
	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}

	/**
	 * EntryStreamをHashMapに変換する
	 * @param {Function} [KeyType]
	 * @param {Function} [ValueType]
	 * @returns {HashMapType<K, V>}
	 */
	toHashMap(KeyType = this._KeyType, ValueType = this._ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}
}

module.exports = EntryStream;
