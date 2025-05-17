const Stream = require("./Stream.js");
const Interface = require("../../base/Interface");

/**
 * 数値専用Stream (LazyList)
 * @class
 */
class NumberStream extends Stream {
	/**
	 * @param {Iterable} source
	 */
	constructor(source) {
		super(source);

		this.mapToNumber = undefined;
	}

	/**
	 * 合計
	 * @returns {Number}
	 */
	sum() {
		let total = 0;
		for (const num of this) {
			total += num;
		}
		return total;
	}

	/**
	 * 平均
	 * @returns {Number}
	 */
	average() {
		let total = 0;
		let count = 0;
		for (const num of this) {
			total += num;
			count++;
		}
		return count === 0 ? NaN : total / count;
	}

	/**
	 * 最小値
	 * @returns {Number | null}
	 */
	min() {
		let min = Infinity;
		for (const num of this) {
			if (num < min) min = num;
		}
		return min === Infinity ? null : min;
	}

	/**
	 * 最大値
	 * @returns {Number | null}
	 */
	max() {
		let max = -Infinity;
		for (const num of this) {
			if (num > max) max = num;
		}
		return max === -Infinity ? null : max;
	}
}

Interface.applyTo(NumberStream);

module.exports = NumberStream;
