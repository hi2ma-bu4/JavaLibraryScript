try {
	// IDEの型表示用
	const { default: JavaLibraryScript } = require("../types/JavaLibraryScript");
} catch (e) {}

jasc.on("DOMContentLoaded", () => {
	console.log("JavaLibraryScript");
	console.log(JavaLibraryScript);

	JavaLibraryScript.base.Interface._isDebugMode = true;

	main();
});

function main() {
	const map = new JavaLibraryScript.util.HashMap(String, Number);

	map.put("a", 1);
	map.put("b", 2);
	map.put("c", 3);
	map.put("d", 4);
	map.put("e", 5);

	console.log(
		map
			.stream()
			.mapValues((v) => v * 2)
			.toHashMap()
	);
}
