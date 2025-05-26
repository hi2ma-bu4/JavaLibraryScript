(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");

/**
 * 単一のEnum要素を表すクラス
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class _EnumItem extends JavaLibraryScriptCore {
	/**
	 * @param {string} name - Enumのキー名
	 * @param {number} ordinal - 順序番号（自動インクリメント）
	 * @param {any} value - 任意の値（name, 数値, オブジェクトなど）
	 * @param {_EnumCore} [owner] - Enumのインスタンス
	 * @param {{[methodName: string]: (...args: any[]) => any}} [methods] - Enumのメソッド
	 */
	constructor(name, ordinal, value = name, owner = null, methods = {}) {
		super();
		this.name = name;
		this.ordinal = ordinal;
		this.value = value;

		this.owner = owner;

		for (const [key, fn] of Object.entries(methods)) {
			if (typeof fn === "function") {
				this[key] = fn.bind(this);
			}
		}

		Object.freeze(this);
	}

	/**
	 * 名前を返す
	 * @returns {string}
	 */
	toString() {
		return this.name;
	}

	/**
	 * JSON化
	 * @returns {string}
	 */
	toJSON() {
		return this.name;
	}

	/**
	 * ordinalでの比較
	 * @param {this} other
	 * @returns {number}
	 */
	compareTo(other) {
		return this.ordinal - other.ordinal;
	}

	/**
	 * 同一EnumItemかチェック
	 * @param {this} other
	 * @returns {boolean}
	 */
	equals(other) {
		return other instanceof _EnumItem && this.name === other.name && this.ordinal === other.ordinal && this.value === other.value;
	}

	/**
	 * ハッシュコード生成（簡易）
	 * @returns {number}
	 */
	hashCode() {
		return this.name.split("").reduce((h, c) => h + c.charCodeAt(0), 0) + this.ordinal * 31;
	}
}

/**
 * Enum を生成するクラス
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class _EnumCore extends JavaLibraryScriptCore {
	/**
	 * @param {Array<string | [string, any]> | Record<string, any>} defs - 定義
	 * @param {{[methodName: string]: (...args: any[]) => any}} [options.methods] - Enumのメソッド
	 */
	constructor(defs, options = {}) {
		super();
		/** @type {_EnumItem[]} */
		this._items = [];
		this._methods = options.methods || {};

		let entries;

		if (Array.isArray(defs)) {
			entries = defs.map((def) => (Array.isArray(def) ? def : [def, def]));
		} else if (typeof defs === "object" && defs !== null) {
			entries = Object.entries(defs);
		} else {
			throw new TypeError("Enum: 配列か連想配列で定義してください");
		}

		entries.forEach(([name, value], index) => {
			const item = new _EnumItem(name, index, value, this, this._methods);
			Object.defineProperty(this, name, {
				value: item,
				writable: false,
				configurable: false,
				enumerable: true,
			});
			this._items.push(item);
		});

		Object.freeze(this._items);
	}

	/**
	 * Enumの全要素を配列で取得
	 * @returns {_EnumItem[]}
	 */
	values() {
		return this._items.slice();
	}

	/**
	 * 名前からEnumItemを取得
	 * @param {string} name
	 * @returns {_EnumItem | undefined}
	 */
	valueOf(name) {
		return this[name];
	}
	/**
	 * 名前からEnumItemを取得
	 * @param {string} name
	 * @returns {_EnumItem | undefined}
	 */
	fromName = valueOf;

	/**
	 * 値からEnumItemを取得
	 * @param {any} value
	 * @returns {_EnumItem | undefined}
	 */
	fromValue(value) {
		return this._items.find((e) => e.value === value);
	}

	/**
	 * ordinalからEnumItemを取得
	 * @param {number} ordinal
	 * @returns {_EnumItem | undefined}
	 */
	fromOrdinal(ordinal) {
		return this._items.find((e) => e.ordinal === ordinal);
	}

	/**
	 * Enumにそのnameが存在するか
	 * @param {string} name
	 * @returns {boolean}
	 */
	has(name) {
		return typeof this[name] === "object" && this[name] instanceof _EnumItem;
	}

	/**
	 * name → _EnumItem の [name, item] 配列を返す
	 * @returns {[string, _EnumItem][]}
	 */
	entries() {
		return this._items.map((e) => [e.name, e]);
	}

	/**
	 * Enumの全nameを返す
	 * @returns {string[]}
	 */
	keys() {
		return this._items.map((e) => e.name);
	}

	/**
	 * name → value のマップを返す
	 * @returns {Record<string, any>}
	 */
	toMap() {
		const map = {};
		for (const e of this._items) {
			map[e.name] = e.value;
		}
		return map;
	}

	/**
	 * JSONシリアライズ用のtoJSONメソッド
	 * @returns {Array<{name: string, ordinal: number, value: any}>} 列挙子の配列
	 */
	toJSON() {
		return this._items.map((item) => item.toJSON());
	}

	/**
	 * for...of に対応
	 */
	*[Symbol.iterator]() {
		yield* this._items;
	}

	/**
	 * インデックス付きで列挙子を返すジェネレータ
	 * @returns {Generator<[number, _EnumItem]>} インデックスと列挙子のペア
	 */
	*enumerate() {
		for (let i = 0; i < this._items.length; i++) {
			yield [i, this._items[i]];
		}
	}
}

/**
 * DynamicEnum生成関数（インデックスアクセスに対応したProxy付き）
 * @param {Array<string | [string, any]> | Record<string, any>} defs
 * @param {{[methodName: string]: (...args: any[]) => any}} [options.methods] - Enumのメソッド
 * @returns {_EnumCore & Proxy}
 */
function Enum(defs, options = {}) {
	const core = new _EnumCore(defs, options);
	return new Proxy(core, {
		get(target, prop, receiver) {
			if (typeof prop === "string" && /^[0-9]+$/.test(prop)) {
				const index = Number(prop);
				return target._items[index];
			}
			return Reflect.get(target, prop, receiver);
		},

		enumerate(target) {
			// 数字のインデックスを除外
			return Object.keys(target._items).map((i) => i.toString());
		},

		has(target, prop) {
			if (typeof prop === "string" && /^[0-9]+$/.test(prop)) {
				const index = Number(prop);
				return index >= 0 && index < target._items.length;
			}
			return prop in target;
		},

		ownKeys(target) {
			const keys = Reflect.ownKeys(target);
			const indexes = target._items.map((_, i) => i.toString());
			return [...keys, ...indexes];
		},

		getOwnPropertyDescriptor(target, prop) {
			if (typeof prop === "string" && /^[0-9]+$/.test(prop)) {
				// プロパティがターゲットに存在するか確認
				if (prop in target._items) {
					return {
						value: target._items[Number(prop)],
						writable: false,
						configurable: false,
						enumerable: true,
					};
				} else {
					// プロパティが存在しない場合はエラーを避ける
					return undefined; // これでエラーを避ける
				}
			}
			return Object.getOwnPropertyDescriptor(target, prop);
		},

		set(target, prop, value) {
			throw new TypeError(`Enumは変更できません: ${String(prop)} = ${value}`);
		},

		defineProperty(target, prop, descriptor) {
			throw new TypeError(`Enumにプロパティを追加/変更できません: ${String(prop)}`);
		},

		deleteProperty(target, prop) {
			throw new TypeError(`Enumのプロパティを削除できません: ${String(prop)}`);
		},
	});
}

module.exports = {
	_EnumItem,
	_EnumCore,
	Enum,
};

},{"../libs/sys/JavaLibraryScriptCore":9}],2:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");
const { logging } = require("../libs/sys/Logger");
const TypeChecker = require("../libs/TypeChecker");
const { _EnumItem, Enum } = require("./Enum");

/**
 * @typedef {{throw: _EnumItem, log: _EnumItem, ignore: _EnumItem}} ErrorModeItem
 */

/**
 * @typedef {Object} InterfaceTypeData
 * @property {Function[] | null} [args] - 引数の型定義
 * @property {Function | Function[] | null} [returns] - 戻り値の型定義
 * @property {boolean} [abstract=true] - 抽象クラス化
 */

/**
 * @typedef {Object.<string, InterfaceTypeData>} InterfaceTypeDataList
 */

