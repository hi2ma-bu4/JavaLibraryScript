/**
 * @typedef {symbol} LIBRARY_ID_TYPE
 */

/** @type {LIBRARY_ID_TYPE} */
const LIBRARY_ID = Symbol.for("JavaLibraryScript");

/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
class JavaLibraryScriptCore {
	/** @type {true} */
	static [LIBRARY_ID] = true;
}

module.exports = JavaLibraryScriptCore;
