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
