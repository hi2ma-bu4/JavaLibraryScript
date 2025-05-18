const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Setの基底クラス
 * @class
 * @abstract
 * @interface
 */
class SetInterface extends Set {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super();
		this._ValueType = ValueType;
	}

	/**
	 * Valueの型をチェックする
	 * @param {any} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${TypeChecker.typeNames(this._ValueType)} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}
}

module.exports = Interface.convert(SetInterface, {
	set: { args: [NotEmpty, NotEmpty], returns: Any },
	put: { args: [NotEmpty, NotEmpty], returns: Any },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});