/**
 * インターフェイス管理
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class Interface extends JavaLibraryScriptCore {
	/**
	 * デバッグモード
	 * @type {boolean}
	 * @static
	 */
	static isDebugMode = false;

	/**
	 * エラーモード
	 * @type {ErrorModeItem}
	 * @static
	 * @readonly
	 */
	static ErrorMode = Enum(["throw", "log", "ignore"]);

	/**
	 * エラーモード
	 * @type {ErrorModeItem}
	 * @static
	 */
	static _errorMode = this.ErrorMode.throw;

	/**
	 * エラーモード設定
	 * @param {ErrorModeItem} mode - エラーモード
	 * @static
	 */
	static setErrorMode(mode) {
		if (!this.ErrorMode.has(mode)) throw new Error(`不正な errorMode: ${mode}`);
		this._errorMode = mode;
	}

	/**
	 * エラー処理
	 * @param {typeof Error} error
	 * @param {string} message - エラーメッセージ
	 * @returns {undefined}
	 * @throws {Error}
	 * @static
	 */
	static _handleError(error, message) {
		const ErrorMode = this.ErrorMode;
		switch (this._errorMode) {
			case ErrorMode.throw:
				throw new error(message);
			case ErrorMode.log:
				logging.warn("[Interface Warning]", message);
				break;
			case ErrorMode.ignore:
				break;
		}
	}

	/**
	 * 型定義
	 * @param {Function} TargetClass - 型定義を追加するクラス
	 * @param {InterfaceTypeDataList} [newMethods] - 追加するメソッド群
	 * @param {Object} [opt] - オプション
	 * @param {boolean} [opt.inherit=true] - 継承モード
	 * @returns {undefined}
	 * @static
	 */
	static applyTo(TargetClass, newDefs = {}, { inherit = true } = {}) {
		const proto = TargetClass.prototype;

		// 継承モードなら親の型定義をマージ
		let inheritedDefs = {};
		if (inherit) {
			const parentProto = Object.getPrototypeOf(proto);
			if (parentProto && parentProto.__interfaceTypes) {
				inheritedDefs = { ...parentProto.__interfaceTypes };
			}
		}

		// クラスの型定義ストレージを用意 or 上書き
		if (!proto.__interfaceTypes) {
			Object.defineProperty(proto, "__interfaceTypes", {
				value: {},
				configurable: false,
				writable: false,
				enumerable: false,
			});
		}

		// 継承＋新規定義マージ（子定義優先）
		Object.assign(proto.__interfaceTypes, inheritedDefs, newDefs);
	}

	/**
	 * 型定義とメゾットの強制実装
	 * @template T
	 * @param {new (...args: any[]) => T} TargetClass - 型定義を追加するクラス
	 * @param {InterfaceTypeDataList} [newMethods] - 追加するメソッド群
	 * @param {Object} [opt] - オプション
	 * @param {boolean} [opt.inherit=true] - 継承モード
	 * @param {boolean} [opt.abstract=true] - 抽象クラス化
	 * @returns {new (...args: any[]) => T}
	 * @static
	 */
	static convert(TargetClass, newDefs = {}, { inherit = true, abstract = true } = {}) {
		this.applyTo(TargetClass, newDefs, { inherit });

		const this_ = this;

		const interfaceClass = class extends TargetClass {
			constructor(...args) {
				if (abstract) {
					if (new.target === interfaceClass) {
						new TypeError(`Cannot instantiate abstract class ${TargetClass.name}`);
					}
				}
				super(...args);

				if (!Interface.isDebugMode) return;

				const proto = Object.getPrototypeOf(this);
				const defs = proto.__interfaceTypes || {};

				for (const methodName of Object.keys(defs)) {
					const def = defs[methodName];
					const original = this[methodName];
					const isAbstract = !!def.abstract;

					if (typeof original !== "function") {
						if (isAbstract) continue;
						this_._handleError(Error, `"${this.constructor.name}" はメソッド "${methodName}" を実装する必要があります`);
						return;
					}

					// ラップは一度だけ（重複防止）
					if (!original.__isWrapped) {
						const wrapped = (...args) => {
							// 引数チェック
							const expectedArgs = def.args || [];
							for (let i = 0; i < expectedArgs.length; i++) {
								if (!TypeChecker.matchType(args[i], expectedArgs[i])) {
									this_._handleError(TypeError, `"${this.constructor.name}.${methodName}" 第${i + 1}引数: ${TypeChecker.typeNames(expectedArgs[i])} を期待 → 実際: ${TypeChecker.stringify(args[i])}`);
								}
							}

							const result = original.apply(this, args);
							const expectedReturn = TypeChecker.checkFunction(def.returns) ? def.returns(args) : def.returns;

							const validate = (val) => {
								if (!TypeChecker.matchType(val, expectedReturn)) {
									if (expectedReturn === TypeChecker.NoReturn) {
										this_._handleError(TypeError, `"${this.constructor.name}.${methodName}" は戻り値を返してはいけません → 実際: ${TypeChecker.stringify(val)}`);
									} else {
										this_._handleError(TypeError, `"${this.constructor.name}.${methodName}" の戻り値: ${TypeChecker.typeNames(expectedReturn)} を期待 → 実際: ${TypeChecker.stringify(val)}`);
									}
								}
								return val;
							};

							return result instanceof Promise ? result.then(validate) : validate(result);
						};
						wrapped.__isWrapped = true;
						this[methodName] = wrapped;
					}
				}
			}
		};

		Object.defineProperty(interfaceClass, "name", { value: TargetClass.name });

		return interfaceClass;
	}

	/**
	 * 抽象メソッドが未実装かを個別に検査
	 * @param {Object} instance
	 * @returns {boolean}
	 */
	static isAbstractImplemented(instance) {
		const proto = Object.getPrototypeOf(instance);
		const defs = proto.__interfaceTypes || {};

		for (const [methodName, def] of Object.entries(defs)) {
			if (!def.abstract) continue;
			if (typeof instance[methodName] !== "function") return false;
		}
		return true;
	}

	/**
	 * 型定義を取得
	 * @param {Function|Object} ClassOrInstance
	 * @returns {InterfaceTypeDataList}
	 * @static
	 */
	static getDefinition(ClassOrInstance) {
		const proto = typeof ClassOrInstance === "function" ? ClassOrInstance.prototype : Object.getPrototypeOf(ClassOrInstance);
		return proto.__interfaceTypes || {};
	}

	/**
	 * 型定義を文字列化
	 * @param {Function|Object} ClassOrInstance
	 * @returns {string}
	 * @static
	 */
	static describe(ClassOrInstance) {
		const defs = this.getDefinition(ClassOrInstance);
		const lines = [];
		for (const [name, def] of Object.entries(defs)) {
			const argsStr = (def.args || []).map((t) => TypeChecker.typeNames(t)).join(", ");
			const retStr = TypeChecker.typeNames(def.returns);
			lines.push(`${def.abstract ? "abstract " : ""}function ${name}(${argsStr}) → ${retStr}`);
		}
		return lines.join("\n");
	}

	/**
	 * メソッド名を取得
	 * @param {Function|Object} ClassOrInstance
	 * @param {Object} [opt]
	 * @param {boolean} [opt.abstractOnly=false]
	 * @returns {string[]}
	 * @static
	 */
	static getMethodNames(ClassOrInstance, { abstractOnly = false } = {}) {
		const defs = this.getDefinition(ClassOrInstance);
		return Object.entries(defs)
			.filter(([_, def]) => !abstractOnly || def.abstract)
			.map(([name]) => name);
	}

	/**
	 * メソッド定義を取得
	 * @param {Function|Object} classOrInstance
	 * @param {string} methodName
	 * @returns {InterfaceTypeData | null}
	 * @static
	 */
	static getExpectedSignature(classOrInstance, methodName) {
		const defs = this.getDefinition(classOrInstance);
		if (!(methodName in defs)) return null;
		return {
			args: defs[methodName].args,
			returns: defs[methodName].returns,
			abstract: !!defs[methodName].abstract,
		};
	}

	/**
	 * 型定義を結合
	 * @param {...InterfaceTypeDataList} defs
	 * @returns {InterfaceTypeDataList}
	 * @static
	 */
	static merge(...defs) {
		const result = {};
		for (const def of defs) {
			Object.assign(result, def);
		}
		return result;
	}
}

