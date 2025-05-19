const SymbolDict = require("./sys/symbol/SymbolDict");
const JavaLibraryScriptCore = require("./sys/JavaLibraryScriptCore");
const TypeChecker = require("./TypeChecker");

/** @type {Symbol} */
const instanceofTarget = SymbolDict.instanceofTarget;

/**
 * Index参照機能を提供する
 * @template T
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class IndexProxy extends JavaLibraryScriptCore {
	/**
	 * @param {new (...args: any[]) => T} targetClass
	 * @param {{getMethod?: string, setMethod?: string, sizeMethod?: string, addMethod?: string, typeCheckMethod?: string | null, autoExtend?: boolean}} options
	 */
	constructor(targetClass, { getMethod = "get", setMethod = "set", sizeMethod = "size", addMethod = "add", typeCheckMethod = null, autoExtend = true } = {}) {
		super();
		this._TargetClass = targetClass;
		this._config = {
			getMethod,
			setMethod,
			sizeMethod,
			addMethod,
			typeCheckMethod,
			autoExtend,
		};
		this._cachedMethods = {
			get: null,
			set: null,
			size: null,
			add: null,
			typeCheck: null,
		};
	}

	/**
	 * @param {...any} args
	 * @returns {T}
	 */
	create(...args) {
		const target = new this._TargetClass(...args);
		const class_name = TypeChecker.typeNames(this._TargetClass);

		const cfg = this._config;
		const m = this._cachedMethods;

		if (typeof target[cfg.getMethod] !== "function") {
			throw new TypeError(`${class_name}.${cfg.getMethod}(index) メソッドが必要です。`);
		}
		if (typeof target[cfg.setMethod] !== "function") {
			throw new TypeError(`${class_name}.${cfg.setMethod}(index, value) メソッドが必要です。`);
		}
		m.get = target[cfg.getMethod].bind(target);
		m.set = target[cfg.setMethod].bind(target);

		// sizeは関数かgetterか判定
		const sizeVal = target[cfg.sizeMethod];
		if (typeof sizeVal === "function") {
			m.size = sizeVal.bind(target);
		} else if (typeof sizeVal === "number") {
			// getterはbind不要なので関数化
			m.size = () => target[cfg.sizeMethod];
		} else {
			throw new TypeError(`${class_name}.${cfg.sizeMethod}() メソッドまたは、${class_name}.${cfg.sizeMethod} getterが必要です。`);
		}

		if (typeof target[cfg.addMethod] === "function") {
			m.add = target[cfg.addMethod].bind(target);
		} else if (this._config.autoExtend) {
			throw new TypeError(`${this._TargetClass}.${cfg.addMethod}(item) メソッドが必要です。範囲外追加を許容しない場合はautoExtendをfalseにしてください。`);
		}
		if (typeof target[cfg.typeCheckMethod] === "function") {
			m.typeCheck = target[cfg.typeCheckMethod].bind(target);
		}

		return new Proxy(target, {
			get: (t, prop, r) => {
				if (!isNaN(prop)) {
					return m.get(Number(prop));
				}
				return Reflect.get(t, prop, r);
			},
			set: (t, prop, val, r) => {
				if (!isNaN(prop)) {
					const i = Number(prop);
					if (m.typeCheck) {
						m.typeCheck(val);
					}
					const size = m.size();

					if (i < size) {
						m.set(i, val);
					} else if (i === size && this._config.autoExtend) {
						m.add(val);
					} else {
						throw new RangeError(`インデックス ${i} は無効です（サイズ: ${size}）`);
					}
					return true;
				}
				return Reflect.set(t, prop, val, r);
			},
			has: (t, prop) => {
				if (!isNaN(prop)) {
					const i = Number(prop);
					const size = m.size();
					return i >= 0 && i < size;
				}
				return prop in t;
			},
		});
	}

	/**
	 * インスタンス化時に初期データを設定する
	 * @template C
	 * @param {C} targetInstance
	 */
	static defineInitData(targetInstance) {
		Object.defineProperty(targetInstance, instanceofTarget, {
			value: targetInstance,
			enumerable: false,
			writable: false,
		});
	}

	/**
	 * [Symbol.hasInstance]の処理を自動化
	 * @template S, C
	 * @param {new (...args: any[]) => S} targetClass - 多くの場合、this
	 * @param {C} otherInstance
	 */
	static hasInstance(targetClass, otherInstance) {
		const target = otherInstance?.[instanceofTarget];
		return typeof target === "object" && target !== null && targetClass.prototype.isPrototypeOf(target);
	}
}

module.exports = IndexProxy;
