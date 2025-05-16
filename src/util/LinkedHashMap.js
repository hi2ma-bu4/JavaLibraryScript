const HashMap = require("./HashMap");

class LinkedHashMap extends HashMap {
	constructor(KeyType, ValueType, { accessOrder = false } = {}) {
		super(KeyType, ValueType);
		this._accessOrder = accessOrder;
	}

	put(key, value) {
		this._checkKey(key);
		this._checkValue(value);

		if (this._accessOrder && this._data.has(key)) {
			this._data.delete(key); // 移動のため一度削除
		}
		super.put(key, value);
	}

	get(key) {
		const value = super.get(key);
		if (this._accessOrder && value !== undefined) {
			this._data.delete(key); // 移動のため一度削除
			this._data.set(key, value);
		}
		return value;
	}
}

module.exports = LinkedHashMap;
