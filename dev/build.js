const browserify = require("browserify");
const exorcist = require("exorcist");
const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");

const generateIndex = require("./generateIndex.js");
const CL = require("./libs/ColorLogger.js");

const script_name = "JavaLibraryScript";

const baseDir = path.join(__dirname, "..");

const distDir = path.join(baseDir, "dist");
const entryDir = path.join(baseDir, "src");

const entry = path.join(entryDir, "main.js");
const bundlePath = path.join(distDir, `${script_name}.js`);
const bundleMapPath = path.join(distDir, `${script_name}.js.map`);
const minPath = path.join(distDir, `${script_name}.min.js`);
const minMapPath = path.join(distDir, `${script_name}.min.js.map`);

// 相対座標を取得
function getRelativePath(name) {
	return path.relative(baseDir, name);
}

// distディレクトリのクリーン＆作成
function prepareDist() {
	if (fs.existsSync(distDir)) {
		fs.rmSync(distDir, { recursive: true, force: true });
	}
	fs.mkdirSync(distDir, { recursive: true });
}

// ファイルサイズを見やすく表示
function formatSize(bytes) {
	if (bytes < 1024) return bytes + " B";
	if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
	return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// ファイルサイズ取得
function showFileSize(filePath) {
	const stat = fs.statSync(filePath);
	console.log(`📦 ${CL.brightWhite(path.basename(filePath))}: ${CL.brightGreen(formatSize(stat.size))}`);
}

// Browserifyでバンドル
function bundle() {
	return new Promise((resolve, reject) => {
		const b = browserify(entry, {
			cache: {},
			packageCache: {},
			debug: true, // source map生成のため必須
		});
		const writeStream = fs.createWriteStream(bundlePath);

		b.bundle()
			.pipe(exorcist(bundleMapPath)) // ここでmapを外部化
			.pipe(writeStream);

		writeStream.on("finish", () => {
			const code = fs.readFileSync(bundlePath, "utf-8");
			resolve(code);
		});
		writeStream.on("error", reject);
	});
}

// Terserでminify（drop_consoleなど最適化オプション付き）
async function minifyCode(code) {
	const opt = {
		compress: {
			drop_console: true,
			dead_code: true,
			passes: 4,
			pure_funcs: ["console.info", "console.debug"],
		},
		mangle: {
			toplevel: true,
		},
		format: {
			comments: "some",
		},
		sourceMap: {
			filename: path.basename(minPath),
			url: path.basename(minMapPath),
		},
		ecma: 2020,
	};
	const result = await minify(code, opt);
	fs.writeFileSync(minPath, result.code);
	fs.writeFileSync(minMapPath, result.map);
}

(async () => {
	try {
		//
		console.log(`🔁 ${CL.brightWhite("index.js自動生成開始...")}`);
		generateIndex(entryDir);
		console.log(`🌱 ${CL.brightWhite("自動生成完了")}`);
		//
		console.log(`🗑️ ${CL.brightWhite("distフォルダリセット")}`);
		prepareDist();
		//
		console.log(`🗂️ ${CL.brightWhite("バンドル中...")}`);
		const code = await bundle();
		console.log(`✨ ${CL.brightWhite("バンドル完了")}: ${getRelativePath(bundlePath)}`);
		console.log(`🗺️ ${CL.brightWhite("ソースマップ生成")}: ${getRelativePath(bundleMapPath)}`);

		console.log(`🔧 ${CL.brightWhite("Minify中...")}`);
		await minifyCode(code);
		console.log(`✅ ${CL.brightWhite("Minify完了:")} ${getRelativePath(minPath)}`);
		console.log(`🗺️ ${CL.brightWhite("ソースマップ生成[min]")}: ${getRelativePath(minMapPath)}`);
		showFileSize(bundlePath);
		showFileSize(minPath);
	} catch (e) {
		console.error("❌ ビルド失敗:", e);
		process.exit(1);
	}
})();
