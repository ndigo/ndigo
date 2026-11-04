[**@ndigo/factory v0.0.1**](../README.md)

***

[@ndigo/factory](../README.md) / HashScope

# Class: HashScope

**`Internal`**

Hash (route) scope implementation — one instance per scope key.
Activate a scope context by calling `setCurrentKey(key)` before `getValue()`.

Values are cached per key, so a route-scoped bean lives as long as its
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

#### Parameters

##### name

`string`

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

#### Returns

`void`

***

### getCurrentKey()

> **getCurrentKey**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### getValue()

> **getValue**\<`T`\>(`name`, `objectFactory`): `T`

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### name

`string`

##### objectFactory

[`ObjectFactory`](../type-aliases/ObjectFactory.md)\<`T`\>

#### Returns

`T`

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

##### callback

() => `void`

#### Returns

`void`

***

### setCurrentKey()

> **setCurrentKey**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`
