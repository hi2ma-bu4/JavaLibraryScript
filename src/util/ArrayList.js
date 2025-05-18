const ListInterface = require("./ListInterface.js");
const TypeChecker = require("../libs/TypeChecker.js");
const StreamChecker = require("./stream/StreamChecker.js");
const Stream = require("./stream/Stream.js");

/**
 * 型チェック機能のついたList
 * @template V
 * @extends {ListInterface<V>}
 * @class
 */
class ArrayList extends ListInterface {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super(ValueType);
		this._list = [];
	}

	// ==================================================
	// 基本操作
	// ==================================================

	/**
	 * 要素を追加する
	 * @param {V} item
	 * @returns {this}
	 * @throws {TypeError}
	 */
	add(item) {
		this._checkValue(item);
		this._list.push(item);
		return this;
	}

	/**
	 * 指定したインデックスの要素を取得する
	 * @param {Number} index
	 * @returns {V}
	 */
	get(index) {
		return this._list[index];
	}

	/**
	 * 指定したインデックスの要素を設定する
	 * @param {Number} index
	 * @param {V} item
	 * @returns {this}
	 * @throws {TypeError}
	 */
	set(index, item) {
		this._checkValue(item);
		this._list[index] = item;
		return this;
	}

	/**
	 * 指定したインデックスの要素を削除する
	 * @param {Number} index
	 * @returns {V}
	 */
	remove(index) {
		return this._list.splice(index, 1)[0];
	}

	/**
	 * 要素数を返却する
	 * @returns {Number}
	 * @readonly
	 */
	get size() {
		return this._list.length;
	}

	/**
	 * 全要素を削除する
	 */
	clear() {
		this._list.length = 0;
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * EnumのIteratorを返却する
	 * @returns {ArrayIterator<V>}
	 */
	values() {
		return this._list.values();
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} [thisArg]
	 */
	forEach(callback, thisArg) {
		for (const item of this._list) {
			callback.call(thisArg, item, item, this._list);
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
		return StreamChecker.typeToStream(this._ValueType).from(this._list, this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 配列に変換する
	 * @returns {V[]}
	 */
	toArray() {
		return this._list.slice();
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

module.exports = ArrayList;
