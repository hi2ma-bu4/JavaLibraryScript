const BaseMap = require("./BaseMap");
const HashMap = require("./HashMap");

class TreeMap extends HashMap {
	static defaultCompare(a, b) {
		if (typeof a === "number" && typeof b === "number") return a - b;
		if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
		const sa = String(a),
			sb = String(b);
		return sa > sb ? 1 : sa < sb ? -1 : 0;
	}

	static compareByProp(propName, fallback = TreeMap.defaultCompare) {
		return (a, b) => fallback(a[propName], b[propName]);
	}

	constructor(KeyType, ValueType, compareFunction = TreeMap.defaultCompare) {
		super(KeyType, ValueType);
		this._compare = compareFunction;
		this._sortedKeys = null;
	}

	_invalidateSortedKeys() {
		this._sortedKeys = null;
	}

	_getSortedKeys() {
		if (!this._sortedKeys) {
			this._sortedKeys = Array.from(this.keys()).sort(this._compare);
		}
		return this._sortedKeys;
	}

	put(key, value) {
		const existed = this._data.has(key);
		super.put(key, value);
		if (!existed) this._invalidateSortedKeys();
	}

	remove(key) {
		const deleted = super.remove(key);
		if (deleted) this._invalidateSortedKeys();
		return deleted;
	}

	clear() {
		super.clear();
		this._invalidateSortedKeys();
	}

	firstKey() {
		const keys = this._getSortedKeys();
		return keys.length > 0 ? keys[0] : undefined;
	}

	lastKey() {
		const keys = this._getSortedKeys();
		return keys.length > 0 ? keys[keys.length - 1] : undefined;
	}

	ceilingKey(key) {
		return this._getSortedKeys().find((k) => this._compare(k, key) >= 0);
	}

	floorKey(key) {
		const keys = this._getSortedKeys();
		for (let i = keys.length - 1; i >= 0; i--) {
			if (this._compare(keys[i], key) <= 0) return keys[i];
		}
		return undefined;
	}

	headMap(toKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, toKey) >= 0) break;
			map.set(k, this.get(k));
		}
		return map;
	}

	tailMap(fromKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, fromKey) >= 0) map.set(k, this.get(k));
		}
		return map;
	}

	subMap(fromKey, toKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, toKey) >= 0) break;
			if (this._compare(k, fromKey) >= 0) map.set(k, this.get(k));
		}
		return map;
	}
}

module.exports = TreeMap;
