const Stream = require("./Stream");
const StreamChecker = require("./StreamChecker");
const TypeChecker = require("../../libs/TypeChecker");

/** @typedef {import("../HashMap.js")} HashMapType */

const Any = TypeChecker.Any;

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap");
}

/**
 * Entry専用Stream (LazyList)
 * @template K, V
 * @extends {Stream<V>}
 * @class
 */
class EntryStream extends Stream {
	/**
	 * @param {Iterable<[K, V]>} source
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(source, KeyType, ValueType) {
		super(source, ValueType);

		this.mapToEntry = undefined;
		this._KeyType = KeyType || Any;
	}

	/**
	 * Stream化
	 * @template {EntryStream} T
	 * @this {new (Iterable, Function, Function) => T}
	 * @param {Iterable} iterable
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 * @returns {T}
	 * @overload
	 * @static
	 */
	static from(iterable, KeyType, ValueType) {
		return new this(iterable, KeyType, ValueType);
	}

	/**
	 * EntryStreamからキーのStreamを返却
	 * @returns {Stream<K>}
	 */
	keys() {
		return this._convertToX(StreamChecker.typeToStream(this._KeyType)).map(([k, _]) => k);
	}

	/**
	 * EntryStreamから値のStreamを返却
	 * @returns {Stream<V>}
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

	// ==================================================
	// to
	// ==================================================

	/**
	 * EntryStreamをHashMapに変換する
	 * @param {Function} [KeyType]
	 * @param {Function} [ValueType]
	 * @returns {HashMapType}
	 */
	toHashMap(KeyType = this._KeyType, ValueType = this._ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}

	/**
	 * 文字列に変換する
	 * @returns {String}
	 * @override
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._KeyType)}, ${TypeChecker.typeNames(this._ValueType)}>`;
	}
}

module.exports = EntryStream;
