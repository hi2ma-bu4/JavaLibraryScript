const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");
const { logging } = require("../libs/sys/Logger");

/**
 * BigFloat の設定
 * @class
 */
class BigFloatConfig extends JavaLibraryScriptCore {
	/**
	 * 0に近い方向に切り捨て
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_TRUNCATE = 0;
	/**
	 * 絶対値が小さい方向に切り捨て（ROUND_TRUNCATEと同じ）
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_DOWN = 0;
	/**
	 * 絶対値が大きい方向に切り上げ
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_UP = 1;
	/**
	 * 正の無限大方向に切り上げ
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_CEIL = 2;
	/**
	 * 負の無限大方向に切り捨て
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_FLOOR = 3;
	/**
	 * 四捨五入
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_HALF_UP = 4;
	/**
	 * 五捨六入（5未満切り捨て）
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static ROUND_HALF_DOWN = 5;

	/**
	 * 円周率の計算アルゴリズム
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static PI_MATH_DEFAULT = 0;
	/**
	 * 円周率[Gregory-Leibniz法] (超高速・超低収束)
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static PI_LEIBNIZ = 1;
	/**
	 * 円周率[ニュートン法] (高速・低収束)
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static PI_NEWTON = 2;
	/**
	 * 円周率[Chudnovsky法] (低速・高収束)
	 * @type {number}
	 * @static
	 * @readonly
	 */
	static PI_CHUDNOVSKY = 3;

	/**
	 * @param {Object | BigFloatConfig} [options]
	 * @param {boolean} [options.allowPrecisionMismatch=false] - 精度の不一致を許容する
	 * @param {boolean} [options.mutateResult=false] - 破壊的な計算(自身の上書き)をする (falseは新インスタンスを作成)
	 * @param {number} [options.roundingMode=BigFloatConfig.ROUND_TRUNCATE] - 丸めモード
	 * @param {BigInt} [options.extraPrecision=2n] - 追加の精度
	 * @param {number} [options.piAlgorithm=BigFloatConfig.PI_CHUDNOVSKY] - 円周率算出アルゴリズム
	 * @param {BigInt} [options.trigFuncsMaxSteps=5000n] - 三角関数の最大ステップ数
	 * @param {BigInt} [options.lnMaxSteps=10000n] - 自然対数の最大ステップ数
	 */
	constructor({
		// 設定
		allowPrecisionMismatch = false,
		mutateResult = false,
		roundingMode = BigFloatConfig.ROUND_TRUNCATE,
		extraPrecision = 2n,
		piAlgorithm = BigFloatConfig.PI_CHUDNOVSKY,
		trigFuncsMaxSteps = 5000n,
		lnMaxSteps = 10000n,
	} = {}) {
		super();
		/**
		 * 精度の不一致を許容する
		 * @type {boolean}
		 * @default false
		 */
		this.allowPrecisionMismatch = allowPrecisionMismatch;
		/**
		 * 破壊的な計算(自身の上書き)をする (falseは新インスタンスを作成)
		 * @type {boolean}
		 * @default false
		 */
		this.mutateResult = mutateResult;
		/**
		 * 丸めモード
		 * @type {number}
		 * @default BigFloatConfig.ROUND_TRUNCATE
		 */
		this.roundingMode = roundingMode;
		/**
		 * 追加の精度
		 * @type {BigInt}
		 * @default 2n
		 */
		this.extraPrecision = extraPrecision;
		/**
		 * 円周率算出アルゴリズム
		 * @type {number}
		 * @default BigFloatConfig.PI_CHUDNOVSKY
		 */
		this.piAlgorithm = piAlgorithm;
		/**
		 * 三角関数の最大ステップ数
		 * @type {BigInt}
		 * @default 1000n
		 */
		this.trigFuncsMaxSteps = trigFuncsMaxSteps;
		/**
		 * 自然対数の最大ステップ数
		 * @type {BigInt}
		 * @default 50000n
		 */
		this.lnMaxSteps = lnMaxSteps;
	}

	/**
	 * 設定オブジェクトを複製する
	 * @returns {BigFloatConfig}
	 */
	clone() {
		// shallow copy で新しい設定オブジェクトを返す
		return new BigFloatConfig({ ...this });
	}

	/**
	 * 精度の不一致を許容するかどうかを切り替える
	 */
	toggleMismatch() {
		this.allowPrecisionMismatch = !this.allowPrecisionMismatch;
	}

	/**
	 * 破壊的な計算(自身の上書き)をするかどうかを切り替える
	 */
	toggleMutation() {
		this.mutateResult = !this.mutateResult;
	}
}

/**
 * 大きな浮動小数点数を扱えるクラス
 * @class
 */
class BigFloat extends JavaLibraryScriptCore {
	/**
	 * 最大精度 (Stringの限界)
	 * @type {BigInt}
	 * @static
	 */
	static MAX_PRECISION = 200000000n;

	/**
	 * 設定
	 * @type {BigFloatConfig}
	 * @static
	 */
	static config = new BigFloatConfig();

	/**
	 * @param {string | number | BigInt | BigFloat} value - 初期値
	 * @param {number} [precision=20] - 精度
	 * @throws {Error}
	 */
	constructor(value, precision = 20n) {
		super();

		if (value instanceof BigFloat) {
			this.value = value.value;
			return;
		}

		/** @type {BigInt} */
		this._precision = BigInt(precision);
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		construct._checkPrecision(this._precision);

		if (!value) {
			this.value = 0n;
			return;
		}

		const { intPart, fracPart, sign } = this._parse(value);
		const exPrec = this._precision + construct.config.extraPrecision;
		const frac = fracPart.padEnd(Number(exPrec), "0").slice(0, Number(exPrec));
		const rawValue = BigInt(intPart + frac) * BigInt(sign);

		/** @type {BigInt} */
		this.value = construct._round(rawValue, exPrec, this._precision);
	}

	/**
	 * クラスを複製する (設定複製用)
	 * @returns {BigFloat}
	 * @static
	 */
	static clone() {
		const Parent = this;
		return class extends Parent {
			static config = Parent.config.clone();
			static MAX_PRECISION = Parent.MAX_PRECISION;
		};
	}

	/**
	 * インスタンスを複製する
	 * @returns {BigFloat}
	 */
	clone() {
		const instance = new this.constructor();
		instance._precision = this._precision;
		instance.value = this.value;
		return instance;
	}

	/**
	 * 精度を変更する
	 * @param {number} precision
	 */
	changePrecision(precision) {
		this._precision = BigInt(precision);
		this.value = this.constructor._round(this.value, precision, this._precision);
	}

	/**
	 * 数値に変換する
	 * @returns {number}
	 */
	toNumber() {
		return Number(this.toString());
	}

