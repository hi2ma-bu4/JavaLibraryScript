const fs = require("node:fs");
const path = require("node:path");

function generateEndpoint(entryPath) {
	const inData = `import * as JavaLibraryScript from "./index.js";
export default JavaLibraryScript;`;
	fs.writeFileSync(entryPath, inData, "utf8");
}

module.exports = generateEndpoint;
