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
				const expectedReturn = TypeChecker.checkFunction(ret) ? ret(args) : ret;

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

},{"./base":3,"./libs":6,"./util":14}],5:[function(require,module,exports){
const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const { _EnumCore, _EnumItem } = require("../base/Enum.js");

class TypeChecker extends JavaLibraryScriptCore {
	static _CLASS_REG = /^\s*class\s+/;

	// ==================================================
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

	static checkFunction(fn) {
		if (typeof fn !== "function") return false;
		if (this.checkClass(fn)) return false;
		return true;
	}

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
		put: { args: [NotEmpty, NotEmpty], returns: NoReturn },
		get: { args: [NotEmpty], returns: Any },
		remove: { args: [NotEmpty], returns: Boolean },
		size: { returns: Number },
		isEmpty: { returns: Boolean },
		clear: { returns: NoReturn },
		containsKey: { args: [NotEmpty], returns: Boolean },
		containsValue: { args: [NotEmpty], returns: Boolean },
		keys: { returns: Array },
		values: { returns: Array },
		entrySet: { returns: Array },
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

	putAll(map) {
		for (const [k, v] of map.entries()) {
			this.set(k, v);
		}
	}

	get(key) {
		this._checkKey(key);
		if (!this._map.has(key)) return undefined;
		return this._data.get(key);
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	containsValue(value) {
		for (const v of this.values()) {
			if (v === value) return true;
		}
		return false;
	}

	remove(key) {
		this._checkKey(key);
		return this._data.delete(key);
	}

	size() {
		return this._data.size;
	}

	isEmpty() {
		return this._data.size === 0;
	}

	clear() {
		this._data.clear();
	}

	containsKey(key) {
		this._checkKey(key);
		return this._data.has(key);
	}

	containsValue(value) {
		for (const val of this._data.values()) {
			if (val === value) return true;
		}
		return false;
	}

	keys() {
		return Array.from(this._data.keys());
	}

	values() {
		return Array.from(this._data.values());
	}

	entrySet() {
		return Array.from(this._data.entries());
	}

	equals(otherMap) {
		if (this.size !== otherMap.size) return false;
		for (const [k, v] of this.entries()) {
			if (!otherMap.has(k) || otherMap.get(k) !== v) return false;
		}
		return true;
	}

	forEach(callback, thisArg) {
		for (const [key, value] of this._data.entries()) {
			callback.call(thisArg, value, key, this);
		}
	}

	toString() {
		const data = Array.from(this.entries())
			.map(([k, v]) => `${k}=${v}`)
			.join(", ");
		return `{ ${data} }`;
	}

	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}
}

module.exports = HashMap;

},{"./BaseMap":10}],12:[function(require,module,exports){
const HashMap = require("./HashMap");

class LinkedHashMap extends HashMap {
	constructor(KeyType, ValueType, { accessOrder = false } = {}) {
		super(KeyType, ValueType);
		this._accessOrder = accessOrder;
	}

	put(key, value) {
		this._checkKey(key);
		this._checkValue(value);

		if (this._accessOrder && this._data.has(key)) {
			this._data.delete(key); // 移動のため一度削除
		}
		super.put(key, value);
	}

	get(key) {
		const value = super.get(key);
		if (this._accessOrder && value !== undefined) {
			this._data.delete(key); // 移動のため一度削除
			this._data.set(key, value);
		}
		return value;
	}
}

module.exports = LinkedHashMap;

},{"./HashMap":11}],13:[function(require,module,exports){
const HashMap = require("./HashMap");

class TreeMap extends HashMap {
	static defaultCompare(a, b) {
		if (typeof a === "number" && typeof b === "number") return a - b;
		if (typeof a === "string" && typeof b === "string") return a.localeCompare(b);
		const sa = String(a),
			sb = String(b);
		return sa > sb ? 1 : sa < sb ? -1 : 0;
	}

	static compareByProp(propName, fallback = TreeMap.defaultCompare) {
		return (a, b) => fallback(a[propName], b[propName]);
	}

	constructor(KeyType, ValueType, compareFunction = TreeMap.defaultCompare) {
		super(KeyType, ValueType);
		this._compare = compareFunction;
		this._sortedKeys = null;
	}

	_invalidateSortedKeys() {
		this._sortedKeys = null;
	}

	_getSortedKeys() {
		if (!this._sortedKeys) {
			this._sortedKeys = Array.from(this.keys()).sort(this._compare);
		}
		return this._sortedKeys;
	}

	put(key, value) {
		const existed = this._data.has(key);
		super.put(key, value);
		if (!existed) this._invalidateSortedKeys();
	}

	remove(key) {
		const deleted = super.remove(key);
		if (deleted) this._invalidateSortedKeys();
		return deleted;
	}

	clear() {
		super.clear();
		this._invalidateSortedKeys();
	}

	keys() {
		return this._getSortedKeys().slice();
	}

	values() {
		return this._getSortedKeys().map((k) => this._data.get(k));
	}

	entrySet() {
		return this._getSortedKeys().map((k) => [k, this._data.get(k)]);
	}

	firstKey() {
		const keys = this._getSortedKeys();
		return keys.length > 0 ? keys[0] : undefined;
	}

	lastKey() {
		const keys = this._getSortedKeys();
		return keys.length > 0 ? keys[keys.length - 1] : undefined;
	}

	ceilingKey(key) {
		return this._getSortedKeys().find((k) => this._compare(k, key) >= 0);
	}

	floorKey(key) {
		const keys = this._getSortedKeys();
		for (let i = keys.length - 1; i >= 0; i--) {
			if (this._compare(keys[i], key) <= 0) return keys[i];
		}
		return undefined;
	}

	headMap(toKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, toKey) >= 0) break;
			map.set(k, this.get(k));
		}
		return map;
	}

	tailMap(fromKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, fromKey) >= 0) map.set(k, this.get(k));
		}
		return map;
	}

	subMap(fromKey, toKey) {
		const map = new TreeMap();
		for (const k of this._getSortedKeys()) {
			if (this._compare(k, toKey) >= 0) break;
			if (this._compare(k, fromKey) >= 0) map.set(k, this.get(k));
		}
		return map;
	}

	forEach(callback, thisArg) {
		for (const key of this._getSortedKeys()) {
			callback.call(thisArg, this._map.get(key), key, this);
		}
	}
}