	/**
	 * 文字列に変換する
	 * @param {number} base - 基数
	 * @param {number} precision - 精度
	 * @returns {string}
	 */
	toString(base = 10, precision = this._precision) {
		if (base < 2 || base > 36) throw new RangeError("Base must be between 2 and 36");
		if (base === 10) return this._normalize(this.value);
		const val = this.value;
		const scale = 10n ** this._precision;

		const digits = "0123456789abcdefghijklmnopqrstuvwxyz";
		const sign = val < 0n ? "-" : "";
		const absVal = val < 0n ? -val : val;

		const intPart = absVal / scale;
		const fracPart = absVal % scale;

		const bigBase = BigInt(base);

		// 整数部
		let intStr = "";
		let intCopy = intPart;
		if (intCopy === 0n) {
			intStr = "0";
		} else {
			while (intCopy > 0n) {
				const digit = intCopy % bigBase;
				intStr = digits[digit] + intStr;
				intCopy /= bigBase;
			}
		}
		if (this._precision === 0n) return `${sign}${intStr}`;
		precision = BigInt(precision);

		// 小数部
		let fracStr = "";
		let frac = fracPart;
		for (let i = 0n; i < precision; i++) {
			frac *= bigBase;
			const digit = frac / scale;
			fracStr += digits[digit];
			frac %= scale;
			if (frac === 0n) break;
		}

		return fracStr.length > 0 ? `${sign}${intStr}.${fracStr}` : `${sign}${intStr}`;
	}

	/**
	 * 文字列を数値に変換する
	 * @param {string} str - 変換する文字列
	 * @param {BigInt} precision - 小数点以下の桁数
	 * @param {number} base - 基数
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static parseFloat(str, precision = 20n, base = 10) {
		if (str instanceof BigFloat) return str.clone();
		if (typeof str !== "string") str = String(str);
		if (base < 2 || base > 36) throw new RangeError("Base must be between 2 and 36");
		if (base === 10) return new this(str, precision);

		const [rawInt, rawFrac = ""] = str.toLowerCase().replace(/^\+/, "").split(".");
		const sign = str.trim().startsWith("-") ? -1n : 1n;
		const digits = "0123456789abcdefghijklmnopqrstuvwxyz";

		const toDigit = (ch) => {
			const d = digits.indexOf(ch);
			if (d < 0 || d >= base) throw new Error(`Invalid digit '${ch}' for base ${base}`);
			return BigInt(d);
		};

		const bigBase = BigInt(base);

		// 整数部分
		let intVal = 0n;
		for (const ch of rawInt.replace(/^[-+]/, "")) {
			intVal = intVal * bigBase + toDigit(ch);
		}

		// 小数部分
		let fracVal = 0n;
		let scale = 1n;
		let basePow = 1n;

		for (let i = 0; i < rawFrac.length && i < precision; i++) {
			basePow *= bigBase;
			fracVal = fracVal * bigBase + toDigit(rawFrac[i]);
			scale = basePow;
		}

		precision = BigInt(precision);

		const scale10 = 10n ** precision;
		const fracScaled = scale === 0n ? 0n : (fracVal * scale10) / scale;
		const total = (intVal * scale10 + fracScaled) * sign;

		return this._makeResult(total, precision);
	}
	/**
	 * 小数点以下の桁数を指定して数値を丸める
	 * @param {number} digits - 小数点以下の桁数
	 * @returns {string}
	 */
	toFixed(digits) {
		const str = this._normalize(this.value);
		const [intPart, fracPart = ""] = str.split(".");
		const d = Math.max(0, Number(digits));
		if (d === 0) return intPart;
		const fracFixed = fracPart.padEnd(d, "0").slice(0, d);
		return `${intPart}.${fracFixed}`;
	}
	/**
	 * 指数表記に変換する
	 * @param {number} digits - 小数点以下の桁数
	 * @returns {string}
	 */
	toExponential(digits = Number(this._precision)) {
		const prec = Number(this._precision);
		if (digits <= 0 || digits > prec) throw new RangeError("Invalid digits (must be between 1 and precision)");
		const isNeg = this.value < 0n;
		const absVal = isNeg ? -this.value : this.value;
		const s = absVal.toString().padStart(prec + 1, "0");

		const intPart = s.slice(0, -prec) || "0";
		const fracPart = s.slice(-prec);
		const raw = `${intPart}${fracPart}`;

		// 最初の非ゼロ桁探す（有効数字先頭）
		const firstDigitIndex = raw.search(/[1-9]/);
		if (firstDigitIndex === -1) return "0e+0";

		const mantissa = raw.slice(firstDigitIndex, firstDigitIndex + digits);
		let decimal;
		if (digits === 1) {
			decimal = raw[firstDigitIndex]; // 有効数字1桁だけ（整数部）
		} else if (mantissa.length === 1) {
			decimal = `${mantissa[0]}.0`;
		} else {
			decimal = `${mantissa[0]}.${mantissa.slice(1)}`;
		}
		const exp = intPart.length - firstDigitIndex - 1;

		const signStr = isNeg ? "-" : "";
		const expStr = exp >= 0 ? `e+${exp}` : `e${exp}`;
		return `${signStr}${decimal}${expStr}`;
	}

	/**
	 * 等しいかどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	compare(other) {
		const [valA, valB] = this._bothRescale(other);
		if (valA < valB) return -1;
		if (valA > valB) return 1;
		return 0;
	}
	/**
	 * 等しいかどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	eq(other) {
		return this.compare(other) === 0;
	}
	/**
	 * 等しいかどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	equals(other) {
		return this.compare(other) === 0;
	}
	/**
	 * 等しくないかどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	ne(other) {
		return this.compare(other) !== 0;
	}
	/**
	 * this < other かどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	lt(other) {
		return this.compare(other) === -1;
	}
	/**
	 * this <= other かどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	lte(other) {
		return this.compare(other) <= 0;
	}
	/**
	 * this > other かどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	gt(other) {
		return this.compare(other) === 1;
	}
	/**
	 * this >= other かどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	gte(other) {
		return this.compare(other) >= 0;
	}
	/**
	 * 0かどうかを判定する
	 * @returns {boolean}
	 */
	isZero() {
		return this.value === 0n;
	}
	/**
	 * 正かどうかを判定する
	 * @returns {boolean}
	 */
	isPositive() {
		return this.value > 0n;
	}
	/**
	 * 負かどうかを判定する
	 * @returns {boolean}
	 */
	isNegative() {
		return this.value < 0n;
	}

	/**
	 * 小数点以下を切り捨て
	 * @returns {BigFloat}
	 */
	floor() {
		const scale = 10n ** this._precision;
		const scaled = this.value / scale;
		const floored = this.value < 0n && this.value % scale !== 0n ? scaled - 1n : scaled;
		return this._makeResult(floored * scale, this._precision);
	}
	/**
	 * 小数点以下を切り上げ
	 * @returns {BigFloat}
	 */
	ceil() {
		const scale = 10n ** this._precision;
		const scaled = this.value / scale;
		const ceiled = this.value > 0n && this.value % scale !== 0n ? scaled + 1n : scaled;
		return this._makeResult(ceiled * scale, this._precision);
	}
	/**
	 * 四捨五入
	 * @returns {BigFloat}
	 */
	round() {
		const scale = 10n ** this._precision;
		const scaled = this.value / scale;
		const remainder = this.value % scale;
		const half = scale / 2n;

		let rounded;
		if (this.value >= 0n) {
			rounded = remainder >= half ? scaled + 1n : scaled;
		} else {
			rounded = -remainder >= half ? scaled - 1n : scaled;
		}

		return this._makeResult(rounded * scale, this._precision);
	}
	/**
	 * 整数部分だけを取得
	 * @returns {BigFloat}
	 */
	trunc() {
		const scale = 10n ** this._precision;
		const truncated = this.value / scale;
		return this._makeResult(truncated * scale, this._precision);
	}
	/**
	 * 逆数を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	reciprocal() {
		if (this.value === 0n) throw new Error("Division by zero");
		const exPr = this.constructor.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const scale = 10n ** totalPr;
		// 1をスケール倍して割る
		const result = (scale * scale) / val;
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * どこまで精度が一致しているかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {number}
	 * @throws {Error}
	 */
	matchingPrecision(other) {
		const [valA, valB, prec] = this._bothRescale(other);
		let diff = valA - valB;
		if (diff === 0n) return prec;
		diff = diff < 0n ? -diff : diff;

		let factor = 10n ** prec;
		let matched = 0n;

		while (matched < prec) {
			factor /= 10n;
			if (diff < factor) {
				matched += 1n;
			} else {
				break;
			}
		}
		return matched;
	}

