const BaseMap = require("./BaseMap");

class HashMap extends BaseMap {
	constructor(KeyType, ValueType) {
		super(KeyType, ValueType);
		this._data = new Map();
	}

	put(key, value) {
		this._checkKey(key);
		this._checkValue(value);
		this._data.set(key, value);
	}

	get(key) {
		this._checkKey(key);
		return this._data.get(key);
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	delete(key) {
		this._checkKey(key);
		return this._data.delete(key);
	}
}

module.exports = HashMap;
