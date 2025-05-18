// ColorLogger.js
class ColorLogger {
	static RESET = "\x1b[0m";

	static COLORS = {
		black: "\x1b[30m",
		red: "\x1b[31m",
		green: "\x1b[32m",
		yellow: "\x1b[33m",
		blue: "\x1b[34m",
		magenta: "\x1b[35m",
		cyan: "\x1b[36m",
		white: "\x1b[37m",

		// 明るい色
		brightRed: "\x1b[91m",
		brightGreen: "\x1b[92m",
		brightYellow: "\x1b[93m",
		brightBlue: "\x1b[94m",
		brightMagenta: "\x1b[95m",
		brightCyan: "\x1b[96m",
		brightWhite: "\x1b[97m",
	};

	static BGS = {
		bgRed: "\x1b[41m",
		bgGreen: "\x1b[42m",
		bgYellow: "\x1b[43m",
		bgBlue: "\x1b[44m",
		bgMagenta: "\x1b[45m",
		bgCyan: "\x1b[46m",
		bgWhite: "\x1b[47m",
	};

	static STYLE = {
		bold: "\x1b[1m",
		dim: "\x1b[2m",
		italic: "\x1b[3m",
		underline: "\x1b[4m",
		reverse: "\x1b[7m",
	};

	static color(text, ...codes) {
		return `${codes.join("")}${text}${ColorLogger.RESET}`;
	}

	// ↓ よく使う色はショートカットで static メソッド化
	static red(text) {
		return this.color(text, this.COLORS.red);
	}
	static green(text) {
		return this.color(text, this.COLORS.green);
	}
	static yellow(text) {
		return this.color(text, this.COLORS.yellow);
	}
	static blue(text) {
		return this.color(text, this.COLORS.blue);
	}
	static magenta(text) {
		return this.color(text, this.COLORS.magenta);
	}
	static cyan(text) {
		return this.color(text, this.COLORS.cyan);
	}
	static white(text) {
		return this.color(text, this.COLORS.white);
	}

	static brightRed(text) {
		return this.color(text, this.COLORS.brightRed);
	}
	static brightGreen(text) {
		return this.color(text, this.COLORS.brightGreen);
	}
	static brightYellow(text) {
		return this.color(text, this.COLORS.brightYellow);
	}
	static brightBlue(text) {
		return this.color(text, this.COLORS.brightBlue);
	}
	static brightMagenta(text) {
		return this.color(text, this.COLORS.brightMagenta);
	}
	static brightCyan(text) {
		return this.color(text, this.COLORS.brightCyan);
	}
	static brightWhite(text) {
		return this.color(text, this.COLORS.brightWhite);
	}

	static bold(text) {
		return this.color(text, this.STYLE.bold);
	}
	static dim(text) {
		return this.color(text, this.STYLE.dim);
	}
	static italic(text) {
		return this.color(text, this.STYLE.italic);
	}
	static underline(text) {
		return this.color(text, this.STYLE.underline);
	}
	static reverse(text) {
		return this.color(text, this.STYLE.reverse);
	}

	// 任意カラー適用（複数コード）
	static custom(text, ...styleKeys) {
		const codes = styleKeys.map((key) => this.COLORS[key] || this.BGS[key] || this.STYLE[key] || "");
		return this.color(text, ...codes);
	}
}

module.exports = ColorLogger;
