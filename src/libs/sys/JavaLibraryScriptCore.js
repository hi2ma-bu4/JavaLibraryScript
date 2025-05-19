const SymbolDict = require("./symbol/SymbolDict");

/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
class JavaLibraryScriptCore {
	/** @type {true} */
	static [SymbolDict.JavaLibraryScript] = true;
}

module.exports = JavaLibraryScriptCore;
