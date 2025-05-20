const JavaLibraryScriptCore = require("./sys/JavaLibraryScriptCore");

/**
 * プロキシマネージャー
 * @class
 */
class ProxyManager extends JavaLibraryScriptCore {
	/**
	 * getのreturnのオーバーライド
	 * @param {any} target
	 * @param {any} prop
	 * @param {any} receiver
	 * @returns {any}
	 */
	static over_get(target, prop, receiver) {
		switch (prop) {
			case "toString":
				return () => `Proxy(${target.toString()})`;
		}
		return Reflect.get(target, prop, receiver);
	}
}

module.exports = ProxyManager;