module.exports = TreeMap;

},{"./HashMap":11}],14:[function(require,module,exports){
module.exports = {
    BaseMap: require("./BaseMap.js"),
    HashMap: require("./HashMap.js"),
    LinkedHashMap: require("./LinkedHashMap.js"),
    TreeMap: require("./TreeMap.js"),
    stream: require("./stream")
};

},{"./BaseMap.js":10,"./HashMap.js":11,"./LinkedHashMap.js":12,"./TreeMap.js":13,"./stream":21}],15:[function(require,module,exports){
const StreamInterface = require("./StreamInterface.js");
const Stream = require("./Stream.js");

class AsyncStream extends StreamInterface {
	constructor(source) {
		super();
		this._iter = AsyncStream._normalize(source);
		this._pipeline = [];
	}

	static from(iterable) {
		return new AsyncStream(iterable);
	}

	static _normalize(input) {
		if (typeof input[Symbol.asyncIterator] === "function") return input;
		if (typeof input[Symbol.iterator] === "function") {
			return (async function* () {
				for (const x of input) yield x;
			})();
		}
		throw new TypeError("not (Async)Iterable");
	}

	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

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

	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	map(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) yield await fn(x);
		});
	}

	filter(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				if (await fn(x)) yield x;
			}
		});
	}

	flatMap(fn) {
		return this._use(async function* (iter) {
			for await (const x of iter) {
				const sub = await fn(x);
				for await (const y of AsyncStream._normalize(sub)) yield y;
			}
		});
	}

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

	limit(n) {
		return this._use(async function* (iter) {
			let i = 0;
			for await (const x of iter) {
				if (i++ < n) yield x;
				else break;
			}
		});
	}

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

	async forEach(fn) {
		for await (const x of this) {
			await fn(x);
		}
	}

	async toArray() {
		const result = [];
		for await (const x of this) {
			result.push(x);
		}
		return result;
	}

	async reduce(fn, init) {
		let acc = init;
		for await (const x of this) {
			acc = await fn(acc, x);
		}
		return acc;
	}

	count() {
		return this.reduce((acc) => acc + 1, 0);
	}

	// ==================================================
	// mapTo
	// ==================================================

	toLazy() {
		return new Promise(async (resolve) => {
			const arr = [];
			for await (const item of this) {
				arr.push(item);
			}
			resolve(new Stream(arr));
		});
	}
}

