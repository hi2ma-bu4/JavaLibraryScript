const Stream = require("./Stream");
const { BigFloat } = require("../../math/BigFloat");

/**
 * BigFloat専用Stream (LazyList)
 * @extends {Stream<BigFloat>}
 * @class
 */
class BigFloatStream extends Stream {
	/**
	 * @param {Iterable<BigFloat>} source
	 */
	constructor(source) {
		super(source, BigFloat);

		this.mapToBigFloat = undefined;
	}

	// ====================================================================================================
	// * 内部ユーティリティ・補助関数
	// ====================================================================================================
	// --------------------------------------------------
	// 精度チェック
	// --------------------------------------------------
	/**
	 * 精度を変更する
	 * @param {BigInt} precision
	 * @returns {this}
	 * @throws {Error}
	 */
	changePrecision(precision) {
		return this.peek((x) => x.changePrecision(precision));
	}
	// ====================================================================================================
	// * 四則演算・基本関数
	// ====================================================================================================
	// --------------------------------------------------
	// 基本演算
	// --------------------------------------------------
	/**
	 * 加算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	add(other) {
		return this.map((x) => x.add(other));
	}
	/**
	 * 減算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	sub(other) {
		return this.map((x) => x.sub(other));
	}
	/**
	 * 乗算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mul(other) {
		return this.map((x) => x.mul(other));
	}
	/**
	 * 除算
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	div(other) {
		return this.map((x) => x.div(other));
	}
	/**
	 * 剰余
	 * @param {BigFloat} other
	 * @returns {this}
	 * @throws {Error}
	 */
	mod(other) {
		return this.map((x) => x.mod(other));
	}
	// --------------------------------------------------
	// 符号操作
	// --------------------------------------------------
	/**
	 * 符号反転
	 * @returns {this}
	 * @throws {Error}
	 */
	neg() {
		return this.map((x) => x.neg());
	}
	/**
	 * 絶対値
	 * @returns {this}
	 * @throws {Error}
	 */
	abs() {
		return this.map((x) => x.abs());
	}
	/**
	 * 逆数を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	reciprocal() {
		return this.map((x) => x.reciprocal());
	}
	// ====================================================================================================
	// * 冪乗・ルート・スケーリング
	// ====================================================================================================
	// --------------------------------------------------
	// べき乗
	// --------------------------------------------------
	/**
	 * べき乗
	 * @param {BigFloat} exponent - 指数
	 * @returns {this}
	 */
	pow(exponent) {
		return this.map((x) => x.pow(exponent));
	}
	// --------------------------------------------------
	// 平方根・立方根・任意根
	// --------------------------------------------------
	/**
	 * 平方根
	 * @returns {this}
	 * @throws {Error}
	 */
	sqrt() {
		return this.map((x) => x.sqrt());
	}
	/**
	 * 立方根
	 * @returns {this}
	 * @throws {Error}
	 */
	cbrt() {
		return this.map((x) => x.cbrt());
	}
	/**
	 * n乗根
	 * @param {BigInt} n
	 * @returns {this}
	 * @throws {Error}
	 */
	nthRoot(n) {
		return this.map((x) => x.nthRoot(n));
	}
	// ====================================================================================================
	// * 統計関数
	// ====================================================================================================
	// --------------------------------------------------
	// 集計
	// --------------------------------------------------
	/**
	 * 最大値を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	max() {
		return BigFloat.max(this.toArray());
	}
	/**
	 * 最小値を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	min() {
		return BigFloat.min(this.toArray());
	}
	/**
	 * 合計値を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	sum() {
		return BigFloat.sum(this.toArray());
	}
	/**
	 * 積を返す (丸め誤差に注意)
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	product() {
		return BigFloat.product(this.toArray());
	}
	// --------------------------------------------------
	// 平均・中央値
	// --------------------------------------------------
	/**
	 * 平均値を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	average() {
		return BigFloat.average(this.toArray());
	}
	/**
	 * 中央値を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	median() {
		return BigFloat.median(this.toArray());
	}
	// --------------------------------------------------
	// 分散・標準偏差
	// --------------------------------------------------
	/**
	 * 分散を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	variance() {
		return BigFloat.variance(this.toArray());
	}
	/**
	 * 標準偏差を返す
	 * @returns {BigFloat}
	 * @throws {Error}
	 */
	stddev() {
		return BigFloat.stddev(this.toArray());
	}
	// ====================================================================================================
	// * 三角関数
	// ====================================================================================================
	// --------------------------------------------------
	// 基本三角関数
	// --------------------------------------------------
}

module.exports = BigFloatStream;
