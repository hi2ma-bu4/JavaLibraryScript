/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
declare class JavaLibraryScriptCore {
}

/**
 * Listの基底クラス
 * @template V
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 * @interface
 */
declare class ListInterface<V> extends JavaLibraryScriptCore {
    /**
     * @param {Function} ValueType
     */
    constructor(ValueType: Function);
    _ValueType: Function | Symbol;
    /**
     * Valueの型をチェックする
     * @param {V} value
     * @throws {TypeError}
     */
    _checkValue(value: V): void;
    /**
     * 空かどうかを返却する
     * @returns {boolean}
     */
    isEmpty(): boolean;
}

/**
 * Setの基底クラス
 * @template V
 * @extends {Set<V>}
 * @class
 * @abstract
 * @interface
 */
declare class SetInterface<V> extends Set<V> {
    /**
     * @param {Function} ValueType
     */
    constructor(ValueType: Function);
    _ValueType: Function | Symbol;
    /**
     * Valueの型をチェックする
     * @param {V} value
     * @throws {TypeError}
     */
    _checkValue(value: V): void;
    /**
     * 空かどうかを返却する
     * @returns {boolean}
     */
    isEmpty(): boolean;
}

/**
 * 型チェック機能のついたSet
 * @template V
 * @extends {SetInterface<V>}
 * @class
 */
declare class HashSet<V> extends SetInterface<V> {
    /**
     * 値を追加する
     * @param {V} value
     * @returns {this}
     * @throws {TypeError}
     */
    add(value: V): this;
    /**
     * 値を一括で追加する
     * @param {Iterable<V>} collection
     * @returns {this}
     * @throws {TypeError}
     */
    addAll(collection: Iterable<V>): this;
    /**
     * 値の存在を確認
     * @param {V} value
     * @returns {boolean}
     * @throws {TypeError}
     */
    contains(value: V): boolean;
    /**
     * 全ての値の存在を確認
     * @param {Iterable<V>} collection
     * @returns {boolean}
     * @throws {TypeError}
     */
    containsAll(collection: Iterable<V>): boolean;
    /**
     * 値を削除する
     * @param {V} value
     * @returns {boolean}
     * @throws {TypeError}
     */
    remove(value: V): boolean;
    /**
     * 全ての値を削除する
     * @param {Iterable<V>} collection
     * @returns {boolean}
     * @throws {TypeError}
     */
    removeAll(collection: Iterable<V>): boolean;
    /**
     * 含まれない要素を全削除する
     * @param {Iterable<V>} collection
     * @returns {boolean}
     * @throws {TypeError}
     */
    retainAll(collection: Iterable<V>): boolean;
    /**
     * 等価判定を行う
     * @param {this} otherSet
     * @returns {boolean}
     */
    equals(otherSet: this): boolean;
    /**
     * 全てのデータを呼び出す
     * @param {Function} callback
     * @param {any} [thisArg]
     */
    forEach(callback: Function, thisArg?: any): void;
    /**
     * Streamを返却する
     * @returns {Stream<V>}
     */
    stream(): Stream<V>;
    /**
     * 配列に変換する
     * @returns {V[]}
     */
    toArray(): V[];
    /**
     * イテレータを返却する
     * @returns {Iterator<V>}
     */
    [Symbol.iterator](): Iterator<V>;
}

/**
 * Streamの基底クラス
 * @extends {JavaLibraryScriptCore}
 * @class
 * @abstract
 */
declare class StreamInterface extends JavaLibraryScriptCore {
}

/**
 * 非同期Stream (LazyAsyncList)
 * @extends {StreamInterface}
 * @class
 */
declare class AsyncStream extends StreamInterface {
    /**
     * AsyncStream化
     * @template {AsyncStream} T
     * @this {new (iterable: Iterable | AsyncIterator) => T}
     * @param {Iterable | AsyncIterator} iterable
     * @returns {T}
     * @static
     */
    static from<T extends AsyncStream>(this: new (iterable: Iterable<any> | AsyncIterator<any, any, any>) => T, iterable: Iterable<any> | AsyncIterator<any, any, any>): T;
    /**
     * Iterable化
     * @param {Iterable | AsyncIterator} input
     * @returns {AsyncIterator}
     */
    static _normalize(input: Iterable<any> | AsyncIterator<any, any, any>): AsyncIterator<any, any, any>;
    /**
     * @param {Iterable | AsyncIterator} source
     */
    constructor(source: Iterable<any> | AsyncIterator<any, any, any>);
    _iter: AsyncIterator<any, any, any>;
    _pipeline: any[];
    /**
     * pipelineに追加
     * @param {Generator} fn
     * @returns {this}
     */
    _use(fn: Generator): this;
    /**
     * pipelineを圧縮
     * @returns {this}
     */
    flattenPipeline(): this;
    /**
     * 処理を一括関数化
     * @returns {Function}
     */
    toFunction(): Function;
    /**
     * AsyncStreamをマップ
     * @param {Function | Promise} fn
     * @returns {this}
     */
    map(fn: Function | Promise<any>): this;
    /**
     * AsyncStreamをフィルタ
     * @param {Function | Promise} fn
     * @returns {this}
     */
    filter(fn: Function | Promise<any>): this;
    /**
     * AsyncStreamを展開
     * @param {Function | Promise} fn
     * @returns {this}
     */
    flatMap(fn: Function | Promise<any>): this;
    /**
     * AsyncStreamの重複を排除
     * @param {Function | Promise} keyFn
     * @returns {this}
     */
    distinct(keyFn?: Function | Promise<any>): this;
    /**
     * AsyncStreamの要素は変更せずに関数のみを実行
     * @param {Function} fn
     * @returns {this}
     */
    peek(fn: Function): this;
    /**
     * AsyncStreamの要素数を先頭から制限
     * @param {Number} n
     * @returns {this}
     */
    limit(n: number): this;
    /**
     * AsyncStreamの要素数を先頭からスキップ
     * @param {Number} n
     * @returns {this}
     */
    skip(n: number): this;
    /**
     * AsyncStreamをforEach
     * @param {Function | Promise} fn
     * @async
     */
    forEach(fn: Function | Promise<any>): Promise<void>;
    /**
     * AsyncStreamを配列化
     * @returns {Array}
     * @async
     */
    toArray(): any[];
    /**
     * AsyncStreamをreduce
     * @param {Function | Promise} fn
     * @param {any} initial
     * @returns {any}
     * @async
     */
    reduce(fn: Function | Promise<any>, initial: any): any;
    /**
     * AsyncStreamの要素数を取得
     * @returns {Number}
     * @async
     */
    count(): number;
    /**
     * AsyncStreamで条件を満たす要素があるか検査
     * @param {Function | Promise} fn
     * @returns {Boolean}
     * @async
     */
    some(fn: Function | Promise<any>): boolean;
    /**
     * Streamで全ての要素が条件を満たすか検査
     * @param {Function | Promise} fn
     * @returns {Boolean}
     * @async
     */
    every(fn: Function | Promise<any>): boolean;
    /**
     * AsyncStreamから最初の要素を取得
     * @returns {any}
     * @async
     */
    findFirst(): any;
    /**
     * Streamから任意の要素を取得
     * @returns {any}
     * @async
     */
    find(): any;
    /**
     * Java Collectors 相当
     * @param {Function} collectorFn
     * @returns {any}
     */
    collectWith(collectorFn: Function): any;
    /**
     * AsyncStreamをStreamに変換
     * @returns {Stream}
     * @async
     */
    toLazy(): Stream<any>;
    /**
     * Streamをイテレータ化(非同期)
     * @returns {AsyncIterator}
     */
    [Symbol.asyncIterator](): AsyncIterator<any, any, any>;
}

/**
 * Mapの基底クラス
 * @template K, V
 * @extends {Map<K, V>}
 * @class
 * @abstract
 * @interface
 */
declare class MapInterface<K, V> extends Map<K, V> {
    /**
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(KeyType: Function, ValueType: Function);
    _KeyType: Function | Symbol;
    _ValueType: Function | Symbol;
    /**
     * Keyの型をチェックする
     * @param {K} key
     * @throws {TypeError}
     */
    _checkKey(key: K): void;
    /**
     * Valueの型をチェックする
     * @param {V} value
     * @throws {TypeError}
     */
    _checkValue(value: V): void;
    /**
     * 空かどうかを返却する
     * @returns {boolean}
     */
    isEmpty(): boolean;
}

/**
 * 型チェック機能のついたMap
 * @template K, V
 * @extends {MapInterface<K, V>}
 * @class
 */