module.exports = Interface;

},{"../libs/TypeChecker":7,"../libs/sys/JavaLibraryScriptCore":9,"../libs/sys/Logger":10,"./Enum":1}],3:[function(require,module,exports){
module.exports = {
    ...require("./Enum.js"),
    Interface: require("./Interface.js")
};

},{"./Enum.js":1,"./Interface.js":2}],4:[function(require,module,exports){
module.exports = {
    base: require("./base/index.js"),
    libs: require("./libs/index.js"),
    math: require("./math/index.js"),
    util: require("./util/index.js")
};

},{"./base/index.js":3,"./libs/index.js":8,"./math/index.js":16,"./util/index.js":23}],5:[function(require,module,exports){
const SymbolDict = require("./sys/symbol/SymbolDict");
const JavaLibraryScriptCore = require("./sys/JavaLibraryScriptCore");
const ProxyManager = require("./ProxyManager");
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
				return ProxyManager.over_get(t, prop, r);
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

},{"./ProxyManager":6,"./TypeChecker":7,"./sys/JavaLibraryScriptCore":9,"./sys/symbol/SymbolDict":12}],6:[function(require,module,exports){
const JavaLibraryScriptCore = require("./sys/JavaLibraryScriptCore");

/**
 * プロキシマネージャー
 * @class
 */
class ProxyManager extends JavaLibraryScriptCore {
	/**
	 * getのreturnのオーバーライド
	 * @param {any} target
	 * @param {any} prop
	 * @param {any} receiver
	 * @returns {any}
	 */
	static over_get(target, prop, receiver) {
		switch (prop) {
			case "toString":
				return () => `Proxy(${target.toString()})`;
		}
		return Reflect.get(target, prop, receiver);
	}
}

module.exports = ProxyManager;

},{"./sys/JavaLibraryScriptCore":9}],7:[function(require,module,exports){
const SymbolDict = require("../libs/sys/symbol/SymbolDict");
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");
const { _EnumCore, _EnumItem } = require("../base/Enum");

/**
 * 型チェッカー
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class TypeChecker extends JavaLibraryScriptCore {
	static _CLASS_REG = /^\s*class\s+/;

	// ==================================================
	/**
	 * Typeの否定
	 * @extends {JavaLibraryScriptCore}
	 * @class
	 * @static
	 */
	static _NotType = class _NotType extends JavaLibraryScriptCore {
		/**
		 * @param {Function | Function[]} typeToExclude
		 */
		constructor(typeToExclude) {
			super();
			if (typeToExclude instanceof TypeChecker._NotType) throw new TypeError("typeToExclude must be instance of NotType");
			this.typeToExclude = typeToExclude;
		}
	};

	/**
	 * 否定型を返す
	 * @param {Function | Function[]} typeToExclude
	 * @returns {TypeChecker._NotType}
	 */
	static NotType(typeToExclude) {
		return new TypeChecker._NotType(typeToExclude);
	}
	// ==================================================

	/**
	 * 任意の型
	 * @type {Symbol}
	 * @static
	 * @readonly
	 */
	static Any = SymbolDict.TypeAny;
	/**
	 * 返り値を返さない関数の型
	 * @type {Symbol}
	 * @static
	 * @readonly
	 */
	static Void = SymbolDict.TypeVoid;
	/**
	 * 返り値を返さない関数の型
	 * @type {Symbol}
	 * @static
	 * @readonly
	 */
	static NoReturn = this.Void;

	/**
	 * null以外の型
	 * @type {TypeChecker._NotType}
	 * @static
	 * @readonly
	 */
	static NotNull = this.NotType(null);
	/**
	 * undefined以外の型
	 * @type {TypeChecker._NotType}
	 * @static
	 * @readonly
	 */
	static NotUndefined = this.NotType(undefined);

	// ==================================================

	/**
	 * 型チェック(一括)
	 * @param {any} value
	 * @param {Function} expected
	 * @returns {boolean}
	 * @static
	 */
	static matchType(value, expected) {
		if (Array.isArray(expected)) {
			const notTypes = expected.filter((t) => t instanceof this._NotType);
			const isNotExcluded = notTypes.some((t) => this.checkType(value, t.typeToExclude));
			if (isNotExcluded) return false;
			const notExcluded = expected.filter((t) => !(t instanceof this._NotType));
			if (notExcluded.length === 0) return true;
			return notExcluded.some((e) => this.checkType(value, e));
		}
		return this.checkType(value, expected);
	}

	/**
	 * 型チェック(個別)
	 * @param {any} value
	 * @param {Function} expected
	 * @returns {boolean}
	 * @static
	 */
	static checkType(value, expected) {
		if (expected instanceof this._NotType) {
			// 除外型なので、valueが除外型にマッチしたらfalse
			return !this.checkType(value, expected.typeToExclude);
		}
		if (expected === this.Any) return true;
		if (expected === this.NoReturn) return value === undefined;
		if (expected === null) return value === null;
		if (expected === undefined) return value === undefined;
		if (expected === String || expected === Number || expected === Boolean || expected === Symbol || expected === Function || expected === BigInt) return typeof value === expected.name.toLowerCase();
		if (expected === Object) return typeof value === "object" && value !== null && !Array.isArray(value);
		if (expected === Array) return Array.isArray(value);
		// ----- Enum対応
		if (expected instanceof _EnumCore) {
			// Enumの場合
			return expected.has(value?.name);
		}
		if (expected === _EnumItem) return value instanceof _EnumItem;
		// -----
		if (typeof expected === "function") return value instanceof expected;
		return false;
	}

	/**
	 * 型を取得する
	 * @param {any} value
	 * @returns {Function | null}
	 */
	static getType(value) {
		if (value === null) return null;
		if (value === undefined) return undefined;
		const type = typeof value;
		switch (type) {
			case "string":
				return String;
			case "number":
				return Number;
			case "boolean":
				return Boolean;
			case "symbol":
				return Symbol;
			case "function":
				return Function;
			case "bigint":
				return BigInt;
			case "object":
				if (Array.isArray(value)) return Array;
				return value.constructor;
		}
		throw new TypeError(`TypeChecker: getType()に対応していない型:${type}`);
	}

	/**
	 * 型名を取得
	 * @param {Function} expected
	 * @returns {string}
	 * @static
	 */
	static typeNames(expected) {
		if (Array.isArray(expected)) return expected.map((t) => t?.name || TypeChecker.stringify(t)).join(" | ");
		return expected?.name || TypeChecker.stringify(expected);
	}

	/**
	 * 値を文字列に変換
	 * @param {any} value
	 * @returns {string}
	 * @static
	 */
	static stringify(value) {
		if (value === null || value === undefined) {
			return String(value);
		}
		if (typeof value === "symbol") {
			switch (value) {
				case this.Any:
					return "Any";
				case this.NoReturn:
				case this.Void:
					return "NoReturn";
			}
		}
		if (typeof value === "object") {
			if (value?.toString() !== "[object Object]") {
				return String(value);
			}
			if (value instanceof this._NotType) {
				return `NotType(${TypeChecker.stringify(value.typeToExclude)})`;
			}
			try {
				const jsonString = JSON.stringify(
					value,
					(key, val) => {
						if (val && typeof val === "object") {
							const size = Object.keys(val).length;
							// オブジェクトが大きすぎる場合は省略表示
							if (size > 5) {
								return `Object with ${size} properties`;
							}
						}
						return val;
					},
					0
				);
				// JSON.stringifyエラー時にfallback
				if (jsonString === undefined) {
					return "Object is too large to display or contains circular references";
				}

				return jsonString.length > 1000 ? "Object is too large to display" : jsonString; // 文字数が多すぎる場合は省略
			} catch (e) {
				return `[オブジェクト表示エラー: ${e.message}]`; // サークル参照等のエラー防止
			}
		}
		return String(value); // それ以外の型はそのまま文字列に変換
	}

	/**
	 * 関数かチェック
	 * @param {any} fn
	 * @returns {boolean}
	 * @static
	 */
	static checkFunction(fn) {
		if (typeof fn !== "function") return false;
		if (this.checkClass(fn)) return false;
		return true;
	}

	/**
	 * クラスかチェック
	 * @param {any} fn
	 * @returns {boolean}
	 * @static
	 */
	static checkClass(fn) {
		if (typeof fn !== "function") return false;
		if (this._CLASS_REG.test(fn.toString())) return true;
		if (fn === Function) return true;
		try {
			new new Proxy(fn, { construct: () => ({}) })();
			return true;
		} catch {
			return false;
		}
	}
}

module.exports = TypeChecker;

},{"../base/Enum":1,"../libs/sys/JavaLibraryScriptCore":9,"../libs/sys/symbol/SymbolDict":12}],8:[function(require,module,exports){
module.exports = {
    IndexProxy: require("./IndexProxy.js"),
    ProxyManager: require("./ProxyManager.js"),
    TypeChecker: require("./TypeChecker.js"),
    sys: require("./sys/index.js")
};

},{"./IndexProxy.js":5,"./ProxyManager.js":6,"./TypeChecker.js":7,"./sys/index.js":11}],9:[function(require,module,exports){
const SymbolDict = require("./symbol/SymbolDict");

/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
class JavaLibraryScriptCore {
	/** @type {true} */
	static [SymbolDict.JavaLibraryScript] = true;
}

module.exports = JavaLibraryScriptCore;

},{"./symbol/SymbolDict":12}],10:[function(require,module,exports){
const SymbolDict = require("./symbol/SymbolDict");
const JavaLibraryScriptCore = require("./JavaLibraryScriptCore");

/**
 * ログ出力管理クラス
 * @class
 */
class Logger extends JavaLibraryScriptCore {
	/**
	 * コンソールスタイルを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_CONSOLE_STYLE = this._isEnableCustomConsole();
	/**
	 * 折りたたみなしのログを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_SIMPLE_LOG = true;
	/**
	 * スタックトレースを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_STACK_TRACE = true;
	/**
	 * 区切り線の長さの初期値
	 * @type {number}
	 * @default 50
	 * @static
	 */
	static DEFAULT_HR_SIZE = 40;

	/**
	 * ログレベル
	 * @enum {number}
	 * @readonly
	 * @static
	 */
	static LOG_LEVEL = {
		DEBUG: 0,
		TIME: 1,
		LOG: 3,
		WARN: 5,
		ERROR: 7,
		INFO: 9,
		IGNORE: 11,
	};
	/**
	 * コンソールスタイル
	 * @enum {string}
	 * @readonly
	 * @static
	 */
	static CONSOLE_STYLE = {
		DEBUG_TITLE: "color: gray;font-weight: normal;",
		DEBUG: "color: gray;",
		LOG_TITLE: "color: teal;font-weight: normal;",
		LOG: "color: teal;",
		WARN_TITLE: "background-color: #fef6d5;font-weight: normal;",
		WARN: "",
		ERROR_TITLE: "background-color: #fcebeb;font-weight: normal;",
		ERROR: "",
		INFO_TITLE: "color: blue;font-weight: normal;",
		INFO: "font-family: serif;",
		STACK_TRACE: "font-size: 0.8em;color: darkblue;",
	};
	/**
	 * スタックトレースを取得する正規表現
	 * @type {RegExp}
	 * @readonly
	 * @static
	 */
	static STACK_TRACE_GET_REG = /at (?:.+? )?\(?(.+):(\d+):(?:\d+)\)?/;

	/**
	 * @param {String} [prefix=""]
	 * @param {number} [visibleLevel=Logger.LOG_LEVEL.WARN]
	 */
	constructor(prefix = "", visibleLevel = Logger.LOG_LEVEL.WARN) {
		super();

		/**
		 * ログの先頭の文字列
		 * @type {String}
		 */
		this._prefix = prefix;
		/**
		 * 表示するログレベル
		 * @type {number}
		 */
		this._visibleLevel = visibleLevel;
	}

	/**
	 * ログの先頭の文字列を変更する
	 * @param {String} prefix
	 */
	setPrefix(prefix) {
		this._prefix = prefix;
	}
	/**
	 * ログの先頭の文字列を取得する
	 * @returns {String}
	 */
	getPrefix() {
		return this._prefix;
	}

	/**
	 * 表示するログレベルを変更する
	 * @param {number} level
	 */
	setVisibleLevel(level) {
		this._visibleLevel = level;
	}
	/**
	 * 表示するログレベルを取得する
	 * @returns {number}
	 */
	getVisibleLevel() {
		return this._visibleLevel;
	}

	/**
	 * カスタムコンソールが使用可能か判定する
	 * @returns {boolean}
	 * @static
	 */
	static _isEnableCustomConsole() {
		const t = navigator?.userAgent?.toLowerCase();
		if (!t) return false;
		return /(chrome|firefox|safari)/.test(t);
	}

	/**
	 * 表示可能なログレベルか判定する
	 * @param {number} level
	 * @returns {boolean}
	 */
	_isVisible(level) {
		return level >= this._visibleLevel;
	}

	/**
	 * ログの先頭の文字列を生成する
	 * @returns {String}
	 */
	_generatePrefix() {
		if (!this._prefix) return "";
		return `[${this._prefix}] `;
	}

	/**
	 * ログレベルを文字列に変換する
	 * @param {number} level
	 * @returns {String | false}
	 */
	_getLevelToString(level) {
		/** @type {typeof Logger.LOG_LEVEL} */
		const LOG_LEVEL = this.constructor.LOG_LEVEL;
		switch (level) {
			case LOG_LEVEL.DEBUG:
				return "DEBUG";
			case LOG_LEVEL.LOG:
				return "LOG";
			case LOG_LEVEL.WARN:
				return "WARN";
			case LOG_LEVEL.ERROR:
				return "ERROR";
			case LOG_LEVEL.INFO:
				return "INFO";
			default:
				return false;
		}
	}

	/**
	 * 呼び出し元のスタックトレースを取得する
	 * @returns {String}
	 */
	_getTopStackTrace() {
		const stackLines = new Error().stack.split("\n");
		/** @type {typeof Logger} */
		const construct = this.constructor;
		const className = construct.name;
		const LibName = SymbolDict.LIBRARY_NAME;

		const reg = new RegExp(`(?:^|\\W)(?:${className}|${LibName})\\.`);

		// Logger.* 系のフレームを飛ばす
		let callerLine = "";
		for (let i = 1; i < stackLines.length; i++) {
			const line = stackLines[i];
			if (!reg.test(line)) {
				callerLine = line.trim();
				break;
			}
		}
		const match = callerLine.match(construct.STACK_TRACE_GET_REG);
		let location = "";
		if (match) {
			const filePath = match[1];
			const lineNumber = match[2];

			const parts = filePath.split(/[\\/]/);
			const shortPath = parts.slice(-1).join("/");
			location = `${shortPath}:${lineNumber}`;
		}

		return location;
	}

	/**
	 * ログを出力する
	 * @param {number} level
	 * @param {any[]} args
	 * @returns {boolean}
	 */
	_levelToPrint(level, args) {
		if (!this._isVisible(level)) return true;

		const levelStr = this._getLevelToString(level);
		if (!levelStr) return false;

		/** @type {typeof Logger} */
		const construct = this.constructor;

		let logFunc,
			title_prefix = "";
		/** @type {typeof Logger.LOG_LEVEL} */
		const LOG_LEVEL = construct.LOG_LEVEL;
		switch (level) {
			case LOG_LEVEL.DEBUG:
			case LOG_LEVEL.LOG:
				logFunc = console.log.bind(console);
				break;
			case LOG_LEVEL.WARN:
				logFunc = console.warn.bind(console);
				title_prefix = "⚠️";
				break;
			case LOG_LEVEL.ERROR:
				logFunc = console.error.bind(console);
				title_prefix = "🛑";
				break;
			case LOG_LEVEL.INFO:
				logFunc = console.info.bind(console);
				title_prefix = "ℹ️";
				break;
			default:
				logFunc = console.log.bind(console);
		}

		const format = args.map((a) => (typeof a === "string" ? "%s" : "%o")).join(" ");
		/** @type {typeof Logger.CONSOLE_STYLE} */
		const console_style = construct.CONSOLE_STYLE;

		let stackTrace = "";
		if (construct.ENABLE_STACK_TRACE) {
			stackTrace = this._getTopStackTrace();
		}

		if (construct.ENABLE_SIMPLE_LOG) {
			let stackName = "";
			if (stackTrace) {
				stackName = `[${stackTrace}]\n`;
			}
			if (construct.ENABLE_CONSOLE_STYLE) {
				logFunc(
					// 通常表示
					`%c%s%c${this._generatePrefix()}${format}`,
					console_style.STACK_TRACE,
					stackName,
					console_style[levelStr],
					...args
				);
			} else {
				logFunc(
					// 通常表示
					`%s${format}`,
					stackName,
					...args
				);
			}
			return true;
		}

		if (construct.ENABLE_CONSOLE_STYLE) {
			console.groupCollapsed(
				// タイトル表示
				`%c${this._generatePrefix()}${title_prefix}${format}`,
				console_style[`${levelStr}_TITLE`],
				...args
			);
		} else {
			console.groupCollapsed(
				// タイトル表示
				`${this._generatePrefix()}${title_prefix}${format}`,
				...args
			);
		}

		if (stackTrace) {
			if (construct.ENABLE_CONSOLE_STYLE) {
				console.log(`%c[%s]`, console_style.STACK_TRACE, stackTrace);
			} else {
				console.log(`[%s]`, stackTrace);
			}
		}
		if (construct.ENABLE_CONSOLE_STYLE) {
			logFunc(
				// 内部表示
				`%c${format}`,
				console_style[levelStr],
				...args
			);
		} else {
			logFunc(
				// 内部表示
				`${format}`,
				...args
			);
		}
		console.groupEnd();

		return true;
	}

	/**
	 * 開発用ログ
	 * @param {...any} args
	 */
	debug(...args) {
		const level = this.constructor.LOG_LEVEL.DEBUG;
		this._levelToPrint(level, args);
	}
	/**
	 * 通常ログ
	 * @param {...any} args
	 */
	log(...args) {
		const level = this.constructor.LOG_LEVEL.LOG;
		this._levelToPrint(level, args);
	}
	/**
	 * 警告ログ
	 * @param {...any} args
	 */
	warning(...args) {
		const level = this.constructor.LOG_LEVEL.WARN;
		this._levelToPrint(level, args);
	}
	/**
	 * 警告ログ
	 * @param {...any} args
	 */
	warn(...args) {
		this.warning(...args);
	}
	/**
	 * エラーログ
	 * @param {...any} args
	 */
	error(...args) {
		const level = this.constructor.LOG_LEVEL.ERROR;
		this._levelToPrint(level, args);
	}
	/**
	 * エラーログ
	 * @param {...any} args
	 */
	err(...args) {
		this.error(...args);
	}
	/**
	 * 情報ログ
	 * @param {...any} args
	 */
	information(...args) {
		const level = this.constructor.LOG_LEVEL.INFO;
		this._levelToPrint(level, args);
	}
	/**
	 * 情報ログ
	 * @param {...any} args
	 */
	info(...args) {
		this.information(...args);
	}
	/**
	 * タイムログ (開始)
	 * @param {String} label
	 * @returns {String}
	 */
	time(label) {
		const level = this.constructor.LOG_LEVEL.TIME;
		if (this._isVisible(level)) {
			const str = `${this._generatePrefix()}${label}`;
			console.log(`${str}: Start`);
			console.time(str);
		}
		return label;
	}
	/**
	 * タイムログ (終了)
	 * @param {String} label
	 */
	timeEnd(label) {
		const level = this.constructor.LOG_LEVEL.TIME;
		if (this._isVisible(level)) {
			console.timeEnd(`${this._generatePrefix()}${label}`);
		}
	}
	/**
	 * 区切り線を出力する
	 * @param {Number} [size]
	 */
	hr(size) {
		const hr_size = size || this.constructor.DEFAULT_HR_SIZE;

		let hr = "".padEnd(hr_size, "-");
		if (this._isVisible(this.constructor.LOG_LEVEL.LOG)) {
			console.log(hr);
		}
	}

	/**
	 * クラスのインスタンスをラップする
	 * @template {Object} T
	 * @param {T} instance
	 * @returns {T}
	 */
	wrapInstanceIO(instance) {
		// すでにラップ済みならそのまま返す
		if (instance[SymbolDict.LoggerWrapped]) return instance;

		const Log = this;
		const classRef = instance.constructor;
		const className = classRef.name;
		const proxy = new Proxy(instance, {
			get(target, prop, receiver) {
				const value = target[prop];
				if (typeof value === "function") {
					return (...args) => {
						Log.debug(`call ${className}.${prop}:`, args);
						const result = value.apply(target, args);

						// 戻り値が同じクラスのインスタンスなら再ラップ
						if (result instanceof classRef) {
							return Log.wrapInstanceIO(result, classRef);
						}

						return result;
					};
				}
				return value;
			},
		});

		proxy[SymbolDict.LoggerWrapped] = true;
		return proxy;
	}
}

/**
 * 内容ログ出力用のインスタンス
 * @type {Logger}
 */
const logging = new Logger("JLS", Logger.LOG_LEVEL.LOG);

module.exports = { Logger, logging };

},{"./JavaLibraryScriptCore":9,"./symbol/SymbolDict":12}],11:[function(require,module,exports){
module.exports = {
    JavaLibraryScriptCore: require("./JavaLibraryScriptCore.js"),
    ...require("./Logger.js"),
    symbol: require("./symbol/index.js")
};

},{"./JavaLibraryScriptCore.js":9,"./Logger.js":10,"./symbol/index.js":13}],12:[function(require,module,exports){
/**
 * Symbolの共通プレフィックス
 * @type {string}
 * @readonly
 */
const prefix = "@@JLS_";

const LIBRARY_NAME = "JavaLibraryScript";

/**
 * 内部利用Symbolの辞書
 * @enum {Symbol}
 * @readonly
 */
const SYMBOL_DICT = {
	// 定数
	/** @type {string} */
	LIBRARY_NAME,
	// 公開
	JavaLibraryScript: Symbol.for(`${prefix}${LIBRARY_NAME}`),
	instanceofTarget: Symbol.for(`${prefix}instanceofTarget`),
	LoggerWrapped: Symbol.for(`${prefix}LoggerWrapped`),
	// 内部
	TypeAny: Symbol("Any"),
	TypeVoid: Symbol("Void"),
};

module.exports = SYMBOL_DICT;

},{}],13:[function(require,module,exports){
module.exports = {
    ...require("./SymbolDict.js")
};

},{"./SymbolDict.js":12}],14:[function(require,module,exports){
const JavaLibraryScript = require("./index");

if (typeof window !== "undefined") {
	window.JavaLibraryScript = JavaLibraryScript;
}

module.exports = JavaLibraryScript;

},{"./index":4}],15:[function(require,module,exports){
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
		sqrtMaxChebyshevSteps = 30,
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
		 * 平方根[チェビシェフ法]の最大ステップ数
		 * @type {number}
		 * @default 30
		 */
		this.sqrtMaxChebyshevSteps = sqrtMaxChebyshevSteps;
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
	 * 等しいかどうかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {boolean}
	 * @throws {Error}
	 */
	compare(other) {
		const [valA, valB] = this._rescaleToMatch(other);
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
	 * どこまで精度が一致しているかを判定する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {number}
	 * @throws {Error}
	 */
	matchingPrecision(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);
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
		const [valA, valB, prec] = this._rescaleToMatch(other);

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
		const [valA, valB, prec] = this._rescaleToMatch(other);
		return this._makeResult(valA > valB ? valA - valB : valB - valA, prec);
	}
	/**
	 * 差分の非一致度を計算する
	 * @param {BigFloat | number | string | BigInt} other - 比較する値
	 * @returns {BigInt}
	 * @throws {Error}
	 */
	percentDiff(other) {
		const [valA, valB, prec] = this._rescaleToMatch(other);

		const absB = valB < 0n ? -valB : valB;
		const diff = valA > valB ? valA - valB : valB - valA;

		if (absB === 0n) return 0n;

		const scale = 10n ** prec;
		return this._makeResult((diff * scale * 100n) / absB, prec);
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
	 * @deprecated
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

		// // y == 0
		// if (y === 0n) {
		// 	if (x > 0n) return 0n;
		// 	if (x < 0n) return this._pi(precision);
		// }
		// const scale = 10n ** precision;

		// const ratio = (y * scale) / x;

		// const angle = this._atan(ratio, precision, maxSteps);

		// if (x > 0n) {
		// 	// 第1,4象限: そのまま
		// 	return angle;
		// }
		// const pi = this._pi(precision);
		// // 第2,3象限: πを足す
		// if (y >= 0n) {
		// 	return angle + pi;
		// }
		// return angle - pi;
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

},{"../libs/sys/JavaLibraryScriptCore":9,"../libs/sys/Logger":10}],16:[function(require,module,exports){
module.exports = {
    ...require("./BigFloat.js")
};

},{"./BigFloat.js":15}],17:[function(require,module,exports){
const IndexProxy = require("../libs/IndexProxy");
const ListInterface = require("./ListInterface");
const TypeChecker = require("../libs/TypeChecker");
const StreamChecker = require("./stream/StreamChecker");
const Stream = require("./stream/Stream");

/**
 * 型チェック機能のついたList
 * @template V
 * @extends {ListInterface<V>}
 * @class
 */
class ArrayList extends ListInterface {
	/**
	 * @param {Function} ValueType
	 * @param {Iterable<V>} [collection]
	 */
	constructor(ValueType, collection) {
		super(ValueType);
		this._list = [];

		if (collection) this.addAll(collection);

		IndexProxy.defineInitData(this);
	}

	/**
	 * instanceof を実装する
	 * @param {any} obj
	 * @returns {boolean}
	 */
	[Symbol.hasInstance](obj) {
		return IndexProxy.hasInstance(this, obj);
	}

	// ==================================================
	// 基本操作
	// ==================================================

	/**
	 * 要素を追加する
	 * @param {V} item
	 * @returns {this}
	 * @throws {TypeError}
	 */
	add(item) {
		this._checkValue(item);
		this._list.push(item);
		return this;
	}

	/**
	 * 値を一括で追加する
	 * @param {Iterable<V>} collection
	 * @returns {this}
	 * @throws {TypeError}
	 */
	addAll(collection) {
		for (const item of collection) {
			this.add(item);
		}
		return this;
	}

	/**
	 * 指定したインデックスの要素を取得する
	 * @param {Number} index
	 * @returns {V}
	 */
	get(index) {
		return this._list[index];
	}

	/**
	 * 指定したインデックスの要素を設定する
	 * @param {Number} index
	 * @param {V} item
	 * @returns {this}
	 * @throws {TypeError}
	 */
	set(index, item) {
		this._checkValue(item);
		this._list[index] = item;
		return this;
	}

	/**
	 * 指定したインデックスの要素を削除する
	 * @param {Number} index
	 * @returns {V}
	 */
	remove(index) {
		return this._list.splice(index, 1)[0];
	}

	/**
	 * 要素数を返却する
	 * @returns {Number}
	 * @readonly
	 */
	get size() {
		return this._list.length;
	}

	/**
	 * 全要素を削除する
	 */
	clear() {
		this._list.length = 0;
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * 等価判定を行う
	 * @param {this} other
	 * @returns {boolean}
	 */
	equals(other) {
		if (!(other instanceof ArrayList) || this.size !== other.size) return false;

		for (let i = 0; i < this.size; i++) {
			if (this._list[i] !== other._list[i]) return false;
		}
		return true;
	}

	/**
	 * EnumのIteratorを返却する
	 * @returns {ArrayIterator<V>}
	 */
	values() {
		return this._list.values();
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} [thisArg]
	 */
	forEach(callback, thisArg) {
		for (const item of this._list) {
			callback.call(thisArg, item, item, this._list);
		}
	}

	/**
	 * ソートする
	 * @param {Function} [compareFn]
	 * @returns {this}
	 */
	sort(compareFn = undefined) {
		this._list.sort(compareFn);
	}

	/**
	 * ソートしたStreamを返却する
	 * @param {Function} [compareFn]
	 * @returns {Generator<V>}
	 */
	*sorted(compareFn = undefined) {
		yield* this.toArray().sort(compareFn);
	}

	/**
	 * 指定した範囲の配列を返却する
	 * @param {Number} from
	 * @param {Number} to
	 * @returns {ArrayList<V>}
	 */
	subList(from, to) {
		if (from < 0 || to > this.size || from > to) {
			throw new RangeError(`subList(${from}, ${to}) は無効な範囲です`);
		}
		return new this.constructor(this._ValueType, this._list.slice(from, to));
	}

	// ==================================================
	// Stream
	// ==================================================

	/**
	 * Streamを返却する
	 * @returns {Stream<V>}
	 */
	stream() {
		return StreamChecker.typeToStream(this._ValueType).from(this._list, this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 配列に変換する
	 * @returns {V[]}
	 */
	toArray() {
		return this._list.slice();
	}

	/**
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._ValueType)}>(size=${this.size})`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.values();
	}
}

/**
 * 直接参照機能を提供する
 * @type {IndexProxy<ArrayList>}
 * @readonly
 */
const indProxy = new IndexProxy(ArrayList);

/**
 * 配列を返却する
 * @param {Function} ValueType
 * @param {Iterable<V>} [collection]
 * @returns {ArrayList<V>}
 */
function arrayList(ValueType, collection) {
	return indProxy.create(ValueType, collection);
}

module.exports = { ArrayList, arrayList };

},{"../libs/IndexProxy":5,"../libs/TypeChecker":7,"./ListInterface":20,"./stream/Stream":27,"./stream/StreamChecker":28}],18:[function(require,module,exports){
const { TypeChecker } = require("../libs");
const MapInterface = require("./MapInterface");
const EntryStream = require("./stream/EntryStream");

/**
 * 型チェック機能のついたMap
 * @template K, V
 * @extends {MapInterface<K, V>}
 * @class
 */
class HashMap extends MapInterface {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super(KeyType, ValueType);
	}

	// ==================================================
	// 基本操作(override)
	// ==================================================

	/**
	 * データを追加・更新する
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	set(key, value) {
		this._checkKey(key);
		this._checkValue(value);
		return super.set(key, value);
	}
	/**
	 * データを追加・更新する
	 * @param {K} key
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	put(key, value) {
		return this.set(key, value);
	}

	/**
	 * データを一括で追加・更新する
	 * @param {Map<K, V>} map
	 * @throws {TypeError}
	 */
	setAll(map) {
		for (const [k, v] of map.entries()) {
			this.set(k, v);
		}
	}
	/**
	 * データを一括で追加・更新する
	 * @param {Map<K, V>} map
	 * @throws {TypeError}
	 */
	putAll(map) {
		return this.setAll(map);
	}

	/**
	 * データを取得する
	 * @param {K} key
	 * @returns {V}
	 * @throws {TypeError}
	 */
	get(key) {
		this._checkKey(key);
		return super.get(key);
	}

	/**
	 * Keyの存在を確認する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	has(key) {
		this._checkKey(key);
		return super.has(key);
	}
	/**
	 * Keyの存在を確認する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	containsKey(key) {
		return this.has(key);
	}

	/**
	 * Valueの存在を確認する
	 * @param {V} value
	 * @returns {boolean}
	 */
	containsValue(value) {
		for (const v of super.values()) {
			if (v === value) return true;
		}
		return false;
	}

	/**
	 * データを削除する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	delete(key) {
		this._checkKey(key);
		return super.delete(key);
	}
	/**
	 * データを削除する
	 * @param {K} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	remove(key) {
		return this.delete(key);
	}

	/**
	 * EntrySetを返却する
	 * @returns {MapIterator<[...[K, V]]>}
	 */
	entrySet() {
		return this.entries();
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * 等価判定を行う
	 * @param {this} otherMap
	 * @returns {boolean}
	 */
	equals(otherMap) {
		if (!(otherMap instanceof Map) || this.size !== otherMap.size) return false;
		for (const [k, v] of this.entries()) {
			if (!otherMap.has(k) || otherMap.get(k) !== v) return false;
		}
		return true;
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} thisArg
	 */
	forEach(callback, thisArg) {
		for (const [key, value] of this.entries()) {
			callback.call(thisArg, value, key, this);
		}
	}

	// ==================================================
	// Stream
	// ==================================================

	/**
	 * Streamを返却する
	 * @returns {EntryStream<K, V>}
	 */
	stream() {
		return EntryStream.from(this.entries(), this._KeyType, this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._KeyType)}, ${TypeChecker.typeNames(this._ValueType)}>(size=${this.size})`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.entries();
	}
}

module.exports = HashMap;

},{"../libs":8,"./MapInterface":21,"./stream/EntryStream":25}],19:[function(require,module,exports){
const SetInterface = require("./SetInterface");
const TypeChecker = require("../libs/TypeChecker");
const StreamChecker = require("./stream/StreamChecker");
const Stream = require("./stream/Stream");

/**
 * 型チェック機能のついたSet
 * @template V
 * @extends {SetInterface<V>}
 * @class
 */
class HashSet extends SetInterface {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super(ValueType);
	}

	// ==================================================
	// 基本操作(override)
	// ==================================================

	/**
	 * 値を追加する
	 * @param {V} value
	 * @returns {this}
	 * @throws {TypeError}
	 */
	add(value) {
		this._checkValue(value);
		return super.add(value);
	}

	/**
	 * 値を一括で追加する
	 * @param {Iterable<V>} collection
	 * @returns {this}
	 * @throws {TypeError}
	 */
	addAll(collection) {
		for (const item of collection) {
			this.add(item);
		}
		return this;
	}

	/**
	 * 値の存在を確認
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	has(value) {
		this._checkValue(value);
		return super.has(value);
	}
	/**
	 * 値の存在を確認
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	contains(value) {
		return this.has(value);
	}

	/**
	 * 全ての値の存在を確認
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	containsAll(collection) {
		for (const item of collection) {
			if (!this.has(item)) return false;
		}
		return true;
	}

	/**
	 * 値を削除する
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	delete(value) {
		this._checkValue(value);
		return super.delete(value);
	}
	/**
	 * 値を削除する
	 * @param {V} value
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	remove(value) {
		return this.delete(value);
	}

	/**
	 * 全ての値を削除する
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	removeAll(collection) {
		let modified = false;
		for (const item of collection) {
			modified = this.delete(item) || modified;
		}
		return modified;
	}

	/**
	 * 含まれない要素を全削除する
	 * @param {Iterable<V>} collection
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	retainAll(collection) {
		const otherSet = new Set(collection);
		let modified = false;
		for (const item of this) {
			if (!otherSet.has(item)) {
				this.delete(item);
				modified = true;
			}
		}
		return modified;
	}

	// ==================================================
	// 追加機能
	// ==================================================

	/**
	 * 等価判定を行う
	 * @param {this} otherSet
	 * @returns {boolean}
	 */
	equals(otherSet) {
		if (!(otherSet instanceof Set) || this.size !== otherSet.size) return false;
		for (const item of this) {
			if (!otherSet.has(item)) return false;
		}
		return true;
	}

	/**
	 * 全てのデータを呼び出す
	 * @param {Function} callback
	 * @param {any} [thisArg]
	 */
	forEach(callback, thisArg) {
		for (const item of this) {
			callback.call(thisArg, item, item, this);
		}
	}

	// ==================================================
	// Stream
	// ==================================================

	/**
	 * Streamを返却する
	 * @returns {Stream<V>}
	 */
	stream() {
		return StreamChecker.typeToStream(this._ValueType).from(this.values(), this._ValueType);
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 配列に変換する
	 * @returns {V[]}
	 */
	toArray() {
		return Array.from(this);
	}

	/**
	 * 文字列に変換する
	 * @returns {string}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._ValueType)}>(size=${this.size})`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.values();
	}
}

module.exports = HashSet;

},{"../libs/TypeChecker":7,"./SetInterface":22,"./stream/Stream":27,"./stream/StreamChecker":28}],20:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore");
const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Listの基底クラス
 * @template V
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 * @interface
 */
class ListInterface extends JavaLibraryScriptCore {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super();
		this._ValueType = ValueType || Any;
	}

	/**
	 * Valueの型をチェックする
	 * @param {V} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${TypeChecker.typeNames(this._ValueType)} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}

	/**
	 * 空かどうかを返却する
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.size === 0;
	}
}

ListInterface = Interface.convert(ListInterface, {
	add: { args: [NotEmpty], returns: ListInterface },
	get: { args: [Number], returns: Any },
	set: { args: [Number, NotEmpty], returns: ListInterface },
	remove: { args: [Number], returns: Any },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	toArray: { returns: Array },
});

module.exports = ListInterface;

},{"../base/Interface":2,"../libs/TypeChecker":7,"../libs/sys/JavaLibraryScriptCore":9}],21:[function(require,module,exports){
const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Mapの基底クラス
 * @template K, V
 * @extends {Map<K, V>}
 * @class
 * @abstract
 * @interface
 */
class MapInterface extends Map {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super();
		this._KeyType = KeyType || Any;
		this._ValueType = ValueType || Any;
	}

	/**
	 * Keyの型をチェックする
	 * @param {K} key
	 * @throws {TypeError}
	 */
	_checkKey(key) {
		if (!TypeChecker.matchType(key, this._KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${TypeChecker.typeNames(this._KeyType)} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	/**
	 * Valueの型をチェックする
	 * @param {V} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${TypeChecker.typeNames(this._ValueType)} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}

	/**
	 * 空かどうかを返却する
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.size === 0;
	}
}

MapInterface = Interface.convert(MapInterface, {
	set: { args: [NotEmpty, NotEmpty], returns: MapInterface, abstract: true },
	put: { args: [NotEmpty, NotEmpty], returns: MapInterface },
	get: { args: [NotEmpty], returns: Any, abstract: true },
	delete: { args: [NotEmpty], returns: Boolean, abstract: true },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean, abstract: true },
	containsKey: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});

module.exports = MapInterface;

},{"../base/Interface":2,"../libs/TypeChecker":7}],22:[function(require,module,exports){
const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

/**
 * Setの基底クラス
 * @template V
 * @extends {Set<V>}
 * @class
 * @abstract
 * @interface
 */
class SetInterface extends Set {
	/**
	 * @param {Function} ValueType
	 */
	constructor(ValueType) {
		super();
		this._ValueType = ValueType || Any;
	}

	/**
	 * Valueの型をチェックする
	 * @param {V} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${TypeChecker.typeNames(this._ValueType)} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}

	/**
	 * 空かどうかを返却する
	 * @returns {boolean}
	 */
	isEmpty() {
		return this.size === 0;
	}
}

SetInterface = Interface.convert(SetInterface, {
	add: { args: [NotEmpty], returns: SetInterface },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean, abstract: true },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	contains: { args: [NotEmpty], returns: Boolean },
});

module.exports = SetInterface;

},{"../base/Interface":2,"../libs/TypeChecker":7}],23:[function(require,module,exports){
module.exports = {
    ...require("./ArrayList.js"),
    HashMap: require("./HashMap.js"),
    HashSet: require("./HashSet.js"),
    ListInterface: require("./ListInterface.js"),
    MapInterface: require("./MapInterface.js"),
    SetInterface: require("./SetInterface.js"),
    stream: require("./stream/index.js")
};

},{"./ArrayList.js":17,"./HashMap.js":18,"./HashSet.js":19,"./ListInterface.js":20,"./MapInterface.js":21,"./SetInterface.js":22,"./stream/index.js":31}],24:[function(require,module,exports){
const StreamInterface = require("./StreamInterface");
const Stream = require("./Stream");

/**
 * 非同期Stream (LazyAsyncList)
 * @extends {StreamInterface}
 * @class
 */
class AsyncStream extends StreamInterface {
	/**
	 * @param {Iterable | AsyncIterator} source
	 */
	constructor(source) {
		super();
		this._iter = AsyncStream._normalize(source);
		this._pipeline = [];
	}

	/**
	 * AsyncStream化
	 * @template {AsyncStream} T
	 * @this {new (iterable: Iterable | AsyncIterator) => T}
	 * @param {Iterable | AsyncIterator} iterable
	 * @returns {T}
	 * @static
	 */
	static from(iterable) {
		return new AsyncStream(iterable);
	}

	/**
	 * Iterable化
	 * @param {Iterable | AsyncIterator} input
	 * @returns {AsyncIterator}
	 */
	static _normalize(input) {
		if (typeof input[Symbol.asyncIterator] === "function") return input;
		if (typeof input[Symbol.iterator] === "function") {
			return (async function* () {
				for (const x of input) yield x;
			})();
		}
		throw new TypeError("not (Async)Iterable");
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	/**
	 * pipelineに追加
	 * @param {Generator} fn
	 * @returns {this}
	 */
	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	/**
	 * pipelineを圧縮
	 * @returns {this}
	 */
	flattenPipeline() {
		const flattenedFn = this._pipeline.reduceRight(
			(nextFn, currentFn) => {
				return async function* (iterable) {
					yield* currentFn(nextFn(iterable));
				};
			},
			async function* (x) {
				yield* x;
			}
		);
		const flat = new this.constructor([]);
		flat._iter = this._iter;
		flat._pipeline = [flattenedFn];
		return flat;
	}

	/**
	 * 処理を一括関数化
	 * @returns {Function}
	 */
	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	/**
	 * AsyncStreamをマップ
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	map(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) yield await fn(x);
		});
	}

	/**
	 * AsyncStreamをフィルタ
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	filter(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				if (await fn(x)) yield x;
			}
		});
	}

	/**
	 * AsyncStreamを展開
	 * @param {Function | Promise} fn
	 * @returns {this}
	 */
	flatMap(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				const sub = await fn(x);
				for await (const y of AsyncStream._normalize(sub)) yield y;
			}
		});
	}

	/**
	 * AsyncStreamの重複を排除
	 * @param {Function | Promise} keyFn
	 * @returns {this}
	 */
	distinct(keyFn = (x) => x) {
		return this._use(async function* (iter) {
			const seen = new Set();
			for await (const x of iter) {
				const key = await keyFn(x);
				if (!seen.has(key)) {
					seen.add(key);
					yield x;
				}
			}
		});
	}

	/**
	 * AsyncStreamの要素は変更せずに関数のみを実行
	 * @param {Function} fn
	 * @returns {this}
	 */
	peek(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				fn(x);
				yield x;
			}
		});
	}

	/**
	 * AsyncStreamの要素数を先頭から制限
	 * @param {Number} n
	 * @returns {this}
	 */
	limit(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ < n) yield x;
				else break;
			}
		});
	}

	/**
	 * AsyncStreamの要素数を先頭からスキップ
	 * @param {Number} n
	 * @returns {this}
	 */
	skip(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ >= n) yield x;
			}
		});
	}

	// ==================================================
	// Iterator
	// ==================================================

	/**
	 * Streamをイテレータ化(非同期)
	 * @returns {AsyncIterator}
	 */
	[Symbol.asyncIterator]() {
		let iter = this._iter;
		for (const op of this._pipeline) {
			iter = op(iter);
		}
		return iter[Symbol.asyncIterator]();
	}
	// ==================================================
	// End
	// ==================================================

	/**
	 * AsyncStreamをforEach
	 * @param {Function | Promise} fn
	 * @async
	 */
	async forEach(fn) {
		for await (const x of this) {
			await fn(x);
		}
	}

	/**
	 * AsyncStreamを配列化
	 * @returns {Array}
	 * @async
	 */
	async toArray() {
		const result = [];
		for await (const x of this) {
			result.push(x);
		}
		return result;
	}

	/**
	 * AsyncStreamをreduce
	 * @param {Function | Promise} fn
	 * @param {any} initial
	 * @returns {any}
	 * @async
	 */
	async reduce(fn, initial) {
		let acc = initial;
		for await (const x of this) {
			acc = await fn(acc, x);
		}
		return acc;
	}

	/**
	 * AsyncStreamの要素数を取得
	 * @returns {Number}
	 * @async
	 */
	async count() {
		return await this.reduce((acc) => acc + 1, 0);
	}

	/**
	 * AsyncStreamで条件を満たす要素があるか検査
	 * @param {Function | Promise} fn
	 * @returns {Boolean}
	 * @async
	 */
	async some(fn) {
		for await (const x of this) {
			if (await fn(x)) return true;
		}
		return false;
	}

	/**
	 * Streamで全ての要素が条件を満たすか検査
	 * @param {Function | Promise} fn
	 * @returns {Boolean}
	 * @async
	 */
	async every(fn) {
		for await (const x of this) {
			if (!(await fn(x))) return false;
		}
		return true;
	}

	/**
	 * AsyncStreamから最初の要素を取得
	 * @returns {any}
	 * @async
	 */
	async findFirst() {
		for await (const item of this) return item;
		return undefined;
	}

	/**
	 * Streamから任意の要素を取得
	 * @returns {any}
	 * @async
	 */
	async find() {
		return await this.findFirst();
	}

	/**
	 * Java Collectors 相当
	 * @param {Function} collectorFn
	 * @returns {any}
	 */
	collectWith(collectorFn) {
		return collectorFn(this);
	}

	// ==================================================
	// mapTo
	// ==================================================

	/**
	 * AsyncStreamをStreamに変換
	 * @returns {Stream}
	 * @async
	 */
	async toLazy() {
		const arr = [];
		for await (const item of this) {
			arr.push(item);
		}
		return new Stream(arr);
	}

	// ==================================================
	// その他
	// ==================================================

	/**
	 * 文字列に変換する
	 * @returns {String}
	 */
	toString() {
		return `${this.constructor.name}<Promise>`;
	}
}

