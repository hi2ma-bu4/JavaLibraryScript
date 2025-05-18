/**
 * 型チェック機能のついたSet
 * @template V
 * @extends {SetInterface<V>}
 * @class
 */
declare class HashSet<V> {
    /**
     * @param {Function} ValueType
     */
    constructor(ValueType: Function);
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
    has(value: V): boolean;
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
    delete(value: V): boolean;
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
     * 文字列に変換する
     * @returns {string}
     */
    toString(): string;
    /**
     * イテレータを返却する
     * @returns {Iterator<V>}
     */
    [Symbol.iterator](): Iterator<V>;
}

declare const AsyncStream_base: new (...args: any[]) => {};
/**
 * 非同期Stream (LazyAsyncList)
 * @extends {StreamInterface}
 * @class
 */
declare class AsyncStream extends AsyncStream_base {
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
 * 型チェック機能のついたMap
 * @template K, V
 * @extends {MapInterface<K, V>}
 * @class
 */
declare class HashMap<K, V> {
    /**
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(KeyType: Function, ValueType: Function);
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
     * データを取得する
     * @param {K} key
     * @returns {V}
     * @throws {TypeError}
     */
    get(key: K): V;
    /**
     * Keyの存在を確認する
     * @param {K} key
     * @returns {boolean}
     * @throws {TypeError}
     */
    has(key: K): boolean;
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
    delete(key: K): boolean;
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
     * 文字列に変換する
     * @returns {string}
     */
    toString(): string;
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
     * @param {Iterable} source
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(source: Iterable<any>, KeyType: Function, ValueType: Function);
    mapToEntry: any;
    _KeyType: Function | Symbol;
    /**
     * EntryStreamからキーのStreamを返却
     * @returns {Stream}
     */
    keys(): Stream<any>;
    /**
     * EntryStreamから値のStreamを返却
     * @returns {Stream}
     */
    values(): Stream<any>;
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
 * 数値専用Stream (LazyList)
 * @template V
 * @extends {Stream<V>}
 * @class
 */
declare class NumberStream<V> extends Stream<V> {
    /**
     * @param {Iterable<V} source
     */
    constructor(source: Iterable<V>);
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

declare const Stream_base: new (...args: any[]) => {};
/**
 * Streamオブジェクト(LazyList)
 * @template V
 * @extends {StreamInterface}
 * @class
 */
declare class Stream<V> extends Stream_base {
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
    export type { NumberStreamType, EntryStreamType, AsyncStreamType, HashSetType };
}
type NumberStreamType = NumberStream<any>;
type EntryStreamType = EntryStream<any, any>;
type AsyncStreamType = AsyncStream;
type HashSetType = HashSet<any>;

/**
 * 文字列専用Stream (LazyList)
 * @template V
 * @extends {Stream<V>}
 * @class
 */
declare class StringStream<V> extends Stream<V> {
    /**
     * @param {Iterable<V>} source
     */
    constructor(source: Iterable<V>);
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
 * JavaLibraryScriptの共通継承元
 * @class
 */
declare class JavaLibraryScriptCore {
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
    static typeToStream(expected: Function): new (...args: any[]) => {};
    /**
     * StreamをTypeに変換する
     * @param {StreamInterface} stream
     * @returns {Function}
     * @static
     */
    static streamToType(stream: new (...args: any[]) => {}): Function;
}

/**
 * 型チェック機能のついたList
 * @template V
 * @extends {ListInterface<V>}
 * @class
 */
declare class ArrayList<V> {
    /**
     * @param {Function} ValueType
     */
    constructor(ValueType: Function);
    _list: any[];
    /**
     * 要素を追加する
     * @param {V} item
     * @returns {this}
     * @throws {TypeError}
     */
    add(item: V): this;
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
     * 文字列に変換する
     * @returns {string}
     */
    toString(): string;
    /**
     * イテレータを返却する
     * @returns {Iterator<V>}
     */
    [Symbol.iterator](): Iterator<V>;
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
    static _isDebugMode: boolean;
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
     * @static
     */
    static _handleError(error: typeof Error, message: string): void;
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

declare let base: {
    Interface: typeof Interface;
    _EnumItem: typeof _EnumItem;
    _EnumCore: typeof _EnumCore;
    Enum: typeof Enum;
};
declare let libs: {
    TypeChecker: typeof TypeChecker;
    sys: {
        JavaLibraryScriptCore: typeof JavaLibraryScriptCore;
    };
};
declare let util: {
    ArrayList: typeof ArrayList;
    HashMap: typeof HashMap;
    HashSet: typeof HashSet;
    ListInterface: new (...args: any[]) => {
        _ValueType: Function | Symbol;
        _checkValue(value: unknown): void;
        isEmpty(): boolean;
    };
    MapInterface: new (...args: any[]) => {
        _KeyType: Function | Symbol;
        _ValueType: Function | Symbol;
        _checkKey(key: unknown): void;
        _checkValue(value: unknown): void;
        isEmpty(): boolean;
        clear(): void;
        delete(key: unknown): boolean;
        forEach(callbackfn: (value: unknown, key: unknown, map: Map<unknown, unknown>) => void, thisArg?: any): void;
        get(key: unknown): unknown;
        has(key: unknown): boolean;
        set(key: unknown, value: unknown): /*elided*/ any;
        readonly size: number;
        entries(): MapIterator<[unknown, unknown]>;
        keys(): MapIterator<unknown>;
        values(): MapIterator<unknown>;
        [Symbol.iterator](): MapIterator<[unknown, unknown]>;
        readonly [Symbol.toStringTag]: string;
    };
    SetInterface: new (...args: any[]) => {
        _ValueType: Function | Symbol;
        _checkValue(value: unknown): void;
        isEmpty(): boolean;
        add(value: unknown): /*elided*/ any;
        clear(): void;
        delete(value: unknown): boolean;
        forEach(callbackfn: (value: unknown, value2: unknown, set: Set<unknown>) => void, thisArg?: any): void;
        has(value: unknown): boolean;
        readonly size: number;
        entries(): SetIterator<[unknown, unknown]>;
        keys(): SetIterator<unknown>;
        values(): SetIterator<unknown>;
        [Symbol.iterator](): SetIterator<unknown>;
        readonly [Symbol.toStringTag]: string;
    };
    stream: {
        AsyncStream: typeof AsyncStream;
        EntryStream: typeof EntryStream;
        NumberStream: typeof NumberStream;
        Stream: typeof Stream;
        StreamChecker: typeof StreamChecker;
        StreamInterface: new (...args: any[]) => {};
        StringStream: typeof StringStream;
    };
};

declare const JavaLibraryScript_base: typeof base;
declare const JavaLibraryScript_libs: typeof libs;
declare const JavaLibraryScript_util: typeof util;
declare namespace JavaLibraryScript {
  export {
    JavaLibraryScript_base as base,
    JavaLibraryScript_libs as libs,
    JavaLibraryScript_util as util,
  };
}

export { JavaLibraryScript as default };
