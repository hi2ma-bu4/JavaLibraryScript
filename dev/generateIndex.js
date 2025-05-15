const fs = require("node:fs");
const path = require("node:path");

const CL = require("./libs/ColorLogger.js");

/**
 * index.jsを生成する
 * @param {string} dir
 */
function generateIndex(dir, baseDir = dir) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	// jsファイルだけ、かつindex.jsは除外
	const jsFiles = entries.filter((e) => e.isFile() && e.name.endsWith(".js") && e.name !== "index.js");

	// サブディレクトリ
	const subDirs = entries.filter((e) => e.isDirectory());

	// 先にサブディレクトリも再帰処理（深い階層から順に）
	for (const subDir of subDirs) {
		generateIndex(path.join(dir, subDir.name), baseDir);
	}

	// export文を作成
	let exportsObj = {};

	// ファイルのエクスポートを設定
	jsFiles.forEach((file) => {
		const name = path.basename(file.name, ".js");
		exportsObj[name] = `require("./${file.name}")`;
	});

	// サブフォルダのindexもexport
	subDirs.forEach((subDir) => {
		const name = subDir.name;
		exportsObj[name] = `require("./${name}/index.js")`;
	});

	// module.exportsの内容を文字列で作成
	const exportLines = Object.entries(exportsObj).map(([key, val]) => `  ${key}: ${val}`);

	const content = `module.exports = {\n${exportLines.join(",\n")}\n};\n`;

	// index.jsを書き込み
	fs.writeFileSync(path.join(dir, "index.js"), content, "utf8");

	console.log(`📜 Generated index.js in ${CL.brightBlue(path.relative(path.dirname(baseDir), dir))}`);
}

module.exports = generateIndex;
