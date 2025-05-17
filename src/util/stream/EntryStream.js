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

	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}

	toHashMap(KeyType, ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}
}

Interface.applyTo(EntryStream);

module.exports = EntryStream;
