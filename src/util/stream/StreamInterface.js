const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");
const Interface = require("../../base/Interface");

/**
 * Streamの基底クラス
 * @class
 */
class StreamInterface extends JavaLibraryScriptCore {
	constructor() {
		super();
		if (new.target === StreamInterface) {
			throw new TypeError("Cannot instantiate abstract class StreamInterface");
		}
	}
}

Interface.applyTo(StreamInterface, {
	map: {
		args: [Function],
		returns: StreamInterface,
	},
	filter: {
		args: [Function],
		returns: StreamInterface,
	},
	flatMap: {
		args: [Function],
		returns: StreamInterface,
	},
	//
	forEach: {
		args: [[Function, Promise]],
		returns: [undefined, Promise],
	},
});

module.exports = StreamInterface;