module.exports = AsyncStream;

},{"./Stream":27,"./StreamInterface":29}],25:[function(require,module,exports){
const Stream = require("./Stream");
const StreamChecker = require("./StreamChecker");
const TypeChecker = require("../../libs/TypeChecker");

/** @typedef {import("../HashMap.js")} HashMapType */

const Any = TypeChecker.Any;

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap");
}

/**
 * Entry専用Stream (LazyList)
 * @template K, V
 * @extends {Stream<V>}
 * @class
 */
class EntryStream extends Stream {
	/**
	 * @param {Iterable} source
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(source, KeyType, ValueType) {
		super(source, ValueType);

		this.mapToEntry = undefined;
		this._KeyType = KeyType || Any;
	}

	/**
	 * Stream化
	 * @template {EntryStream} T
	 * @this {new (Iterable, Function, Function) => T}
	 * @param {Iterable} iterable
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 * @returns {T}
	 * @overload
	 * @static
	 */
	static from(iterable, KeyType, ValueType) {
		return new this(iterable, KeyType, ValueType);
	}

	/**
	 * EntryStreamからキーのStreamを返却
	 * @returns {Stream}
	 */
	keys() {
		return this._convertToX(StreamChecker.typeToStream(this._KeyType)).map(([k, _]) => k);
	}

	/**
	 * EntryStreamから値のStreamを返却
	 * @returns {Stream}
	 */
	values() {
		return this._convertToX(StreamChecker.typeToStream(this._ValueType)).map(([_, v]) => v);
	}

	/**
	 * EntryStreamのキーをマップ
	 * @param {Function} fn
	 * @returns {this}
	 */
	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	/**
	 * EntryStreamの値をマップ
	 * @param {Function} fn
	 * @returns {this}
	 */
	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}

	// ==================================================
	// to
	// ==================================================

	/**
	 * EntryStreamをHashMapに変換する
	 * @param {Function} [KeyType]
	 * @param {Function} [ValueType]
	 * @returns {HashMapType}
	 */
	toHashMap(KeyType = this._KeyType, ValueType = this._ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}

	/**
	 * 文字列に変換する
	 * @returns {String}
	 * @override
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._KeyType)}, ${TypeChecker.typeNames(this._ValueType)}>`;
	}
}

module.exports = EntryStream;

},{"../../libs/TypeChecker":7,"../HashMap":18,"./Stream":27,"./StreamChecker":28}],26:[function(require,module,exports){
const Stream = require("./Stream");

/**
 * 数値専用Stream (LazyList)
 * @template V
 * @extends {Stream<V>}
 * @class
 */
class NumberStream extends Stream {
	/**
	 * @param {Iterable<V} source
	 */
	constructor(source) {
		super(source, Number);

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

module.exports = NumberStream;

},{"./Stream":27}],27:[function(require,module,exports){
const StreamInterface = require("./StreamInterface");
const TypeChecker = require("../../libs/TypeChecker");

const Any = TypeChecker.Any;

/** @typedef {import("./NumberStream.js")} NumberStreamType */
// /** @typedef {import("./StringStream.js")} StringStream_forceRep */ // なぜかこいつだけ動かん
/** @typedef {import("./EntryStream.js")} EntryStreamType */
/** @typedef {import("./AsyncStream.js")} AsyncStreamType */
/** @typedef {import("../HashSet.js")} HashSetType */

let NumberStream, StringStream, EntryStream, AsyncStream, HashSet;
function init() {
	if (NumberStream) return;
	NumberStream = require("./NumberStream");
	StringStream = require("./StringStream");
	EntryStream = require("./EntryStream");
	AsyncStream = require("./AsyncStream");
	HashSet = require("../HashSet");
}

/**
 * Streamオブジェクト(LazyList)
 * @template V
 * @extends {StreamInterface}
 * @class
 */
class Stream extends StreamInterface {
	/**
	 * @param {Iterable<V>} source
	 * @param {Function} ValueType
	 */
	constructor(source, ValueType) {
		super();
		this._iter = source[Symbol.iterator]();
		this._pipeline = [];

		this._ValueType = ValueType || Any;

		init();
	}

	/**
	 * Stream化
	 * @template {Stream} T
	 * @this {new (Iterable) => T}
	 * @param {Iterable<V>} iterable
	 * @param {Function} ValueType
	 * @returns {T}
	 * @static
	 */
	static from(iterable, ValueType) {
		return new this(iterable, ValueType);
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	/**
	 * pipelineに追加
	 * @param {Generator} fn
	 * @returns {this}
	 */
	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	/**
	 * 他Streamに変換
	 * @param {Function} construct
	 * @param {Generator} fn
	 * @param {...any} args
	 * @returns {this}
	 */
	_convertToX(construct, fn, ...args) {
		const newStream = new construct([], ...args);
		newStream._iter = this._iter;
		newStream._pipeline = [...this._pipeline];
		if (fn) newStream._pipeline.push(fn);
		return newStream;
	}

	/**
	 * pipelineを圧縮
	 * @returns {this}
	 */
	flattenPipeline() {
		const flattenedFn = this._pipeline.reduceRight(
			(nextFn, currentFn) => {
				return function* (iterable) {
					yield* currentFn(nextFn(iterable));
				};
			},
			(x) => x
		);

		const flat = new this.constructor([]); // 継承クラス対応
		flat._iter = this._iter;
		flat._pipeline = [flattenedFn];
		return flat;
	}

	/**
	 * 処理を一括関数化
	 * @returns {Function}
	 */
	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	/**
	 * Streamをマップ
	 * @param {Function} fn
	 * @returns {this}
	 */
	map(fn) {
		return this._use(function* (iter) {
			for (const item of iter) yield fn(item);
		});
	}

	/**
	 * Streamをフィルタ
	 * @param {Function} fn
	 * @returns {this}
	 */
	filter(fn) {
		return this._use(function* (iter) {
			for (const item of iter) if (fn(item)) yield item;
		});
	}

	/**
	 * Streamを展開
	 * @param {Function} fn
	 * @returns {this}
	 */
	flatMap(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				const sub = fn(item);
				yield* sub instanceof StreamInterface ? sub : sub[Symbol.iterator]();
			}
		});
	}

	/**
	 * Streamの重複を排除
	 * @param {Function} keyFn
	 * @returns {this}
	 */
	distinct(keyFn = JSON.stringify.bind(JSON)) {
		return this._use(function* (iter) {
			const seen = new Set();
			for (const item of iter) {
				const key = keyFn(item);
				if (!seen.has(key)) {
					seen.add(key);
					yield item;
				}
			}
		});
	}

	/**
	 * Streamをソート
	 * @param {Function} compareFn
	 * @returns {this}
	 */
	sorted(compareFn = (a, b) => (a > b ? 1 : a < b ? -1 : 0)) {
		return this._use(function* (iter) {
			const arr = [...iter].sort(compareFn);
			yield* arr;
		});
	}

	/**
	 * Streamの要素は変更せずに関数のみを実行
	 * @param {Function} fn
	 * @returns {this}
	 */
	peek(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				fn(item);
				yield item;
			}
		});
	}

	/**
	 * Streamの要素数を先頭から制限
	 * @param {Number} n
	 * @returns {this}
	 */
	limit(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ >= n) break;
				yield item;
			}
		});
	}

	/**
	 * Streamの要素数を先頭からスキップ
	 * @param {Number} n
	 * @returns {this}
	 */
	skip(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ < n) continue;
				yield item;
			}
		});
	}

	/**
	 * Streamを分割
	 * @param {Number} size
	 * @returns {this}
	 */
	chunk(size) {
		return this._use(function* (iter) {
			let buf = [];
			for (const item of iter) {
				buf.push(item);
				if (buf.length === size) {
					yield buf;
					buf = [];
				}
			}
			if (buf.length) yield buf;
		});
	}

	/**
	 * Streamをスライド分割
	 * @param {Number} size
	 * @param {Number} step
	 * @returns {this}
	 */
	windowed(size, step = size) {
		return this._use(function* (iter) {
			const buffer = [];
			for (const item of iter) {
				buffer.push(item);
				if (buffer.length === size) {
					yield buffer.slice();
					buffer.splice(0, step); // スライド
				}
			}
		});
	}

	// ==================================================
	// Iterator
	// ==================================================

	/**
	 * Streamをイテレータ化
	 * @returns {Iterator}
	 */
	[Symbol.iterator]() {
		return this._pipeline.reduce((iter, fn) => fn(iter), this._iter);
	}

	/**
	 * Streamをイテレータ化(非同期)
	 * @returns {AsyncIterator}
	 */
	[Symbol.asyncIterator]() {
		let iter = this._pipeline.reduce((i, fn) => fn(i), this._iter);
		return {
			async next() {
				return Promise.resolve(iter.next());
			},
		};
	}

	// ==================================================
	// End
	// ==================================================

	/**
	 * StreamをforEach
	 * @param {Function} fn
	 */
	forEach(fn) {
		for (const item of this) fn(item);
	}

	/**
	 * Streamを配列化
	 * @returns {V[]}
	 */
	toArray() {
		return Array.from(this);
	}

	/**
	 * Streamをreduce
	 * @param {Function} fn
	 * @param {any} initial
	 * @returns {any}
	 */
	reduce(fn, initial) {
		let acc = initial;
		for (const item of this) {
			acc = fn(acc, item);
		}
		return acc;
	}

	/**
	 * Streamの要素数を取得
	 * @returns {Number}
	 */
	count() {
		let c = 0;
		for (const _ of this) c++;
		return c;
	}

	/**
	 * Streamで条件を満たす要素があるか検査
	 * @param {Function} fn
	 * @returns {Boolean}
	 */
	some(fn) {
		for (const item of this) {
			if (fn(item)) return true;
		}
		return false;
	}

	/**
	 * Streamで全ての要素が条件を満たすか検査
	 * @param {Function} fn
	 * @returns {Boolean}
	 */
	every(fn) {
		for (const item of this) {
			if (!fn(item)) return false;
		}
		return true;
	}

	/**
	 * Streamから最初の要素を取得
	 * @returns {any}
	 */
	findFirst() {
		for (const item of this) return item;
		return undefined;
	}

	/**
	 * Streamから任意の要素を取得
	 * @returns {any}
	 */
	findAny() {
		return this.findFirst(); // 同義（非並列）
	}

	/**
	 * Java Collectors 相当
	 * @param {Function} collectorFn
	 * @returns {any}
	 */
	collectWith(collectorFn) {
		return collectorFn(this);
	}

	// ==================================================
	// mapTo
	// ==================================================

	/**
	 * StreamをNumberStreamに変換
	 * @param {Function} fn
	 * @returns {NumberStreamType}
	 */
	mapToNumber(fn) {
		return this._convertToX(NumberStream, function* (iter) {
			for (const item of iter) {
				const mapped = fn(item);
				if (typeof mapped !== "number") {
					throw new TypeError(`mapToNumber() must return number. Got ${typeof mapped}`);
				}
				yield mapped;
			}
		});
	}

	/**
	 * StreamをStringStreamに変換
	 * @param {Function} fn
	 * @returns {StringStream_forceRep}
	 */
	mapToString(fn) {
		return this._convertToX(StringStream, function* (iter) {
			for (const item of iter) {
				const mapped = fn(item);
				if (typeof mapped !== "string") {
					throw new TypeError(`mapToString() must return string. Got ${typeof mapped}`);
				}
				yield mapped;
			}
		});
	}

	/**
	 * StreamをEntryStreamに変換
	 * @param {Function} fn
	 * @returns {EntryStreamType}
	 */
	mapToEntry(fn) {
		return this._convertToX(
			EntryStream,
			function* (iter) {
				for (const item of iter) {
					const entry = fn(item);
					if (!Array.isArray(entry) || entry.length !== 2) {
						throw new TypeError(`mapToEntry() must return [key, value] pair. Got: ${entry}`);
					}
					yield entry;
				}
			},
			Any,
			Any
		);
	}

	/**
	 * StreamをAsyncStreamに変換
	 * @param {Function} fn
	 * @returns {AsyncStreamType}
	 */
	mapToAsync(fn) {
		const input = this.flattenPipeline();
		const sourceIterable = input._pipeline[0](input._iter); // 実行（同期 generator）

		// AsyncStream に渡す非同期イテレータを構築
		const asyncIterable = (async function* () {
			for (const item of sourceIterable) {
				yield await fn(item);
			}
		})();

		return new AsyncStream(asyncIterable);
	}

	// ==================================================
	// to
	// ==================================================

	/**
	 * StreamをHashSetに変換
	 * @param {Function} [ValueType]
	 * @returns {HashSetType}
	 */
	toHashSet(ValueType = this._ValueType) {
		const set = new HashSet(ValueType);
		for (const item of this) set.add(item);
		return set;
	}

	/**
	 * 文字列に変換する
	 * @returns {String}
	 */
	toString() {
		return `${this.constructor.name}<${TypeChecker.typeNames(this._ValueType)}>`;
	}
}