	/**
	 * 相対差を計算する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {BigInt}
	 * @throws {Error}
	 */
	relativeDiff(other) {
		const [valA, valB, prec] = this._bothRescale(other);

		const absA = valA < 0n ? -valA : valA;
		const absB = valB < 0n ? -valB : valB;
		const diff = valA > valB ? valA - valB : valB - valA;

		const denominator = absA > absB ? absA : absB;
		if (denominator === 0n) return 0n;

		const scale = 10n ** prec;
		return this._makeResult((diff * scale) / denominator, prec);
	}
	/**
	 * 絶対差を計算する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	absoluteDiff(other) {
		const [valA, valB, prec] = this._bothRescale(other);
		return this._makeResult(valA > valB ? valA - valB : valB - valA, prec);
	}
	/**
	 * 差分の非一致度を計算する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {BigInt}
	 * @throws {Error}
	 */
	percentDiff(other) {
		const [valA, valB, prec] = this._bothRescale(other);

		const absB = valB < 0n ? -valB : valB;
		const diff = valA > valB ? valA - valB : valB - valA;

		if (absB === 0n) return 0n;

		const scale = 10n ** prec;
		return this._makeResult((diff * scale * 100n) / absB, prec);
	}

	/**
	 * 最大値を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static max(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) throw new Error("No arguments provided");

		const [scaled, prec] = this._batchRescale(arr);

		let max = scaled[0];
		for (let i = 1; i < scaled.length; i++) {
			if (scaled[i] > max) max = scaled[i];
		}

		return this._makeResult(max, prec);
	}
	/**
	 * 最小値を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static min(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) throw new Error("No arguments provided");

		const [scaled, prec] = this._batchRescale(arr);

		let min = scaled[0];
		for (let i = 1; i < scaled.length; i++) {
			if (scaled[i] < min) min = scaled[i];
		}

		return this._makeResult(min, prec);
	}

	/**
	 * 合計値を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static sum(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) return new this();

		const [scaled, prec] = this._batchRescale(arr);
		const totalVal = scaled.reduce((acc, cur) => acc + cur, 0n);
		return this._makeResult(totalVal, prec);
	}
	/**
	 * 平均値を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static average(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) return new this();

		const total = this.sum(arr);
		return total.div(new this(arr.length));
	}

	/**
	 * 中央値を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static median(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) throw new Error("No arguments provided");

		const [scaled, prec] = this._batchRescale(arr);
		// valでソート
		const sorted = scaled.sort();
		const mid = Math.floor(sorted.length / 2);

		if (sorted.length % 2 === 1) {
			return this._makeResult(sorted[mid], prec);
		} else {
			// 偶数の場合は中間2つの平均
			const a = new this();
			a.value = sorted[mid - 1];
			a._precision = prec;
			const b = new this();
			b.value = sorted[mid];
			b._precision = prec;
			return a.add(b).div(2);
		}
	}
	/**
	 * 積を返す (丸め誤差に注意)
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static product(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) return new this("1");

		const [scaled, exPrec, prec] = this._batchRescale(arr, true);
		// 積をBigIntで計算
		let prod = new this(1, exPrec);
		for (const item of scaled) {
			const a = new this();
			a.value = item;
			a._precision = exPrec;
			prod = prod.mul(a);
		}
		return this._makeResult(prod.value, prec, exPrec);
	}
	/**
	 * 分散を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static variance(...args) {
		const arr = this._normalizeArgs(args);
		if (arr.length === 0) throw new Error("No arguments provided");
		if (arr.length === 1) return new this("0");

		const [scaled, exPrec, prec] = this._batchRescale(arr, true);
		const n = new this(arr.length, exPrec);

		// 平均値計算
		const total = this.sum(arr);
		const meanVal = total.div(n).changePrecision(exPrec);

		// 分散 = Σ(x_i - mean)^2 / n
		let sumSquares = 0n;
		for (const item of scaled) {
			const a = new this();
			a.value = item;
			a._precision = exPrec;
			const diff = a.sub(meanVal);
			sumSquares += diff.mul(diff).value;
		}

		const sumS = new this();
		sumS.value = sumSquares;
		sumS._precision = exPrec;

		// 分散は元の精度に合わせて返す
		return this._makeResult(sumS.div(n).value, prec, exPrec);
	}
	/**
	 * 標準偏差を返す
	 * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static stddev(...args) {
		const variance = this.variance(args);
		return variance.sqrt();
	}

	/**
	 * 階乗を計算する
	 * @param {BigInt} n
	 * @returns {BigInt}
	 * @static
	 */
	static _factorial(n) {
		let f = 1n;
		for (let i = 2n; i <= n; i++) f *= i;
		return f;
	}
	/**
	 * 二項係数を計算する
	 * @param {BigInt} n
	 * @param {BigInt} k
	 * @returns {BigInt}
	 * @static
	 */
	static _binomial(n, k) {
		if (k > n) return 0n;
		if (k > n - k) k = n - k;
		let result = 1n;
		for (let i = 1n; i <= k; i++) {
			result = (result * (n - i + 1n)) / i;
		}
		return result;
	}

	/**
	 * 精度をチェックする
	 * @param {BigInt} precision
	 * @throws {Error}
	 * @static
	 */
	static _checkPrecision(precision) {
		if (precision < 0n) {
			throw new RangeError(`Precision must be greater than 0`);
		}
		if (precision > this.MAX_PRECISION) {
			throw new RangeError(`Precision exceeds ${this.name}.MAX_PRECISION`);
		}
	}

	/**
	 * 文字列を解析して数値を取得
	 * @param {string} str - 文字列
	 * @returns {{intPart: string, fracPart: string, sign: number}}
	 */
	_parse(str) {
		str = str.toString().trim();

		const expMatch = str.match(/^([+-]?[\d.]+)[eE]([+-]?\d+)$/);
		if (expMatch) {
			// 指数表記を通常の小数に変換
			let [_, base, expStr] = expMatch;
			const exp = parseInt(expStr, 10);

			// 小数点位置をずらす
			let [intPart, fracPart = ""] = base.split(".");
			const allDigits = intPart + fracPart;

			let pointIndex = intPart.length + exp;
			if (pointIndex < 0) {
				base = "0." + "0".repeat(-pointIndex) + allDigits;
			} else if (pointIndex >= allDigits.length) {
				base = allDigits + "0".repeat(pointIndex - allDigits.length);
			} else {
				base = allDigits.slice(0, pointIndex) + "." + allDigits.slice(pointIndex);
			}

			str = base;
		}

		const [intPartRaw, fracPartRaw = ""] = str.split(".");
		const sign = intPartRaw.startsWith("-") ? -1 : 1;
		const intPart = intPartRaw.replace("-", "");
		return { intPart, fracPart: fracPartRaw, sign };
	}

