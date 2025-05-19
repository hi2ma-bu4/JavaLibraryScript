const browserify = require("browserify");
const exorcist = require("exorcist");
const rollup = require("rollup");
const dts = require("rollup-plugin-dts").default;
const commonjs = require("@rollup/plugin-commonjs");
const fs = require("node:fs");
const path = require("node:path");
const { minify } = require("terser");
const { execSync } = require("node:child_process");

const generateIndex = require("./build/generateIndex");
const createEntryEndpoint = require("./build/createEntryEndpoint");
const checkIllegalStrings = require("./build/checkIllegalStrings");
const CL = require("./libs/ColorLogger");

const script_name = "JavaLibraryScript";
const entry_name = "main";
const type_entry_name = "entrypoint";

const baseDir = path.join(__dirname, "..");

const entryDir = path.join(baseDir, "src");
const distDir = path.join(baseDir, "dist");
const typesTmpDir = path.join(baseDir, "dev/tmp/types");
const typesDir = path.join(baseDir, "types");

const entryPath = path.join(entryDir, `${entry_name}.js`);
const bundlePath = path.join(distDir, `${script_name}.js`);
const bundleMapPath = path.join(distDir, `${script_name}.js.map`);
const minPath = path.join(distDir, `${script_name}.min.js`);
const minMapPath = path.join(distDir, `${script_name}.min.js.map`);
const entryTypesPath = path.join(typesTmpDir, `${type_entry_name}.d.ts`);
const typesPath = path.join(typesDir, `${script_name}.d.ts`);

// 相対座標を取得
function getRelativePath(name) {
	return path.relative(baseDir, name);
}

// ディレクトリのクリーン＆作成
function prepareDir(dir) {
	if (fs.existsSync(dir)) {
		fs.rmSync(dir, { recursive: true, force: true });
	}
	fs.mkdirSync(dir, { recursive: true });
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
	console.log(`┃📊 ${CL.brightWhite(path.basename(filePath))}: ${CL.brightGreen(formatSize(stat.size))}`);
}

// Browserifyでバンドル
function bundle() {
	return new Promise((resolve, reject) => {
		const b = browserify(entryPath, {
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

async function buildRollup() {
	const bundle = await rollup.rollup({
		input: entryTypesPath,
		plugins: [
			commonjs({
				strictRequires: "auto",
				sourceMap: false,
			}),
			dts(),
		],
	});
	await bundle.write({
		file: typesPath,
		format: "es",
	});
}

function fixDtsOutputFlexible(filePath, log = false) {
	let code = fs.readFileSync(filePath, "utf8");

	const regList = [
		// 修正をここに追加
		[
			`declare\\s+namespace\\s+(__(?:[a-z]+_)+[A-Za-z]+_js)\\s+{\\s+export\\s+{[\\s\\S]*?\\s+};\\s+}\\s+`,
			(a, b) => {
				if (log) console.log(`┃┃ namespace ${b} : ${CL.cyan("削除")}`);
				return "";
			},
		],
		[
			`(\\s+)(__(?:[a-z]+_)+([A-Za-z]+)_js)`,
			(a, b, c, d) => {
				if (log) console.log(`┃┃ ${c} -> ${d} : ${CL.cyan("統合")}`);
				return `${b}${d}`;
			},
		],
		[
			`([A-Za-z][A-Za-z0-9]*)_forceRep`,
			(a, b) => {
				if (log) console.log(`┃┃ ${b} : ${CL.cyan("強制変更")}`);
				return b;
			},
		],
	];

	for (const [reg, rep] of regList) {
		const re = new RegExp(reg, "gm");
		code = code.replace(re, rep);
	}

	fs.writeFileSync(filePath, code);
}

(async () => {
	const debug = true;
	// 動作確認用 ログ表示
	const logView = true;
	//
	const start = performance.now();
	try {
		console.log(`🎉 ${CL.brightYellow("ビルド開始")}`);
		//
		console.log(`┣🔁 ${CL.brightWhite("index.js自動生成開始...")}`);
		generateIndex(entryDir, logView);
		console.log(`┃┗🌱 ${CL.brightWhite("自動生成完了")}`);
		//
		console.log(`┃🗑️ ${CL.brightWhite("distフォルダリセット")}`);
		prepareDir(distDir);
		//
		console.log(`┃🗂️ ${CL.brightWhite("バンドル中...")}`);
		const code = await bundle();
		console.log(`┃┣✅ ${CL.brightWhite("バンドル完了")}: ${getRelativePath(bundlePath)}`);
		console.log(`┃┗🗺️ ${CL.brightWhite("ソースマップ生成")}: ${getRelativePath(bundleMapPath)}`);
		//
		console.log(`┃🔧 ${CL.brightWhite("Minify中...")}`);
		await minifyCode(code);
		console.log(`┃┣✅ ${CL.brightWhite("Minify完了:")} ${getRelativePath(minPath)}`);
		console.log(`┃┗🗺️ ${CL.brightWhite("ソースマップ生成[min]")}: ${getRelativePath(minMapPath)}`);
		showFileSize(bundlePath);
		showFileSize(minPath);
		//
		if (debug) {
			console.log(`┃🗑️ ${CL.brightWhite("types仮フォルダリセット")}`);
			prepareDir(typesTmpDir);
			console.log(`┃🗒️ ${CL.brightWhite("TypeScriptコンパイル中...")}`);
			execSync("npx tsc", { stdio: "inherit" });
			console.log(`┃┗✅ ${CL.brightWhite("TypeScriptコンパイル完了")}: ${getRelativePath(typesTmpDir)}`);
			console.log(`┃⛳ ${CL.brightWhite("rollup用entrypoint作成")}`);
			createEntryEndpoint(entryTypesPath);
			console.log("┃📦 .d.ts を rollup中...");
			await buildRollup();
			console.log(`┃┗✅ ${CL.brightWhite("rollup完了")}: ${getRelativePath(typesPath)}`);
			console.log(`┃🗑️ ${CL.brightWhite("types仮フォルダcleanup")}`);
			prepareDir(typesTmpDir);
			console.log(`┃🌵 ${CL.brightWhite("予測候補・コンパイル問題を解決")}`);
			fixDtsOutputFlexible(typesPath, logView);
			console.log(`┃┗✅ ${CL.brightWhite("予測候補・コンパイル問題 修正完了")}: ${getRelativePath(typesPath)}`);
			showFileSize(typesPath);
		}

		console.log(`┃🔍 ${CL.brightWhite("問題性の高い文字列の検査を開始...")}`);
		const illegalFound = checkIllegalStrings(baseDir);
		if (illegalFound) {
			console.log(`┃┗❌ ${CL.brightWhite("検査完了")} ${CL.red("(違法文字列発見)")}`);
		} else {
			console.log(`┃┗✅ ${CL.brightWhite("検査完了")}`);
		}

		const end = performance.now() - start;
		console.log(`┣🕒 ${CL.brightWhite("ビルド時間")}: ${CL.brightGreen(end.toFixed(2))} ms`);
		console.log(`┗🎉 ${CL.brightYellow("ビルド完了")}`);
	} catch (e) {
		const end = performance.now() - start;
		console.log(`┣🕒 ${CL.brightWhite("ビルド時間")}: ${CL.brightGreen(end.toFixed(2))} ms`);
		console.error(`┗❌ ${CL.brightRed("ビルド失敗")}:`, e);
		process.exit(1);
	}
})();
