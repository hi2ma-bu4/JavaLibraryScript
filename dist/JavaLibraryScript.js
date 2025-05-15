(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");

/**
 * 単一のEnum要素を表すクラス
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
	 * @param {_EnumItem} other
	 * @returns {number}
	 */
	compareTo(other) {
		return this.ordinal - other.ordinal;
	}

	/**
	 * 同一EnumItemかチェック
	 * @param {_EnumItem} other
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

class Interface extends JavaLibraryScriptCore {
	static _isDebugMode = false;

	static methodTypes = {};

	constructor() {
		super();
		if (new.target === Interface) {
			throw new Error("Interfaceは直接インスタンス化できません。継承して使ってください。");
		}

		if (!Interface._isDebugMode) return;

		const CLASS_REG = /^\s*class\s+/;

		const cls = this.constructor;
		const typeDefs = cls.methodTypes || {};

		for (const method in typeDefs) {
			const def = typeDefs[method];
			if (typeof this[method] !== "function") {
				throw new Error(`"${cls.name}" はメソッド "${method}" を実装する必要があります`);
			}

			const originalMethod = this[method].bind(this);

			this[method] = (...args) => {
				// 引数チェック
				const expectedArgs = def.args || [];
				for (let i = 0; i < expectedArgs.length; i++) {
					if (!TypeChecker.matchType(args[i], expectedArgs[i])) {
						throw new TypeError(`"${cls.name}.${method}" 第${i + 1}引数: ${TypeChecker.typeNames(expectedArgs[i])} を期待 → 実際: ${TypeChecker.stringify(args[i])}`);
					}
				}

				const result = originalMethod(...args);

				// 戻り値型を動的に取得
				const ret = def.returns;
				const expectedReturn = typeof ret === "function" && !CLASS_REG.test(ret.toString()) ? ret(args) : ret;

				const validate = (val) => {
					if (!TypeChecker.matchType(val, expectedReturn)) {
						throw new TypeError(`"${cls.name}.${method}" の戻り値: ${TypeChecker.typeNames(expectedReturn)} を期待 → 実際: ${TypeChecker.stringify(val)}`);
					}
					return val;
				};

				if (result instanceof Promise) {
					return result.then(validate);
				} else {
					return validate(result);
				}
			};
		}
	}
}

module.exports = Interface;

},{"../libs/TypeChecker.js":5,"../libs/sys/JavaLibraryScriptCore.js":7}],3:[function(require,module,exports){
module.exports = {
  ...require("./Enum.js"),
  Interface: require("./Interface.js")
};

},{"./Enum.js":1,"./Interface.js":2}],4:[function(require,module,exports){
module.exports = {
  base: require("./base"),
  libs: require("./libs"),
  util: require("./util")
};

},{"./base":3,"./libs":6,"./util":12}],5:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const { _EnumCore, _EnumItem } = require("../base/Enum.js");

class TypeChecker extends JavaLibraryScriptCore {
	static _NotType = class _NotType extends JavaLibraryScriptCore {
		constructor(typeToExclude) {
			super();
			if (typeToExclude instanceof TypeChecker._NotType) throw new TypeError("typeToExclude must be instance of NotType");
			this.typeToExclude = typeToExclude;
		}
	};

	static NotType(typeToExclude) {
		return new TypeChecker._NotType(typeToExclude);
	}
	// ==================================================

	static Any = Symbol("any");
	static Void = Symbol("void");
	static NoReturn = this.Void;

	static NotNull = this.NotType(null);
	static NotUndefined = this.NotType(undefined);

	// ==================================================

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

	static typeNames(expected) {
		if (Array.isArray(expected)) return expected.map((t) => t?.name || TypeChecker.stringify(t)).join(" | ");
		return expected?.name || TypeChecker.stringify(expected);
	}

	static stringify(value) {
		if (value === null || value === undefined) {
			return String(value);
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
}

module.exports = TypeChecker;

},{"../base/Enum.js":1,"../libs/sys/JavaLibraryScriptCore.js":7}],6:[function(require,module,exports){
module.exports = {
  TypeChecker: require("./TypeChecker.js"),
  sys: require("./sys")
};

},{"./TypeChecker.js":5,"./sys":8}],7:[function(require,module,exports){
const LIBRARY_ID = Symbol("JavaLibraryScript");

class JavaLibraryScriptCore {
	static [LIBRARY_ID] = true;
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
const Interface = require("../base/Interface");
const TypeChecker = require("../libs/TypeChecker");

const Any = TypeChecker.Any;
const NoReturn = TypeChecker.NoReturn;
const NotNull = TypeChecker.NotNull;
const NotUndefined = TypeChecker.NotUndefined;

const NotEmpty = [NotNull, NotUndefined];

class BaseMap extends Interface {
	static methodTypes = {
		put: {
			args: [NotEmpty, NotEmpty],
			returns: NoReturn,
		},
		get: {
			args: [NotEmpty],
			returns: Any,
		},
		containsKey: {
			args: [NotEmpty],
			returns: Boolean,
		},
		delete: {
			args: [NotEmpty],
			returns: Boolean,
		},
	};

	constructor(KeyType, ValueType) {
		super();
		if (new.target === BaseMap) {
			throw new TypeError("Cannot instantiate abstract class BaseMap");
		}

		this.KeyType = KeyType;
		this.ValueType = ValueType;
	}

	_checkKey(key) {
		if (!TypeChecker.matchType(key, this.KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${this.KeyType.name} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	_checkValue(value) {
		if (!TypeChecker.matchType(value, this.ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${this.ValueType.name} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}
}

module.exports = BaseMap;

},{"../base/Interface":2,"../libs/TypeChecker":5}],11:[function(require,module,exports){
const BaseMap = require("./BaseMap");

class HashMap extends BaseMap {
	constructor(KeyType, ValueType) {
		super(KeyType, ValueType);
		this._data = new Map();
	}

	put(key, value) {
		this._checkKey(key);
		this._checkValue(value);
		this._data.set(key, value);
	}

	get(key) {
		this._checkKey(key);
		return this._data.get(key);
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	delete(key) {
		this._checkKey(key);
		return this._data.delete(key);
	}
}

module.exports = HashMap;

},{"./BaseMap":10}],12:[function(require,module,exports){
module.exports = {
  BaseMap: require("./BaseMap.js"),
  HashMap: require("./HashMap.js")
};

},{"./BaseMap.js":10,"./HashMap.js":11}]},{},[9])
//# sourceMappingURL=JavaLibraryScript.js.map
