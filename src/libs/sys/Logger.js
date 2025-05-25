const SymbolDict = require("./symbol/SymbolDict");
const JavaLibraryScriptCore = require("./JavaLibraryScriptCore");

/**
 * ログ出力管理クラス
 * @class
 */
class Logger extends JavaLibraryScriptCore {
	/**
	 * コンソールスタイルを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_CONSOLE_STYLE = this._isEnableCustomConsole();
	/**
	 * 折りたたみなしのログを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_SIMPLE_LOG = true;
	/**
	 * スタックトレースを有効にする
	 * @type {boolean}
	 * @default true
	 * @static
	 */
	static ENABLE_STACK_TRACE = true;

	/**
	 * ログレベル
	 * @enum {number}
	 * @readonly
	 * @static
	 */
	static LOG_LEVEL = {
		DEBUG: 0,
		TIME: 1,
		LOG: 3,
		WARN: 5,
		ERROR: 7,
		INFO: 9,
		IGNORE: 11,
	};
	/**
	 * コンソールスタイル
	 * @enum {string}
	 * @readonly
	 * @static
	 */
	static CONSOLE_STYLE = {
		DEBUG_TITLE: "color: gray;font-weight: normal;",
		DEBUG: "color: gray;",
		LOG_TITLE: "color: teal;font-weight: normal;",
		LOG: "color: teal;",
		WARN_TITLE: "background-color: #fef6d5;font-weight: normal;",
		WARN: "",
		ERROR_TITLE: "background-color: #fcebeb;font-weight: normal;",
		ERROR: "",
		INFO_TITLE: "color: blue;font-weight: normal;",
		INFO: "font-family: serif;",
		STACK_TRACE: "font-size: 0.8em;color: darkblue;",
	};
	/**
	 * スタックトレースを取得する正規表現
	 * @type {RegExp}
	 * @readonly
	 * @static
	 */
	static STACK_TRACE_GET_REG = /at (?:.+? )?\(?(.+):(\d+):(?:\d+)\)?/;

	/**
	 * @param {String} [prefix=""]
	 * @param {number} [visibleLevel=Logger.LOG_LEVEL.WARN]
	 */
	constructor(prefix = "", visibleLevel = Logger.LOG_LEVEL.WARN) {
		super();

		/**
		 * ログの先頭の文字列
		 * @type {String}
		 */
		this._prefix = prefix;
		/**
		 * 表示するログレベル
		 * @type {number}
		 */
		this._visibleLevel = visibleLevel;
	}

	/**
	 * ログの先頭の文字列を変更する
	 * @param {String} prefix
	 */
	setPrefix(prefix) {
		this._prefix = prefix;
	}
	/**
	 * ログの先頭の文字列を取得する
	 * @returns {String}
	 */
	getPrefix() {
		return this._prefix;
	}

	/**
	 * 表示するログレベルを変更する
	 * @param {number} level
	 */
	setVisibleLevel(level) {
		this._visibleLevel = level;
	}
	/**
	 * 表示するログレベルを取得する
	 * @returns {number}
	 */
	getVisibleLevel() {
		return this._visibleLevel;
	}

	/**
	 * カスタムコンソールが使用可能か判定する
	 * @returns {boolean}
	 * @static
	 */
	static _isEnableCustomConsole() {
		const t = navigator?.userAgent?.toLowerCase();
		if (!t) return false;
		return /(chrome|firefox|safari)/.test(t);
	}

	/**
	 * 表示可能なログレベルか判定する
	 * @param {number} level
	 * @returns {boolean}
	 */
	_isVisible(level) {
		return level >= this._visibleLevel;
	}

	/**
	 * ログの先頭の文字列を生成する
	 * @returns {String}
	 */
	_generatePrefix() {
		if (!this._prefix) return "";
		return `[${this._prefix}] `;
	}

