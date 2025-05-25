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
	 * @param {number} [options.sqrtMaxChebyshevSteps=30] - 平方根[チェビシェフ法]の最大ステップ数
	 * @param {BigInt} [options.trigFuncsMaxSteps=100n] - 三角関数の最大ステップ数
	 * @param {BigInt} [options.lnMaxSteps=10000n] - 自然対数の最大ステップ数
	 */
	constructor({
		// 設定
		allowPrecisionMismatch = false,
		mutateResult = false,
		roundingMode = BigFloatConfig.ROUND_TRUNCATE,
		extraPrecision = 2n,
		piAlgorithm = BigFloatConfig.PI_CHUDNOVSKY,
		sqrtMaxChebyshevSteps = 30,
		trigFuncsMaxSteps = 100n,
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
		 * 平方根[チェビシェフ法]の最大ステップ数
		 * @type {number}
		 * @default 30
		 */
		this.sqrtMaxChebyshevSteps = sqrtMaxChebyshevSteps;
		/**
		 * 三角関数の最大ステップ数
		 * @type {BigInt}
		 * @default 100n
		 */
		this.trigFuncsMaxSteps = trigFuncsMaxSteps;
		/**
		 * 自然対数の最大ステップ数
		 * @type {BigInt}
		 * @default 10000n
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
	_rescaleToMatch(other, useExPrecision = false) {
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

		function factorial(n) {
			let res = 1n;
			for (let i = 2n; i <= n; i++) res *= i;
			return res;
		}

		function bigPower(base, exp) {
			let res = 1n;
			for (let i = 0n; i < exp; i++) res *= base;
			return res;
		}

		for (let k = 0n; k < terms; k++) {
			const numerator = factorial(6n * k) * (545140134n * k + 13591409n) * (k % 2n === 0n ? 1n : -1n);
			const denominator = factorial(3n * k) * bigPower(factorial(k), 3n) * bigPower(640320n, 3n * k);

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
	static _expTaylor(x, precision) {
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
		const eInt = this._expTaylor(scale, totalPr);
		return this._makeResult(eInt, precision, totalPr);
	}

	/**
	 * 指数関数
	 * @param {BigInt} [precision=20n] - 精度
	 * @returns {this}
	 * @throws {Error}
	 */
	exp() {
		const exPr = this.config.extraPrecision;
		const totalPr = precision + exPr;

		const val = this.value * 10n ** exPr;
		const expInt = this.constructor._expTaylor(val, totalPr);
		return this._makeResult(expInt, precision, totalPr);
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
		const [valA, valB, prec] = this._rescaleToMatch(other);
		return this._makeResult(valA + valB, prec);
	}

	/**
	 * 減算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	sub(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
		return this._makeResult(valA - valB, prec);
	}

	/**
	 * 乗算
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
	 * 除算
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
		const [valA, valB, prec] = this._rescaleToMatch(other);
		const result = this.constructor._mod(valA, valB);
		return this._makeResult(result, prec);
	}

	/**
	 * べき乗
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
		if (this.value === 0n) {
			return this._makeResult(0n, prec);
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
	 * 平方根[ニュートン法]
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
			if (x === last || (x > last ? x - last : last - x) <= 1n) break;
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
	 * 平方根[チェビシェフ法]
	 * @returns {this}
	 */
	sqrtChebyshev() {
		let val = this.value;
		if (val < 0n) throw new Error("Cannot compute square root of negative number");

		/** @type {BigFloatConfig} */
		const config = this.constructor.config;
		const maxSteps = config.sqrtMaxChebyshevSteps;
		const exPr = config.extraPrecision;

		const prec = this._precision;
		const totalPr = prec + exPr;
		const scale = 10n ** totalPr;
		val *= 10n ** exPr;
		const TWO = 2n;

		const scale2 = scale * scale;

		// 初期近似 x = A / 2
		let x = v / TWO;
		if (x === 0n) x = 1n; // 小さい数のための補正

		let lastX = 0n;

		// チェビシェフ法の反復
		// xₙ₊₁ = xₙ * (3 - A / (xₙ²)) / 2
		for (let i = 0; i < maxSteps && x !== lastX; i++) {
			lastX = x;
			const x2 = (x * x) / scale;
			const fx = x2 - val;
			const f1x = TWO * x;

			const fx_div_f1x = (fx * scale) / f1x;
			const fx2 = (fx * fx) / scale;
			const correction = (fx2 * TWO) / ((f1x * f1x * f1x) / scale2);

			x = x - fx_div_f1x - correction;
		}

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
		const EPSILON = 10n ** (precision / 2n);
		let x = initial;

		for (let i = 0; i < maxSteps; i++) {
			const fx = f(x);
			if (fx === 0n) break;
			const dfx = df(x);
			if (dfx === 0n) throw new Error("Derivative zero during Newton iteration");

			// dx = fx / dfx （整数で割り算）
			// dx は分母あるから SCALEかけて割る
			const dx = fx / dfx;
			x = x - dx;

			if ((dx < 0n ? -dx : dx) < EPSILON) break; // 収束判定
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
				return (scale * scale) / (cosTheta * cosTheta);
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
			throw new Error("atan2(0, 0) is undefined");
		}

		// y == 0
		if (y === 0n) {
			if (x > 0n) return 0n;
			if (x < 0n) return this._pi(precision);
		}
		const scale = 10n ** precision;

		const ratio = (y * scale) / x;

		const angle = this._atan(ratio, precision, maxSteps);

		if (x > 0n) {
			// 第1,4象限: そのまま
			return angle;
		}
		const pi = this._pi(precision);
		// 第2,3象限: πを足す
		if (y >= 0n) {
			return angle + pi;
		}
		return angle - pi;
	}

	/**
	 * 逆正接2 (atan2(y, x))
	 * @param {BigFloat} x
	 * @returns {this}
	 * @throws {Error}
	 */
	atan2(x) {
		const [valA, valB, exPrec, prec] = this._rescaleToMatch(x, true);
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
	 * 対数
	 * @param {BigInt} baseValue
	 * @param {BigInt} precision
	 * @param {BigInt} maxSteps
	 * @returns {BigInt}
	 * @throws {Error}
	 * @static
	 */
	static _log(value, baseValue, precision, maxSteps) {
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
		const [valA, valB, exPrec, prec] = this._rescaleToMatch(base, true);

		/** @type {typeof BigFloat} */
		const construct = this.constructor;
		const maxSteps = construct.config.lnMaxSteps;
		const raw = construct._log(valA, valB, exPrec, maxSteps);
		return this._makeResult(raw, prec, exPrec);
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
