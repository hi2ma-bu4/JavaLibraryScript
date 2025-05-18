const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Mapの基底クラス
 * @template K, V
 * @extends {Map<K, V>}
 * @class
 * @abstract
 * @interface
 */
class MapInterface extends Map {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super();
		this._KeyType = KeyType || Any;
		this._ValueType = ValueType || Any;
	}

	/**
	 * Keyの型をチェックする
	 * @param {K} key
	 * @throws {TypeError}
	 */
	_checkKey(key) {
		if (!TypeChecker.matchType(key, this._KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${TypeChecker.typeNames(this._KeyType)} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	/**
	 * Valueの型をチェックする
	 * @param {V} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${TypeChecker.typeNames(this._ValueType)} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}

	/**
	 * 空かどうかを返却する
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.size === 0;
	}
}

module.exports = Interface.convert(MapInterface, {
	set: { args: [NotEmpty, NotEmpty], returns: MapInterface, abstract: true },
	put: { args: [NotEmpty, NotEmpty], returns: MapInterface },
	get: { args: [NotEmpty], returns: Any, abstract: true },
	delete: { args: [NotEmpty], returns: Boolean, abstract: true },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean, abstract: true },
	containsKey: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});
