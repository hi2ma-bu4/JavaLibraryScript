const { _EnumCore, _EnumItem } = require("../base/Enum.js");

class TypeChecker {
	static matchType(value, expected) {
		if (Array.isArray(expected)) return expected.some((e) => this.checkType(value, e));
		return this.checkType(value, expected);
	}

	static checkType(value, expected) {
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
