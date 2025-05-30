const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore");
const TypeChecker = require("../../libs/TypeChecker");
const StreamInterface = require("./StreamInterface");
const { BigFloat } = require("../../math/BigFloat");

let Stream, NumberStream, StringStream, BigFloatStream, EntryStream, AsyncStream;
function init() {
	if (Stream) return;
	Stream = require("./Stream");
	NumberStream = require("./NumberStream");
	StringStream = require("./StringStream");
	BigFloatStream = require("./BigFloatStream");
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
		if (expected?.prototype instanceof BigFloat) return BigFloatStream;
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
		if (stream instanceof BigFloatStream) return BigFloat;
		if (stream instanceof EntryStream) return Map;
		// StreamInterface継承
		if (stream instanceof AsyncStream) return Promise;
		if (stream instanceof Stream) return TypeChecker.Any;
		return null;
	}
}

module.exports = StreamChecker;
