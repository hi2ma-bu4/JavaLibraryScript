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
				const expectedReturn = TypeChecker.checkClass(ret) ? ret : ret(args);

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
