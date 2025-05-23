const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");

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
	 * @param {Object | BigFloatConfig} [options]
	 * @param {boolean} [options.allowPrecisionMismatch=false] - 精度の不一致を許容する
	 * @param {number} [options.roundingMode=BigFloatConfig.ROUND_TRUNCATE] - 丸めモード
	 * @param {BigInt} [options.extraPrecision=1n] - 追加の精度
	 * @param {number} [options.sqrtMaxNewtonSteps=50] - 平方根[ニュートン法]の最大ステップ数
	 * @param {number} [options.sqrtMaxChebyshevSteps=30] - 平方根[チェビシェフ法]の最大ステップ数
	 */
	constructor({
		// 設定
		allowPrecisionMismatch = false,
		roundingMode = BigFloatConfig.ROUND_TRUNCATE,
		extraPrecision = 1n,
		sqrtMaxNewtonSteps = 50,
		sqrtMaxChebyshevSteps = 30,
	} = {}) {
		super();
		/**
		 * 精度の不一致を許容する
		 * @type {boolean}
		 * @default false
		 */
		this.allowPrecisionMismatch = allowPrecisionMismatch;

		/**
		 * 丸めモード
		 * @type {number}
		 * @default BigFloatConfig.ROUND_TRUNCATE
		 */
		this.roundingMode = roundingMode;

		/**
		 * 追加の精度
		 * @type {BigInt}
		 * @default 1n
		 */
		this.extraPrecision = extraPrecision;

		/**
		 * 平方根[ニュートン法]の最大ステップ数
		 * @type {number}
		 * @default 50
		 */
		this.sqrtMaxNewtonSteps = sqrtMaxNewtonSteps;

		/**
		 * 平方根[チェビシェフ法]の最大ステップ数
		 * @type {number}
		 * @default 30
		 */
		this.sqrtMaxChebyshevSteps = sqrtMaxChebyshevSteps;
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
}

/**
 * メモリの限界までの大きな浮動小数点数を扱うクラス
 * @class
 */
class BigFloat extends JavaLibraryScriptCore {
	/**
	 * 最大精度 (Number.MAX_SAFE_INTEGERより大きくでも可)
	 * @type {BigInt}
	 * @static
	 */
	static MAX_PRECISION = BigInt(Number.MAX_SAFE_INTEGER);

	/**
	 * 設定
	 * @type {BigFloatConfig}
	 * @static
	 */
	static config = new BigFloatConfig();

	/**
	 * @param {string | number | BigInt | BigFloat} [value="0"] - 初期値
	 * @param {number} [precision=20] - 精度
	 */
	constructor(value = "0", precision = 20n) {
		super();

		if (value instanceof BigFloat) {
			this.value = value.value;
			return;
		}

		/** @type {BigInt} */
		this._precision = BigInt(precision);
		if (this._precision > this.constructor.MAX_PRECISION) {
			throw new RangeError("Precision exceeds MAX_SAFE_INTEGER");
		}

		const { intPart, fracPart, sign } = this._parse(value);
		const exPrec = this._precision + this.constructor.config.extraPrecision;
		const frac = fracPart.padEnd(Number(exPrec), "0").slice(0, Number(exPrec));
		const rawValue = BigInt(intPart + frac) * BigInt(sign);

		/** @type {BigInt} */
		this.value = this._round(rawValue, exPrec, this._precision);
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
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return this._normalize(this.value);
	}

	/**
	 * 数値に変換する
	 * @returns {number}
	 */
	toNumber() {
		return Number(this.toString());
	}

	/**
	 * 文字列を解析して数値を取得
	 * @param {string} str - 文字列
	 * @returns {{intPart: string, fracPart: string, sign: number}}
	 */
	_parse(str) {
		const [intPartRaw, fracPartRaw = ""] = str.toString().split(".");
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
		const s = absVal.toString().padStart(Number(this._precision) + 1, "0");
		const intPart = s.slice(0, -Number(this._precision));
		const fracPart = s.slice(-Number(this._precision));
		return `${sign}${intPart}.${fracPart}`;
	}