module.exports = Stream;

},{"../../libs/TypeChecker":7,"../HashSet":19,"./AsyncStream":24,"./EntryStream":25,"./NumberStream":26,"./StreamInterface":29,"./StringStream":30}],28:[function(require,module,exports){
const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore");
const TypeChecker = require("../../libs/TypeChecker");
const StreamInterface = require("./StreamInterface");

let Stream, NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (Stream) return;
	Stream = require("./Stream");
	NumberStream = require("./NumberStream");
	StringStream = require("./StringStream");
	EntryStream = require("./EntryStream");
	AsyncStream = require("./AsyncStream");
}

/**
 * Streamの型チェック
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class StreamChecker extends JavaLibraryScriptCore {
	/**
	 * TypeをStreamに変換する
	 * @param {Function} expected
	 * @returns {StreamInterface}
	 */
	static typeToStream(expected) {
		init();
		if (expected == null) return Stream;
		if (expected === String) return StringStream;
		if (expected === Number) return NumberStream;
		if (expected === Map) return EntryStream;
		if (expected === Promise) return AsyncStream;
		return Stream;
	}

	/**
	 * StreamをTypeに変換する
	 * @param {StreamInterface} stream
	 * @returns {Function}
	 * @static
	 */
	static streamToType(stream) {
		init();
		// Stream継承
		if (stream instanceof StringStream) return String;
		if (stream instanceof NumberStream) return Number;
		if (stream instanceof EntryStream) return Map;
		// StreamInterface継承
		if (stream instanceof AsyncStream) return Promise;
		if (stream instanceof Stream) return TypeChecker.Any;
		return null;
	}
}

