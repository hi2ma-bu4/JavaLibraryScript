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

		const this_ = this;

		const interfaceClass = class extends TargetClass {
			constructor(...args) {
				if (abstract) {
					if (new.target === interfaceClass) {
						new TypeError(`Cannot instantiate abstract class ${TargetClass.name}`);
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
