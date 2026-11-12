[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [scope](../README.md) / HashScope

# Class: HashScope

**`Internal`**

Hash (route) scope implementation — one instance per scope key.
Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.

Values are cached per key, so a route-scoped entry lives as long as its
bucket: `destroyValue(name)` tears one down within the active key, and
`endScope(key)` tears down the whole bucket. Lifecycle-bearing values
(`@destroyable`/`@closeable`) register a destruction callback (see
`registerDestructionCallback`, wired by the container) which runs before the
value is discarded — mirroring `SingletonScope.destroyValue` and
`RefreshScope.clear`.

 AD-06: Implementation detail — see [PrototypeScope](PrototypeScope.md) for rationale.

## Implements

- [`Scope`](../interfaces/Scope.md)

## Constructors

### Constructor

> **new HashScope**(): `HashScope`

#### Returns

`HashScope`

## Methods

### destroyValue()

> **destroyValue**(`name`): `void`

Destroys a value in the active hash-scope bucket.

#### Parameters

##### name

`string`

The value name.

#### Returns

`void`

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`destroyValue`](../interfaces/Scope.md#destroyvalue)

***

### endScope()

> **endScope**(`key`): `void`

Ends the scope identified by `key`: runs every registered destruction
callback, then discards the key's bucket. Callbacks are best effort —
a throwing callback is logged and never aborts the sweep, so no stale
bucket survives `endScope`.

#### Parameters

##### key

`string`

The scope key to end.

#### Returns

`void`

***

### getCurrentKey()

> **getCurrentKey**(): `string` \| `null`

The active hash-scope key.

#### Returns

`string` \| `null`

The current key, or `null`.

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

Resolves a value in the active hash-scope bucket.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

The value name.

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

The lazy factory invoked on a miss.

#### Returns

`T`

The cached or newly created value.

#### Implementation of

[`Scope`](../interfaces/Scope.md).[`getValue`](../interfaces/Scope.md#getvalue)

***

### registerDestructionCallback()

> **registerDestructionCallback**(`name`, `callback`): `void`

Registers a destruction callback for `name` within the active key's
bucket; `destroyValue`/`endScope` run it before discarding the value.

#### Parameters

##### name

`string`

The value name.

##### callback

() => `void`

The teardown callback.

#### Returns

`void`

***

### setCurrentKey()

> **setCurrentKey**(`key`): `void`

Activates a hash-scope key.

#### Parameters

##### key

`string`

The scope key.

#### Returns

`void`
