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

	/**
	 * 型定義とメゾットの強制実装
	 * @param {Function} TargetClass - 型定義を追加するクラス
	 * @param {{[String]: {"args": Function[], "returns": Function[]}}} [newMethods] - 追加するメソッド群
	 * @param {Object} [opt] - オプション
	 * @param {boolean} [opt.inherit=true] - 継承モード
	 * @returns {undefined}
	 * @static
	 */
	static applyTo(TargetClass, newDefs = {}, { inherit = true } = {}) {
		if (!this._isDebugMode) return;

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

		for (const methodName in proto.__interfaceTypes) {
			const def = proto.__interfaceTypes[methodName];
			const original = proto[methodName];

			if (typeof original !== "function") {
				throw new Error(`"${TargetClass.name}" はメソッド "${methodName}" を実装する必要があります`);
			}

			proto[methodName] = function (...args) {
				// 引数チェック
				const expectedArgs = def.args || [];
				for (let i = 0; i < expectedArgs.length; i++) {
					if (!TypeChecker.matchType(args[i], expectedArgs[i])) {
						throw new TypeError(`"${TargetClass.name}.${methodName}" 第${i + 1}引数: ${TypeChecker.typeNames(expectedArgs[i])} を期待 → 実際: ${TypeChecker.stringify(args[i])}`);
					}
				}

				const result = original.apply(this, args);
				const ret = def.returns;
				const expectedReturn = TypeChecker.checkFunction(ret) ? ret(args) : ret;

				const validate = (val) => {
					if (!TypeChecker.matchType(val, expectedReturn)) {
						if (expectedReturn === InterfaceTypeChecker.NO_RETURN) {
							throw new TypeError(`"${TargetClass.name}.${methodName}" は戻り値を返してはいけません → 実際: ${TypeChecker.stringify(val)}`);
						} else {
							throw new TypeError(`"${TargetClass.name}.${methodName}" の戻り値: ${TypeChecker.typeNames(expectedReturn)} を期待 → 実際: ${TypeChecker.stringify(val)}`);
						}
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
const LIBRARY_ID = Symbol.for("JavaLibraryScript");

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

/**
 * Mapの基底クラス
 */
class BaseMap extends Map {
	/**
	 * @param {Function} KeyType
	 * @param {Function} ValueType
	 */
	constructor(KeyType, ValueType) {
		super();
		if (new.target === BaseMap) {
			throw new TypeError("Cannot instantiate abstract class BaseMap");
		}

		this._KeyType = KeyType;
		this._ValueType = ValueType;
	}

	/**
	 * Keyの型をチェックする
	 * @param {any} key
	 * @throws {TypeError}
	 */
	_checkKey(key) {
		if (!TypeChecker.matchType(key, this._KeyType)) {
			throw new TypeError(`キー型が一致しません。期待: ${this._KeyType.name} → 実際: ${TypeChecker.stringify(key)}`);
		}
	}

	/**
	 * Valueの型をチェックする
	 * @param {any} value
	 * @throws {TypeError}
	 */
	_checkValue(value) {
		if (!TypeChecker.matchType(value, this._ValueType)) {
			throw new TypeError(`値型が一致しません。期待: ${this._ValueType.name} → 実際: ${TypeChecker.stringify(value)}`);
		}
	}
}

Interface.applyTo(BaseMap, {
	set: { args: [NotEmpty, NotEmpty], returns: Any },
	put: { args: [NotEmpty, NotEmpty], returns: Any },
	get: { args: [NotEmpty], returns: Any },
	delete: { args: [NotEmpty], returns: Boolean },
	remove: { args: [NotEmpty], returns: Boolean },
	isEmpty: { returns: Boolean },
	clear: { returns: NoReturn },
	has: { args: [NotEmpty], returns: Boolean },
	containsKey: { args: [NotEmpty], returns: Boolean },
	containsValue: { args: [NotEmpty], returns: Boolean },
});

module.exports = BaseMap;

},{"../base/Interface":2,"../libs/TypeChecker":5}],11:[function(require,module,exports){
const BaseMap = require("./BaseMap");
const Interface = require("../base/Interface");
const EntryStream = require("./stream/EntryStream.js");

/**
 * 型チェック機能のついたMap
 */
class HashMap extends BaseMap {
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
	 * @param {any} key
	 * @param {any} value
	 * @returns {any}
	 * @throws {TypeError}
	 * @override
	 */
	set(key, value) {
		this._checkKey(key);
		this._checkValue(value);
		return super.set(key, value);
	}
	/**
	 * データを追加・更新する
	 * @param {any} key
	 * @param {any} value
	 * @returns {any}
	 * @throws {TypeError}
	 */
	put(key, value) {
		return this.set(key, value);
	}

	/**
	 * データを一括で追加・更新する
	 * @param {Map<any, any>} map
	 * @throws {TypeError}
	 */
	setAll(map) {
		for (const [k, v] of map.entries()) {
			this.set(k, v);
		}
	}
	/**
	 * データを一括で追加・更新する
	 * @param {Map<any, any>} map
	 * @throws {TypeError}
	 */
	putAll(map) {
		return this.setAll(map);
	}

	/**
	 * データを取得する
	 * @param {any} key
	 * @returns {any}
	 * @throws {TypeError}
	 * @override
	 */
	get(key) {
		this._checkKey(key);
		return super.get(key);
	}

	/**
	 * Keyの存在を確認する
	 * @param {any} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 * @override
	 */
	has(key) {
		this._checkKey(key);
		return super.has(key);
	}
	/**
	 * Keyの存在を確認する
	 * @param {any} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	containsKey(key) {
		return this.has(key);
	}

	/**
	 * Valueの存在を確認する
	 * @param {any} value
	 * @returns {boolean}
	 */
	containsValue(value) {
		for (const v of super.values()) {
			if (v === value) return true;
		}
		return false;
	}

	/**
	 * データを削除する
	 * @param {any} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 * @override
	 */
	delete(key) {
		this._checkKey(key);
		return super.delete(key);
	}
	/**
	 * データを削除する
	 * @param {any} key
	 * @returns {boolean}
	 * @throws {TypeError}
	 */
	remove(key) {
		return this.delete(key);
	}

	/**
	 * EntrySetを返却する
	 * @returns {MapIterator<any, any>}
	 */
	entrySet() {
		return this.entries();
	}

	/**
	 * 空かどうかを返却する
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
	 * @param {HashMap} otherMap
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
	 * 全てのデータを呼び出す
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
	 * @returns {EntryStream}
	 */
	stream() {
		return EntryStream.from(this.entries());
	}

	// ==================================================
	// 基本操作(システム)
	// ==================================================

	/**
	 * 文字列に変換する
	 * @returns {string}
	 * @override
	 */
	toString() {
		const data = Array.from(this.entries())
			.map(([k, v]) => `${k}=${v}`)
			.join(", ");
		return `{ ${data} }`;
	}

	/**
	 * イテレータを返却する
	 * @returns {Iterator<any>}
	 */
	[Symbol.iterator]() {
		return this.entries()[Symbol.iterator]();
	}
}

Interface.applyTo(HashMap);

module.exports = HashMap;

},{"../base/Interface":2,"./BaseMap":10,"./stream/EntryStream.js":14}],12:[function(require,module,exports){
module.exports = {
    BaseMap: require("./BaseMap.js"),
    HashMap: require("./HashMap.js"),
    stream: require("./stream")
};

},{"./BaseMap.js":10,"./HashMap.js":11,"./stream":19}],13:[function(require,module,exports){
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

},{"./Stream.js":16,"./StreamInterface.js":17}],14:[function(require,module,exports){
const Stream = require("./Stream.js");

let HashMap;
function init() {
	if (HashMap) return;
	HashMap = require("../HashMap.js");
}

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

	toHashMap(KeyType, ValueType) {
		init();
		const map = new HashMap(KeyType, ValueType);
		this.forEach(([k, v]) => map.set(k, v));
		return map;
	}
}

module.exports = EntryStream;

},{"../HashMap.js":11,"./Stream.js":16}],15:[function(require,module,exports){
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

},{"./Stream.js":16}],16:[function(require,module,exports){
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

},{"./AsyncStream.js":13,"./EntryStream.js":14,"./NumberStream.js":15,"./StreamInterface.js":17,"./StringStream.js":18}],17:[function(require,module,exports){
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

},{"../../libs/sys/JavaLibraryScriptCore.js":7}],18:[function(require,module,exports){
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

},{"./Stream.js":16}],19:[function(require,module,exports){
module.exports = {
    AsyncStream: require("./AsyncStream.js"),
    EntryStream: require("./EntryStream.js"),
    NumberStream: require("./NumberStream.js"),
    Stream: require("./Stream.js"),
    StreamInterface: require("./StreamInterface.js"),
    StringStream: require("./StringStream.js")
};

},{"./AsyncStream.js":13,"./EntryStream.js":14,"./NumberStream.js":15,"./Stream.js":16,"./StreamInterface.js":17,"./StringStream.js":18}]},{},[9])
//# sourceMappingURL=JavaLibraryScript.js.map
