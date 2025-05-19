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
	JavaLibraryScript: Symbol.for(`${prefix}JavaLibraryScript`),
	instanceofTarget: Symbol.for(`${prefix}instanceofTarget`),
};

module.exports = SYMBOL_DICT;