	/**
	 * 数値を正規化
	 * @param {BigInt} val
	 * @returns {string}
	 */
	_normalize(val) {
		const sign = val < 0n ? "-" : "";
		const absVal = val < 0n ? -val : val;
		const prec = Number(this._precision);
		if (prec === 0) {
			return `${sign}${absVal.toString()}`;
		}
		const s = absVal.toString().padStart(prec + 1, "0");
		const intPart = s.slice(0, -prec);
		const fracPart = s.slice(-prec);
		return `${sign}${intPart}.${fracPart}`;
	}

	/**
	 * 精度を合わせる
	 * @param {BigFloat} other
	 * @param {boolean} [useExPrecision=false] - 追加の精度を使う
	 * @returns {[BigInt, BigInt, BigInt, BigInt]}
	 * @throws {Error}
	 */
	_bothRescale(other, useExPrecision = false) {
		const precisionA = this._precision;
		if (!(other instanceof BigFloat)) {
			other = new this.constructor(other);
		}
		const precisionB = other._precision;
		/** @type {BigFloatConfig} */
		const config = this.constructor.config;
		if (precisionA === precisionB) {
			if (useExPrecision) {
				const exPr = config.extraPrecision;
				const exScale = 10n ** exPr;
				const valA = this.value * exScale;
				const valB = other.value * exScale;
				return [valA, valB, precisionA + exPr, precisionA];
			}
			return [this.value, other.value, precisionA, precisionA];
		}
		if (!config.allowPrecisionMismatch) throw new Error("Precision mismatch");

		const maxPrecision = precisionA > precisionB ? precisionA : precisionB;
		const maxExPrecision = maxPrecision + (useExPrecision ? config.extraPrecision : 0n);
		const scaleDiffA = maxExPrecision - precisionA;
		const scaleDiffB = maxExPrecision - precisionB;
		const valA = this.value * 10n ** scaleDiffA;
		const valB = other.value * 10n ** scaleDiffB;
		return [valA, valB, maxExPrecision, maxPrecision];
	}

	/**
	 * 引数を正規化する
	 * @param {any[]} args
	 * @returns {any[]}
	 */
	static _normalizeArgs(args) {
		// 配列か複数引数か判別して配列にまとめる
		if (args.length === 1 && Array.isArray(args[0])) {
			return args[0];
		}
		return args;
	}

	/**
	 * 複数の精度を合わせる
	 * @param {BigFloat[]} arr
	 * @param {boolean} [useExPrecision=false]
	 * @returns {[BigFloat[], BigInt, BigInt]}
	 * @throws {Error}
	 * @static
	 */
	static _batchRescale(arr, useExPrecision = false) {
		/** @type {BigFloatConfig} */
		const config = this.config;
		const exPr = config.extraPrecision;
		if (arr.length === 0) {
			if (useExPrecision) {
				return [[], exPr, 0n];
			}
			return [[], 0n, 0n];
		}
		arr = arr.slice();

		const allowMismatch = config.allowPrecisionMismatch;
		// 最大精度を探す
		let maxPrecision = 0n;
		for (let i = 0; i < arr.length; i++) {
			let bf = arr[i];
			if (!(bf instanceof this)) {
				bf = arr[i] = new this(bf);
			}
			if (!allowMismatch && bf._precision !== maxPrecision) {
				throw new Error("Precision mismatch and allowPrecisionMismatch = false");
			}
			if (bf._precision > maxPrecision) maxPrecision = bf._precision;
		}

		let maxExPrecision = maxPrecision + (useExPrecision ? exPr : 0n);
		// スケール計算とBigInt変換
		const retArr = arr.map((bf) => {
			const diff = maxExPrecision - bf._precision;
			return bf.value * 10n ** diff;
		});
		return [retArr, maxExPrecision, maxPrecision];
	}

	/**
	 * 結果を作成する
	 * @param {BigInt} val
	 * @param {BigInt} precision
	 * @param {BigInt} [exPrecision]
	 * @returns {BigFloat}
	 * @static
	 */
	static _makeResult(val, precision, exPrecision = precision) {
		const rounded = this._round(val, exPrecision, precision);
		const result = new this();
		result._precision = precision;
		result.value = rounded;
		return result;
	}
	/**
	 * 結果を作成する
	 * @param {BigInt} val
	 * @param {BigInt} precision
	 * @param {BigInt} [exPrecision]
	 * @param {boolean} [okMutate=true] - 破壊的変更を許容
	 * @returns {this}
	 */
	_makeResult(val, precision, exPrecision = precision, okMutate = true) {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		if (construct.config.mutateResult && okMutate) {
			const rounded = construct._round(val, exPrecision, precision);
			this._precision = precision;
			this.value = rounded;
			return this;
		}
		return construct._makeResult(val, precision, exPrecision);
	}

	/**
	 * 数値を丸める
	 * @param {BigInt} val
	 * @param {BigInt} currentPrec
	 * @param {BigInt} targetPrec
	 * @returns {BigInt}
	 * @static
	 */
	static _round(val, currentPrec, targetPrec) {
		const diff = currentPrec - targetPrec;
		if (diff < 0n) {
			// 精度が上がる場合は0埋め
			return diff === 0n ? val : val * 10n ** -diff;
		}
		// 精度が下がる場合は丸める
		const scale = 10n ** diff;
		const rem = val % scale;
		const base = val - rem;
		if (rem === 0n) return base / scale;

		const mode = this.config.roundingMode;
		const absRem = rem < 0n ? -rem : rem;
		const half = scale / 2n;
		const isNeg = val < 0n;

		let offset = 0n;
		switch (mode) {
			case BigFloatConfig.ROUND_UP:
				offset = isNeg ? -scale : scale;
				break;
			case BigFloatConfig.ROUND_CEIL:
				if (!isNeg) offset = scale;
				break;
			case BigFloatConfig.ROUND_FLOOR:
				if (isNeg) offset = -scale;
				break;
			case BigFloatConfig.ROUND_HALF_UP:
				if (absRem >= half) offset = isNeg ? -scale : scale;
				break;
			case BigFloatConfig.ROUND_HALF_DOWN:
				if (absRem > half) offset = isNeg ? -scale : scale;
				break;
			case BigFloatConfig.ROUND_TRUNCATE:
			case BigFloatConfig.ROUND_DOWN:
			default:
				// 何もしないの...?
				break;
		}

		return (base + offset) / scale;
	}

