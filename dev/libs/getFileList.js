const fs = require("node:fs");
const path = require("node:path");

/**
 * ファイルリストを取得
 * @param {string} dir
 * @param {string[]} filesList
 * @param {string} [baseDir]
 */
function getFileList(dir, filesList, baseDir = dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	// jsファイルだけ
	const jsFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".js"));
	filesList.push(...jsFiles.map((e) => path.join(dir, e.name)));

	// サブディレクトリ
	const subDirs = entries.filter((e) => e.isDirectory());

	for (const subDir of subDirs) {
		getFileList(path.join(dir, subDir.name), filesList, baseDir);
	}
}

module.exports = getFileList;
