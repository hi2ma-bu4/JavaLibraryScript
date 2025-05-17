/**
 * JavaLibraryScriptの共通継承元
 * @class
 */
declare class JavaLibraryScriptCore {
}
declare namespace JavaLibraryScriptCore {
    export { __index };
    export type { LIBRARY_ID_TYPE };
}
type LIBRARY_ID_TYPE = symbol;

declare namespace __libs_sys_JavaLibraryScriptCore_js {
  export {
    JavaLibraryScriptCore as default,
  };
}

/**
 * Streamの基底クラス
 * @class
 */
declare class StreamInterface extends JavaLibraryScriptCore {
}

declare namespace __util_stream_StreamInterface_js {
  export {
    StreamInterface as default,
  };
}

/**
 * Streamオブジェクト(LazyList)
 * @class
 */
declare class Stream extends StreamInterface {
    /**
     * Stream化
     * @param {Iterable} iterable
     * @returns {Stream}
     * @static
     */
    static from(iterable: Iterable<any>): Stream;
    /**
     * @param {Iterable} source
     */
    constructor(source: Iterable<any>);
    _iter: Iterator<any, any, any>;
    _pipeline: any[];
    /**
     * pipelineに追加
     * @param {Generator} fn
     * @returns {Stream}
     */
    _use(fn: Generator): Stream;
    /**
     * 他Streamに変換
     * @param {Function} construct
     * @param {Generator} fn
     * @param {...any} args
     * @returns {Stream}
     */
    _convertToX(construct: Function, fn: Generator, ...args: any[]): Stream;
    /**
     * pipelineを圧縮
     * @returns {Stream}
     */
    flattenPipeline(): Stream;
    /**
     * 処理を一括関数化
     * @returns {Function}
     */
    toFunction(): Function;
    /**
     * Streamをマップ
     * @param {Function} fn
     * @returns {Stream}
     */
    map(fn: Function): Stream;
    /**
     * Streamをフィルタ
     * @param {Function} fn
     * @returns {Stream}
     */
    filter(fn: Function): Stream;
    /**
     * Streamを展開
     * @param {Function} fn
     * @returns {Stream}
     */
    flatMap(fn: Function): Stream;
    /**
     * Streamの重複を排除
     * @param {Function} keyFn
     * @returns {Stream}
     */
    distinct(keyFn?: Function): Stream;
    /**
     * Streamをソート
     * @param {Function} compareFn
     * @returns {Stream}
     */
    sorted(compareFn?: Function): Stream;
    /**
     * Streamの要素は変更せずに関数のみを実行
     * @param {Function} fn
     * @returns {Stream}
     */
    peek(fn: Function): Stream;
    /**
     * Streamの要素数を先頭から制限
     * @param {Number} n
     * @returns {Stream}
     */
    limit(n: number): Stream;
    /**
     * Streamの要素数を先頭からスキップ
     * @param {Number} n
     * @returns {Stream}
     */
    skip(n: number): Stream;
    /**
     * Streamを分割
     * @param {Number} size
     * @returns {Stream}
     */
    chunk(size: number): Stream;
    /**
     * Streamをスライド分割
     * @param {Number} size
     * @param {Number} step
     * @returns {Stream}
     */
    windowed(size: number, step?: number): Stream;
    /**
     * StreamをforEach
     * @param {Function} fn
     */
    forEach(fn: Function): void;
    /**
     * Streamを配列化
     * @returns {Array}
     */
    toArray(): any[];
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
     * @returns {NumberStream}
     */
    mapToNumber(fn: Function): any;
    /**
     * StreamをStringStreamに変換
     * @param {Function} fn
     * @returns {StringStream}
     */
    mapToString(fn: Function): any;
    /**
     * StreamをEntryStreamに変換
     * @param {Function} fn
     * @returns {EntryStream}
     */
    mapToEntry(fn: Function): any;
    /**
     * StreamをAsyncStreamに変換
     * @param {Function} fn
     * @returns {AsyncStream}
     */
    mapToAsync(fn: Function): any;
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

declare namespace __util_stream_Stream_js {
  export {
    Stream as default,
  };
}

/**
 * 文字列専用Stream (LazyList)
 * @class
 */
declare class StringStream extends Stream {
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

declare namespace __util_stream_StringStream_js {
  export {
    StringStream as default,
  };
}

/**
 * Streamの型チェック
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

declare namespace __util_stream_StreamChecker_js {
  export {
    StreamChecker as default,
  };
}

/**
 * 数値専用Stream (LazyList)
 * @class
 */
declare class NumberStream extends Stream {
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

declare namespace __util_stream_NumberStream_js {
  export {
    NumberStream as default,
  };
}

/**
 * Entry専用Stream (LazyList)
 * @class
 */
declare class EntryStream extends Stream {
    /**
     * @param {Iterable} source
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(source: Iterable<any>, KeyType: Function, ValueType: Function);
    mapToEntry: any;
    _KeyType: Function;
    _ValueType: Function;
    /**
     * EntryStreamからキーのStreamを返却
     * @returns {Stream}
     */
    keys(): Stream;
    /**
     * EntryStreamから値のStreamを返却
     * @returns {Stream}
     */
    values(): Stream;
    mapKeys(fn: any): Stream;
    mapValues(fn: any): Stream;
    toHashMap(KeyType: any, ValueType: any): any;
}

declare namespace __util_stream_EntryStream_js {
  export {
    EntryStream as default,
  };
}

/**
 * 非同期Stream (LazyAsyncList)
 * @class
 */
declare class AsyncStream extends StreamInterface {
    /**
     * AsyncStream化
     * @param {Iterable | AsyncIterator} iterable
     * @returns {AsyncStream}
     * @static
     */
    static from(iterable: Iterable<any> | AsyncIterator<any, any, any>): AsyncStream;
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
     * @returns {AsyncStream}
     */
    _use(fn: Generator): AsyncStream;
    /**
     * pipelineを圧縮
     * @returns {AsyncStream}
     */
    flattenPipeline(): AsyncStream;
    /**
     * 処理を一括関数化
     * @returns {Function}
     */
    toFunction(): Function;
    /**
     * AsyncStreamをマップ
     * @param {Function | Promise} fn
     * @returns {AsyncStream}
     */
    map(fn: Function | Promise<any>): AsyncStream;
    /**
     * AsyncStreamをフィルタ
     * @param {Function | Promise} fn
     * @returns {AsyncStream}
     */
    filter(fn: Function | Promise<any>): AsyncStream;
    /**
     * AsyncStreamを展開
     * @param {Function | Promise} fn
     * @returns {AsyncStream}
     */
    flatMap(fn: Function | Promise<any>): AsyncStream;
    /**
     * AsyncStreamの重複を排除
     * @param {Function | Promise} keyFn
     * @returns {AsyncStream}
     */
    distinct(keyFn?: Function | Promise<any>): AsyncStream;
    /**
     * AsyncStreamの要素は変更せずに関数のみを実行
     * @param {Function} fn
     * @returns {AsyncStream}
     */
    peek(fn: Function): AsyncStream;
    /**
     * AsyncStreamの要素数を先頭から制限
     * @param {Number} n
     * @returns {AsyncStream}
     */
    limit(n: number): AsyncStream;
    /**
     * AsyncStreamの要素数を先頭からスキップ
     * @param {Number} n
     * @returns {AsyncStream}
     */
    skip(n: number): AsyncStream;
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
    toLazy(): Stream;
    /**
     * Streamをイテレータ化(非同期)
     * @returns {AsyncIterator}
     */
    [Symbol.asyncIterator](): AsyncIterator<any, any, any>;
}

declare namespace __util_stream_AsyncStream_js {
  export {
    AsyncStream as default,
  };
}

/**
 * Mapの基底クラス
 * @class
 */
declare class BaseMap extends Map<any, any> {
    /**
     * @param {Function} KeyType
     * @param {Function} ValueType
     */
    constructor(KeyType: Function, ValueType: Function);
    _KeyType: Function;
    _ValueType: Function;
    /**
     * Keyの型をチェックする
     * @param {any} key
     * @throws {TypeError}
     */
    _checkKey(key: any): void;
    /**
     * Valueの型をチェックする
     * @param {any} value
     * @throws {TypeError}
     */
    _checkValue(value: any): void;
}

declare namespace __util_BaseMap_js {
  export {
    BaseMap as default,
  };
}

/**
 * 型チェック機能のついたMap
 * @class
 */
declare class HashMap extends BaseMap {
    /**
     * データを追加・更新する
     * @param {any} key
     * @param {any} value
     * @returns {any}
     * @throws {TypeError}
     * @override
     */
    override set(key: any, value: any): any;
    /**
     * データを追加・更新する
     * @param {any} key
     * @param {any} value
     * @returns {any}
     * @throws {TypeError}
     */
    put(key: any, value: any): any;
    /**
     * データを一括で追加・更新する
     * @param {Map<any, any>} map
     * @throws {TypeError}
     */
    setAll(map: Map<any, any>): void;
    /**
     * データを一括で追加・更新する
     * @param {Map<any, any>} map
     * @throws {TypeError}
     */
    putAll(map: Map<any, any>): void;
    /**
     * Keyの存在を確認する
     * @param {any} key
     * @returns {boolean}
     * @throws {TypeError}
     */
    containsKey(key: any): boolean;
    /**
     * Valueの存在を確認する
     * @param {any} value
     * @returns {boolean}
     */
    containsValue(value: any): boolean;
    /**
     * データを削除する
     * @param {any} key
     * @returns {boolean}
     * @throws {TypeError}
     */
    remove(key: any): boolean;
    /**
     * EntrySetを返却する
     * @returns {MapIterator<any, any>}
     */
    entrySet(): MapIterator<any, any>;
    /**
     * 空かどうかを返却する
     * @returns {boolean}
     */
    isEmpty(): boolean;
    /**
     * 等価判定を行う
     * @param {HashMap} otherMap
     * @returns {boolean}
     */
    equals(otherMap: HashMap): boolean;
    /**
     * 全てのデータを呼び出す
     * @param {Function} callback
     * @param {any} thisArg
     */
    forEach(callback: Function, thisArg: any): void;
    /**
     * Streamを返却する
     * @returns {EntryStream}
     */
    stream(): EntryStream;
    /**
     * イテレータを返却する
     * @returns {Iterator<any>}
     */
    [Symbol.iterator](): Iterator<any>;
}

declare namespace __util_HashMap_js {
  export {
    HashMap as default,
  };
}

/**
 * 型チェッカー
 * @class
 */
declare class TypeChecker extends JavaLibraryScriptCore {
    static _CLASS_REG: RegExp;
    /**
     * Typeの否定
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

declare namespace __libs_TypeChecker_js {
  export {
    TypeChecker as default,
  };
}

/**
 * 単一のEnum要素を表すクラス
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
     * @param {_EnumItem} other
     * @returns {number}
     */
    compareTo(other: _EnumItem): number;
    /**
     * 同一EnumItemかチェック
     * @param {_EnumItem} other
     * @returns {boolean}
     */
    equals(other: _EnumItem): boolean;
    /**
     * ハッシュコード生成（簡易）
     * @returns {number}
     */
    hashCode(): number;
}
/**
 * Enum を生成するクラス
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
 * インターフェイス管理
 * @class
 */
declare class Interface extends JavaLibraryScriptCore {
    static _isDebugMode: boolean;
    /**
     * 型定義とメゾットの強制実装
     * @param {Function} TargetClass - 型定義を追加するクラス
     * @param {{[String]: {"args": Function[], "returns": Function[]}}} [newMethods] - 追加するメソッド群
     * @param {Object} [opt] - オプション
     * @param {boolean} [opt.inherit=true] - 継承モード
     * @returns {undefined}
     * @static
     */
    static applyTo(TargetClass: Function, newDefs?: {}, { inherit }?: {
        inherit?: boolean;
    }): undefined;
}

declare namespace __base_Interface_js {
  export {
    Interface as default,
  };
}

declare let base: {
    Interface: typeof __base_Interface_js;
    _EnumItem: typeof _EnumItem;
    _EnumCore: typeof _EnumCore;
    Enum: typeof Enum;
};
declare let libs: {
    TypeChecker: typeof __libs_TypeChecker_js;
    sys: {
        JavaLibraryScriptCore: typeof __libs_sys_JavaLibraryScriptCore_js;
    };
};
declare let util: {
    BaseMap: typeof __util_BaseMap_js;
    HashMap: typeof __util_HashMap_js;
    stream: {
        AsyncStream: typeof __util_stream_AsyncStream_js;
        EntryStream: typeof __util_stream_EntryStream_js;
        NumberStream: typeof __util_stream_NumberStream_js;
        Stream: typeof __util_stream_Stream_js;
        StreamChecker: typeof __util_stream_StreamChecker_js;
        StreamInterface: typeof __util_stream_StreamInterface_js;
        StringStream: typeof __util_stream_StringStream_js;
    };
};

declare const lib_base: typeof base;
declare const lib_libs: typeof libs;
declare const lib_util: typeof util;
declare namespace lib {
  export {
    lib_base as base,
    lib_libs as libs,
    lib_util as util,
  };
}

export { lib as default };
