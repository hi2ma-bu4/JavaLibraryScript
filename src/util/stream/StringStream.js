const Stream = require("./Stream.js");

class StringStream extends Stream {
	constructor(source) {
		super(source);

		this.mapToString = undefined;
	}

	join(separator = "") {
		return Array.from(this).join(separator);
	}

	concatAll() {
		return this.join("");
	}

	longest() {
		let max = "";
		for (const str of this) {
			if (typeof str !== "string") throw new TypeError("All elements must be strings");
			if (str.length > max.length) max = str;
		}
		return max || undefined;
	}

	shortest() {
		let min = null;
		for (const str of this) {
			if (typeof str !== "string") throw new TypeError("All elements must be strings");
			if (min === null || str.length < min.length) min = str;
		}
		return min || undefined;
	}
}

module.exports = StringStream;
