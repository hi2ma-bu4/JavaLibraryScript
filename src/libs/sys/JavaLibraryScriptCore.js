const LIBRARY_ID = Symbol.for("JavaLibraryScript");

class JavaLibraryScriptCore {
	static [LIBRARY_ID] = true;
}

module.exports = JavaLibraryScriptCore;
