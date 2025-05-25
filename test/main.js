try {
	// IDEの型表示用
	const { default: JavaLibraryScript } = require("../types/JavaLibraryScript");
} catch (e) {}

jasc.on("DOMContentLoaded", () => {
	const log = new JavaLibraryScript.libs.sys.Logger("", JavaLibraryScript.libs.sys.Logger.LOG_LEVEL.TIME);
	window.log = log;

	log.info("JavaLibraryScript");
	log.info(JavaLibraryScript);

	JavaLibraryScript.base.Interface.isDebugMode = true;
	JavaLibraryScript.math.BigFloat.config.allowPrecisionMismatch = true;
	//JavaLibraryScript.math.BigFloat.config.roundingMode = JavaLibraryScript.math.BigFloatConfig.ROUND_HALF_UP;

	const map = new JavaLibraryScript.util.HashMap(String, Number);

	let sss = "abcdefghijklmnopqrstuvwxyz";
	for (let i = 0; i < sss.length; i++) {
		map.put(sss[i], i);
	}
	log.log(
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
	log.log(set.stream().toHashSet().toString());
	log.log(al.toString());

	const bf = JavaLibraryScript.math.bigFloat(3);
	log.log(bf.sqrt().toString());
	log.log(JavaLibraryScript.math.BigFloat.pi(20).toString());
});
