const fs = require("node:fs");

const CL = require("../libs/ColorLogger");

/**
 * DTS出力を修正
 */
function fixDtsOutputFlexible(filePath, log = false) {
	let code = fs.readFileSync(filePath, "utf8");

	const ol = outLog(log);
	let cou = 0;

	const regList = [
		// 修正をここに追加
		[
			`declare\\s+namespace\\s+(__(?:[a-z]+_)+[A-Za-z]+_js)\\s+{\\s+export\\s+{[\\s\\S]*?\\s+};\\s+}\\s+`,
			(a, b) => {
				ol(`namespace ${b} : ${CL.cyan("削除")}`);
				cou++;
				return "";
			},
		],
		[
			`(\\s+)(__(?:[a-z]+_)+([A-Za-z]+)_js)`,
			(a, b, c, d) => {
				ol(`${c} -> ${d} : ${CL.cyan("統合")}`);
				cou++;
				return `${b}${d}`;
			},
		],
		[
			`([A-Za-z][A-Za-z0-9]*)_forceRep`,
			(a, b) => {
				ol(`${b} : ${CL.cyan("強制変更")}`);
				cou++;
				return b;
			},
		],
	];

	let sum = 0;
	for (const [reg, rep] of regList) {
		const re = new RegExp(reg, "gm");
		cou = 0;
		code = code.replace(re, rep);
		if (!log) console.log(`┃┃ 変更箇所: ${CL.blue(cou)}`);
		sum += cou;
	}
	console.log(`┃┃ 全体変更箇所: ${CL.green(sum)}`);

	fs.writeFileSync(filePath, code);
}

function outLog(log) {
	return function (msg) {
		if (log) console.log(`┃┃ ${msg}`);
	};
}

module.exports = fixDtsOutputFlexible;
