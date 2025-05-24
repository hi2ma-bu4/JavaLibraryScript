/**
 * Symbolの共通プレフィックス
 * @type {string}
 * @readonly
 */
const prefix = "@@JLS_";

/**
 * 内部利用Symbolの辞書
 * @enum {Symbol}
 * @readonly
 */
const SYMBOL_DICT = {
	// 公開
	JavaLibraryScript: Symbol.for(`${prefix}JavaLibraryScript`),
	instanceofTarget: Symbol.for(`${prefix}instanceofTarget`),
	// 内部
	TypeAny: Symbol("Any"),
	TypeVoid: Symbol("Void"),
};

module.exports = SYMBOL_DICT;