	/**
	 * ログレベルを文字列に変換する
	 * @param {number} level
	 * @returns {String | false}
	 */
	_getLevelToString(level) {
		/** @type {typeof Logger.LOG_LEVEL} */
		const LOG_LEVEL = this.constructor.LOG_LEVEL;
		switch (level) {
			case LOG_LEVEL.DEBUG:
				return "DEBUG";
			case LOG_LEVEL.LOG:
				return "LOG";
			case LOG_LEVEL.WARN:
				return "WARN";
			case LOG_LEVEL.ERROR:
				return "ERROR";
			case LOG_LEVEL.INFO:
				return "INFO";
			default:
				return false;
		}
	}

	/**
	 * 呼び出し元のスタックトレースを取得する
	 * @returns {String}
	 */
	_getTopStackTrace() {
		const stackLines = new Error().stack.split("\n");
		/** @type {typeof Logger} */
		const construct = this.constructor;
		const className = construct.name;
		const LibName = SymbolDict.LIBRARY_NAME;

		const reg = new RegExp(`(?:^|\\W)(?:${className}|${LibName})\\.`);

		// Logger.* 系のフレームを飛ばす
		let callerLine = "";
		for (let i = 1; i < stackLines.length; i++) {
			const line = stackLines[i];
			if (!reg.test(line)) {
				callerLine = line.trim();
				break;
			}
		}
		const match = callerLine.match(construct.STACK_TRACE_GET_REG);
		let location = "";
		if (match) {
			const filePath = match[1];
			const lineNumber = match[2];

			const parts = filePath.split(/[\\/]/);
			const shortPath = parts.slice(-1).join("/");
			location = `${shortPath}:${lineNumber}`;
		}

		return location;
	}

	/**
	 * ログを出力する
	 * @param {number} level
	 * @param {any[]} args
	 * @returns {boolean}
	 */
	_levelToPrint(level, args) {
		if (!this._isVisible(level)) return true;

		const levelStr = this._getLevelToString(level);
		if (!levelStr) return false;

		/** @type {typeof Logger} */
		const construct = this.constructor;

		let logFunc,
			title_prefix = "";
		/** @type {typeof Logger.LOG_LEVEL} */
		const LOG_LEVEL = construct.LOG_LEVEL;
		switch (level) {
			case LOG_LEVEL.DEBUG:
			case LOG_LEVEL.LOG:
				logFunc = console.log.bind(console);
				break;
			case LOG_LEVEL.WARN:
				logFunc = console.warn.bind(console);
				title_prefix = "⚠️";
				break;
			case LOG_LEVEL.ERROR:
				logFunc = console.error.bind(console);
				title_prefix = "🛑";
				break;
			case LOG_LEVEL.INFO:
				logFunc = console.info.bind(console);
				title_prefix = "ℹ️";
				break;
			default:
				logFunc = console.log.bind(console);
		}

		const format = args.map((a) => (typeof a === "string" ? "%s" : "%o")).join(" ");
		/** @type {typeof Logger.CONSOLE_STYLE} */
		const console_style = construct.CONSOLE_STYLE;

		let stackTrace = "";
		if (construct.ENABLE_STACK_TRACE) {
			stackTrace = this._getTopStackTrace();
		}

		if (construct.ENABLE_SIMPLE_LOG) {
			let stackName = "";
			if (stackTrace) {
				stackName = `[${stackTrace}]\n`;
			}
			if (construct.ENABLE_CONSOLE_STYLE) {
				logFunc(
					// 通常表示
					`%c%s%c${this._generatePrefix()}${format}`,
					console_style.STACK_TRACE,
					stackName,
					console_style[levelStr],
					...args
				);
			} else {
				logFunc(
					// 通常表示
					`%s${format}`,
					stackName,
					...args
				);
			}
			return true;
		}

		if (construct.ENABLE_CONSOLE_STYLE) {
			console.groupCollapsed(
				// タイトル表示
				`%c${this._generatePrefix()}${title_prefix}${format}`,
				console_style[`${levelStr}_TITLE`],
				...args
			);
		} else {
			console.groupCollapsed(
				// タイトル表示
				`${this._generatePrefix()}${title_prefix}${format}`,
				...args
			);
		}

		if (stackTrace) {
			if (construct.ENABLE_CONSOLE_STYLE) {
				console.log(`%c[%s]`, console_style.STACK_TRACE, stackTrace);
			} else {
				console.log(`[%s]`, stackTrace);
			}
		}
		if (construct.ENABLE_CONSOLE_STYLE) {
			logFunc(
				// 内部表示
				`%c${format}`,
				console_style[levelStr],
				...args
			);
		} else {
			logFunc(
				// 内部表示
				`${format}`,
				...args
			);
		}
		console.groupEnd();

		return true;
	}

