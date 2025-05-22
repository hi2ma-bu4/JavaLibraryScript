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
	 * @param {boolean} [options.allowPrecisionMismatch=false] 精度の不一致を許容する
	 * @param {number} [options.roundingMode=BigFloatConfig.ROUND_TRUNCATE] 丸めモード
	 */
	constructor({
		// 設定
		allowPrecisionMismatch = false,
		roundingMode = BigFloatConfig.ROUND_TRUNCATE,
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
	 * @param {string | number | bigint | BigFloat} [value="0"] 初期値
	 * @param {number} [precision=20] 精度
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
		/** @type {BigInt} */
		this._scale = 10n ** this._precision;

		const { intPart, fracPart, sign } = this._parse(value);
		const frac = fracPart.padEnd(Number(this._precision), "0").slice(0, Number(this._precision));

		/** @type {BigInt} */
		this.value = BigInt(intPart + frac) * BigInt(sign);
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
	 * 文字列を解析して数値を取得
	 * @param {string} str 文字列
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
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return this._normalize(this.value);
	}

	/**
	 * 精度を合わせる
	 * @param {BigFloat} other
	 * @returns {[BigInt, BigInt, BigInt]}
	 * @throws {Error}
	 */
	_rescaleToMatch(other) {
		const precisionA = this._precision;
		const precisionB = other._precision;
		if (precisionA === precisionB) return [this.value, other.value, precisionA];
		const config = this.constructor.config;
		if (!config.allowPrecisionMismatch) throw new Error("Precision mismatch");

		const maxPrecision = precisionA > precisionB ? precisionA : precisionB;
		const scaleDiffA = maxPrecision - precisionA;
		const scaleDiffB = maxPrecision - precisionB;
		const valA = this.value * 10n ** scaleDiffA;
		const valB = other.value * 10n ** scaleDiffB;
		return [valA, valB, maxPrecision];
	}

	/**
	 * 結果を作成する
	 * @param {BigInt} val
	 * @param {BigInt} precision
	 * @returns {this}
	 */
	_makeResult(val, precision) {
		const rounded = this._round(val, precision);
		const result = new this.constructor();
		result._precision = precision;
		result._scale = 10n ** precision;
		result.value = rounded;
		return result;
	}

	/**
	 * 数値を丸める
	 * @param {BigInt} val
	 * @param {BigInt} prec
	 * @returns {BigInt}
	 */
	_round(val, prec) {
		const scale = 10n ** prec;
		const rem = val % scale;
		const base = val - rem;
		const mode = this.constructor.config.roundingMode;
		const absRem = rem < 0n ? -rem : rem;
		const half = scale / 2n;
		const isNeg = val < 0n;

		switch (mode) {
			case BigFloatConfig.ROUND_TRUNCATE:
			case BigFloatConfig.ROUND_DOWN:
				return base;
			case BigFloatConfig.ROUND_UP:
				return rem === 0n ? base : isNeg ? base - scale : base + scale;
			case BigFloatConfig.ROUND_CEIL:
				return rem === 0n ? base : isNeg ? base : base + scale;
			case BigFloatConfig.ROUND_FLOOR:
				return rem === 0n ? base : isNeg ? base - scale : base;
			case BigFloatConfig.ROUND_HALF_UP:
				if (absRem >= half) {
					return isNeg ? base - scale : base + scale;
				}
				return base;
			case BigFloatConfig.ROUND_HALF_DOWN:
				if (absRem > half) {
					return isNeg ? base - scale : base + scale;
				}
				return base;
			default:
				return base;
		}
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
		const [valA, valB, prec] = this._rescaleToMatch(other);
		const scale = 10n ** prec;
		const result = (valA * valB) / scale;
		return this._makeResult(result, prec);
	}

	/**
	 * 除算 (非破壊)
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	div(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
		const scale = 10n ** prec;
		if (valB === 0n) throw new Error("Division by zero");
		const result = (valA * scale) / valB;
		return this._makeResult(result, prec);
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
}

module.exports = {
	BigFloatConfig,
	BigFloat,
};