declare class HashMap<K, V> extends MapInterface<K, V> {
    /**
     * データを追加・更新する
     * @param {K} key
     * @param {V} value
     * @returns {this}
     * @throws {TypeError}
     */
    set(key: K, value: V): this;
    /**
     * データを追加・更新する
     * @param {K} key
     * @param {V} value
     * @returns {this}
     * @throws {TypeError}
     */
    put(key: K, value: V): this;
    /**
     * データを一括で追加・更新する
     * @param {Map<K, V>} map
     * @throws {TypeError}
     */
    setAll(map: Map<K, V>): void;
    /**
     * データを一括で追加・更新する
     * @param {Map<K, V>} map
     * @throws {TypeError}
     */
    putAll(map: Map<K, V>): void;
    /**
     * Keyの存在を確認する
     * @param {K} key
     * @returns {boolean}
     * @throws {TypeError}
     */
    containsKey(key: K): boolean;
    /**
     * Valueの存在を確認する
     * @param {V} value
     * @returns {boolean}
     */
    containsValue(value: V): boolean;
    /**
     * データを削除する
     * @param {K} key
     * @returns {boolean}
     * @throws {TypeError}
     */
    remove(key: K): boolean;
    /**
     * EntrySetを返却する
     * @returns {MapIterator<[...[K, V]]>}
     */
    entrySet(): MapIterator<[...[K, V]]>;
    /**
     * 等価判定を行う
     * @param {this} otherMap
     * @returns {boolean}
     */
    equals(otherMap: this): boolean;
    /**
     * 全てのデータを呼び出す
     * @param {Function} callback
     * @param {any} thisArg
     */
    forEach(callback: Function, thisArg: any): void;
    /**
     * Streamを返却する
     * @returns {EntryStream<K, V>}
     */
    stream(): EntryStream<K, V>;
    /**
     * イテレータを返却する
     * @returns {Iterator<V>}
     */
    [Symbol.iterator](): Iterator<V>;
}

/**
 * Entry専用Stream (LazyList)
 * @template K, V
 * @extends {Stream<V>}
 * @class
 */
declare class EntryStream<K, V> extends Stream<V> {
    /**
     * Stream化
     * @template {EntryStream} T
     * @this {new (Iterable, Function, Function) => T}
     * @param {Iterable} iterable
     * @param {Function} KeyType
     * @param {Function} ValueType
     * @returns {T}
     * @overload
     * @static
     */
    static from<T extends EntryStream<any, any>>(): any;
    /**
     * @param {Iterable<[K, V]>} source
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(source: Iterable<[K, V]>, KeyType: Function, ValueType: Function);
    mapToEntry: any;
    _KeyType: Function | Symbol;
    /**
     * EntryStreamからキーのStreamを返却
     * @returns {Stream<K>}
     */
    keys(): Stream<K>;
    /**
     * EntryStreamから値のStreamを返却
     * @returns {Stream<V>}
     */
    values(): Stream<V>;
    /**
     * EntryStreamのキーをマップ
     * @param {Function} fn
     * @returns {this}
     */
    mapKeys(fn: Function): this;
    /**
     * EntryStreamの値をマップ
     * @param {Function} fn
     * @returns {this}
     */
    mapValues(fn: Function): this;
    /**
     * EntryStreamをHashMapに変換する
     * @param {Function} [KeyType]
     * @param {Function} [ValueType]
     * @returns {HashMapType}
     */
    toHashMap(KeyType?: Function, ValueType?: Function): HashMapType;
}
declare namespace EntryStream {
    export type { HashMapType };
}

type HashMapType = HashMap<any, any>;

/**
 * BigFloat の設定
 * @class
 */
declare class BigFloatConfig extends JavaLibraryScriptCore {
    /**
     * 0に近い方向に切り捨て
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_TRUNCATE: number;
    /**
     * 絶対値が小さい方向に切り捨て（ROUND_TRUNCATEと同じ）
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_DOWN: number;
    /**
     * 絶対値が大きい方向に切り上げ
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_UP: number;
    /**
     * 正の無限大方向に切り上げ
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_CEIL: number;
    /**
     * 負の無限大方向に切り捨て
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_FLOOR: number;
    /**
     * 四捨五入
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_HALF_UP: number;
    /**
     * 五捨六入（5未満切り捨て）
     * @type {number}
     * @static
     * @readonly
     */
    static readonly ROUND_HALF_DOWN: number;
    /**
     * 円周率の計算アルゴリズム
     * @type {number}
     * @static
     * @readonly
     */
    static readonly PI_MATH_DEFAULT: number;
    /**
     * 円周率[Gregory-Leibniz法] (超高速・超低収束)
     * @type {number}
     * @static
     * @readonly
     */
    static readonly PI_LEIBNIZ: number;
    /**
     * 円周率[ニュートン法] (高速・低収束)
     * @type {number}
     * @static
     * @readonly
     */
    static readonly PI_NEWTON: number;
    /**
     * 円周率[Chudnovsky法] (低速・高収束)
     * @type {number}
     * @static
     * @readonly
     */
    static readonly PI_CHUDNOVSKY: number;
    /**
     * @param {Object | BigFloatConfig} [options]
     * @param {boolean} [options.allowPrecisionMismatch=false] - 精度の不一致を許容する
     * @param {boolean} [options.mutateResult=false] - 破壊的な計算(自身の上書き)をする (falseは新インスタンスを作成)
     * @param {number} [options.roundingMode=BigFloatConfig.ROUND_TRUNCATE] - 丸めモード
     * @param {BigInt} [options.extraPrecision=2n] - 追加の精度
     * @param {number} [options.piAlgorithm=BigFloatConfig.PI_CHUDNOVSKY] - 円周率算出アルゴリズム
     * @param {BigInt} [options.trigFuncsMaxSteps=5000n] - 三角関数の最大ステップ数
     * @param {BigInt} [options.lnMaxSteps=10000n] - 自然対数の最大ステップ数
     */
    constructor({ allowPrecisionMismatch, mutateResult, roundingMode, extraPrecision, piAlgorithm, trigFuncsMaxSteps, lnMaxSteps, }?: any | BigFloatConfig);
    /**
     * 精度の不一致を許容する
     * @type {boolean}
     * @default false
     */
    allowPrecisionMismatch: boolean;
    /**
     * 破壊的な計算(自身の上書き)をする (falseは新インスタンスを作成)
     * @type {boolean}
     * @default false
     */
    mutateResult: boolean;
    /**
     * 丸めモード
     * @type {number}
     * @default BigFloatConfig.ROUND_TRUNCATE
     */
    roundingMode: number;
    /**
     * 追加の精度
     * @type {BigInt}
     * @default 2n
     */
    extraPrecision: bigint;
    /**
     * 円周率算出アルゴリズム
     * @type {number}
     * @default BigFloatConfig.PI_CHUDNOVSKY
     */
    piAlgorithm: number;
    /**
     * 三角関数の最大ステップ数
     * @type {BigInt}
     * @default 1000n
     */
    trigFuncsMaxSteps: bigint;
    /**
     * 自然対数の最大ステップ数
     * @type {BigInt}
     * @default 50000n
     */
    lnMaxSteps: bigint;
    /**
     * 設定オブジェクトを複製する
     * @returns {BigFloatConfig}
     */
    clone(): BigFloatConfig;
    /**
     * 精度の不一致を許容するかどうかを切り替える
     */
    toggleMismatch(): void;
    /**
     * 破壊的な計算(自身の上書き)をするかどうかを切り替える
     */
    toggleMutation(): void;
}
/**
 * 大きな浮動小数点数を扱えるクラス
 * @class
 */
