/**
 * Symbolの共通プレフィックス
 * @type {string}
 * @readonly
 */
const prefix = "@@JLS_";

const LIBRARY_NAME = "JavaLibraryScript";

/**
 * 内部利用Symbolの辞書
 * @enum {Symbol}
 * @readonly
 */
const SYMBOL_DICT = {
	// 定数
	/** @type {string} */
	LIBRARY_NAME,
	// 公開
	JavaLibraryScript: Symbol.for(`${prefix}${LIBRARY_NAME}`),
	instanceofTarget: Symbol.for(`${prefix}instanceofTarget`),
	LoggerWrapped: Symbol.for(`${prefix}LoggerWrapped`),
	// 内部
	TypeAny: Symbol("Any"),
	TypeVoid: Symbol("Void"),
};

module.exports = SYMBOL_DICT;
