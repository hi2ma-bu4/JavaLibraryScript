# クラス一覧

## base\Enum.js

### _EnumItem

```ts
class _EnumItem(name: string, ordinal: number, value: any): _EnumItem
```

単一のEnum要素を表すクラス

### _EnumCore

```ts
class _EnumCore(defs: Array<string | [string, any]> | Record<string, any>): _EnumCore
```

Enum を生成するクラス

## base\Interface.js

### Interface

```ts
class Interface(): Interface
```

インターフェイス管理

## libs\IndexProxy.js

### IndexProxy

```ts
class IndexProxy<T>(targetClass: new (...args: any[]) => T): IndexProxy<T>
```

Index参照機能を提供する

## libs\sys\JavaLibraryScriptCore.js

### JavaLibraryScriptCore

```ts
class JavaLibraryScriptCore(): JavaLibraryScriptCore
```

JavaLibraryScriptの共通継承元

## libs\TypeChecker.js

### TypeChecker

```ts
class TypeChecker(typeToExclude: Function | Function[]): TypeChecker
```

型チェッカー

## util\ArrayList.js

### ArrayList

```ts
class ArrayList<V>(ValueType: Function): ArrayList<V>
```

型チェック機能のついたList

## util\HashMap.js

### HashMap

```ts
class HashMap<K>(KeyType: Function, ValueType: Function): HashMap<K>
```

型チェック機能のついたMap

## util\HashSet.js

### HashSet

```ts
class HashSet<V>(ValueType: Function): HashSet<V>
```

型チェック機能のついたSet

## util\ListInterface.js

### ListInterface

```ts
class ListInterface<V>(ValueType: Function): ListInterface<V>
```

Listの基底クラス

## util\MapInterface.js

### MapInterface

```ts
class MapInterface<K>(KeyType: Function, ValueType: Function): MapInterface<K>
```

Mapの基底クラス

## util\SetInterface.js

### SetInterface

```ts
class SetInterface<V>(ValueType: Function): SetInterface<V>
```

Setの基底クラス

## util\stream\AsyncStream.js

### AsyncStream

```ts
class AsyncStream(source: Iterable | AsyncIterator): AsyncStream
```

非同期Stream (LazyAsyncList)

## util\stream\EntryStream.js

### EntryStream

```ts
class EntryStream<K>(source: Iterable, KeyType: Function, ValueType: Function): EntryStream<K>
```

Entry専用Stream (LazyList)

## util\stream\NumberStream.js

### NumberStream

```ts
class NumberStream<V>(source: Iterable<V): NumberStream<V>
```

数値専用Stream (LazyList)

## util\stream\Stream.js

### Stream

```ts
class Stream<V>(source: Iterable<V>, ValueType: Function): Stream<V>
```

Streamオブジェクト(LazyList)

## util\stream\StreamChecker.js

### StreamChecker

```ts
class StreamChecker(): StreamChecker
```

Streamの型チェック

## util\stream\StreamInterface.js

### StreamInterface

```ts
class StreamInterface(): StreamInterface
```

Streamの基底クラス

## util\stream\StringStream.js

### StringStream

```ts
class StringStream<V>(source: Iterable<V>): StringStream<V>
```

文字列専用Stream (LazyList)

