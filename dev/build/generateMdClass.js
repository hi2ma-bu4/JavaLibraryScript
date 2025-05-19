const fs = require("node:fs");
const path = require("node:path");

/**
 * 指定ディレクトリ以下の全JSファイルからクラス定義とJSDocを抽出してMarkdown生成
 * @param {string} baseDir - 探索開始ディレクトリ（例: ./src）
 * @param {string} outputPath - 出力先Markdownファイル（例: ./docs/classes.md）
 */
function generateMarkdownFromClasses(baseDir, outputPath) {
	const allJsFiles = [];
	walkDir(baseDir, allJsFiles);

	let markdown = `# クラス一覧\n\n`;

	for (const filePath of allJsFiles) {
		const relPath = path.relative(baseDir, filePath);
		const content = fs.readFileSync(filePath, "utf-8");
		const classBlocks = extractClassDocs(content);
		if (classBlocks.length === 0) continue;

		markdown += `## ${relPath}\n\n`;
		for (const block of classBlocks) {
			const typeParams = block.templates.length > 0 ? `<${block.templates.join(", ")}>` : "";
			const paramList = block.params.map((p) => `${p.name}: ${p.type}`).join(", ");
			markdown += `### ${block.name}\n\n`;
			markdown += `\`\`\`ts\nclass ${block.name}${typeParams}(${paramList}): ${block.name}${typeParams}\n\`\`\`\n\n`;
			markdown += `${block.description || "説明なし"}\n\n`;
		}
	}

	fs.writeFileSync(outputPath, markdown, "utf-8");
}

/**
 * ディレクトリを再帰的に探索してJSファイルを収集
 * @param {string} dir
 * @param {string[]} fileList
 */
function walkDir(dir, fileList) {
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			walkDir(fullPath, fileList);
		} else if (entry.isFile() && entry.name.endsWith(".js")) {
			fileList.push(fullPath);
		}
	}
}

/**
 * クラス定義と直前のJSDocコメントを抽出（複数行のみ）を抽出
 * @param {string} code - ファイルの内容
 * @returns {{ name: string, description: string, templates: string[], params: string[] }[]}
 */
function extractClassDocs(code) {
	const classRegex = /\/\*\*((?:\s*\*(?:(?!\/\*\*)[\s\S])*?)\n\s*)\*\/\s*class\s+(\w+)/g;
	const results = [];

	let match;
	while ((match = classRegex.exec(code)) !== null) {
		const [fullMatch, commentBody, className] = match;
		const classStartIdx = match.index;

		// 1行JSDoc（/** ... */）は除外
		const isSingleLine = fullMatch.split("\n").length === 1;
		if (isSingleLine) continue;

		const desc = parseJsDocDescription(commentBody);
		const templates = parseJsDocTemplates(commentBody);

		const constructorInfo = extractConstructorParams(code.slice(classStartIdx));

		results.push({ name: className, description: desc, templates, params: constructorInfo.params });
	}

	return results;
}

/**
 * JSDocコメントから説明部分を抽出（@description 優先）
 * @param {string} comment - JSDoc コメント
 * @returns {string}
 */
function parseJsDocDescription(comment) {
	const lines = comment.split("\n").map((line) => line.replace(/^\s*\*\s?/, "").trim());
	const descriptionLine = lines.find((line) => line.startsWith("@description"));
	if (descriptionLine) return descriptionLine.replace("@description", "").trim();

	// @descriptionが無ければ最初の行を説明とみなす
	for (const line of lines) {
		if (line && !line.startsWith("@")) return line;
	}

	return "";
}

function parseJsDocTemplates(comment) {
	const lines = comment.split("\n");
	const templateRegex = /@template\s+(\w+)/;
	const templates = [];
	for (const line of lines) {
		const match = line.match(templateRegex);
		if (match) templates.push(match[1]);
	}
	return templates;
}

function extractConstructorParams(classBody) {
	const constructorRegex = /\/\*\*((?:\s*\*(?!\/)[\s\S]*?)\*\/)\s*constructor\s*\(([^\)]*)\)/;
	const match = classBody.match(constructorRegex);

	if (!match) return { params: [] };

	const jsdoc = match[1];
	return {
		params: parseJsDocParams(jsdoc),
	};
}

function parseJsDocParams(comment) {
	const lines = comment.split("\n");
	const paramRegex = /@param\s+{([^}]+)}\s+(\w+)/;
	const params = [];
	for (const line of lines) {
		const match = line.match(paramRegex);
		if (match) {
			const [, type, name] = match;
			params.push({ name, type });
		}
	}
	return params;
}

module.exports = generateMarkdownFromClasses;
