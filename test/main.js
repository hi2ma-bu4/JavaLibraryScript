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

	// const map = new JavaLibraryScript.util.HashMap(String, Number);
	// let sss = "abcdefghijklmnopqrstuvwxyz";
	// for (let i = 0; i < sss.length; i++) {
	// 	map.put(sss[i], i);
	// }
	// log.log(
	// 	map
	// 		.stream()
	// 		.mapValues((v) => v * 2)
	// 		.toHashMap()
	// 		.toString()
	// );

	// const set = new JavaLibraryScript.util.HashSet(Number);
	// const al = JavaLibraryScript.util.arrayList(Number);
	// for (let i = 0; i < 10; i++) {
	// 	set.add(i);
	// 	al.add(i);
	// }
	// log.log(set.stream().toHashSet().toString());
	// log.log(al.toString());

	log.hr();
	const bf = JavaLibraryScript.math.bigFloat(3);
	log.log(bf.sqrt().toString());
	log.log(JavaLibraryScript.math.BigFloat.pi(20).toString());
	log.hr();
	return;
	log.time("bf");
	const p = 40;
	const x = JavaLibraryScript.math.bigFloat(2, p);
	const y = JavaLibraryScript.math.bigFloat(3, p);
	log.log("y =", y.toString());
	log.log("x =", x.toString());
	const theta = y.atan2(x);
	log.log("atan2(y,x) =", theta.toString());
	const r = x.pow(2).add(y.pow(2)).sqrt();
	log.log("r = ", r.toString());
	const sinTheta = theta.sin().mul(r);
	const cosTheta = theta.cos().mul(r);
	const tanTheta = theta.tan();

	log.log("sin(θ) * r =", sinTheta.toString());
	log.log("cos(θ) * r =", cosTheta.toString());
	log.log("tan(θ) =", tanTheta.toString());
	log.timeEnd("bf");

	log.hr();
});
