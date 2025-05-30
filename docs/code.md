# クラス一覧

## base\Enum.js

### _EnumItem (JavaLibraryScript.base._EnumItem)

```ts
class _EnumItem(name: string, ordinal: number, value: any, owner: _EnumCore, methods: {[methodName: string]: (...args: any[]) => any}): _EnumItem
```

単一のEnum要素を表すクラス

### _EnumCore (JavaLibraryScript.base._EnumCore)

```ts
class _EnumCore(defs: Array<string | [string, any]> | Record<string, any>): _EnumCore
```

Enum を生成するクラス

### Enum (JavaLibraryScript.base.Enum)

```ts
function Enum(defs: Array<string | [string, any]> | Record<string, any>): _EnumCore & Proxy
```

DynamicEnum生成関数（インデックスアクセスに対応したProxy付き）

## base\Interface.js

### Interface (JavaLibraryScript.base.Interface)

```ts
class Interface(): Interface
```

インターフェイス管理

## libs\IndexProxy.js

### IndexProxy (JavaLibraryScript.libs.IndexProxy)

```ts
class IndexProxy<T>(targetClass: new (...args: any[]) => T, options: {getMethod?: string, setMethod?: string, sizeMethod?: string, addMethod?: string, typeCheckMethod?: string | null, autoExtend?: boolean}): IndexProxy<T>
```

Index参照機能を提供する

## libs\ProxyManager.js

### ProxyManager (JavaLibraryScript.libs.ProxyManager)

```ts
class ProxyManager(): ProxyManager
```

プロキシマネージャー

## libs\TypeChecker.js

### TypeChecker (JavaLibraryScript.libs.TypeChecker)

```ts
class TypeChecker(typeToExclude: Function | Function[]): TypeChecker
```

型チェッカー

## libs\cache\CacheWrapper.js

### CacheMapInterface (JavaLibraryScript.libs.cache.CacheMapInterface)

```ts
class CacheMapInterface(limit: number): CacheMapInterface
```

キャッシュ用のマップ

### FIFOCache (JavaLibraryScript.libs.cache.FIFOCache)

```ts
class FIFOCache(limit: number): FIFOCache
```

FIFOキャッシュ

### LFUCache (JavaLibraryScript.libs.cache.LFUCache)

```ts
class LFUCache(limit: number): LFUCache
```

LFUキャッシュ

### LRUCache (JavaLibraryScript.libs.cache.LRUCache)

```ts
class LRUCache(limit: number): LRUCache
```

LRUキャッシュ

### CacheWrapper (JavaLibraryScript.libs.cache.CacheWrapper)

```ts
class CacheWrapper<T>(): CacheWrapper<T>
```

クラスのstaticメゾットをキャッシュするクラス

## libs\sys\JavaLibraryScriptCore.js

### JavaLibraryScriptCore (JavaLibraryScript.libs.sys.JavaLibraryScriptCore)

```ts
class JavaLibraryScriptCore(): JavaLibraryScriptCore
```

JavaLibraryScriptの共通継承元

## libs\sys\Logger.js

### Logger (JavaLibraryScript.libs.sys.Logger)

```ts
class Logger(prefix: String, visibleLevel: number): Logger
```

ログ出力管理クラス

## math\BigFloat.js

### BigFloatConfig (JavaLibraryScript.math.BigFloatConfig)

```ts
class BigFloatConfig(options: Object | BigFloatConfig): BigFloatConfig
```

BigFloat の設定

### BigFloat (JavaLibraryScript.math.BigFloat)

```ts
class BigFloat(value: string | number | BigInt | BigFloat, precision: number): BigFloat
```

大きな浮動小数点数を扱えるクラス

### bigFloat (JavaLibraryScript.math.bigFloat)

```ts
function bigFloat(value: string | number | BigInt | BigFloat, precision: number): BigFloat
```

BigFloat を作成する

## util\ArrayList.js

### ArrayList (JavaLibraryScript.util.ArrayList)

```ts
class ArrayList<V>(ValueType: Function, collection: Iterable<V>): ArrayList<V>
```

型チェック機能のついたList

### arrayList (JavaLibraryScript.util.arrayList)

```ts
function arrayList(ValueType: Function, collection: Iterable<V>): ArrayList<V>
```

配列を返却する

## util\HashMap.js

### HashMap (JavaLibraryScript.util.HashMap)

```ts
class HashMap<K, V>(KeyType: Function, ValueType: Function): HashMap<K, V>
```

型チェック機能のついたMap

## util\HashSet.js

### HashSet (JavaLibraryScript.util.HashSet)

```ts
class HashSet<V>(ValueType: Function): HashSet<V>
```

型チェック機能のついたSet

## util\ListInterface.js

### ListInterface (JavaLibraryScript.util.ListInterface)

```ts
class ListInterface<V>(ValueType: Function): ListInterface<V>
```

Listの基底クラス

## util\MapInterface.js

### MapInterface (JavaLibraryScript.util.MapInterface)

```ts
class MapInterface<K, V>(KeyType: Function, ValueType: Function): MapInterface<K, V>
```

Mapの基底クラス

## util\SetInterface.js

### SetInterface (JavaLibraryScript.util.SetInterface)

```ts
class SetInterface<V>(ValueType: Function): SetInterface<V>
```

Setの基底クラス

## util\stream\AsyncStream.js

### AsyncStream (JavaLibraryScript.util.stream.AsyncStream)

```ts
class AsyncStream(source: Iterable | AsyncIterator): AsyncStream
```

非同期Stream (LazyAsyncList)

## util\stream\BigFloatStream.js

### BigFloatStream (JavaLibraryScript.util.stream.BigFloatStream)

```ts
class BigFloatStream(source: Iterable<BigFloat>): BigFloatStream
```

BigFloat専用Stream (LazyList)

## util\stream\EntryStream.js

### EntryStream (JavaLibraryScript.util.stream.EntryStream)

```ts
class EntryStream<K, V>(source: Iterable<[K, V]>, KeyType: Function, ValueType: Function): EntryStream<K, V>
```

Entry専用Stream (LazyList)

## util\stream\NumberStream.js

### NumberStream (JavaLibraryScript.util.stream.NumberStream)

```ts
class NumberStream(source: Iterable<Number>): NumberStream
```

数値専用Stream (LazyList)

## util\stream\Stream.js

### Stream (JavaLibraryScript.util.stream.Stream)

```ts
class Stream<V>(source: Iterable<V>, ValueType: Function): Stream<V>
```

Streamオブジェクト(LazyList)

## util\stream\StreamChecker.js

### StreamChecker (JavaLibraryScript.util.stream.StreamChecker)

```ts
class StreamChecker(): StreamChecker
```

Streamの型チェック

## util\stream\StreamInterface.js

### StreamInterface (JavaLibraryScript.util.stream.StreamInterface)

```ts
class StreamInterface(): StreamInterface
```

Streamの基底クラス

## util\stream\StringStream.js

### StringStream (JavaLibraryScript.util.stream.StringStream)

```ts
class StringStream(source: Iterable<String>): StringStream
```

文字列専用Stream (LazyList)

