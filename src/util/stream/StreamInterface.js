const JavaLibraryScriptCore = require("../../libs/sys/JavaLibraryScriptCore.js");

class StreamInterface extends JavaLibraryScriptCore {
	static methodTypes = {
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
	};

	constructor() {
		super();
		if (new.target === StreamInterface) {
			throw new TypeError("Cannot instantiate abstract class StreamInterface");
		}
	}
}

module.exports = StreamInterface;
