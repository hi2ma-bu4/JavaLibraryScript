class Interface {
	static _isDebugMode = false;

	static methodTypes = {};

	constructor() {
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
					if (!Interface.__iface_matchType(args[i], expectedArgs[i])) {
						throw new TypeError(`"${cls.name}.${method}" 第${i + 1}引数: ${Interface.__iface_typeNames(expectedArgs[i])} を期待 → 実際: ${Interface.__iface_stringify(args[i])}`);
					}
				}

				const result = originalMethod(...args);

				// 戻り値型を動的に取得
				const ret = def.returns;
				const expectedReturn = typeof ret === "function" && !CLASS_REG.test(ret.toString()) ? ret(args) : ret;

				const validate = (val) => {
					if (!Interface.__iface_matchType(val, expectedReturn)) {
						throw new TypeError(`"${cls.name}.${method}" の戻り値: ${Interface.__iface_typeNames(expectedReturn)} を期待 → 実際: ${Interface.__iface_stringify(val)}`);
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

	static __iface_matchType(value, expected) {
		if (Array.isArray(expected)) return expected.some((e) => Interface.__iface_checkType(value, e));
		return Interface.__iface_checkType(value, expected);
	}

	static __iface_checkType(value, expected) {
		if (expected === null) return value === null;
		if (expected === undefined) return value === undefined;
		if (expected === String || expected === Number || expected === Boolean || expected === Symbol || expected === Function || expected === BigInt) return typeof value === expected.name.toLowerCase();
		if (expected === Object) return typeof value === "object" && value !== null && !Array.isArray(value);
		if (expected === Array) return Array.isArray(value);
		// ----- DynamicEnum対応
		if (expected instanceof _DynamicEnumCore) {
			// DynamicEnumの場合
			return expected.has(value.name);
		}
		if (expected === _EnumItem) return value instanceof _EnumItem;
		// -----
		if (typeof expected === "function") return value instanceof expected;
		return false;
	}

	static __iface_typeNames(expected) {
		if (Array.isArray(expected)) return expected.map((t) => t?.name || Interface.__iface_stringify(t)).join(" | ");
		return expected?.name || Interface.__iface_stringify(expected);
	}

	// エラー表示時にオブジェクトや配列の内容をわかりやすく表示
	static __iface_stringify(value) {
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
