const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

class BaseMap extends Interface {
	static methodTypes = {
		put: { args: [NotEmpty, NotEmpty], returns: NoReturn },
		get: { args: [NotEmpty], returns: Any },
		remove: { args: [NotEmpty], returns: Boolean },
		size: { returns: Number },
		isEmpty: { returns: Boolean },
		clear: { returns: NoReturn },
		containsKey: { args: [NotEmpty], returns: Boolean },
		containsValue: { args: [NotEmpty], returns: Boolean },
		keys: { returns: Array },
		values: { returns: Array },
		entrySet: { returns: Array },
	};

	constructor(KeyType, ValueType) {
		super();
		if (new.target === BaseMap) {
			throw new TypeError("Cannot instantiate abstract class BaseMap");
		}

		this.KeyType = KeyType;
		this.ValueType = ValueType;
	}

	_checkKey(key) {
		if (!TypeChecker.matchType(key, this.KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${this.KeyType.name} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	_checkValue(value) {
		if (!TypeChecker.matchType(value, this.ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${this.ValueType.name} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}
}

module.exports = BaseMap;
