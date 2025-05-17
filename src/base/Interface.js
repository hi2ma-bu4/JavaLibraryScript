const JavaLibraryScriptCore = require("../libs/sys/JavaLibraryScriptCore.js");
const TypeChecker = require("../libs/TypeChecker.js");

/**
 * インターフェイス管理
 * @class
 */
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
