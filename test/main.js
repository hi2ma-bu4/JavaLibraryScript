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

	const { BigFloat, bigFloat } = JavaLibraryScript.math;
	window.BigFloat = BigFloat;
	window.bigFloat = bigFloat;

	log.hr();
	log.log(bigFloat(3, 30).sqrt().toString());
	log.log(BigFloat.pi(30).toString());
	log.hr();
});
