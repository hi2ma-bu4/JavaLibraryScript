const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Mapの基底クラス
 */
class BaseMap extends Map {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super();
		if (new.target === BaseMap) {
			throw new TypeError("Cannot instantiate abstract class BaseMap");
		}

		this._KeyType = KeyType;
		this._ValueType = ValueType;
	}

	/**
	 * Keyの型をチェックする
	 * @param {any} key
	 * @throws {TypeError}
	 */
	_checkKey(key) {
		if (!TypeChecker.matchType(key, this._KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${this._KeyType.name} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	/**
	 * Valueの型をチェックする
	 * @param {any} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${this._ValueType.name} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}
}

Interface.applyTo(BaseMap, {
	set: { args: [NotEmpty, NotEmpty], returns: Any },
	put: { args: [NotEmpty, NotEmpty], returns: Any },
	get: { args: [NotEmpty], returns: Any },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	containsKey: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});

module.exports = BaseMap;