	/**
	 * 精度を合わせる
	 * @param {BigFloat} other
	 * @param {boolean} [useExPrecision=false] - 追加の精度を使う
	 * @returns {[BigInt, BigInt, BigInt, BigInt]}
	 * @throws {Error}
	 */
	_rescaleToMatch(other, useExPrecision = false) {
		const precisionA = this._precision;
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
	 * 結果を作成する
	 * @param {BigInt} val
	 * @param {BigInt} precision
	 * @param {BigInt} [exPrecision]
	 * @returns {this}
	 */
	_makeResult(val, precision, exPrecision = precision) {
		const rounded = this._round(val, exPrecision, precision);
		const result = new this.constructor();
		result._precision = precision;
		result.value = rounded;
		return result;
	}

	/**
	 * 数値を丸める
	 * @param {BigInt} val
	 * @param {BigInt} currentPrec
	 * @param {BigInt} targetPrec
	 * @returns {BigInt}
	 */
	_round(val, currentPrec, targetPrec) {
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

		const mode = this.constructor.config.roundingMode;
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

	/**
	 * 加算 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	add(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
		return this._makeResult(valA + valB, prec);
	}

	/**
	 * 減算 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	sub(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
		return this._makeResult(valA - valB, prec);
	}

	/**
	 * 乗算 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mul(other) {
		const [valA, valB, exPrec, prec] = this._rescaleToMatch(other, true);
		const scale = 10n ** exPrec;
		const result = (valA * valB) / scale;
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 除算 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	div(other) {
		const [valA, valB, exPrec, prec] = this._rescaleToMatch(other, true);
		const scale = 10n ** exPrec;
		if (valB === 0n) throw new Error("Division by zero");
		const result = (valA * scale) / valB;
		return this._makeResult(result, prec, exPrec);
	}

	/**
	 * 剰余 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mod(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
		const result = valA % valB;
		return this._makeResult(result, prec);
	}

	/**
	 * べき乗 (非破壊)
	 * @param {number | BigInt} exponent - 指数（整数のみ対応）
	 * @returns {this}
	 * @throws {Error}
	 */
	pow(exponent) {
		const prec = this._precision;
		const scale = 10n ** prec;
		let exp = BigInt(exponent);
		if (exp === 0n) {
			return this._makeResult(scale, prec);
		}
		if (exp < 0n) {
			// 負の指数は逆数計算を根幹でやるため div を使う
			const one = this._makeResult(scale, prec);
			return one.div(this.pow(-exp));
		}

		const exPr = this.constructor.config.extraPrecision;
		const exScale = 10n ** (prec + exPr);

		let baseVal = this.value * 10n ** exPr;
		let resultVal = exScale; // 1.0をスケール付き整数で表現

		while (exp > 0n) {
			if (exp & 1n) {
				resultVal = (resultVal * baseVal) / exScale;
			}
			baseVal = (baseVal * baseVal) / exScale;
			exp >>= 1n;
		}

		return this._makeResult(resultVal, prec, prec + exPr);
	}

	/**
	 * 平方根[ニュートン法] (非破壊)
	 * @returns {this}
	 */
	sqrt() {
		let v = this.value;
		if (v < 0n) throw new Error("Cannot compute square root of negative number");

		/** @type {BigFloatConfig} */
		const config = this.constructor.config;
		const maxSteps = config.sqrtMaxNewtonSteps;
		const exPr = config.extraPrecision;

		const prec = this._precision;
		const scale = 10n ** (prec + exPr);
		v *= 10n ** exPr;
		const TWO = 2n;
		const VAL_SCALE = v * scale;

		// 初期近似 x = A / 2
		let x = v / TWO;
		if (x === 0n) x = 1n; // 小さい数のための補正

		let lastX = 0n;

		// ニュートン法反復
		for (let i = 0; i < maxSteps && x !== lastX; i++) {
			lastX = x;
			x = (x + VAL_SCALE / x) / TWO;
		}

		return this._makeResult(x, prec, prec + exPr);
	}
	/**
	 * 平方根[チェビシェフ法] (非破壊)
	 * @returns {this}
	 */
	sqrtChebyshev() {
		let v = this.value;
		if (v < 0n) throw new Error("Cannot compute square root of negative number");

		/** @type {BigFloatConfig} */
		const config = this.constructor.config;
		const maxSteps = config.sqrtMaxChebyshevSteps;
		const exPr = config.extraPrecision;

		const prec = this._precision;
		const scale = 10n ** (prec + exPr);
		v *= 10n ** exPr;
		const TWO = 2n;
		const THREE = 3n;
		const VAL_SCALE = v * scale;
		const HALF = scale / TWO;
		const THREE_HALF = (THREE * scale) / TWO;

		const scale2 = scale * scale;
		const scale3 = scale * scale2;

		// 初期近似 x = A / 2
		let x = v / TWO;
		if (x === 0n) x = 1n; // 小さい数のための補正

		let lastX = 0n;

		// チェビシェフ法の反復
		// xₙ₊₁ = xₙ * (3 - A / (xₙ²)) / 2
		for (let i = 0; i < maxSteps && x !== lastX; i++) {
			lastX = x;
			const x2 = (x * x) / scale;
			const fx = x2 - v;
			const f1x = TWO * x;

			const fx_div_f1x = (fx * scale) / f1x;
			const fx2 = (fx * fx) / scale;
			const correction = (fx2 * TWO) / ((f1x * f1x * f1x) / scale2);

			x = x - fx_div_f1x - correction;
		}

		return this._makeResult(x, prec, prec + exPr);
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
