(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");

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

},{"../libs/sys/JavaLibraryScriptCore.js":7}],2:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const TypeChecker = require("../libs/TypeChecker.js");
const { _EnumItem, Enum } = require("./Enum.js");

/**
 * @typedef {{throw: _EnumItem, log: _EnumItem, ignore: _EnumItem}} ErrorModeItem
 */
//
/**
 * @typedef {Object} InterfaceTypeData
 * @property {Function[] | null} [args] - 引数の型定義
 * @property {Function | Function[] | null} [returns] - 戻り値の型定義
 * @property {boolean} [abstract=true] - 抽象クラス化
 */
//
/**
 * @typedef {Object.<string, InterfaceTypeData>} InterfaceTypeDataList
 */
//
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
	static _isDebugMode = false;

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
	 * @static
	 */
	static _handleError(error, message) {
		const errorMode = this._errorMode;
		switch (this._errorMode) {
			case errorMode.throw:
				throw new error(message);
			case errorMode.log:
				console.warn("[Interface Warning]", message);
				break;
			case errorMode.ignore:
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

		const interfaceClass = class extends TargetClass {
			constructor(...args) {
				if (abstract) {
					if (new.target === interfaceClass) {
						this._handleError(TypeError, `Cannot instantiate abstract class ${TargetClass.name}`);
					}
				}
				super(...args);

				if (!Interface._isDebugMode) return;

				const proto = Object.getPrototypeOf(this);
				const defs = proto.__interfaceTypes || {};

				for (const methodName of Object.keys(defs)) {
					const def = defs[methodName];
					const original = this[methodName];
					const isAbstract = !!def.abstract;

					if (typeof original !== "function") {
						if (isAbstract) continue;
						this._handleError(Error, `"${this.constructor.name}" はメソッド "${methodName}" を実装する必要があります`);
					}

					// ラップは一度だけ（重複防止）
					if (!original.__isWrapped) {
						const wrapped = (...args) => {
							// 引数チェック
							const expectedArgs = def.args || [];
							for (let i = 0; i < expectedArgs.length; i++) {
								if (!TypeChecker.matchType(args[i], expectedArgs[i])) {
									this._handleError(TypeError, `"${this.constructor.name}.${methodName}" 第${i + 1}引数: ${TypeChecker.typeNames(expectedArgs[i])} を期待 → 実際: ${TypeChecker.stringify(args[i])}`);
								}
							}

							const result = original.apply(this, args);
							const expectedReturn = TypeChecker.checkFunction(def.returns) ? def.returns(args) : def.returns;

							const validate = (val) => {
								if (!TypeChecker.matchType(val, expectedReturn)) {
									if (expectedReturn === TypeChecker.NoReturn) {
										this._handleError(TypeError, `"${this.constructor.name}.${methodName}" は戻り値を返してはいけません → 実際: ${TypeChecker.stringify(val)}`);
									} else {
										this._handleError(TypeError, `"${this.constructor.name}.${methodName}" の戻り値: ${TypeChecker.typeNames(expectedReturn)} を期待 → 実際: ${TypeChecker.stringify(val)}`);
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

},{"../libs/TypeChecker.js":5,"../libs/sys/JavaLibraryScriptCore.js":7,"./Enum.js":1}],3:[function(require,module,exports){
module.exports = {
    ...require("./Enum.js"),
    Interface: require("./Interface.js")
};

},{"./Enum.js":1,"./Interface.js":2}],4:[function(require,module,exports){
module.exports = {
    base: require("./base/index.js"),
    libs: require("./libs/index.js"),
    util: require("./util/index.js")
};

},{"./base/index.js":3,"./libs/index.js":6,"./util/index.js":13}],5:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const { _EnumCore, _EnumItem } = require("../base/Enum.js");

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
	static Any = Symbol("any");
	/**
	 * 返り値を返さない関数の型
	 * @type {Symbol}
	 * @static
	 * @readonly
	 */
	static Void = Symbol("void");
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

},{"../base/Enum.js":1,"../libs/sys/JavaLibraryScriptCore.js":7}],6:[function(require,module,exports){
module.exports = {
    TypeChecker: require("./TypeChecker.js"),
    sys: require("./sys/index.js")
};

},{"./TypeChecker.js":5,"./sys/index.js":8}],7:[function(require,module,exports){
/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
class JavaLibraryScriptCore {
	/** @type {true} */
	static [Symbol.for("JavaLibraryScript")] = true;
}

module.exports = JavaLibraryScriptCore;

},{}],8:[function(require,module,exports){
module.exports = {
    JavaLibraryScriptCore: require("./JavaLibraryScriptCore.js")
};

},{"./JavaLibraryScriptCore.js":7}],9:[function(require,module,exports){
const JavaLibraryScript = require("./index.js");

if (typeof window !== "undefined") {
	window.JavaLibraryScript = JavaLibraryScript;
}

module.exports = JavaLibraryScript;

},{"./index.js":4}],10:[function(require,module,exports){
const MapInterface = require("./MapInterface");
const EntryStream = require("./stream/EntryStream.js");

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

	/**
	 * 空かどうかを返却する
	 * @returns {boolean}
	 */
	isEmpty() {
		return super.size === 0;
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
		if (this.size !== otherMap.size) return false;
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
		const data = Array.from(this.entries())
			.map(([k, v]) => `${k}=${v}`)
			.join(", ");
		return `{ ${data} }`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<V>}
	 */
	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}
}

module.exports = HashMap;

},{"./MapInterface":11,"./stream/EntryStream.js":15}],11:[function(require,module,exports){
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
		this._KeyType = KeyType;
		this._ValueType = ValueType;
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
}

module.exports = Interface.convert(MapInterface, {
	set: { args: [NotEmpty, NotEmpty], returns: Any, abstract: true },
	put: { args: [NotEmpty, NotEmpty], returns: Any },
	get: { args: [NotEmpty], returns: Any, abstract: true },
	delete: { args: [NotEmpty], returns: Boolean, abstract: true },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean, abstract: true },
	containsKey: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});

},{"../base/Interface":2,"../libs/TypeChecker":5}],12:[function(require,module,exports){
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
		this._ValueType = ValueType;
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
}

module.exports = Interface.convert(SetInterface, {
	set: { args: [NotEmpty, NotEmpty], returns: Any },
	put: { args: [NotEmpty, NotEmpty], returns: Any },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});

},{"../base/Interface":2,"../libs/TypeChecker":5}],13:[function(require,module,exports){
module.exports = {
    HashMap: require("./HashMap.js"),
    MapInterface: require("./MapInterface.js"),
    SetInterface: require("./SetInterface.js"),
    stream: require("./stream/index.js")
};

},{"./HashMap.js":10,"./MapInterface.js":11,"./SetInterface.js":12,"./stream/index.js":21}],14:[function(require,module,exports){
const StreamInterface = require("./StreamInterface.js");
const Stream = require("./Stream.js");

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
}

module.exports = AsyncStream;

},{"./Stream.js":17,"./StreamInterface.js":19}],15:[function(require,module,exports){
const Stream = require("./Stream.js");
const StreamChecker = require("./StreamChecker");

/** @typedef {import("../HashMap.js")} HashMapType */

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap.js");
}

/**
 * Entry専用Stream (LazyList)
 * @template K, V
 * @extends {Stream}
 * @class
 */
class EntryStream extends Stream {
	/**
	 * @param {Iterable} source
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(source, KeyType, ValueType) {
		super(source);

		this.mapToEntry = undefined;
		this._KeyType = KeyType;
		this._ValueType = ValueType;
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
}

module.exports = EntryStream;

},{"../HashMap.js":10,"./Stream.js":17,"./StreamChecker":18}],16:[function(require,module,exports){
const Stream = require("./Stream.js");

/**
 * 数値専用Stream (LazyList)
 * @extends {Stream}
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

module.exports = NumberStream;

},{"./Stream.js":17}],17:[function(require,module,exports){
const StreamInterface = require("./StreamInterface.js");
const TypeChecker = require("../../libs/TypeChecker");

const Any = TypeChecker.Any;

/** @typedef {import("./NumberStream.js")} NumberStreamType */
// /** @typedef {import("./StringStream.js")} StringStream_forceRep */
/** @typedef {import("./EntryStream.js")} EntryStreamType */
/** @typedef {import("./AsyncStream.js")} AsyncStreamType */

let NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (NumberStream) return;
	NumberStream = require("./NumberStream.js");
	StringStream = require("./StringStream.js");
	EntryStream = require("./EntryStream.js");
	AsyncStream = require("./AsyncStream.js");
}

/**
 * Streamオブジェクト(LazyList)
 * @extends {StreamInterface}
 * @class
 */
class Stream extends StreamInterface {
	/**
	 * @param {Iterable} source
	 */
	constructor(source) {
		super();
		this._iter = source[Symbol.iterator]();
		this._pipeline = [];

		init();
	}

	/**
	 * Stream化
	 * @template {Stream} T
	 * @this {new (Iterable) => T}
	 * @param {Iterable} iterable
	 * @returns {T}
	 * @static
	 */
	static from(iterable) {
		return new this(iterable);
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
	 * @returns {Array}
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
}

module.exports = Stream;

},{"../../libs/TypeChecker":5,"./AsyncStream.js":14,"./EntryStream.js":15,"./NumberStream.js":16,"./StreamInterface.js":19,"./StringStream.js":20}],18:[function(require,module,exports){
const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");
const TypeChecker = require("../../libs/TypeChecker.js");
const StreamInterface = require("./StreamInterface.js");

let Stream, NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (Stream) return;
	Stream = require("./Stream.js");
	NumberStream = require("./NumberStream.js");
	StringStream = require("./StringStream.js");
	EntryStream = require("./EntryStream.js");
	AsyncStream = require("./AsyncStream.js");
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

},{"../../libs/TypeChecker.js":5,"../../libs/sys/JavaLibraryScriptCore.js":7,"./AsyncStream.js":14,"./EntryStream.js":15,"./NumberStream.js":16,"./Stream.js":17,"./StreamInterface.js":19,"./StringStream.js":20}],19:[function(require,module,exports){
const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");
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

module.exports = Interface.convert(StreamInterface, {
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

},{"../../base/Interface":2,"../../libs/sys/JavaLibraryScriptCore.js":7}],20:[function(require,module,exports){
const Stream = require("./Stream.js");

/**
 * 文字列専用Stream (LazyList)
 * @extends {Stream}
 * @class
 */
class StringStream extends Stream {
	/**
	 * @param {Iterable} source
	 */
	constructor(source) {
		super(source);

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

},{"./Stream.js":17}],21:[function(require,module,exports){
module.exports = {
    AsyncStream: require("./AsyncStream.js"),
    EntryStream: require("./EntryStream.js"),
    NumberStream: require("./NumberStream.js"),
    Stream: require("./Stream.js"),
    StreamChecker: require("./StreamChecker.js"),
    StreamInterface: require("./StreamInterface.js"),
    StringStream: require("./StringStream.js")
};

},{"./AsyncStream.js":14,"./EntryStream.js":15,"./NumberStream.js":16,"./Stream.js":17,"./StreamChecker.js":18,"./StreamInterface.js":19,"./StringStream.js":20}]},{},[9])
//# sourceMappingURL=JavaLibraryScript.js.map
