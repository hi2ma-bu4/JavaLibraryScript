const Stream = require("./Stream.js");

class NumberStream extends Stream {
	constructor(source) {
		super(source);

		this.mapToNumber = undefined;
	}

	sum() {
		let total = 0;
		for (const num of this) {
			total += num;
		}
		return total;
	}

	average() {
		let total = 0;
		let count = 0;
		for (const num of this) {
			total += num;
			count++;
		}
		return count === 0 ? NaN : total / count;
	}

	min() {
		let min = Infinity;
		for (const num of this) {
			if (num < min) min = num;
		}
		return min === Infinity ? undefined : min;
	}

	max() {
		let max = -Infinity;
		for (const num of this) {
			if (num > max) max = num;
		}
		return max === -Infinity ? undefined : max;
	}
}

module.exports = NumberStream;
