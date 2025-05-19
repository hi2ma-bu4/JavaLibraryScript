const fs = require("node:fs");
const path = require("node:path");

const CL = require("../libs/ColorLogger");

/**
 * 検査対象の設定
 */
const config = {
	includeExtensions: [".js", ".ts", ".json", ".md", "bat", ".txt", ".html", ".css"], // 検査対象ファイルの拡張子
	excludeFiles: ["checkIllegalStrings.js", "package-lock.json", "LICENSE"], // 除外するファイル
	excludeDirs: ["node_modules", ".git", "dist"], // 除外するフォルダ
	illegalPatterns: [/[\u3099\u309A]/], // 違法文字列（正規表現）
};

/**
 * ファイルを検査する
 */
function checkFile(filePath, baseDir) {
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/);

	let found = false;

	lines.forEach((line, idx) => {
		for (const pattern of config.illegalPatterns) {
			const match = line.match(pattern);
			if (match) {
				if (!found) {
					console.log(`┃┣🚨 ${CL.brightRed("違法文字列を検出")}: ${path.relative(baseDir, filePath)}`);
					found = true;
				}
				const highlight = line.replace(pattern, (m) => `${CL.RESET}${CL.red(m)}${CL.STYLE.dim}`); // ハイライト
				console.log(`┃┃  [${idx + 1}行目] ${CL.STYLE.dim}${highlight}${CL.RESET}`);
				console.log(`┃┃     → マッチ: ${CL.brightCyan(match[0])}`);
				console.log(`┃┃     → パターン: ${CL.brightMagenta(pattern)}`);
			}
		}
	});
	return found;
}

/**
 * ディレクトリを再帰的に探索
 */
function checkIllegalStrings(dirPath, baseDir = dirPath) {
	const entries = fs.readdirSync(dirPath, { withFileTypes: true });

	let found = false;

	for (const entry of entries) {
		const fullPath = path.join(dirPath, entry.name);

		// 除外処理
		if (entry.isDirectory()) {
			if (config.excludeDirs.includes(entry.name)) continue;
			found = checkIllegalStrings(fullPath, baseDir) || found;
		} else {
			if (config.excludeFiles.includes(entry.name)) continue;
			const ext = path.extname(entry.name).toLowerCase();
			if (!config.includeExtensions.includes(ext)) continue;
			found = checkFile(fullPath, baseDir) || found;
		}
	}
	return found;
}

module.exports = checkIllegalStrings;
