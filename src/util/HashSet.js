const SetInterface = require("./SetInterface");
const TypeChecker = require("../libs/TypeChecker");
const StreamChecker = require("./stream/StreamChecker");
const Stream = require("./stream/Stream.js");

/**
 * 型チェック機能のついたSet
 * @template V
 * @extends {SetInterface<V>}
 * @class
 */
class HashSet extends SetInterface {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super(ValueType);
	}

	// ==================================================
	// 基本操作(override)
	// ==================================================

	/**
	 * 値を追加する
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	add(value) {
		this._checkValue(value);
		return super.add(value);
	}

	/**
	 * 値を一括で追加する
	 * @param {Iterable<V>} collection
	 * @returns {this}
	 * @throws {TypeError}
	 */
	addAll(collection) {
		for (const item of collection) {
			this.add(item);
		}
		return this;
	}

	/**
	 * 値の存在を確認
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	has(value) {
		this._checkValue(value);
		return super.has(value);
	}
	/**
	 * 値の存在を確認
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	contains(value) {
		return this.has(value);
	}

	/**
	 * 全ての値の存在を確認
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	containsAll(collection) {
		for (const item of collection) {
			if (!this.has(item)) return false;
		}
		return true;
	}

	/**
	 * 値を削除する
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	delete(value) {
		this._checkValue(value);
		return super.delete(value);
	}
	/**
	 * 値を削除する
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	remove(value) {
		return this.delete(value);
	}

	/**
	 * 全ての値を削除する
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	removeAll(collection) {
		let modified = false;
		for (const item of collection) {
			modified = this.delete(item) || modified;
		}
		return modified;
	}

	/**
	 * 含まれない要素を全削除する
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	retainAll(collection) {
		const otherSet = new Set(collection);
		let modified = false;
		for (const item of this) {
			if (!otherSet.has(item)) {
				this.delete(item);
				modified = true;
			}
		}
		return modified;
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * 等価判定を行う
	 * @param {this} otherSet
	 * @returns {boolean}
	 */
	equals(otherSet) {
		if (!(otherSet instanceof Set) || this.size !== otherSet.size) return false;
		for (const item of this) {
			if (!otherSet.has(item)) return false;
		}
		return true;
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} [thisArg]
	 */
	forEach(callback, thisArg) {
		for (const item of this) {
			callback.call(thisArg, item, item, this);
		}
	}

	// ==================================================
	// Stream
	// ==================================================

	/**
	 * Streamを返却する
	 * @returns {Stream<V>}
	 */
	stream() {
		return StreamChecker.typeToStream(this._ValueType).from(this.values(), this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 配列に変換する
	 * @returns {V[]}
	 */
	toArray() {
		return Array.from(this);
	}

	/**
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._ValueType)}>(size=${this.size})`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.values();
	}
}

module.exports = HashSet;
