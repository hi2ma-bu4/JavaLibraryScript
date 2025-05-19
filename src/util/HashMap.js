const { TypeChecker } = require("../libs");
const MapInterface = require("./MapInterface");
const EntryStream = require("./stream/EntryStream");

/**
 * 型チェック機能のついたMap
 * @template K, V
 * @extends {MapInterface<K, V>}
 * @class
 */
class HashMap extends MapInterface {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super(KeyType, ValueType);
	}

	// ==================================================
	// 基本操作(override)
	// ==================================================

	/**
	 * データを追加・更新する
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	set(key, value) {
		this._checkKey(key);
		this._checkValue(value);
		return super.set(key, value);
	}
	/**
	 * データを追加・更新する
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	put(key, value) {
		return this.set(key, value);
	}

	/**
	 * データを一括で追加・更新する
	 * @param {Map<K, V>} map
	 * @throws {TypeError}
	 */
	setAll(map) {
		for (const [k, v] of map.entries()) {
			this.set(k, v);
		}
	}
	/**
	 * データを一括で追加・更新する
	 * @param {Map<K, V>} map
	 * @throws {TypeError}
	 */
	putAll(map) {
		return this.setAll(map);
	}

	/**
	 * データを取得する
	 * @param {K} key
	 * @returns {V}
	 * @throws {TypeError}
	 */
	get(key) {
		this._checkKey(key);
		return super.get(key);
	}

	/**
	 * Keyの存在を確認する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	has(key) {
		this._checkKey(key);
		return super.has(key);
	}
	/**
	 * Keyの存在を確認する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	containsKey(key) {
		return this.has(key);
	}

	/**
	 * Valueの存在を確認する
	 * @param {V} value
	 * @returns {boolean}
	 */
	containsValue(value) {
		for (const v of super.values()) {
			if (v === value) return true;
		}
		return false;
	}

	/**
	 * データを削除する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	delete(key) {
		this._checkKey(key);
		return super.delete(key);
	}
	/**
	 * データを削除する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	remove(key) {
		return this.delete(key);
	}

	/**
	 * EntrySetを返却する
	 * @returns {MapIterator<[...[K, V]]>}
	 */
	entrySet() {
		return this.entries();
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * 等価判定を行う
	 * @param {this} otherMap
	 * @returns {boolean}
	 */
	equals(otherMap) {
		if (!(otherMap instanceof Map) || this.size !== otherMap.size) return false;
		for (const [k, v] of this.entries()) {
			if (!otherMap.has(k) || otherMap.get(k) !== v) return false;
		}
		return true;
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} thisArg
	 */
	forEach(callback, thisArg) {
		for (const [key, value] of this.entries()) {
			callback.call(thisArg, value, key, this);
		}
	}

	// ==================================================
	// Stream
	// ==================================================

	/**
	 * Streamを返却する
	 * @returns {EntryStream<K, V>}
	 */
	stream() {
		return EntryStream.from(this.entries(), this._KeyType, this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._KeyType)}, ${TypeChecker.typeNames(this._ValueType)}>(size=${this.size})`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.entries();
	}
}

module.exports = HashMap;
