(function (w) {
	const loadList = [
		// それぞれのライブラリをロード
		"dynamicEnum.js",
		"interface.js",
	];

	const eventName = "javaLibraryScriptLoad";
	let loadJasc = false;
	if (typeof jasc !== "undefined" && typeof Jasc?.develop !== "undefined") {
		loadJasc = true;
		Jasc.develop.createEvent(eventName);
	}

	const url = document.currentScript.src;
	const path = url.substring(0, url.lastIndexOf("/"));

	const proList = [];
	loadList.forEach((file) => {
		proList.push(
			new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.addEventListener("load", resolve);
				script.addEventListener("error", reject);
				script.src = path + "/" + file;
				document.head.appendChild(script);
			})
		);
	});

	const loadPro = Promise.all(proList);

	loadPro.then(() => {
		if (loadJasc) {
			jasc.on("DOMContentLoaded", () => {
				jasc._dispatchEvent(eventName, loadList.length);
			});
		}
	});

	w.javaLibraryScript = function () {
		return loadPro;
	};
})(this);
