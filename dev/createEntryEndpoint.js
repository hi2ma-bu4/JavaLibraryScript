const fs = require("node:fs");
const path = require("node:path");

function generateEndpoint(entryPath) {
	const inData = `import * as lib from "./index.js";
export default lib;
`;
	fs.writeFileSync(entryPath, inData, "utf8");
}

module.exports = generateEndpoint;