declare class BigFloat extends JavaLibraryScriptCore {
    /**
     * 最大精度 (Stringの限界)
     * @type {BigInt}
     * @static
     */
    static MAX_PRECISION: bigint;
    /**
     * 設定
     * @type {BigFloatConfig}
     * @static
     */
    static config: BigFloatConfig;
    /**
     * キャッシュ
     * @type {Record<string, {value: BigInt, precision: BigInt, priority: number}>}
     * @static
     * @readonly
     */
    static readonly _cached: Record<string, {
        value: bigint;
        precision: bigint;
        priority: number;
    }>;
    /**
     * BigFloatのstaticメゾット実行結果をキャッシュ化するクラスを生成する (同じ計算を繰り返さない限り使用した方が遅い)
     * @param {number} [maxSize=10000] - キャッシュサイズ
     * @param {string[]} [addBlacklist=[]] - 追加ブラックリスト
     * @returns {typeof BigFloat}
     */
    static generateCachedClass(maxSize?: number, addBlacklist?: string[]): typeof BigFloat;
    /**
     * クラスを複製する (設定複製用)
     * @returns {BigFloat}
     * @static
     */
    static clone(): BigFloat;
    /**
     * 文字列を数値に変換する
     * @param {string} str - 変換する文字列
     * @param {BigInt} precision - 小数点以下の桁数
     * @param {number} base - 基数
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static parseFloat(str: string, precision?: bigint, base?: number): BigFloat;
    /**
     * 引数を正規化する
     * @param {any[]} args
     * @returns {any[]}
     */
    static _normalizeArgs(args: any[]): any[];
    /**
     * 複数の精度を合わせる
     * @param {BigFloat[]} arr
     * @param {boolean} [useExPrecision=false]
     * @returns {[BigFloat[], BigInt, BigInt]}
     * @throws {Error}
     * @static
     */
    static _batchRescale(arr: BigFloat[], useExPrecision?: boolean): [BigFloat[], bigint, bigint];
    /**
     * 結果を作成する
     * @param {BigInt} val
     * @param {BigInt} precision
     * @param {BigInt} [exPrecision]
     * @returns {BigFloat}
     * @static
     */
    static _makeResult(val: bigint, precision: bigint, exPrecision?: bigint): BigFloat;
    /**
     * 精度をチェックする
     * @param {BigInt} precision
     * @throws {Error}
     * @static
     */
    static _checkPrecision(precision: bigint): void;
    /**
     * 剰余
     * @param {BigInt} x
     * @param {BigInt} m
     * @returns {BigInt}
     * @static
     */
    static _mod(x: bigint, m: bigint): bigint;
    /**
     * 絶対値
     * @param {BigInt} val
     * @returns {BigInt}
     * @static
     */
    static _abs(val: bigint): bigint;
    /**
     * 数値を丸める
     * @param {BigInt} val
     * @param {BigInt} currentPrec
     * @param {BigInt} targetPrec
     * @returns {BigInt}
     * @static
     */
    static _round(val: bigint, currentPrec: bigint, targetPrec: bigint): bigint;
    /**
     * べき乗
     * @param {BigInt} base - 基数
     * @param {BigInt} exponent - 指数
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _pow(base: bigint, exponent: bigint, precision: bigint): bigint;
    /**
     * 平方根[ニュートン法] (_nthRootとは高速化のために分離)
     * @param {BigInt} n
     * @param {BigInt} precision
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _sqrt(n: bigint, precision: bigint): bigint;
    /**
     * n乗根[ニュートン法]
     * @param {BigInt} v
     * @param {BigInt} n
     * @param {BigInt} precision
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _nthRoot(v: bigint, n: bigint, precision: bigint): bigint;
    /**
     * 正弦[Maclaurin展開]
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @static
     */
    static _sin(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 余弦
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @static
     */
    static _cos(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 正接
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _tan(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 逆正弦
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _asin(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 逆余弦
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _acos(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 逆正接
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _atan(x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 逆正接2 (atan2(y, x))
     * @param {BigInt} y
     * @param {BigInt} x
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @static
     */
    static _atan2(y: bigint, x: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 逆正接[Machine's formula]
     * @param {BigInt} invX
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _atanMachine(invX: bigint, precision: bigint): bigint;
    /**
     * Newton法
     * @param {(x:BigInt) => BigInt} f
     * @param {(x:BigInt) => BigInt} df
     * @param {BigInt} initial
     * @param {BigInt} precision
     * @param {number} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _trigFuncsNewton(f: (x: bigint) => bigint, df: (x: bigint) => bigint, initial: bigint, precision: bigint, maxSteps?: number): bigint;
    /**
     * sin(π * z)
     * @param {BigInt} z
     * @param {BigInt} precision
     * @returns {BigInt}
     */
    static _sinPi(z: bigint, precision: bigint): bigint;
    /**
     * 指数関数のTaylor展開
     * @param {BigInt} x
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _exp(x: bigint, precision: bigint): bigint;
    /**
     * 2の指数関数
     * @param {BigInt} value
     * @param {BigInt} precision
     * @param {number} maxSteps
     * @returns {BigInt}
     * @static
     */
    static _exp2(value: bigint, precision: bigint, maxSteps: number): bigint;
    /**
     * 指数関数 exp(x) - 1
     * @param {BigInt} value
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _expm1(value: bigint, precision: bigint): bigint;
    /**
     * 自然対数[Atanh法]
     * @param {BigInt} value
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _ln(value: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 対数
     * @param {BigInt} baseValue
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _log(value: any, baseValue: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 底2の対数
     * @param {BigInt} value
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     * @static
     */
    static _log2(value: bigint, precision: bigint, maxSteps: bigint): bigint;
    /**
     * 底10の対数
     * @param {BigInt} value
     * @returns {BigInt}
     * @static
     */
    static _log10(value: bigint, precision: any, maxSteps: any): bigint;
    /**
     * 対数 log(1 + x)
     * @returns {BigFloat}
     * @static
     */
    static _log1p(value: any, precision: any, maxSteps: any): BigFloat;
    /**
     * 自然対数 ln(10) (簡易計算用)
     * @param {BigInt} precision - 精度
     * @param {BigInt} [maxSteps=10000n] - 最大反復回数
     * @returns {BigInt}
     * @static
     */
    static _ln10(precision: bigint, maxSteps?: bigint): bigint;
    /**
     * 自然対数 ln(2)
     * @param {BigInt} precision
     * @param {BigInt} maxSteps
     * @returns {BigInt}
     */
    static _ln2(precision: bigint, maxSteps: bigint): bigint;
    /**
     * ネイピア数
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _e(precision: bigint): bigint;
    /**
     * ネイピア数
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static e(precision?: bigint): BigFloat;
    /**
     * 円周率[Gregory-Leibniz法] (超高速・超低収束)
     * @param {BigInt} [precision=20n] - 精度
     * @param {BigInt} [mulPrecision=100n] - 計算精度の倍率
     * @returns {BigInt}
     * @static
     */
    static _piLeibniz(precision?: bigint, mulPrecision?: bigint): bigint;
    /**
     * 円周率[ニュートン法] (高速・低収束)
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigInt}
     * @static
     */
    static _piNewton(precision?: bigint): bigint;
    /**
     * 円周率[Chudnovsky法] (低速・高収束)
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigInt}
     * @static
     */
    static _piChudnovsky(precision?: bigint): bigint;
    /**
     * 円周率
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigInt}
     * @static
     */
    static _pi(precision?: bigint): bigint;
    /**
     * 円周率
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static pi(precision?: bigint): BigFloat;
    /**
     * 円周率の2倍
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigInt}
     * @static
     */
    static _tau(precision?: bigint): bigint;
    /**
     * 円周率の2倍
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigFloat}
     * @static
     */
    static tau(precision?: bigint): BigFloat;
    /**
     * 最大値を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static max(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 最小値を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static min(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 合計値を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static sum(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 積を返す (丸め誤差に注意)
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static product(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 平均値を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static average(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 中央値を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static median(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 分散を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static variance(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * 標準偏差を返す
     * @param {...(BigFloat | number | string | BigInt) | Array<BigFloat | number | string | BigInt>} args
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static stddev(...args: ((BigFloat | number | string | bigint) | Array<BigFloat | number | string | bigint>)[]): BigFloat;
    /**
     * bigintの乱数を生成する
     * @param {BigInt} precision
     * @returns {BigInt}
     */
    static _randomBigInt(precision: bigint): bigint;
    /**
     * 乱数を生成する
     * @param {BigInt} [precision=20n] - 精度
     * @returns {BigFloat}
     * @throws {Error}
     * @static
     */
    static random(precision?: bigint): BigFloat;
    /**
     * 台形積分
     * @param {(k:BigInt) => BigInt} f
     * @param {BigInt} a - スケール済
     * @param {BigInt} b - スケール済
     * @param {BigInt} n
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _integral(f: (k: bigint) => bigint, a: bigint, b: bigint, n: bigint, precision: bigint): bigint;
    /**
     * ベルヌーイ数 [阿部-Zeta関数/Akiyama-Tanigawaアルゴリズム]
     * @param {number} n - ベルヌーイ数のインデックス (偶数のみ有効)
     * @param {BigInt} precision - 精度
     * @returns {BigInt[]} 0からnまでのベルヌーイ数の配列
     * @static
     */
    static _bernoulliNumbers(n: number, precision: bigint): bigint[];
    /**
     * Lanczos-Spouge近似のパラメータ a を決定
     * @param {BigInt} precision - 精度
     * @returns {number} 非スケール
     * @static
     */
    static _getSpougeParamA(precision: bigint): number;
    /**
     * Lanczos-Spouge近似の係数を動的に計算
     * @param {number} numCoeffs - 係数の数
     * @param {number} a - 非スケール
     * @param {BigInt} precision - 精度
     * @returns {BigInt[]} 係数
     * @static
     */
    static _lanczosSpougeCoefficients(numCoeffs: number, a: number, precision: bigint): bigint[];
    /**
     * gamma関数[Lanczos-Spouge近似]
     * @param {BigInt} z - スケール済
     * @param {BigInt} precision - 精度
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _gammaLanczos(z: bigint, precision: bigint): bigint;
    /**
     * 階乗を計算する (整数のみ)
     * @param {BigInt} n - スケールなし
     * @returns {BigInt}
     * @static
     */
    static _factorial(n: bigint): bigint;
    /**
     * 階乗を計算する (小数対応)
     * @param {BigInt} n - スケールあり
     * @param {BigInt} precision
     * @returns {BigInt}
     * @static
     */
    static _factorialGamma(n: bigint, precision: bigint): bigint;
    /**
     * 二項係数を計算する
     * @param {BigInt} n
     * @param {BigInt} k
     * @returns {BigInt}
     * @static
     */
    static _binomial(n: bigint, k: bigint): bigint;
    /**
     * キャッシュを取得すべきか判定
     * @param {String} key
     * @param {BigInt} precision
     * @param {Number} [priority=0]
     * @returns {Boolean}
     * @static
     */
    static _getCheckCache(key: string, precision: bigint, priority?: number): boolean;
    /**
     * キャッシュを取得する
     * @param {String} name
     * @param {BigInt} precision
     * @returns {BigInt}
     * @throws {Error}
     * @static
     */
    static _getCache(key: any, precision: bigint): bigint;
    /**
     * キャッシュを更新する
     * @param {String} key
     * @param {BigInt} value
     * @param {BigInt} precision
     * @param {Number} [priority=0]
     * @static
     */
    static _updateCache(key: string, value: bigint, precision: bigint, priority?: number): void;
    /**
     * -1のBigFloat
     * @param {BigInt} [precision=20n] 精度
     * @returns {BigFloat}
     * @static
     */
    static minusOne(precision?: bigint): BigFloat;
    /**
     * 0のBigFloat
     * @param {BigInt} [precision=20n] 精度
     * @returns {BigFloat}
     * @static
     */
    static zero(precision?: bigint): BigFloat;
    /**
     * 1のBigFloat
     * @param {BigInt} [precision=20n] 精度
     * @returns {BigFloat}
     * @static
     */
    static one(precision?: bigint): BigFloat;
    /**
     * @param {string | number | BigInt | BigFloat} value - 初期値
     * @param {number} [precision=20] - 精度
     * @throws {Error}
     */
    constructor(value: string | number | bigint | BigFloat, precision?: number);
    value: any;
    /** @type {BigInt} */
    _precision: bigint;
    /**
     * インスタンスを複製する
     * @returns {BigFloat}
     */
    clone(): BigFloat;
    /**
     * 文字列を解析して数値を取得
     * @param {string} str - 文字列
     * @returns {{intPart: string, fracPart: string, sign: number}}
     */
    _parse(str: string): {
        intPart: string;
        fracPart: string;
        sign: number;
    };
    /**
     * 数値を正規化
     * @param {BigInt} val
     * @returns {string}
     */
    _normalize(val: bigint): string;
    /**
     * 精度を合わせる
     * @param {BigFloat} other
     * @param {boolean} [useExPrecision=false] - 追加の精度を使う
     * @returns {[BigInt, BigInt, BigInt, BigInt]}
     * @throws {Error}
     */
    _bothRescale(other: BigFloat, useExPrecision?: boolean): [bigint, bigint, bigint, bigint];
    /**
     * 結果を作成する
     * @param {BigInt} val
     * @param {BigInt} precision
     * @param {BigInt} [exPrecision]
     * @param {boolean} [okMutate=true] - 破壊的変更を許容
     * @returns {this}
     */
    _makeResult(val: bigint, precision: bigint, exPrecision?: bigint, okMutate?: boolean): this;
    /**
     * 精度を変更する
     * @param {BigInt} precision
     * @returns {this}
     */
    changePrecision(precision: bigint): this;
    /**
     * どこまで精度が一致しているかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {number}
     * @throws {Error}
     */
    matchingPrecision(other: BigFloat | number | string | bigint): number;
    /**
     * 等しいかどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    compare(other: BigFloat | number | string | bigint): boolean;
    /**
     * 等しいかどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    eq(other: BigFloat | number | string | bigint): boolean;
    /**
     * 等しいかどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    equals(other: BigFloat | number | string | bigint): boolean;
    /**
     * 等しくないかどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    ne(other: BigFloat | number | string | bigint): boolean;
    /**
     * this < other かどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    lt(other: BigFloat | number | string | bigint): boolean;
    /**
     * this <= other かどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    lte(other: BigFloat | number | string | bigint): boolean;
    /**
     * this > other かどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    gt(other: BigFloat | number | string | bigint): boolean;
    /**
     * this >= other かどうかを判定する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {boolean}
     * @throws {Error}
     */
    gte(other: BigFloat | number | string | bigint): boolean;
    /**
     * 0かどうかを判定する
     * @returns {boolean}
     */
    isZero(): boolean;
    /**
     * 正かどうかを判定する
     * @returns {boolean}
     */
    isPositive(): boolean;
    /**
     * 負かどうかを判定する
     * @returns {boolean}
     */
    isNegative(): boolean;
    /**
     * 相対差を計算する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {BigInt}
     * @throws {Error}
     */
    relativeDiff(other: BigFloat | number | string | bigint): bigint;
    /**
     * 絶対差を計算する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {BigFloat}
     * @throws {Error}
     */
    absoluteDiff(other: BigFloat | number | string | bigint): BigFloat;
    /**
     * 差分の非一致度を計算する
     * @param {BigFloat | number | string | BigInt} other - 比較する値
     * @returns {BigInt}
     * @throws {Error}
     */
    percentDiff(other: BigFloat | number | string | bigint): bigint;
    /**
     * 文字列に変換する
     * @param {number} base - 基数
     * @param {number} precision - 精度
     * @returns {string}
     */
    toString(base?: number, precision?: number): string;
    /**
     * JSONに変換する
     * @returns {string}
     */
    toJSON(): string;
    /**
     * 数値に変換する
     * @returns {number}
     */
    toNumber(): number;
    /**
     * 小数点以下の桁数を指定して数値を丸める
     * @param {number} digits - 小数点以下の桁数
     * @returns {string}
     */
    toFixed(digits: number): string;
    /**
     * 指数表記に変換する
     * @param {number} digits - 小数点以下の桁数
     * @returns {string}
     */
    toExponential(digits?: number): string;
    /**
     * 加算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    add(other: BigFloat): this;
    /**
     * 減算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    sub(other: BigFloat): this;
    /**
     * 乗算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    mul(other: BigFloat): this;
    /**
     * 除算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    div(other: BigFloat): this;
    /**
     * 剰余
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    mod(other: BigFloat): this;
    /**
     * 符号反転
     * @returns {this}
     * @throws {Error}
     */
    neg(): this;
    /**
     * 絶対値
     * @returns {this}
     * @throws {Error}
     */
    abs(): this;
    /**
     * 逆数を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    reciprocal(): BigFloat;
    /**
     * 小数点以下を切り捨て
     * @returns {BigFloat}
     */
    floor(): BigFloat;
    /**
     * 小数点以下を切り上げ
     * @returns {BigFloat}
     */
    ceil(): BigFloat;
    /**
     * 四捨五入
     * @returns {BigFloat}
     */
    round(): BigFloat;
    /**
     * 整数部分だけを取得
     * @returns {BigFloat}
     */
    trunc(): BigFloat;
    /**
     * べき乗
     * @param {BigFloat} exponent - 指数
     * @returns {this}
     * @throws {Error}
     */
    pow(exponent: BigFloat): this;
    /**
     * 平方根[ニュートン法]
     * @returns {this}
     * @throws {Error}
     */
    sqrt(): this;
    /**
     * 立方根[ニュートン法]
     * @returns {this}
     * @throws {Error}
     */
    cbrt(): this;
    /**
     * n乗根[ニュートン法]
     * @param {BigInt} n
     * @returns {this}
     * @throws {Error}
     */
    nthRoot(n: bigint): this;
    /**
     * precisionを最小限まで縮める
     * @returns {this}
     */
    scale(): this;
    /**
     * 正弦[Maclaurin展開]
     * @returns {this}
     * @throws {Error}
     */
    sin(): this;
    /**
     * 余弦
     * @returns {this}
     */
    cos(): this;
    /**
     * 正接
     * @returns {this}
     * @throws {Error}
     */
    tan(): this;
    /**
     * 逆正弦
     * @returns {this}
     * @throws {Error}
     */
    asin(): this;
    /**
     * 逆余弦
     * @returns {this}
     * @throws {Error}
     */
    acos(): this;
    /**
     * 逆正接
     * @returns {this}
     * @throws {Error}
     */
    atan(): this;
    /**
     * 逆正接2 (atan2(y, x))
     * @param {BigFloat} x
     * @returns {this}
     * @throws {Error}
     */
    atan2(x: BigFloat): this;
    /**
     * 指数関数
     * @param {BigInt} [precision=20n] - 精度
     * @returns {this}
     * @throws {Error}
     */
    exp(): this;
    /**
     * 2の指数関数
     * @returns {this}
     */
    exp2(): this;
    /**
     * 指数関数 exp(x) - 1
     * @returns {this}
     */
    expm1(): this;
    /**
     * 自然対数 ln(x)
     * @returns {BigFloat}
     */
    ln(): BigFloat;
    /**
     * 対数
     * @param {BigFloat} base
     * @returns {BigFloat}
     */
    log(base: BigFloat): BigFloat;
    /**
     * 底2の対数
     * @returns {BigFloat}
     */
    log2(): BigFloat;
    /**
     * 底10の対数
     * @returns {BigFloat}
     */
    log10(): BigFloat;
    /**
     * 対数 log(1 + x)
     * @returns {BigFloat}
     */
    log1p(): BigFloat;
    /**
     * ガンマ関数[Lanczos-Spouge近似]
     * @returns {BigFloat}
     */
    gamma(): BigFloat;
    /**
     * 階乗を計算する (小数計算の場合の精度に注意)
     * @returns {BigFloat}
     */
    factorial(): BigFloat;
}
/**
 * BigFloat を作成する
 * @param {string | number | BigInt | BigFloat} value 初期値
 * @param {number} [precision=20] 精度
 * @returns {BigFloat}
 * @throws {Error}
 */
declare function bigFloat(value: string | number | bigint | BigFloat, precision?: number): BigFloat;

/**
 * BigFloat専用Stream (LazyList)
 * @extends {Stream<BigFloat>}
 * @class
 */
declare class BigFloatStream extends Stream<BigFloat> {
    /**
     * @param {Iterable<BigFloat>} source
     */
    constructor(source: Iterable<BigFloat>);
    mapToBigFloat: any;
    /**
     * 精度を変更する
     * @param {BigInt} precision
     * @returns {this}
     * @throws {Error}
     */
    changePrecision(precision: bigint): this;
    /**
     * 加算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    add(other: BigFloat): this;
    /**
     * 減算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    sub(other: BigFloat): this;
    /**
     * 乗算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    mul(other: BigFloat): this;
    /**
     * 除算
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    div(other: BigFloat): this;
    /**
     * 剰余
     * @param {BigFloat} other
     * @returns {this}
     * @throws {Error}
     */
    mod(other: BigFloat): this;
    /**
     * 符号反転
     * @returns {this}
     * @throws {Error}
     */
    neg(): this;
    /**
     * 絶対値
     * @returns {this}
     * @throws {Error}
     */
    abs(): this;
    /**
     * 逆数を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    reciprocal(): BigFloat;
    /**
     * べき乗
     * @param {BigFloat} exponent - 指数
     * @returns {this}
     */
    pow(exponent: BigFloat): this;
    /**
     * 平方根
     * @returns {this}
     * @throws {Error}
     */
    sqrt(): this;
    /**
     * 立方根
     * @returns {this}
     * @throws {Error}
     */
    cbrt(): this;
    /**
     * n乗根
     * @param {BigInt} n
     * @returns {this}
     * @throws {Error}
     */
    nthRoot(n: bigint): this;
    /**
     * 最大値を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    max(): BigFloat;
    /**
     * 最小値を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    min(): BigFloat;
    /**
     * 合計値を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    sum(): BigFloat;
    /**
     * 積を返す (丸め誤差に注意)
     * @returns {BigFloat}
     * @throws {Error}
     */
    product(): BigFloat;
    /**
     * 平均値を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    average(): BigFloat;
    /**
     * 中央値を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    median(): BigFloat;
    /**
     * 分散を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    variance(): BigFloat;
    /**
     * 標準偏差を返す
     * @returns {BigFloat}
     * @throws {Error}
     */
    stddev(): BigFloat;
}

/**
 * 数値専用Stream (LazyList)
 * @extends {Stream<Number>}
 * @class
 */
declare class NumberStream extends Stream<number> {
    /**
     * @param {Iterable<Number>} source
     */
    constructor(source: Iterable<number>);
    mapToNumber: any;
    /**
     * 合計
     * @returns {Number}
     */
    sum(): number;
    /**
     * 平均
     * @returns {Number}
     */
    average(): number;
    /**
     * 最小値
     * @returns {Number | null}
     */
    min(): number | null;
    /**
     * 最大値
     * @returns {Number | null}
     */
    max(): number | null;
}

/**
 * Streamオブジェクト(LazyList)
 * @template V
 * @extends {StreamInterface}
 * @class
 */
declare class Stream<V> extends StreamInterface {
    /**
     * Stream化
     * @template {Stream} T
     * @this {new (Iterable) => T}
     * @param {Iterable<V>} iterable
     * @param {Function} ValueType
     * @returns {T}
     * @static
     */
    static from<T extends Stream<any>>(this: new (Iterable: any) => T, iterable: Iterable<V>, ValueType: Function): T;
    /**
     * @param {Iterable<V>} source
     * @param {Function} ValueType
     */
    constructor(source: Iterable<V>, ValueType: Function);
    _iter: Iterator<V, any, any>;
    _pipeline: any[];
    _ValueType: Function | Symbol;
    /**
     * pipelineに追加
     * @param {Generator} fn
     * @returns {this}
     */
    _use(fn: Generator): this;
    /**
     * 他Streamに変換
     * @param {Function} construct
     * @param {Generator} fn
     * @param {...any} args
     * @returns {this}
     */
    _convertToX(construct: Function, fn: Generator, ...args: any[]): this;
    /**
     * pipelineを圧縮
     * @returns {this}
     */
    flattenPipeline(): this;
    /**
     * 処理を一括関数化
     * @returns {Function}
     */
    toFunction(): Function;
    /**
     * Streamをマップ
     * @param {Function} fn
     * @returns {this}
     */
    map(fn: Function): this;
    /**
     * Streamをフィルタ
     * @param {Function} fn
     * @returns {this}
     */
    filter(fn: Function): this;
    /**
     * Streamを展開
     * @param {Function} fn
     * @returns {this}
     */
    flatMap(fn: Function): this;
    /**
     * Streamの重複を排除
     * @param {Function} keyFn
     * @returns {this}
     */
    distinct(keyFn?: Function): this;
    /**
     * Streamをソート
     * @param {Function} compareFn
     * @returns {this}
     */
    sorted(compareFn?: Function): this;
    /**
     * Streamの要素は変更せずに関数のみを実行
     * @param {Function} fn
     * @returns {this}
     */
    peek(fn: Function): this;
    /**
     * Streamの要素数を先頭から制限
     * @param {Number} n
     * @returns {this}
     */
    limit(n: number): this;
    /**
     * Streamの要素数を先頭からスキップ
     * @param {Number} n
     * @returns {this}
     */
    skip(n: number): this;
    /**
     * Streamを分割
     * @param {Number} size
     * @returns {this}
     */
    chunk(size: number): this;
    /**
     * Streamをスライド分割
     * @param {Number} size
     * @param {Number} step
     * @returns {this}
     */
    windowed(size: number, step?: number): this;
    /**
     * StreamをforEach
     * @param {Function} fn
     */
    forEach(fn: Function): void;
    /**
     * Streamを配列化
     * @returns {V[]}
     */
    toArray(): V[];
    /**
     * Streamをreduce
     * @param {Function} fn
     * @param {any} initial
     * @returns {any}
     */
    reduce(fn: Function, initial: any): any;
    /**
     * Streamの要素数を取得
     * @returns {Number}
     */
    count(): number;
    /**
     * Streamで条件を満たす要素があるか検査
     * @param {Function} fn
     * @returns {Boolean}
     */
    some(fn: Function): boolean;
    /**
     * Streamで全ての要素が条件を満たすか検査
     * @param {Function} fn
     * @returns {Boolean}
     */
    every(fn: Function): boolean;
    /**
     * Streamから最初の要素を取得
     * @returns {any}
     */
    findFirst(): any;
    /**
     * Streamから任意の要素を取得
     * @returns {any}
     */
    findAny(): any;
    /**
     * Java Collectors 相当
     * @param {Function} collectorFn
     * @returns {any}
     */
    collectWith(collectorFn: Function): any;
    /**
     * StreamをNumberStreamに変換
     * @param {Function} fn
     * @returns {NumberStreamType}
     */
    mapToNumber(fn: Function): NumberStreamType;
    /**
     * StreamをStringStreamに変換
     * @param {Function} fn
     * @returns {StringStream}
     */
    mapToString(fn: Function): StringStream;
    /**
     * StreamをBigFloatStreamに変換
     * @param {Function | number | BigInt} [fn=20n] - 数値なら自動変換
     * @returns {BigFloatStreamType}
     */
    mapToBigFloat(fn?: Function | number | bigint): BigFloatStreamType;
    /**
     * StreamをEntryStreamに変換
     * @param {Function} fn
     * @returns {EntryStreamType}
     */
    mapToEntry(fn: Function): EntryStreamType;
    /**
     * StreamをAsyncStreamに変換
     * @param {Function} fn
     * @returns {AsyncStreamType}
     */
    mapToAsync(fn: Function): AsyncStreamType;
    /**
     * StreamをHashSetに変換
     * @param {Function} [ValueType]
     * @returns {HashSetType}
     */
    toHashSet(ValueType?: Function): HashSetType;
    /**
     * Streamをイテレータ化
     * @returns {Iterator}
     */
    [Symbol.iterator](): Iterator<any, any, any>;
    /**
     * Streamをイテレータ化(非同期)
     * @returns {AsyncIterator}
     */
    [Symbol.asyncIterator](): AsyncIterator<any, any, any>;
}
declare namespace Stream {
    export type { NumberStreamType, BigFloatStreamType, EntryStreamType, AsyncStreamType, HashSetType };
}

type NumberStreamType = NumberStream;
type BigFloatStreamType = BigFloatStream;
type EntryStreamType = EntryStream<any, any>;
type AsyncStreamType = AsyncStream;
type HashSetType = HashSet<any>;

/**
 * 型チェック機能のついたList
 * @template V
 * @extends {ListInterface<V>}
 * @class
 */
declare class ArrayList<V> extends ListInterface<V> {
    /**
     * @param {Function} ValueType
     * @param {Iterable<V>} [collection]
     */
    constructor(ValueType: Function, collection?: Iterable<V>);
    _list: any[];
    /**
     * 要素を追加する
     * @param {V} item
     * @returns {this}
     * @throws {TypeError}
     */
    add(item: V): this;
    /**
     * 値を一括で追加する
     * @param {Iterable<V>} collection
     * @returns {this}
     * @throws {TypeError}
     */
    addAll(collection: Iterable<V>): this;
    /**
     * 指定したインデックスの要素を取得する
     * @param {Number} index
     * @returns {V}
     */
    get(index: number): V;
    /**
     * 指定したインデックスの要素を設定する
     * @param {Number} index
     * @param {V} item
     * @returns {this}
     * @throws {TypeError}
     */
    set(index: number, item: V): this;
    /**
     * 指定したインデックスの要素を削除する
     * @param {Number} index
     * @returns {V}
     */
    remove(index: number): V;
    /**
     * 要素数を返却する
     * @returns {Number}
     * @readonly
     */
    readonly get size(): number;
    /**
     * 全要素を削除する
     */
    clear(): void;
    /**
     * 等価判定を行う
     * @param {this} other
     * @returns {boolean}
     */
    equals(other: this): boolean;
    /**
     * EnumのIteratorを返却する
     * @returns {ArrayIterator<V>}
     */
    values(): ArrayIterator<V>;
    /**
     * 全てのデータを呼び出す
     * @param {Function} callback
     * @param {any} [thisArg]
     */
    forEach(callback: Function, thisArg?: any): void;
    /**
     * ソートする
     * @param {Function} [compareFn]
     * @returns {this}
     */
    sort(compareFn?: Function): this;
    /**
     * ソートしたStreamを返却する
     * @param {Function} [compareFn]
     * @returns {Generator<V>}
     */
    sorted(compareFn?: Function): Generator<V>;
    /**
     * 指定した範囲の配列を返却する
     * @param {Number} from
     * @param {Number} to
     * @returns {ArrayList<V>}
     */
    subList(from: number, to: number): ArrayList<V>;
    /**
     * Streamを返却する
     * @returns {Stream<V>}
     */
    stream(): Stream<V>;
    /**
     * 配列に変換する
     * @returns {V[]}
     */
    toArray(): V[];
    /**
     * instanceof を実装する
     * @param {any} obj
     * @returns {boolean}
     */
    [Symbol.hasInstance](obj: any): boolean;
    /**
     * イテレータを返却する
     * @returns {Iterator<V>}
     */
    [Symbol.iterator](): Iterator<V>;
}
/**
 * 配列を返却する
 * @param {Function} ValueType
 * @param {Iterable<V>} [collection]
 * @returns {ArrayList<V>}
 */
declare function arrayList(ValueType: Function, collection?: Iterable<V>): ArrayList<V>;

/**
 * 文字列専用Stream (LazyList)
 * @extends {Stream<String>}
 * @class
 */
declare class StringStream extends Stream<string> {
    /**
     * @param {Iterable<String>} source
     */
    constructor(source: Iterable<string>);
    mapToString: any;
    /**
     * 文字列連結
     * @param {string} separator
     * @returns {string}
     */
    join(separator?: string): string;
    /**
     * 文字列を結合
     * @returns {string}
     */
    concatAll(): string;
    /**
     * 最長の文字列を返す
     * @returns {string}
     */
    longest(): string;
    /**
     * 最短の文字列を返す
     * @returns {string}
     */
    shortest(): string;
}

/**
 * Streamの型チェック
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class StreamChecker extends JavaLibraryScriptCore {
    /**
     * TypeをStreamに変換する
     * @param {Function} expected
     * @returns {StreamInterface}
     */
    static typeToStream(expected: Function): StreamInterface;
    /**
     * StreamをTypeに変換する
     * @param {StreamInterface} stream
     * @returns {Function}
     * @static
     */
    static streamToType(stream: StreamInterface): Function;
}

/**
 * ログ出力管理クラス
 * @class
 */
declare class Logger extends JavaLibraryScriptCore {
    /**
     * コンソールスタイルを有効にする
     * @type {boolean}
     * @default true
     * @static
     */
    static ENABLE_CONSOLE_STYLE: boolean;
    /**
     * 折りたたみなしのログを有効にする
     * @type {boolean}
     * @default true
     * @static
     */
    static ENABLE_SIMPLE_LOG: boolean;
    /**
     * スタックトレースを有効にする
     * @type {boolean}
     * @default true
     * @static
     */
    static ENABLE_STACK_TRACE: boolean;
    /**
     * 区切り線の長さの初期値
     * @type {number}
     * @default 50
     * @static
     */
    static DEFAULT_HR_SIZE: number;
    /**
     * ログレベル
     * @enum {number}
     * @readonly
     * @static
     */
    static readonly LOG_LEVEL: {
        DEBUG: number;
        TIME: number;
        LOG: number;
        WARN: number;
        ERROR: number;
        INFO: number;
        IGNORE: number;
    };
    /**
     * コンソールスタイル
     * @enum {string}
     * @readonly
     * @static
     */
    static readonly CONSOLE_STYLE: {
        DEBUG_TITLE: string;
        DEBUG: string;
        LOG_TITLE: string;
        LOG: string;
        WARN_TITLE: string;
        WARN: string;
        ERROR_TITLE: string;
        ERROR: string;
        INFO_TITLE: string;
        INFO: string;
        STACK_TRACE: string;
    };
    /**
     * スタックトレースを取得する正規表現
     * @type {RegExp}
     * @readonly
     * @static
     */
    static readonly STACK_TRACE_GET_REG: RegExp;
    /**
     * カスタムコンソールが使用可能か判定する
     * @returns {boolean}
     * @static
     */
    static _isEnableCustomConsole(): boolean;
    /**
     * @param {String} [prefix=""]
     * @param {number} [visibleLevel=Logger.LOG_LEVEL.WARN]
     */
    constructor(prefix?: string, visibleLevel?: number);
    /**
     * ログの先頭の文字列
     * @type {String}
     */
    _prefix: string;
    /**
     * 表示するログレベル
     * @type {number}
     */
    _visibleLevel: number;
    /**
     * ログの先頭の文字列を変更する
     * @param {String} prefix
     */
    setPrefix(prefix: string): void;
    /**
     * ログの先頭の文字列を取得する
     * @returns {String}
     */
    getPrefix(): string;
    /**
     * 表示するログレベルを変更する
     * @param {number} level
     */
    setVisibleLevel(level: number): void;
    /**
     * 表示するログレベルを取得する
     * @returns {number}
     */
    getVisibleLevel(): number;
    /**
     * 表示可能なログレベルか判定する
     * @param {number} level
     * @returns {boolean}
     */
    _isVisible(level: number): boolean;
    /**
     * ログの先頭の文字列を生成する
     * @returns {String}
     */
    _generatePrefix(): string;
    /**
     * ログレベルを文字列に変換する
     * @param {number} level
     * @returns {String | false}
     */
    _getLevelToString(level: number): string | false;
    /**
     * 呼び出し元のスタックトレースを取得する
     * @returns {String}
     */
    _getTopStackTrace(): string;
    /**
     * ログを出力する
     * @param {number} level
     * @param {any[]} args
     * @returns {boolean}
     */
    _levelToPrint(level: number, args: any[]): boolean;
    /**
     * 開発用ログ
     * @param {...any} args
     */
    debug(...args: any[]): void;
    /**
     * 通常ログ
     * @param {...any} args
     */
    log(...args: any[]): void;
    /**
     * 警告ログ
     * @param {...any} args
     */
    warning(...args: any[]): void;
    /**
     * 警告ログ
     * @param {...any} args
     */
    warn(...args: any[]): void;
    /**
     * エラーログ
     * @param {...any} args
     */
    error(...args: any[]): void;
    /**
     * エラーログ
     * @param {...any} args
     */
    err(...args: any[]): void;
    /**
     * 情報ログ
     * @param {...any} args
     */
    information(...args: any[]): void;
    /**
     * 情報ログ
     * @param {...any} args
     */
    info(...args: any[]): void;
    /**
     * タイムログ (開始)
     * @param {String} label
     * @returns {String}
     */
    time(label: string): string;
    /**
     * タイムログ (終了)
     * @param {String} label
     */
    timeEnd(label: string): void;
    /**
     * 区切り線を出力する
     * @param {Number} [size]
     */
    hr(size?: number): void;
    /**
     * クラスのインスタンスをラップする
     * @template {Object} T
     * @param {T} instance
     * @returns {T}
     */
    wrapInstanceIO<T extends unknown>(instance: T): T;
}

/**
 * キャッシュのオプション
 */
type CacheWrapperOptions = {
    whitelist: string[] | null;
    blacklist: string[];
    maxSize: number;
    policy: CacheMapInterface;
};
/**
 * キャッシュのオプション
 * @typedef {{ whitelist: string[] | null, blacklist: string[], maxSize: number, policy: CacheMapInterface }} CacheWrapperOptions
 */
/**
 * キャッシュ用のマップ
 * @class
 * @abstract
 * @interface
 */
declare class CacheMapInterface extends JavaLibraryScriptCore {
    /**
     * @param {number} limit
     */
    constructor(limit: number);
    _limit: number;
    _cache: Map<any, any>;
}
/**
 * LRUキャッシュ
 * @class
 */
declare class LRUCache extends CacheMapInterface {
    /**
     * キーに対応する値を返却する
     * @param {string} key
     * @returns {any}
     */
    get(key: string): any;
    /**
     * キーに対応する値を設定する
     * @param {string} key
     * @param {any} val
     */
    set(key: string, val: any): void;
    /**
     * キーの存在を確認する
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     * キャッシュをクリアする
     */
    clear(): void;
}
/**
 * FIFOキャッシュ
 * @class
 */
declare class FIFOCache extends CacheMapInterface {
    constructor(limit: any);
    /**
     * キーに対応する値を返却する
     * @param {string} key
     * @returns {any}
     */
    get(key: string): any;
    /**
     * キーに対応する値を設定する
     * @param {string} key
     * @param {any} value
     */
    set(key: string, value: any): void;
    /**
     * キーの存在を確認する
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     * キャッシュをクリアする
     */
    clear(): void;
}
/**
 * LFUキャッシュ
 * @class
 */
declare class LFUCache extends CacheMapInterface {
    _freq: Map<any, any>;
    /**
     * キーに対応する値を返却する
     * @param {string} key
     * @returns {any}
     */
    get(key: string): any;
    /**
     * キーに対応する値を設定する
     * @param {string} key
     * @param {any} value
     */
    set(key: string, value: any): void;
    /**
     * キーの存在を確認する
     * @param {string} key
     * @returns {boolean}
     */
    has(key: string): boolean;
    /**
     * キャッシュをクリアする
     */
    clear(): void;
}
/**
 * クラスのstaticメゾットをキャッシュするクラス
 * @template T
 * @class
 */
declare class CacheWrapper<T> extends JavaLibraryScriptCore {
    /**
     * 先入れ先出し
     * @type {FIFOCache}
     * @static
     * @readonly
     */
    static readonly POLICY_FIFO: FIFOCache;
    /**
     * 最頻出順
     * @type {LFUCache}
     * @static
     * @readonly
     */
    static readonly POLICY_LFU: LFUCache;
    /**
     * 最近使った順
     * @type {LRUCache}
     * @static
     * @readonly
     */
    static readonly POLICY_LRU: LRUCache;
    /**
     * @type {WeakMap<object, number>}
     * @static
     * @readonly
     */
    static readonly _objectIdMap: WeakMap<object, number>;
    /**
     * @type {number}
     * @static
     */
    static _objectIdCounter: number;
    /**
     * MurmurHash3 32bit ハッシュ関数 (36進数)
     * @see https://github.com/garycourt/murmurhash-js/blob/master/murmurhash3_gc.js
     * @param {string} key
     * @param {number} [seed=0]
     * @returns {string}
     * @static
     */
    static _murmurhash3_32_gc(key: string, seed?: number): string;
    /**
     * オブジェクトのIDを返す
     * @param {Object} obj
     * @returns {number}
     * @static
     */
    static _getObjectId(obj: any): number;
    /**
     * オブジェクトを文字列(key)に変換する
     * @param {Object} obj
     * @returns {string}
     * @static
     */
    static _toStringObject(obj: any): string;
    /**
     * オブジェクト配列を文字列(key)に変換する
     * @param {Object[]} args
     * @returns {string}
     * @static
     */
    static _identityHash(args: any[]): string;
    static isGeneratorObject(obj: any): boolean;
    /**
     * クラスを変換する
     * @template T
     * @param {new (...args: any[]) => T} BaseClass - 変換するクラス
     * @param {CacheWrapperOptions} options
     * @static
     */
    static convert<T_1>(BaseClass: new (...args: any[]) => T_1, { whitelist, blacklist, maxSize, policy }?: CacheWrapperOptions): {
        new (...args: any[]): {};
        __clearCache(methodName: any): void;
        __getCache(methodName: any): any;
        __getCacheDict(): any;
        __getCacheSize(): number;
        readonly name: string;
    };
    constructor();
}

/**
 * 型チェッカー
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class TypeChecker extends JavaLibraryScriptCore {
    static _CLASS_REG: RegExp;
    /**
     * Typeの否定
     * @extends {JavaLibraryScriptCore}
     * @class
     * @static
     */
    static _NotType: {
        new (typeToExclude: Function | Function[]): {
            typeToExclude: Function | Function[];
        };
    };
    /**
     * 否定型を返す
     * @param {Function | Function[]} typeToExclude
     * @returns {TypeChecker._NotType}
     */
    static NotType(typeToExclude: Function | Function[]): {
        new (typeToExclude: Function | Function[]): {
            typeToExclude: Function | Function[];
        };
    };
    /**
     * 任意の型
     * @type {Symbol}
     * @static
     * @readonly
     */
    static readonly Any: Symbol;
    /**
     * 返り値を返さない関数の型
     * @type {Symbol}
     * @static
     * @readonly
     */
    static readonly Void: Symbol;
    /**
     * 返り値を返さない関数の型
     * @type {Symbol}
     * @static
     * @readonly
     */
    static readonly NoReturn: Symbol;
    /**
     * null以外の型
     * @type {TypeChecker._NotType}
     * @static
     * @readonly
     */
    static readonly NotNull: {
        new (typeToExclude: Function | Function[]): {
            typeToExclude: Function | Function[];
        };
    };
    /**
     * undefined以外の型
     * @type {TypeChecker._NotType}
     * @static
     * @readonly
     */
    static readonly NotUndefined: {
        new (typeToExclude: Function | Function[]): {
            typeToExclude: Function | Function[];
        };
    };
    /**
     * 型チェック(一括)
     * @param {any} value
     * @param {Function} expected
     * @returns {boolean}
     * @static
     */
    static matchType(value: any, expected: Function): boolean;
    /**
     * 型チェック(個別)
     * @param {any} value
     * @param {Function} expected
     * @returns {boolean}
     * @static
     */
    static checkType(value: any, expected: Function): boolean;
    /**
     * 型を取得する
     * @param {any} value
     * @returns {Function | null}
     */
    static getType(value: any): Function | null;
    /**
     * 型名を取得
     * @param {Function} expected
     * @returns {string}
     * @static
     */
    static typeNames(expected: Function): string;
    /**
     * 値を文字列に変換
     * @param {any} value
     * @returns {string}
     * @static
     */
    static stringify(value: any): string;
    /**
     * 関数かチェック
     * @param {any} fn
     * @returns {boolean}
     * @static
     */
    static checkFunction(fn: any): boolean;
    /**
     * クラスかチェック
     * @param {any} fn
     * @returns {boolean}
     * @static
     */
    static checkClass(fn: any): boolean;
}

/**
 * プロキシマネージャー
 * @class
 */
declare class ProxyManager extends JavaLibraryScriptCore {
    /**
     * getのreturnのオーバーライド
     * @param {any} target
     * @param {any} prop
     * @param {any} receiver
     * @returns {any}
     */
    static over_get(target: any, prop: any, receiver: any): any;
}

/**
 * Index参照機能を提供する
 * @template T
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class IndexProxy<T> extends JavaLibraryScriptCore {
    /**
     * インスタンス化時に初期データを設定する
     * @template C
     * @param {C} targetInstance
     */
    static defineInitData<C>(targetInstance: C): void;
    /**
     * [Symbol.hasInstance]の処理を自動化
     * @template S, C
     * @param {new (...args: any[]) => S} targetClass - 多くの場合、this
     * @param {C} otherInstance
     */
    static hasInstance<S, C>(targetClass: new (...args: any[]) => S, otherInstance: C): any;
    /**
     * @param {new (...args: any[]) => T} targetClass
     * @param {{getMethod?: string, setMethod?: string, sizeMethod?: string, addMethod?: string, typeCheckMethod?: string | null, autoExtend?: boolean}} options
     */
    constructor(targetClass: new (...args: any[]) => T, { getMethod, setMethod, sizeMethod, addMethod, typeCheckMethod, autoExtend }?: {
        getMethod?: string;
        setMethod?: string;
        sizeMethod?: string;
        addMethod?: string;
        typeCheckMethod?: string | null;
        autoExtend?: boolean;
    });
    _TargetClass: new (...args: any[]) => T;
    _config: {
        getMethod: string;
        setMethod: string;
        sizeMethod: string;
        addMethod: string;
        typeCheckMethod: string;
        autoExtend: boolean;
    };
    _cachedMethods: {
        get: any;
        set: any;
        size: any;
        add: any;
        typeCheck: any;
    };
    /**
     * @param {...any} args
     * @returns {T}
     */
    create(...args: any[]): T;
}

/**
 * 単一のEnum要素を表すクラス
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class _EnumItem extends JavaLibraryScriptCore {
    /**
     * @param {string} name - Enumのキー名
     * @param {number} ordinal - 順序番号（自動インクリメント）
     * @param {any} value - 任意の値（name, 数値, オブジェクトなど）
     * @param {_EnumCore} [owner] - Enumのインスタンス
     * @param {{[methodName: string]: (...args: any[]) => any}} [methods] - Enumのメソッド
     */
    constructor(name: string, ordinal: number, value?: any, owner?: _EnumCore, methods?: {
        [methodName: string]: (...args: any[]) => any;
    });
    name: string;
    ordinal: number;
    value: any;
    owner: _EnumCore;
    /**
     * JSON化
     * @returns {string}
     */
    toJSON(): string;
    /**
     * ordinalでの比較
     * @param {this} other
     * @returns {number}
     */
    compareTo(other: this): number;
    /**
     * 同一EnumItemかチェック
     * @param {this} other
     * @returns {boolean}
     */
    equals(other: this): boolean;
    /**
     * ハッシュコード生成（簡易）
     * @returns {number}
     */
    hashCode(): number;
}
/**
 * Enum を生成するクラス
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class _EnumCore extends JavaLibraryScriptCore {
    /**
     * @param {Array<string | [string, any]> | Record<string, any>} defs - 定義
     * @param {{[methodName: string]: (...args: any[]) => any}} [options.methods] - Enumのメソッド
     */
    constructor(defs: Array<string | [string, any]> | Record<string, any>, options?: {});
    /** @type {_EnumItem[]} */
    _items: _EnumItem[];
    _methods: any;
    /**
     * Enumの全要素を配列で取得
     * @returns {_EnumItem[]}
     */
    values(): _EnumItem[];
    /**
     * 名前からEnumItemを取得
     * @param {string} name
     * @returns {_EnumItem | undefined}
     */
    valueOf(name: string): _EnumItem | undefined;
    /**
     * 名前からEnumItemを取得
     * @param {string} name
     * @returns {_EnumItem | undefined}
     */
    fromName: any;
    /**
     * 値からEnumItemを取得
     * @param {any} value
     * @returns {_EnumItem | undefined}
     */
    fromValue(value: any): _EnumItem | undefined;
    /**
     * ordinalからEnumItemを取得
     * @param {number} ordinal
     * @returns {_EnumItem | undefined}
     */
    fromOrdinal(ordinal: number): _EnumItem | undefined;
    /**
     * Enumにそのnameが存在するか
     * @param {string} name
     * @returns {boolean}
     */
    has(name: string): boolean;
    /**
     * name → _EnumItem の [name, item] 配列を返す
     * @returns {[string, _EnumItem][]}
     */
    entries(): [string, _EnumItem][];
    /**
     * Enumの全nameを返す
     * @returns {string[]}
     */
    keys(): string[];
    /**
     * name → value のマップを返す
     * @returns {Record<string, any>}
     */
    toMap(): Record<string, any>;
    /**
     * JSONシリアライズ用のtoJSONメソッド
     * @returns {Array<{name: string, ordinal: number, value: any}>} 列挙子の配列
     */
    toJSON(): Array<{
        name: string;
        ordinal: number;
        value: any;
    }>;
    /**
     * インデックス付きで列挙子を返すジェネレータ
     * @returns {Generator<[number, _EnumItem]>} インデックスと列挙子のペア
     */
    enumerate(): Generator<[number, _EnumItem]>;
    /**
     * for...of に対応
     */
    [Symbol.iterator](): Generator<_EnumItem, void, unknown>;
}
/**
 * DynamicEnum生成関数（インデックスアクセスに対応したProxy付き）
 * @param {Array<string | [string, any]> | Record<string, any>} defs
 * @param {{[methodName: string]: (...args: any[]) => any}} [options.methods] - Enumのメソッド
 * @returns {_EnumCore & Proxy}
 */
declare function Enum(defs: Array<string | [string, any]> | Record<string, any>, options?: {}): _EnumCore & ProxyConstructor;

/**
 * @typedef {{throw: _EnumItem, log: _EnumItem, ignore: _EnumItem}} ErrorModeItem
 */
/**
 * @typedef {Object} InterfaceTypeData
 * @property {Function[] | null} [args] - 引数の型定義
 * @property {Function | Function[] | null} [returns] - 戻り値の型定義
 * @property {boolean} [abstract=true] - 抽象クラス化
 */
/**
 * @typedef {Object.<string, InterfaceTypeData>} InterfaceTypeDataList
 */
/**
 * インターフェイス管理
 * @extends {JavaLibraryScriptCore}
 * @class
 */
declare class Interface extends JavaLibraryScriptCore {
    /**
     * デバッグモード
     * @type {boolean}
     * @static
     */
    static isDebugMode: boolean;
    /**
     * エラーモード
     * @type {ErrorModeItem}
     * @static
     * @readonly
     */
    static readonly ErrorMode: ErrorModeItem;
    /**
     * エラーモード
     * @type {ErrorModeItem}
     * @static
     */
    static _errorMode: ErrorModeItem;
    /**
     * エラーモード設定
     * @param {ErrorModeItem} mode - エラーモード
     * @static
     */
    static setErrorMode(mode: ErrorModeItem): void;
    /**
     * エラー処理
     * @param {typeof Error} error
     * @param {string} message - エラーメッセージ
     * @returns {undefined}
     * @throws {Error}
     * @static
     */
    static _handleError(error: typeof Error, message: string): undefined;
    /**
     * 型定義
     * @param {Function} TargetClass - 型定義を追加するクラス
     * @param {InterfaceTypeDataList} [newMethods] - 追加するメソッド群
     * @param {Object} [opt] - オプション
     * @param {boolean} [opt.inherit=true] - 継承モード
     * @returns {undefined}
     * @static
     */
    static applyTo(TargetClass: Function, newDefs?: {}, { inherit }?: {
        inherit?: boolean;
    }): undefined;
    /**
     * 型定義とメゾットの強制実装
     * @template T
     * @param {new (...args: any[]) => T} TargetClass - 型定義を追加するクラス
     * @param {InterfaceTypeDataList} [newMethods] - 追加するメソッド群
     * @param {Object} [opt] - オプション
     * @param {boolean} [opt.inherit=true] - 継承モード
     * @param {boolean} [opt.abstract=true] - 抽象クラス化
     * @returns {new (...args: any[]) => T}
     * @static
     */
    static convert<T>(TargetClass: new (...args: any[]) => T, newDefs?: {}, { inherit, abstract }?: {
        inherit?: boolean;
        abstract?: boolean;
    }): new (...args: any[]) => T;
    /**
     * 抽象メソッドが未実装かを個別に検査
     * @param {Object} instance
     * @returns {boolean}
     */
    static isAbstractImplemented(instance: any): boolean;
    /**
     * 型定義を取得
     * @param {Function|Object} ClassOrInstance
     * @returns {InterfaceTypeDataList}
     * @static
     */
    static getDefinition(ClassOrInstance: Function | any): InterfaceTypeDataList;
    /**
     * 型定義を文字列化
     * @param {Function|Object} ClassOrInstance
     * @returns {string}
     * @static
     */
    static describe(ClassOrInstance: Function | any): string;
    /**
     * メソッド名を取得
     * @param {Function|Object} ClassOrInstance
     * @param {Object} [opt]
     * @param {boolean} [opt.abstractOnly=false]
     * @returns {string[]}
     * @static
     */
    static getMethodNames(ClassOrInstance: Function | any, { abstractOnly }?: {
        abstractOnly?: boolean;
    }): string[];
    /**
     * メソッド定義を取得
     * @param {Function|Object} classOrInstance
     * @param {string} methodName
     * @returns {InterfaceTypeData | null}
     * @static
     */
    static getExpectedSignature(classOrInstance: Function | any, methodName: string): InterfaceTypeData | null;
    /**
     * 型定義を結合
     * @param {...InterfaceTypeDataList} defs
     * @returns {InterfaceTypeDataList}
     * @static
     */
    static merge(...defs: InterfaceTypeDataList[]): InterfaceTypeDataList;
}
declare namespace Interface {
    export type { ErrorModeItem, InterfaceTypeData, InterfaceTypeDataList };
}

type ErrorModeItem = {
    throw: _EnumItem;
    log: _EnumItem;
    ignore: _EnumItem;
};
type InterfaceTypeData = {
    /**
     * - 引数の型定義
     */
    args?: Function[] | null;
    /**
     * - 戻り値の型定義
     */
    returns?: Function | Function[] | null;
    /**
     * - 抽象クラス化
     */
    abstract?: boolean;
};
type InterfaceTypeDataList = {
    [x: string]: InterfaceTypeData;
};

declare const base: {
    Interface: typeof Interface;
    _EnumItem: typeof _EnumItem;
    _EnumCore: typeof _EnumCore;
    Enum: typeof Enum;
};
declare const libs: {
    IndexProxy: typeof IndexProxy;
    ProxyManager: typeof ProxyManager;
    TypeChecker: typeof TypeChecker;
    cache: {
        CacheMapInterface: typeof CacheMapInterface;
        LRUCache: typeof LRUCache;
        FIFOCache: typeof FIFOCache;
        LFUCache: typeof LFUCache;
        CacheWrapper: typeof CacheWrapper;
    };
    sys: {
        symbol: {
            LIBRARY_NAME: string;
            JavaLibraryScript: symbol;
            instanceofTarget: symbol;
            LoggerWrapped: symbol;
            TypeAny: symbol;
            TypeVoid: symbol;
        };
        Logger: typeof Logger;
        logging: Logger;
        JavaLibraryScriptCore: typeof JavaLibraryScriptCore;
    };
};
declare const math: {
    BigFloatConfig: typeof BigFloatConfig;
    BigFloat: typeof BigFloat;
    bigFloat: typeof bigFloat;
};
declare const util: {
    HashMap: typeof HashMap;
    HashSet: typeof HashSet;
    ListInterface: typeof ListInterface;
    MapInterface: typeof MapInterface;
    SetInterface: typeof SetInterface;
    stream: {
        AsyncStream: typeof AsyncStream;
        BigFloatStream: typeof BigFloatStream;
        EntryStream: typeof EntryStream;
        NumberStream: typeof NumberStream;
        Stream: typeof Stream;
        StreamChecker: typeof StreamChecker;
        StreamInterface: typeof StreamInterface;
        StringStream: typeof StringStream;
    };
    ArrayList: typeof ArrayList;
    arrayList: typeof arrayList;
};

declare const JavaLibraryScript_base: typeof base;
declare const JavaLibraryScript_libs: typeof libs;
declare const JavaLibraryScript_math: typeof math;
declare const JavaLibraryScript_util: typeof util;
declare namespace JavaLibraryScript {
  export {
    JavaLibraryScript_base as base,
    JavaLibraryScript_libs as libs,
    JavaLibraryScript_math as math,
    JavaLibraryScript_util as util,
  };
}

export { JavaLibraryScript as default };
