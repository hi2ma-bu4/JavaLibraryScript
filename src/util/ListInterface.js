const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Listの基底クラス
 * @template V
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 * @interface
 */
class ListInterface extends JavaLibraryScriptCore {
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

module.exports = Interface.convert(ListInterface, {
	add: { args: [NotEmpty], returns: ListInterface },
	get: { args: [Number], returns: Any },
	set: { args: [Number, NotEmpty], returns: ListInterface },
	remove: { args: [Number], returns: Any },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	toArray: { returns: Array },
});