module.exports = StreamChecker;

},{"../../libs/TypeChecker":7,"../../libs/sys/JavaLibraryScriptCore":9,"./AsyncStream":24,"./EntryStream":25,"./NumberStream":26,"./Stream":27,"./StreamInterface":29,"./StringStream":30}],29:[function(require,module,exports){
const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore");
const Interface = require("../../base/Interface");

/**
 * Streamの基底クラス
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 */
class StreamInterface extends JavaLibraryScriptCore {
	constructor() {
		super();
	}
}

StreamInterface = Interface.convert(StreamInterface, {
	map: {
		args: [Function],
		returns: StreamInterface,
	},
	filter: {
		args: [Function],
		returns: StreamInterface,
	},
	flatMap: {
		args: [Function],
		returns: StreamInterface,
	},
	//
	forEach: {
		args: [[Function, Promise]],
		returns: [undefined, Promise],
	},
});

module.exports = StreamInterface;

},{"../../base/Interface":2,"../../libs/sys/JavaLibraryScriptCore":9}],30:[function(require,module,exports){
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

},{"./Stream":27}],31:[function(require,module,exports){
module.exports = {
    AsyncStream: require("./AsyncStream.js"),
    EntryStream: require("./EntryStream.js"),
    NumberStream: require("./NumberStream.js"),
    Stream: require("./Stream.js"),
    StreamChecker: require("./StreamChecker.js"),
    StreamInterface: require("./StreamInterface.js"),
    StringStream: require("./StringStream.js")
};

},{"./AsyncStream.js":24,"./EntryStream.js":25,"./NumberStream.js":26,"./Stream.js":27,"./StreamChecker.js":28,"./StreamInterface.js":29,"./StringStream.js":30}]},{},[14])
//# sourceMappingURL=JavaLibraryScript.js.map