module.exports = AsyncStream;

},{"./Stream.js":18,"./StreamInterface.js":19}],16:[function(require,module,exports){
const Stream = require("./Stream.js");

class EntryStream extends Stream {
	constructor(source) {
		super(source);

		this.mapToEntry = undefined;
	}

	keys() {
		return this._convertToX(Stream).map(([k, _]) => k);
	}

	values() {
		return this._convertToX(Stream).map(([_, v]) => v);
	}

	mapKeys(fn) {
		return this.map(([k, v]) => [fn(k), v]);
	}

	mapValues(fn) {
		return this.map(([k, v]) => [k, fn(v)]);
	}
}

module.exports = EntryStream;

},{"./Stream.js":18}],17:[function(require,module,exports){
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

},{"./Stream.js":18}],18:[function(require,module,exports){
const StreamInterface = require("./StreamInterface.js");

let NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (NumberStream) return;
	NumberStream = require("./NumberStream.js");
	StringStream = require("./StringStream.js");
	EntryStream = require("./EntryStream.js");
	AsyncStream = require("./AsyncStream.js");
}

class Stream extends StreamInterface {
	constructor(source) {
		super();
		this._iter = source[Symbol.iterator]();
		this._pipeline = [];

		init();
	}

	static from(iterable) {
		return new this(iterable);
	}

	_use(fn) {
		this._pipeline.push(fn);
		return this;
	}

	// ==================================================
	// パイプライン計算
	// ==================================================

	_convertToX(construct, fn) {
		const newStream = new construct([]);
		newStream._iter = this._iter;
		newStream._pipeline = [...this._pipeline];
		if (fn) newStream._pipeline.push(fn);
		return newStream;
	}

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

	toFunction() {
		const flat = this.flattenPipeline();
		const fn = flat._pipeline[0];
		return (input) => fn(input);
	}

	// ==================================================
	// Pipeline
	// ==================================================

	map(fn) {
		return this._use(function* (iter) {
			for (const item of iter) yield fn(item);
		});
	}

	filter(fn) {
		return this._use(function* (iter) {
			for (const item of iter) if (fn(item)) yield item;
		});
	}

	flatMap(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				const sub = fn(item);
				yield* sub instanceof StreamInterface ? sub : sub[Symbol.iterator]();
			}
		});
	}

	distinct() {
		return this._use(function* (iter) {
			const seen = new Set();
			for (const item of iter) {
				const key = JSON.stringify(item);
				if (!seen.has(key)) {
					seen.add(key);
					yield item;
				}
			}
		});
	}

	sorted(compareFn = (a, b) => (a > b ? 1 : a < b ? -1 : 0)) {
		return this._use(function* (iter) {
			const arr = [...iter].sort(compareFn);
			yield* arr;
		});
	}

	peek(fn) {
		return this._use(function* (iter) {
			for (const item of iter) {
				fn(item);
				yield item;
			}
		});
	}

	limit(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ >= n) break;
				yield item;
			}
		});
	}

	skip(n) {
		return this._use(function* (iter) {
			let i = 0;
			for (const item of iter) {
				if (i++ < n) continue;
				yield item;
			}
		});
	}

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

	[Symbol.iterator]() {
		return this._pipeline.reduce((iter, fn) => fn(iter), this._iter);
	}

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

	forEach(fn) {
		for (const item of this) fn(item);
	}

	toArray() {
		return Array.from(this);
	}

	reduce(fn, initial) {
		let acc = initial;
		for (const item of this) {
			acc = fn(acc, item);
		}
		return acc;
	}

	count() {
		let c = 0;
		for (const _ of this) c++;
		return c;
	}

	anyMatch(fn) {
		for (const item of this) {
			if (fn(item)) return true;
		}
		return false;
	}

	allMatch(fn) {
		for (const item of this) {
			if (!fn(item)) return false;
		}
		return true;
	}

	noneMatch(fn) {
		for (const item of this) {
			if (fn(item)) return false;
		}
		return true;
	}

	findFirst() {
		for (const item of this) return item;
		return undefined;
	}

	findAny() {
		return this.findFirst(); // 同義（非並列）
	}

	// Java Collectors 相当
	collectWith(collectorFn) {
		return collectorFn(this);
	}

	// ==================================================
	// mapTo
	// ==================================================

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

	mapToEntry(fn) {
		return this._convertToX(EntryStream, function* (iter) {
			for (const item of iter) {
				const entry = fn(item);
				if (!Array.isArray(entry) || entry.length !== 2) {
					throw new TypeError(`mapToEntry() must return [key, value] pair. Got: ${entry}`);
				}
				yield entry;
			}
		});
	}

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

},{"./AsyncStream.js":15,"./EntryStream.js":16,"./NumberStream.js":17,"./StreamInterface.js":19,"./StringStream.js":20}],19:[function(require,module,exports){
const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");

class StreamInterface extends JavaLibraryScriptCore {
	static methodTypes = {
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
	};

	constructor() {
		super();
		if (new.target === StreamInterface) {
			throw new TypeError("Cannot instantiate abstract class StreamInterface");
		}
	}
}

module.exports = StreamInterface;

},{"../../libs/sys/JavaLibraryScriptCore.js":7}],20:[function(require,module,exports){
const Stream = require("./Stream.js");

class StringStream extends Stream {
	constructor(source) {
		super(source);

		this.mapToString = undefined;
	}

	join(separator = "") {
		return Array.from(this).join(separator);
	}

	concatAll() {
		return this.join("");
	}

	longest() {
		let max = "";
		for (const str of this) {
			if (typeof str !== "string") throw new TypeError("All elements must be strings");
			if (str.length > max.length) max = str;
		}
		return max || undefined;
	}

	shortest() {
		let min = null;
		for (const str of this) {
			if (typeof str !== "string") throw new TypeError("All elements must be strings");
			if (min === null || str.length < min.length) min = str;
		}
		return min || undefined;
	}
}

module.exports = StringStream;

},{"./Stream.js":18}],21:[function(require,module,exports){
module.exports = {
    AsyncStream: require("./AsyncStream.js"),
    EntryStream: require("./EntryStream.js"),
    NumberStream: require("./NumberStream.js"),
    Stream: require("./Stream.js"),
    StreamInterface: require("./StreamInterface.js"),
    StringStream: require("./StringStream.js")
};

},{"./AsyncStream.js":15,"./EntryStream.js":16,"./NumberStream.js":17,"./Stream.js":18,"./StreamInterface.js":19,"./StringStream.js":20}]},{},[9])
//# sourceMappingURL=JavaLibraryScript.js.map
