const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Setの基底クラス
 * @template V
 * @extends {Set<V>}
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
		this._ValueType = ValueType || Any;
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

SetInterface = Interface.convert(SetInterface, {
	add: { args: [NotEmpty], returns: SetInterface },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	contains: { args: [NotEmpty], returns: Boolean },
});

module.exports = SetInterface;
