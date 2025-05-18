const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");
const Interface = require("../../base/Interface");

/**
 * Streamの基底クラス
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 */
class StreamInterface extends JavaLibraryScriptCore {
	constructor() {
		super();
	}
}

module.exports = Interface.convert(StreamInterface, {
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
