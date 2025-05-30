try {
	const { default: JavaLibraryScript } = require("../types/JavaLibraryScript");
} catch (e) {}

importScripts("../dist/JavaLibraryScript.js");

const log = new JavaLibraryScript.libs.sys.Logger("Worker", JavaLibraryScript.libs.sys.Logger.LOG_LEVEL.TIME);
log.info("JavaLibraryScript in Worker");

JavaLibraryScript.base.Interface.isDebugMode = true;
JavaLibraryScript.math.BigFloat.config.allowPrecisionMismatch = true;

const al = new JavaLibraryScript.util.ArrayList(Number);
for (let i = 0; i < 100; i++) {
	al.add(Math.random());
}
log.log(al.toString());
const ns = new JavaLibraryScript.util.stream.NumberStream(al);
log.log(
	ns
		.mapToBigFloat()
		.changePrecision(40)
		.add(0.5)
		.filter((v) => v.gt(1))
		.product()
		.toString()
);

log.hr();
