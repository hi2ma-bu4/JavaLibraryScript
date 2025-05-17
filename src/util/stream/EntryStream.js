const Stream = require("./Stream.js");

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap.js");
}

class EntryStream extends Stream {
	constructor(source) {
		super(source);

		this.mapToEntry = undefined;
	}

	keys() {
		return this._convertToX(Stream).map(([k, _]) => k);
	}

	values() {
		return this._convertToX(Stream).map(([_, v]) => v);
	}

	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}

	toHashMap(KeyType, ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}
}

module.exports = EntryStream;
