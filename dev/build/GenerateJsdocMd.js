const fs = require("node:fs");
const path = require("node:path");

const CL = require("../libs/ColorLogger");
const getFileList = require("../libs/getFileList");

/**
 * jsdocの解析結果
 * @typedef {{ name: string, type: string, description: string, templates: string[], params: { name: string, type: string }[], returns: string[], sample: string }} ModuleDoc
 */

/**
 * jsdocからクラス一覧を生成
 * @class
 */
class GenerateJsdocMd {
	/**
	 * デバッグモード
	 * @type {boolean}
	 * @static
	 */
	static isDebug = false;

	/**
	 * エンドポイント名 (最終的なexportのアクセス元)
	 * @type {string}
	 * @static
	 */
	static endPointName = "root";

	/**
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	static _EXPORT_REGEXP = /module\.exports\s*=\s*{([^}]+)}/;
	/**
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	static _EXPORT_ASSIGN_REGEXP = /module\.exports\s*=\s*(\w+)/;

	/**
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	static _JS_DOC_REGEXP = /\/\*\*((?:\s*\*(?:(?!\/\*\*)[\s\S])*?)\n\s*)\*\/\s*(class|function)\s+(\w+)/g;
	/**
	 * @type {RegExp}
	 * @static
	 * @readonly
	 */
	static _CONSTRUCTOR_REGEXP = /\/\*\*((?:\s*\*(?:(?!\/\*\*)[\s\S])*?)\n\s*)\*\/\s*constructor\s*\(/;

	/**
	 * jsdocからMDを生成
	 * @param {string} baseDir
	 * @param {string} outputPath
	 * @static
	 */
	static generate(baseDir, outputPath) {
		const filesList = [];
		getFileList(baseDir, filesList);

		const markdown = this._createMdString(filesList, baseDir);

		fs.writeFileSync(outputPath, markdown, "utf-8");
	}

	/**
	 * jsdocからMD文字列を生成
	 * @param {string[]} filesList
	 * @param {string} baseDir
	 * @return {string}
	 * @static
	 */
	static _createMdString(filesList, baseDir) {
		let markdown = `# クラス一覧\n\n`;

		for (const filePath of filesList) {
			const relPath = path.relative(baseDir, filePath);
			const content = fs.readFileSync(filePath, "utf-8");
			const moduleBlocks = this._getExtractModuleDocs(content);
			if (moduleBlocks.size === 0) continue;

			markdown += this._createMdBlock(moduleBlocks, relPath);
		}
		return markdown;
	}

	/**
	 * jsdoc配列からMD文字列(ブロック)を生成
	 * @param {Map<string, ModuleDoc>} moduleBlocks
	 * @param {string} filePath
	 * @return {string}
	 * @static
	 */
	static _createMdBlock(moduleBlocks, filePath) {
		let md = `## ${filePath}\n\n`;

		const exRelationalName = this._getExportRelationalName(filePath);

		for (const block of moduleBlocks.values()) {
			md += `### ${block.name} (${exRelationalName}.${block.name})\n
\`\`\`ts
${block.sample}
\`\`\`\n
${block.description || "説明なし"}\n\n`;
		}
		return md;
	}

	/**
	 * ファイルパスからexport名を取得
	 * @param {string} filePath
	 * @return {string}
	 * @static
	 */
	static _getExportRelationalName(filePath) {
		const src = filePath
			.replace(/\.js$/, "")
			.replace(/[\/\\]/g, ".")
			.split(".")
			.slice(0, -1)
			.join(".");
		return `${this.endPointName}.${src}`;
	}

	/**
	 * exportされているものの解析済jsdocを返す
	 * @param {string} code
	 * @return {Map<string, ModuleDoc>}
	 * @static
	 */
	static _getExtractModuleDocs(code) {
		const moduleBlocks = new Map();

		const moduleExportName = this._getExport(code);

		const docs = this._extractDocs(code);
		for (const doc of docs) {
			if (moduleExportName.has(doc.name)) {
				moduleBlocks.set(doc.name, doc);
				if (this.isDebug) console.log(`┃┃ ${doc.type}\t${CL.brightCyan(doc.name)} : ${CL.green("OK")}`);
			} else {
				console.log(`┃┃ ${doc.type}\t${CL.brightCyan(doc.name)} : ${CL.yellow("SKIP")}`);
			}
		}

		return moduleBlocks;
	}

	/**
	 * exportされているものを返す
	 * @param {string} code
	 * @return {Set<string>}
	 * @static
	 */
	static _getExport(code) {
		const exported = new Set();

		let match;
		if ((match = code.match(this._EXPORT_REGEXP))) {
			const exportsList = match[1].split(",").map((s) => s.trim());
			for (const name of exportsList) {
				exported.add(name);
			}
		}
		if ((match = this._EXPORT_ASSIGN_REGEXP.exec(code))) {
			exported.add(match[1]);
		}

		return exported;
	}

	/**
	 * jsdocを抽出する
	 * @param {string} code
	 * @return {Array<ModuleDoc>}
	 * @static
	 */
	static _extractDocs(code) {
		const results = [];

		let match;
		while ((match = this._JS_DOC_REGEXP.exec(code))) {
			const [fullMatch, jsdoc, type, name] = match;

			// 1行JSDoc（/** ... */）は除外
			if (fullMatch.split("\n").length === 1) continue;

			const data = {
				name,
				type,
				description: this._parseJsDocDescription(jsdoc),
				templates: this._parseJsDocTemplates(jsdoc),
				params: this._parseJsDocParams(jsdoc),
				returns: this._parseJsDocReturns(jsdoc),
			};

			if (data.description === "") {
				console.log(`┃┃ ${CL.yellow("not get description")}: ${CL.brightCyan(name)}`);
			}

			if (type === "class") {
				const constructorJsDoc = this._extractConstructor(code.slice(match.index));

				if (constructorJsDoc) {
					data.templates = data.templates.concat(this._parseJsDocTemplates(constructorJsDoc));
					data.params = data.params.concat(this._parseJsDocParams(constructorJsDoc));
					data.returns = data.returns.concat(this._parseJsDocReturns(constructorJsDoc));
				}
			}

			data.sample = this._createSample(data);

			results.push(data);
		}

		return results;
	}

	/**
	 * サンプルを生成
	 * @param {ModuleDoc} data
	 * @return {string}
	 * @static
	 */
	static _createSample(data) {
		const typeParams = data.templates.length > 0 ? `<${data.templates.join(", ")}>` : "";
		const paramList = data.params.map((p) => `${p.name}: ${p.type}`).join(", ");
		const returnsList = data.returns.join(" | ");
		let returns;
		if (data.type === "class" && returnsList === "") {
			returns = `${data.name}${typeParams}`;
		} else {
			returns = returnsList;
		}

		return `${data.type} ${data.name}${typeParams}(${paramList}): ${returns}`;
	}

	/**
	 * コンストラクタのjsdocを抽出
	 * @param {string} code
	 * @return {string}
	 * @static
	 */
	static _extractConstructor(code) {
		const match = this._CONSTRUCTOR_REGEXP.exec(code);
		return match ? match[1] : null;
	}

	/**
	 * jsdocから説明部分を抽出（@description 優先）
	 * @param {string} code
	 * @return {string}
	 * @static
	 */
	static _parseJsDocDescription(code) {
		const lines = code.split("\n").map((line) => line.replace(/^\s*\*\s?/, "").trim());
		const descriptionLine = lines.find((line) => line.startsWith("@description"));
		if (descriptionLine) return descriptionLine.replace("@description", "").trim();

		// @descriptionが無ければ最初の行を説明とみなす
		for (const line of lines) {
			if (line && !line.startsWith("@")) return line;
		}

		return "";
	}
	/**
	 * jsdocからtemplateを抽出
	 * @param {string} code
	 * @return {Array<string>}
	 * @static
	 */
	static _parseJsDocTemplates(code) {
		const lines = code.split("\n");
		const templateRegex = /@template\s+((?:\w|,|\s)+)/;
		const templates = [];
		for (const line of lines) {
			const match = line.match(templateRegex);
			if (match) templates.push(...match[1].split(",").map((s) => s.trim()));
		}
		return templates;
	}
	/**
	 * jsdocからparamsを抽出
	 * @param {string} code
	 * @return {Array<{name: string, type: string}>}
	 * @static
	 */
	static _parseJsDocParams(code) {
		const lines = code.split("\n");
		const paramRegex = /@param\s+{((?:[^{}]|\{[^{}]*\})+)}\s+(?:([\w$]+)|\[([\w$]+)(?:=[^\s]+?)?\])/;
		const notGetParamRegex = /@param\s+{.+?}\s+\[[^\s.]+?\]/;
		const params = [];
		for (const line of lines) {
			const match = line.match(paramRegex);
			if (match) {
				const type = match[1];
				const name = match[2] || match[3];
				params.push({ name, type });
			} else if (notGetParamRegex.test(line)) {
				console.log(`┃┃ ${CL.red("not get param")}: ${line.trim()}`);
			}
		}
		return params;
	}
	/**
	 * jsdocからreturnsを抽出
	 * @param {string} code
	 * @return {Array<string>}
	 * @static
	 */
	static _parseJsDocReturns(code) {
		const lines = code.split("\n");
		const returnsRegex = /@returns?\s+{([^}]+)}/;
		const notGetReturnsRegex = /@returns?\s+{/;
		const returns = [];
		for (const line of lines) {
			const match = line.match(returnsRegex);
			if (match) {
				const type = match[1];
				returns.push(type);
			} else if (notGetReturnsRegex.test(line)) {
				console.log(`┃┃ ${CL.red("not get returns")}: ${line.trim()}`);
			}
		}
		return returns;
	}
}

module.exports = GenerateJsdocMd;
