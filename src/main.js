const JavaLibraryScript = require("./index.js");

if (typeof window !== "undefined") {
	window.JavaLibraryScript = JavaLibraryScript;
}

module.exports = JavaLibraryScript;
