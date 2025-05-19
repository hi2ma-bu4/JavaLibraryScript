const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore");
const TypeChecker = require("../../libs/TypeChecker");
const StreamInterface = require("./StreamInterface");

let Stream, NumberStream, StringStream, EntryStream, AsyncStream;
function init() {
	if (Stream) return;
	Stream = require("./Stream");
	NumberStream = require("./NumberStream");
	StringStream = require("./StringStream");
	EntryStream = require("./EntryStream");
	AsyncStream = require("./AsyncStream");
}

/**
 * Streamの型チェック
 * @extends {JavaLibraryScriptCore}
 * @class
 */
class StreamChecker extends JavaLibraryScriptCore {
	/**
	 * TypeをStreamに変換する
	 * @param {Function} expected
	 * @returns {StreamInterface}
	 */
	static typeToStream(expected) {
		init();
		if (expected == null) return Stream;
		if (expected === String) return StringStream;
		if (expected === Number) return NumberStream;
		if (expected === Map) return EntryStream;
		if (expected === Promise) return AsyncStream;
		return Stream;
	}

	/**
	 * StreamをTypeに変換する
	 * @param {StreamInterface} stream
	 * @returns {Function}
	 * @static
	 */
	static streamToType(stream) {
		init();
		// Stream継承
		if (stream instanceof StringStream) return String;
		if (stream instanceof NumberStream) return Number;
		if (stream instanceof EntryStream) return Map;
		// StreamInterface継承
		if (stream instanceof AsyncStream) return Promise;
		if (stream instanceof Stream) return TypeChecker.Any;
		return null;
	}
}

module.exports = StreamChecker;