	static _randomBigInt(precision) {
		const maxSteps = this.config.lnMaxSteps;
		const scale = 10n ** precision;
		// 0 <= r < scale になる乱数BigIntを作る
		// JSのMath.randomは53bitまでなので複数回繰り返し足し合わせる
		let result = 0n;
		const maxBits = this._log2(scale * scale, precision, maxSteps);
		const rawBits = (maxBits + scale - 1n) / scale; // ← ceil相当
		const rounds = Number((rawBits + 52n) / 53n);

		for (let i = 0; i < rounds; i++) {
			// 53bit乱数取得
			const r = BigInt(Math.floor(Math.random() * Number(2 ** 53)));
			result = (result << 53n) + r;
		}
		return result % scale;
	}
	/**
	 * 乱数を生成する
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static random(precision = 20n) {
		precision = BigInt(precision);
		this._checkPrecision(precision);
		let randBigInt = this._randomBigInt(precision);
		return this._makeResult(randBigInt, precision);
	}

	/**
	 * 円周率[Gregory-Leibniz法] (超高速・超低収束)
	 * @param {BigInt} [precision=20n] - 精度
	 * @param {BigInt} [mulPrecision=100n] - 計算精度の倍率
	 * @returns {BigInt}
	 * @static
	 */
	static _piLeibniz(precision = 20n, mulPrecision = 100n) {
		const scale = 10n ** precision;
		const iterations = precision * mulPrecision;
		let sum = 0n;

		const scale_4 = scale * 4n;
		const ZERO = 0n;
		const ONE = 1n;
		const TWO = 2n;

		let lastTerm = 0n;
		for (let i = 0n; i < iterations; i++) {
			const term = scale_4 / (TWO * i + ONE);
			if (term === lastTerm) break;
			lastTerm = term;
			sum += i % TWO === ZERO ? term : -term;
		}

		return sum;
	}

	/**
	 * 円周率[ニュートン法] (高速・低収束)
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigInt}
	 * @static
	 */
	static _piNewton(precision = 20n) {
		const EXTRA = 10n;
		const prec = precision + EXTRA;

		const atan1_5 = this._atanMachine(5n, prec);
		const atan1_239 = this._atanMachine(239n, prec);

		const value = 16n * atan1_5 - 4n * atan1_239;

		return value / 10n ** EXTRA;
	}

	/**
	 * 円周率[Chudnovsky法] (低速・高収束)
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigInt}
	 * @static
	 */
	static _piChudnovsky(precision = 20n) {
		const scale = 10n ** precision;
		const digitsPerTerm = 14n;
		const terms = precision / digitsPerTerm + 1n;

		const C = 426880n * this._sqrt(10005n * scale, precision);
		let sum = 0n;

		function bigPower(base, exp) {
			let res = 1n;
			for (let i = 0n; i < exp; i++) res *= base;
			return res;
		}

		for (let k = 0n; k < terms; k++) {
			const numerator = this._factorial(6n * k) * (545140134n * k + 13591409n) * (k % 2n === 0n ? 1n : -1n);
			const denominator = this._factorial(3n * k) * bigPower(this._factorial(k), 3n) * bigPower(640320n, 3n * k);

			sum += (scale * numerator) / denominator;
		}

		if (sum === 0n) {
			logging.error("Chudnovsky法の計算に失敗しました");
			return 0n;
		}

		const piInv = (C * scale) / sum; // C / sum = π⁻¹ → π = 1/π⁻¹
		return piInv;
	}

	/**
	 * 円周率
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigInt}
	 * @static
	 */
	static _pi(precision) {
		const piAlgorithm = this.config.piAlgorithm;
		const cachedPi = this._cachedPi;
		if (cachedPi && cachedPi.piAlgorithm === piAlgorithm && cachedPi.precision >= precision) {
			return this._round(cachedPi.value, cachedPi.precision, precision);
		}

		let piRet;
		switch (piAlgorithm) {
			case BigFloatConfig.PI_CHUDNOVSKY:
				piRet = this._piChudnovsky(precision);
				break;
			case BigFloatConfig.PI_NEWTON:
				piRet = this._piNewton(precision);
				break;
			case BigFloatConfig.PI_LEIBNIZ:
				piRet = this._piLeibniz(precision);
				break;
			case BigFloatConfig.PI_MATH_DEFAULT:
			default:
				this._checkPrecision(precision);
				return new this(`${Math.PI}`, precision).value;
		}

		/**
		 * キャッシュ
		 * @type {{precision: BigInt, value: BigInt, piAlgorithm: number}}
		 */
		this._cachedPi = {
			precision: precision,
			value: piRet,
			piAlgorithm: piAlgorithm,
		};

		return piRet;
	}

	/**
	 * 円周率
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static pi(precision = 20n) {
		precision = BigInt(precision);
		this._checkPrecision(precision);

		const piRet = new this();
		piRet.value = this._pi(precision);
		piRet._precision = precision;
		return piRet;
	}

	/**
	 * 指数関数のTaylor展開
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 */
	static _exp(x, precision) {
		const scale = 10n ** precision;
		let sum = scale;
		let term = scale;
		let n = 1n;

		while (true) {
			term = (term * x) / (scale * n); // term *= x / n
			if (term === 0n) break;
			sum += term;
			n++;
		}
		return sum;
	}

	/**
	 * ネイピア数
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {BigFloat}
	 * @throws {Error}
	 * @static
	 */
	static e(precision = 20n) {
		precision = BigInt(precision);
		this._checkPrecision(precision);

		const exPr = this.config.extraPrecision;
		const totalPr = precision + exPr;

		const scale = 10n ** totalPr;
		const eInt = this._exp(scale, totalPr);
		return this._makeResult(eInt, precision, totalPr);
	}

