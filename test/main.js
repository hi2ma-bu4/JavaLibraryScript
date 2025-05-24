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

	let sss = "abcdefghijklmnopqrstuvwxyz";
	for (let i = 0; i < sss.length; i++) {
		map.put(sss[i], i);
	}
	console.log(
		map
			.stream()
			.mapValues((v) => v * 2)
			.toHashMap()
			.toString()
	);

	const set = new JavaLibraryScript.util.HashSet(Number);
	const al = JavaLibraryScript.util.arrayList(Number);
	for (let i = 0; i < 10; i++) {
		set.add(i);
		al.add(i);
	}
	console.log(set.stream().toHashSet().toString());
	console.log(al.toString());

	JavaLibraryScript.math.BigFloat.config.allowPrecisionMismatch = true;
	//JavaLibraryScript.math.BigFloat.config.roundingMode = JavaLibraryScript.math.BigFloatConfig.ROUND_HALF_UP;

	const bf = JavaLibraryScript.math.bigFloat(3);
	console.log(bf.sqrt().toString());
}
