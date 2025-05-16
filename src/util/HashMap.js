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

	putAll(map) {
		for (const [k, v] of map.entries()) {
			this.set(k, v);
		}
	}

	get(key) {
		this._checkKey(key);
		if (!this._map.has(key)) return undefined;
		return this._data.get(key);
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	containsValue(value) {
		for (const v of this.values()) {
			if (v === value) return true;
		}
		return false;
	}

	remove(key) {
		this._checkKey(key);
		return this._data.delete(key);
	}

	size() {
		return this._data.size;
	}

	isEmpty() {
		return this._data.size === 0;
	}

	clear() {
		this._data.clear();
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	containsValue(value) {
		for (const val of this._data.values()) {
			if (val === value) return true;
		}
		return false;
	}

	keys() {
		return Array.from(this._data.keys());
	}

	values() {
		return Array.from(this._data.values());
	}

	entrySet() {
		return Array.from(this._data.entries());
	}

	equals(otherMap) {
		if (this.size !== otherMap.size) return false;
		for (const [k, v] of this.entries()) {
			if (!otherMap.has(k) || otherMap.get(k) !== v) return false;
		}
		return true;
	}

	forEach(callback, thisArg) {
		for (const [key, value] of this._data.entries()) {
			callback.call(thisArg, value, key, this);
		}
	}

	toString() {
		const data = Array.from(this.entries())
			.map(([k, v]) => `${k}=${v}`)
			.join(", ");
		return `{ ${data} }`;
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}
}

module.exports = HashMap;