	/**
	 * 指数関数
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {this}
	 * @throws {Error}
	 */
	exp() {
		const construct = this.constructor;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;
		const expInt = construct._exp(val, totalPr);
		return this._makeResult(expInt, this._precision, totalPr);
	}
	/**
	 * 2の指数関数
	 * @param {BigInt} value
	 * @param {BigInt} precision
	 * @param {number} maxSteps
	 * @returns {BigInt}
	 * @static
	 */
	static _exp2(value, precision, maxSteps) {
		const LN2 = this._ln2(precision, maxSteps);
		const scale = 10n ** precision;

		return this._exp((LN2 * value) / scale, precision);
	}
	/**
	 * 2の指数関数
	 * @returns {this}
	 */
	exp2() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.lnMaxSteps;
		const exPr = config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;
		const exp2Int = construct._exp2(val, totalPr, maxSteps);
		return this._makeResult(exp2Int, this._precision, totalPr);
	}

	/**
	 * 指数関数 exp(x) - 1
	 * @param {BigInt} value
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 */
	static _expm1(value, precision) {
		const scale = 10n ** precision;

		// |x| が小さい場合はテイラー級数で近似
		const absValue = value < 0n ? -value : value;
		const threshold = scale / 10n; // 適当な小さい値の閾値

		if (absValue < threshold) {
			// テイラー展開で計算 (x + x^2/2 + x^3/6 + ... 最大 maxSteps 項)
			let term = value; // 初項 x
			let result = term;
			let factorial = 1n;
			let addend = 1n;
			for (let n = 2n; addend !== 0n; n++) {
				factorial *= n;
				term = (term * value) / scale; // x^n
				addend = term / factorial;
				result += addend;
			}
			return result;
		} else {
			// 大きい値は exp(x) - 1 = exp(x) - 1 を計算（_expは別途実装想定）
			return this._exp(value, precision) - scale;
		}
	}
	/**
	 * 指数関数 exp(x) - 1
	 * @returns {this}
	 */
	expm1() {
		const construct = this.constructor;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;
		const expInt = construct._expm1(val, totalPr);
		return this._makeResult(expInt, this._precision, totalPr);
	}

	/**
	 * precisionを最小限まで縮める
	 * @returns {this}
	 */
	scale() {
		let val = this.value;
		let scale = this._precision;

		const ZERO = 0n;
		const TEN = 10n;

		while (scale > ZERO && val % TEN === ZERO) {
			val /= TEN;
			scale--;
		}
		return this._makeResult(val, scale);
	}

	/**
	 * 加算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	add(other) {
		const [valA, valB, prec] = this._bothRescale(other);
		return this._makeResult(valA + valB, prec);
	}

	/**
	 * 減算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	sub(other) {
		const [valA, valB, prec] = this._bothRescale(other);
		return this._makeResult(valA - valB, prec);
	}

	/**
	 * 乗算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mul(other) {
		const [valA, valB, exPrec, prec] = this._bothRescale(other, true);
		const scale = 10n ** exPrec;
		const result = (valA * valB) / scale;
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 除算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	div(other) {
		const [valA, valB, exPrec, prec] = this._bothRescale(other, true);
		const scale = 10n ** exPrec;
		if (valB === 0n) throw new Error("Division by zero");
		const result = (valA * scale) / valB;
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 剰余
	 * @param {BigInt} x
	 * @param {BigInt} m
	 * @returns {BigInt}
	 * @static
	 */
	static _mod(x, m) {
		const r = x % m;
		return r < 0n ? r + m : r;
	}

	/**
	 * 剰余
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mod(other) {
		const [valA, valB, prec] = this._bothRescale(other);
		const result = this.constructor._mod(valA, valB);
		return this._makeResult(result, prec);
	}

	/**
	 * 符号反転
	 * @returns {this}
	 * @throws {Error}
	 */
	neg() {
		return this._makeResult(-this.value, this._precision);
	}

	/**
	 * 絶対値
	 * @param {BigInt} val
	 * @returns {BigInt}
	 * @static
	 */
	static _abs(val) {
		return val < 0n ? -val : val;
	}
	/**
	 * 絶対値
	 * @returns {this}
	 * @throws {Error}
	 */
	abs() {
		return this._makeResult(this.constructor._abs(this.value), this._precision);
	}

	/**
	 * べき乗
	 * @param {BigInt} base - 基数
	 * @param {BigInt} exponent - 指数
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 */
	static _pow(base, exponent, precision) {
		const scale = 10n ** precision;
		if (exponent === 0n) return scale;
		if (base === 0n) return 0n;
		if (exponent < 0n) {
			// 負の指数は逆数計算を根幹でやるため div を使う
			const one = this._makeResult(scale, precision);
			return one.div(this._pow(base, -exponent, precision)).value;
		}
		if (exponent % scale === 0n) {
			// 整数が指数の場合
			exponent /= scale;
			let result = scale;
			while (exponent > 0n) {
				if (exponent & 1n) {
					result = (result * base) / scale;
				}
				base = (base * base) / scale;
				exponent >>= 1n;
			}
			return result;
		}
		// 小数が指数の場合
		const config = this.config;
		const maxSteps = config.lnMaxSteps;

		const lnBase = this._ln(base, precision, maxSteps);
		const mul = (lnBase * exponent) / scale;
		return this._exp(mul, precision, maxSteps);
	}

	/**
	 * べき乗
	 * @param {BigFloat} exponent - 指数
	 * @returns {this}
	 * @throws {Error}
	 */
	pow(exponent) {
		const [valA, valB, exPrec, prec] = this._bothRescale(exponent, true);
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const result = construct._pow(valA, valB, exPrec);
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 平方根[ニュートン法] (_nthRootとは高速化のために分離)
	 * @param {BigInt} n
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _sqrt(n, precision) {
		if (n < 0n) throw new Error("Cannot compute square root of negative number");
		if (n === 0n) return 0n;

		const scale = 10n ** precision;
		const nScaled = n * scale;
		const TWO = 2n;

		let x = nScaled;

		let last;
		while (true) {
			last = x;
			x = (x + nScaled / x) / TWO;
			if (x === last) break;
		}

		return x;
	}

	/**
	 * 平方根[ニュートン法]
	 * @returns {this}
	 * @throws {Error}
	 */
	sqrt() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const exPr = construct.config.extraPrecision;
		const prec = this._precision;
		const totalPr = prec + exPr;
		const val = this.value * 10n ** exPr;

		const x = construct._sqrt(val, totalPr);

		return this._makeResult(x, prec, totalPr);
	}

	/**
	 * 立方根[ニュートン法]
	 * @returns {this}
	 * @throws {Error}
	 */
	cbrt() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const exPr = construct.config.extraPrecision;
		const prec = this._precision;
		const totalPr = prec + exPr;
		const val = this.value * 10n ** exPr;

		const x = construct._nthRoot(val, 3n, totalPr);

		return this._makeResult(x, prec, totalPr);
	}

	/**
	 * n乗根[ニュートン法]
	 * @param {BigInt} v
	 * @param {BigInt} n
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _nthRoot(v, n, precision) {
		if (n <= 0n) {
			throw new Error("n must be a positive integer");
		}
		if (v < 0n) {
			if (n % 2n === 0n) {
				throw new Error("Even root of negative number is not real");
			}
			return -this._nthRoot(-v, n, precision);
		}
		const scale = 10n ** precision;

		// 初期値 x = 1.0 (scaled)
		let x = scale;

		while (true) {
			// x_{k+1} = ((n - 1) * x_k + target / x_k^{n-1}) / n
			// BigIntでべき乗計算
			let xPow = x;
			if (n === 1n) {
				xPow = scale; // n=1は例外処理
			} else {
				for (let j = 1n; j < n - 1n; j++) {
					xPow = (xPow * x) / scale;
				}
			}

			const numerator = (n - 1n) * x + (v * scale) / xPow;
			const xNext = numerator / n;

			if (xNext === x) break; // 収束判定
			x = xNext;
		}
		return x;
	}
	/**
	 * n乗根[ニュートン法]
	 * @param {BigInt} n
	 * @returns {this}
	 * @throws {Error}
	 */
	nthRoot(n) {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const exPr = construct.config.extraPrecision;
		const prec = this._precision;
		const totalPr = prec + exPr;
		const val = this.value * 10n ** exPr;

		const x = construct._nthRoot(val, BigInt(n), totalPr);

		return this._makeResult(x, prec, totalPr);
	}

	/**
	 * 正弦[Maclaurin展開]
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @static
	 */
	static _sin(x, precision, maxSteps) {
		const scale = 10n ** precision;

		const pi = this._pi(precision);
		const twoPi = 2n * pi;
		const halfPi = pi / 2n;

		// xを[0, 2π)に
		x = this._mod(x, twoPi);
		// xを[-π, π]に
		if (x > pi) x -= twoPi;
		// xを[-π/2, π/2]に
		let sign = 1n;
		if (x > halfPi) {
			x = pi - x;
			sign = 1n;
		} else if (x < -halfPi) {
			x = -pi - x;
			sign = -1n;
		}

		let term = x; // x^1 / 1!
		let result = term;
		let x2 = (x * x) / scale;
		let sgn = -1n;

		for (let n = 1n; n <= maxSteps; n++) {
			const denom = 2n * n;

			term = (term * x2) / scale;
			term = term / (denom * (denom + 1n));

			if (term === 0n) break;

			result += sgn * term;
			sgn *= -1n;
		}
		return result * sign;
	}

	/**
	 * 正弦[Maclaurin展開]
	 * @returns {this}
	 * @throws {Error}
	 */
	sin() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._sin(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * 余弦
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @static
	 */
	static _cos(x, precision, maxSteps) {
		const scale = 10n ** precision;

		let term = scale; // x^0 / 0! = 1
		let result = term;
		let x2 = (x * x) / scale;
		let sign = -1n;

		for (let n = 1n, denom = 2n; n <= maxSteps; n++, denom += 2n) {
			term = (term * x2) / scale;
			term = term / (denom * (denom - 1n));
			if (term === 0n) break;
			result += sign * term;
			sign *= -1n;
		}

		return result;
	}

	/**
	 * 余弦
	 * @returns {this}
	 */
	cos() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._cos(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * 正接
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _tan(x, precision, maxSteps) {
		const cosX = this._cos(x, precision, maxSteps);
		const EPSILON = 10n ** (precision - 4n);
		if (cosX === 0n || (cosX > -EPSILON && cosX < EPSILON)) throw new Error("tan(x) is undefined or numerically unstable at this point");
		const sinX = this._sin(x, precision, maxSteps);
		const scale = 10n ** precision;
		return (sinX * scale) / cosX;
	}

	/**
	 * 正接
	 * @returns {this}
	 * @throws {Error}
	 */
	tan() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._tan(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * Newton法
	 * @param {(x:BigInt) => BigInt} f
	 * @param {(x:BigInt) => BigInt} df
	 * @param {BigInt} initial
	 * @param {BigInt} precision
	 * @param {number} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _trigFuncsNewton(f, df, initial, precision, maxSteps = 50) {
		const scale = 10n ** precision;
		let x = initial;

		for (let i = 0; i < maxSteps; i++) {
			const fx = f(x);
			if (fx === 0n) break;
			const dfx = df(x);
			if (dfx === 0n) throw new Error("Derivative zero during Newton iteration");

			// dx = fx / dfx （整数で割り算）
			// dx は分母あるから SCALEかけて割る
			const dx = (fx * scale) / dfx;
			x = x - dx;

			if (dx === 0n) break; // 収束判定
		}

		return x;
	}

	/**
	 * 逆正弦
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _asin(x, precision, maxSteps) {
		const scale = 10n ** precision;
		if (x > scale || x < -scale) throw new Error("asin input out of range [-1,1]");

		const halfPi = this._pi(precision) / 2n;
		// 初期値を x * π/2 にして必ず [-π/2, π/2] に収める
		const initial = (x * halfPi) / scale;

		const f = (theta) => this._sin(theta, precision, maxSteps) - x;
		const df = (theta) => this._cos(theta, precision, maxSteps);
		return this._trigFuncsNewton(f, df, initial, precision, BigInt(maxSteps));
	}

	/**
	 * 逆正弦
	 * @returns {this}
	 * @throws {Error}
	 */
	asin() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._asin(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * 逆余弦
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _acos(x, precision, maxSteps) {
		const halfPi = this._pi(precision) / 2n;
		const asinX = this._asin(x, precision, maxSteps);
		return halfPi - asinX;
	}

	/**
	 * 逆余弦
	 * @returns {this}
	 * @throws {Error}
	 */
	acos() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._acos(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	/**
	 * 逆正接[Machine's formula]
	 * @param {BigInt} invX
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 */
	static _atanMachine(invX, precision) {
		const scale = 10n ** precision;

		const x = scale / invX;
		const x2 = (x * x) / scale;
		let term = x;
		let sum = term;
		let sign = -1n;

		let lastTerm = 0n;
		for (let n = 3n; term !== lastTerm; n += 2n) {
			term = (term * x2) / scale;
			lastTerm = term;
			sum += (sign * term) / n;
			sign *= -1n;
		}

		return sum;
	}

	/**
	 * 逆正接
	 * @param {BigInt} x
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _atan(x, precision, maxSteps) {
		const scale = 10n ** precision;
		const absX = x < 0n ? -x : x;

		// |x| <= 1 → そのままニュートン法
		if (absX <= scale) {
			const f = (theta) => this._tan(theta, precision, maxSteps) - x;
			const df = (theta) => {
				const cosTheta = this._cos(theta, precision, maxSteps);
				if (cosTheta === 0n) throw new Error("Derivative undefined");

				return (scale * scale * scale) / (cosTheta * cosTheta);
			};
			return this._trigFuncsNewton(f, df, x, precision, BigInt(maxSteps));
		}

		// |x| > 1 → atan(x) = sign * (π/2 - atan(1 / |x|))
		const sign = x < 0n ? -1n : 1n;
		const halfPi = this._pi(precision) / 2n;
		const invX = (scale * scale) / absX;
		const innerAtan = this._atan(invX, precision, maxSteps);
		return sign * (halfPi - innerAtan);
	}

	/**
	 * 逆正接
	 * @returns {this}
	 * @throws {Error}
	 */
	atan() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const exPr = construct.config.extraPrecision;
		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const result = construct._atan(val, totalPr, maxSteps);
		return this._makeResult(result, this._precision, totalPr);
	}

	static _atan2(y, x, precision, maxSteps) {
		// x == 0
		if (x === 0n) {
			if (y > 0n) return this._pi(precision) / 2n;
			if (y < 0n) return -this._pi(precision) / 2n;
			return 0n;
		}

		const scale = 10n ** precision;
		const angle = this._atan((y * scale) / x, precision, maxSteps);

		if (x > 0n) return angle;
		if (y >= 0n) return angle + this._pi(precision);
		return angle - this._pi(precision);
	}

	/**
	 * 逆正接2 (atan2(y, x))
	 * @param {BigFloat} x
	 * @returns {this}
	 * @throws {Error}
	 */
	atan2(x) {
		const [valA, valB, exPrec, prec] = this._bothRescale(x, true);
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.trigFuncsMaxSteps;
		const result = construct._atan2(valA, valB, exPrec, maxSteps);
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 自然対数[Atanh法]
	 * @param {BigInt} value
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _ln(value, precision, maxSteps) {
		if (value <= 0n) throw new Error("ln(x) is undefined for x <= 0");

		const scale = 10n ** precision;

		let x = value;
		let k = 0n;
		while (x > 10n * scale) {
			x /= 10n;
			k += 1n;
		}
		while (x < scale) {
			x *= 10n;
			k -= 1n;
		}

		const z = ((x - scale) * scale) / (x + scale);
		let zSquared = (z * z) / scale;

		let term = z;
		let result = term;
		for (let n = 1n; n < maxSteps; n++) {
			term = (term * zSquared) / scale; // 次の奇数乗 z^(2n+1)
			const denom = 2n * n + 1n;
			const addend = term / denom;
			if (addend === 0n) break;
			result += addend;
		}

		const LN10 = this._ln10(precision, maxSteps);

		return 2n * result + k * LN10;
	}
	/**
	 * 自然対数 ln(10) (簡易計算用)
	 * @param {BigInt} precision - 精度
	 * @param {BigInt} [maxSteps=10000n] - 最大反復回数
	 * @returns {BigInt}
	 * @static
	 */
	static _ln10(precision, maxSteps = 10000n) {
		const scale = 10n ** precision;
		const x = 10n * scale; // ln(10) の対象

		// z = (x - ONE) / (x + ONE)
		const z = ((x - scale) * scale) / (x + scale);
		const zSquared = (z * z) / scale;

		let term = z;
		let result = term;

		for (let n = 1n; n < maxSteps; n++) {
			term = (term * zSquared) / scale;
			const denom = 2n * n + 1n;
			const addend = term / denom;
			if (addend === 0n) break;
			result += addend;
		}

		return 2n * result;
	}

	/**
	 * 自然対数 ln(x)
	 * @returns {BigFloat}
	 */
	ln() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const config = construct.config;
		const maxSteps = config.lnMaxSteps;
		const exPr = config.extraPrecision;

		const totalPr = this._precision + exPr;
		const val = this.value * 10n ** exPr;

		const raw = construct._ln(val, totalPr, maxSteps);
		return this._makeResult(raw, this._precision, totalPr);
	}

	/**
	 * 自然対数 ln(2)
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 */
	static _ln2(precision, maxSteps) {
		const scale = 10n ** precision;
		return this._ln(2n * scale, precision, maxSteps);
	}

	/**
	 * 対数
	 * @param {BigInt} baseValue
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _log(value, baseValue, precision, maxSteps) {
		if (value === 1n) return 0n;
		const lnB = this._ln(baseValue, precision, maxSteps);
		if (lnB === 0n) throw new Error("log base cannot be 1 or 0");
		const lnX = this._ln(value, precision, maxSteps);

		// log_b(x) = ln(x) / ln(b)
		const SCALE = 10n ** precision;
		const result = (lnX * SCALE) / lnB;

		return result;
	}

	/**
	 * 対数
	 * @param {BigFloat} base
	 * @returns {BigFloat}
	 */
	log(base) {
		const [valA, valB, exPrec, prec] = this._bothRescale(base, true);

		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const maxSteps = construct.config.lnMaxSteps;
		const raw = construct._log(valA, valB, exPrec, maxSteps);
		return this._makeResult(raw, prec, exPrec);
	}
	/**
	 * 底2の対数
	 * @param {BigInt} value
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @static
	 */
	static _log2(value, precision, maxSteps) {
		const scale = 10n ** precision;
		const baseValue = 2n * scale;
		return this._log(value, baseValue, precision, maxSteps);
	}
	/**
	 * 底2の対数
	 * @returns {BigFloat}
	 */
	log2() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const maxSteps = construct.config.lnMaxSteps;
		const exPrec = construct.config.extraPrecision;
		const totalPr = this._precision + exPrec;
		const val = this.value * 10n ** exPrec;
		const raw = construct._log2(val, totalPr, maxSteps);
		return this._makeResult(raw, this._precision, totalPr);
	}
	/**
	 * 底10の対数
	 * @param {BigInt} value
	 * @returns {BigInt}
	 * @static
	 */
	static _log10(value, precision, maxSteps) {
		const baseValue = 10n * 10n ** precision;
		return this._log(value, baseValue, precision, maxSteps);
	}
	/**
	 * 底10の対数
	 * @returns {BigFloat}
	 */
	log10() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const maxSteps = construct.config.lnMaxSteps;
		const exPrec = construct.config.extraPrecision;
		const totalPr = this._precision + exPrec;
		const val = this.value * 10n ** exPrec;
		const raw = construct._log10(val, totalPr, maxSteps);
		return this._makeResult(raw, this._precision, totalPr);
	}
	/**
	 * 対数 log(1 + x)
	 * @returns {BigFloat}
	 * @static
	 */
	static _log1p(value, precision, maxSteps) {
		// 1 + x を計算
		const scale = 10n ** precision;
		const onePlusX = scale + value;

		// _logを利用して log(1+x) を計算
		return this._log(onePlusX, scale, precision, maxSteps);
	}
	/**
	 * 対数 log(1 + x)
	 * @returns {BigFloat}
	 */
	log1p() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const maxSteps = construct.config.lnMaxSteps;
		const exPrec = construct.config.extraPrecision;
		const totalPr = this._precision + exPrec;
		const val = this.value * 10n ** exPrec;
		const raw = construct._log1p(val, totalPr, maxSteps);
		return this._makeResult(raw, this._precision, totalPr);
	}

	/**
	 * 台形積分
	 * @param {(k:BigInt) => BigInt} f
	 * @param {BigInt} a - スケール済
	 * @param {BigInt} b - スケール済
	 * @param {BigInt} n
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 */
	static _integral(f, a, b, n, precision) {
		const scale = 10n ** precision;

		if (n <= 0n || a === b) return 0n;

		const delta = b - a;

		let sum = f(a) + f(b);

		for (let i = 1n; i < n; i++) {
			const numerator = a * n + i * delta;
			const x_i = numerator / n;
			const term = 2n * f(x_i);
			if (term === 0n) break;
			sum += term;
		}

		const denominator = scale * n * 2n;
		if (denominator === 0n) return 0n;
		return (delta * sum) / denominator;
	}

	/**
	 * sin(π * z)
	 * @param {BigInt} z
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 */
	static _sinPi(z, precision) {
		// π * z / scale のsinを計算
		// 既存の_sinと_pi使う想定
		const pi = this._pi(precision);
		const x = (pi * z) / 10n ** precision;
		return this._sin(x, precision);
	}

	/**
	 * γ関数[台形積分]
	 * @param {BigInt} z
	 * @param {BigInt} precision
	 * @returns {BigInt}
	 * @static
	 * @deprecated
	 */
	static _gammaIntegral(z, precision) {
		const scale = 10n ** precision;
		const scale2 = scale * scale;

		// z < 0.5 の判定（scale付き比較）
		if (z < scale / 2n) {
			// 反射公式
			const pi = this._pi(precision);
			const sinPiZ = this._sinPi(z, precision);
			const oneMinusZ = scale - z;
			const gammaOneMinusZ = this._gammaIntegral(oneMinusZ, precision);
			return (pi * scale2) / (sinPiZ * gammaOneMinusZ);
		}

		// 定数
		const L = 30n * scale;
		const d = 100000n;

		// f1(t) = t^{z-1} * e^{-t} をBigIntで定義
		const f1 = (t) => {
			const tPow = this._pow(t, z - scale, precision); // z-1
			const expNegT = this._exp(-t, precision);
			return (tPow * expNegT) / scale;
		};

		const integralPart = this._integral(f1, scale, L, d, precision);

		// f2(k) = (-1)^k / ((z+k) * k!)
		let sign = 1n;
		let sum = 0n;
		for (let i = 0n; i < 1000n; i++) {
			const kFactorial = this._factorial(i);
			const denom = (z + i * scale) * kFactorial;
			const term = (sign * scale2) / denom;
			if (term === 0n) break;
			sum += term;
			sign *= -1n;
		}

		return integralPart + sum;
	}

	/**
	 * ガンマ関数[台形積分]
	 * @returns {BigFloat}
	 * @deprecated
	 */
	gamma() {
		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const exPrec = construct.config.extraPrecision;
		const totalPr = this._precision + exPrec;
		const val = this.value * 10n ** exPrec;
		const raw = construct._gammaIntegral(val, totalPr);
		return this._makeResult(raw, this._precision, totalPr);
	}
}

/**
 * BigFloat を作成する
 * @param {string | number | BigInt | BigFloat} value 初期値
 * @param {number} [precision=20] 精度
 * @returns {BigFloat}
 * @throws {Error}
 */
function bigFloat(value, precision) {
	return new BigFloat(value, precision);
}

module.exports = {
	BigFloatConfig,
	BigFloat,
	bigFloat,
};
