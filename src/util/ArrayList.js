const IndexProxy = require("../libs/IndexProxy");
const ListInterface = require("./ListInterface");
const TypeChecker = require("../libs/TypeChecker");
const StreamChecker = require("./stream/StreamChecker");
const Stream = require("./stream/Stream");

/**
 * 型チェック機能のついたList
 * @template V
 * @extends {ListInterface<V>}
 * @class
 */
class ArrayList extends ListInterface {
	/**
	 * @param {Function} ValueType
	 * @param {Iterable<V>} [collection]
	 */
	constructor(ValueType, collection) {
		super(ValueType);
		this._list = [];

		if (collection) this.addAll(collection);

		IndexProxy.defineInitData(this);
	}

	/**
	 * instanceof を実装する
	 * @param {any} obj
	 * @returns {boolean}
	 */
	[Symbol.hasInstance](obj) {
		return IndexProxy.hasInstance(this, obj);
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
	 * 等価判定を行う
	 * @param {this} other
	 * @returns {boolean}
	 */
	equals(other) {
		if (!(other instanceof ArrayList) || this.size !== other.size) return false;

		for (let i = 0; i < this.size; i++) {
			if (this._list[i] !== other._list[i]) return false;
		}
		return true;
	}

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

	/**
	 * ソートする
	 * @param {Function} [compareFn]
	 * @returns {this}
	 */
	sort(compareFn = undefined) {
		this._list.sort(compareFn);
	}

	/**
	 * ソートしたStreamを返却する
	 * @param {Function} [compareFn]
	 * @returns {Generator<V>}
	 */
	*sorted(compareFn = undefined) {
		yield* this.toArray().sort(compareFn);
	}

	/**
	 * 指定した範囲の配列を返却する
	 * @param {Number} from
	 * @param {Number} to
	 * @returns {ArrayList<V>}
	 */
	subList(from, to) {
		if (from < 0 || to > this.size || from > to) {
			throw new RangeError(`subList(${from}, ${to}) は無効な範囲です`);
		}
		return new this.constructor(this._ValueType, this._list.slice(from, to));
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

/**
 * 直接参照機能を提供する
 * @type {IndexProxy<ArrayList>}
 * @readonly
 */
const indProxy = new IndexProxy(ArrayList);

/**
 * 配列を返却する
 * @param {Function} ValueType
 * @param {Iterable<V>} [collection]
 * @returns {ArrayList<V>}
 */
function arrayList(ValueType, collection) {
	return indProxy.create(ValueType, collection);
}

module.exports = { ArrayList, arrayList };
