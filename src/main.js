const JavaLibraryScript = require("./index");

if (typeof window !== "undefined") {
	window.JavaLibraryScript = JavaLibraryScript;
}
if (typeof self !== "undefined") {
	self.JavaLibraryScript = JavaLibraryScript;
}

module.exports = JavaLibraryScript;
