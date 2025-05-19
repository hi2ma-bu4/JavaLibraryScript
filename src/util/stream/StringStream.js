const Stream = require("./Stream");

/**
 * 文字列専用Stream (LazyList)
 * @template V
 * @extends {Stream<V>}
 * @class
 */
class StringStream extends Stream {
	/**
	 * @param {Iterable<V>} source
	 */
	constructor(source) {
		super(source, String);

		this.mapToString = undefined;
	}

	/**
	 * 文字列連結
	 * @param {string} separator
	 * @returns {string}
	 */
	join(separator = " ") {
		return Array.from(this).join(separator);
	}

	/**
	 * 文字列を結合
	 * @returns {string}
	 */
	concatAll() {
		return this.join("");
	}

	/**
	 * 最長の文字列を返す
	 * @returns {string}
	 */
	longest() {
		let max = "";
		for (const str of this) {
			if (str.length > max.length) max = str;
		}
		return max || null;
	}

	/**
	 * 最短の文字列を返す
	 * @returns {string}
	 */
	shortest() {
		let min = null;
		for (const str of this) {
			if (min === null || str.length < min.length) min = str;
		}
		return min || null;
	}
}

module.exports = StringStream;
