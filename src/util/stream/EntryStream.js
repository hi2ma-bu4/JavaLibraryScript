const Stream = require("./Stream.js");
const Interface = require("../../base/Interface");
const StreamChecker = require("./StreamChecker");

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap.js");
}

/**
 * Entry専用Stream (LazyList)
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
	 * @returns {Stream}
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
	 * @returns {Stream}
	 */
	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	/**
	 * EntryStreamの値をマップ
	 * @param {Function} fn
	 * @returns {Stream}
	 */
	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}

	/**
	 * EntryStreamをHashMapに変換する
	 * @param {Function} [KeyType]
	 * @param {Function} [ValueType]
	 * @returns {HashMap}
	 */
	toHashMap(KeyType = this._KeyType, ValueType = this._ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}
}

Interface.applyTo(EntryStream);

module.exports = EntryStream;
