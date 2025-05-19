const fs = require("node:fs");
const path = require("node:path");

const CL = require("../libs/ColorLogger");

const skipList = new Set([
	"index.js", // 自動生成対象自身
	"main.js",
]);

const indent = "    ";

function isPlainObjectExport(modulePath) {
	try {
		const mod = require(modulePath);
		return typeof mod === "object" && mod !== null && !Array.isArray(mod);
	} catch {
		return false;
	}
}

/**
 * index.jsを生成する
 * @param {string} dir
 */
function generateIndex(dir, log = false, baseDir = dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	// jsファイルだけ、かつindex.jsは除外
	const jsFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".js") && !skipList.has(e.name));

	// サブディレクトリ
	const subDirs = entries.filter((e) => e.isDirectory() && !skipList.has(e.name));

	// 先にサブディレクトリも再帰処理（深い階層から順に）
	for (const subDir of subDirs) {
		generateIndex(path.join(dir, subDir.name), log, baseDir);
	}

	// export文を作成
	const exportLines = [];

	// ファイルのエクスポートを設定
	jsFiles.forEach((file) => {
		const filePath = path.join(dir, file.name);
		const requirePath = `./${file.name}`;
		const key = path.basename(file.name, ".js");

		const fullRequirePath = path.resolve(filePath);

		if (isPlainObjectExport(fullRequirePath)) {
			exportLines.push(`${indent}...require("${requirePath}")`);
		} else {
			exportLines.push(`${indent}${key}: require("${requirePath}")`);
		}
	});

	// サブフォルダのindexもexport
	subDirs.forEach((subDir) => {
		exportLines.push(`${indent}${subDir.name}: require("./${subDir.name}/index.js")`);
	});

	// module.exportsの内容を文字列で作成
	const content = `module.exports = {\n${exportLines.join(",\n")}\n};\n`;

	// index.jsを書き込み
	fs.writeFileSync(path.join(dir, "index.js"), content, "utf8");

	if (log) console.log(`┃┣📜 Generated index.js in ${CL.brightBlue(path.relative(path.dirname(baseDir), dir))}`);
}

module.exports = generateIndex;
