const Stream = require("./Stream.js");

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
}

module.exports = EntryStream;