	/**
	 * 開発用ログ
	 * @param {...any} args
	 */
	debug(...args) {
		const level = this.constructor.LOG_LEVEL.DEBUG;
		this._levelToPrint(level, args);
	}
	/**
	 * 通常ログ
	 * @param {...any} args
	 */
	log(...args) {
		const level = this.constructor.LOG_LEVEL.LOG;
		this._levelToPrint(level, args);
	}
	/**
	 * 警告ログ
	 * @param {...any} args
	 */
	warning(...args) {
		const level = this.constructor.LOG_LEVEL.WARN;
		this._levelToPrint(level, args);
	}
	/**
	 * 警告ログ
	 * @param {...any} args
	 */
	warn(...args) {
		this.warning(...args);
	}
	/**
	 * エラーログ
	 * @param {...any} args
	 */
	error(...args) {
		const level = this.constructor.LOG_LEVEL.ERROR;
		this._levelToPrint(level, args);
	}
	/**
	 * エラーログ
	 * @param {...any} args
	 */
	err(...args) {
		this.error(...args);
	}
	/**
	 * 情報ログ
	 * @param {...any} args
	 */
	information(...args) {
		const level = this.constructor.LOG_LEVEL.INFO;
		this._levelToPrint(level, args);
	}
	/**
	 * 情報ログ
	 * @param {...any} args
	 */
	info(...args) {
		this.information(...args);
	}
	/**
	 * タイムログ (開始)
	 * @param {String} label
	 * @returns {String}
	 */
	time(label) {
		const level = this.constructor.LOG_LEVEL.TIME;
		if (this._isVisible(level)) {
			const str = `${this._generatePrefix()}${label}`;
			console.log(`${str}: Start`);
			console.time(str);
		}
		return label;
	}
	/**
	 * タイムログ (終了)
	 * @param {String} label
	 */
	timeEnd(label) {
		const level = this.constructor.LOG_LEVEL.TIME;
		if (this._isVisible(level)) {
			console.timeEnd(`${this._generatePrefix()}${label}`);
		}
	}

	/**
	 * クラスのインスタンスをラップする
	 * @template {Object} T
	 * @param {T} instance
	 * @returns {T}
	 */
	wrapInstanceIO(instance) {
		// すでにラップ済みならそのまま返す
		if (instance[SymbolDict.LoggerWrapped]) return instance;

		const Log = this;
		const classRef = instance.constructor;
		const className = classRef.name;
		const proxy = new Proxy(instance, {
			get(target, prop, receiver) {
				const value = target[prop];
				if (typeof value === "function") {
					return (...args) => {
						Log.debug(`call ${className}.${prop}:`, args);
						const result = value.apply(target, args);

						// 戻り値が同じクラスのインスタンスなら再ラップ
						if (result instanceof classRef) {
							return Log.wrapInstanceIO(result, classRef);
						}

						return result;
					};
				}
				return value;
			},
		});

		proxy[SymbolDict.LoggerWrapped] = true;
		return proxy;
	}
}

/**
 * 内容ログ出力用のインスタンス
 * @type {Logger}
 */
const logging = new Logger("JLS", Logger.LOG_LEVEL.LOG);

module.exports = { Logger, logging };
