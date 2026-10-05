[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / RefreshScope

# Class: RefreshScope

**`Internal`**

Refresh scope implementation — one cached instance per named value, like
[SingletonScope](#), but the whole cache is cleared when the owning
context's environment refreshes (`config:refresh` event, AD-29 D-2): the
next `getValue` re-creates the instance from its factory.

Destruction callbacks are registered by the container for lifecycle-bearing
values; `clear()` runs them before discarding so `@destroyable`/`@closeable`
values tear down properly (mirrors `SingletonScope.destroyValue`).

 AD-06: Implementation detail — see [PrototypeScope](#) for rationale.

## Implements

- `Scope`

## Constructors

### Constructor

> **new RefreshScope**(): `RefreshScope`

#### Returns

`RefreshScope`

## Methods

### clear()

> **clear**(): `void`

Clears every cached instance, running registered destruction callbacks
(lifecycle teardown), so the next `getValue` recreates fresh.

The instance map is cleared FIRST so a throwing destruction callback
can never leave a stale instance cached — `clear()` is the refresh
teardown edge (ARC-1) and must always complete. Callbacks are best
effort: each failure is reported via `console.error` and never
aborts the sweep.

#### Returns

`void`

***

### destroyValue()

> **destroyValue**(`name`): `void`

#### Parameters

##### name

`string`

#### Returns

`void`

#### Implementation of

`Scope.destroyValue`

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

`ObjectFactory`\<`T`\>

#### Returns

`T`

#### Implementation of

`Scope.getValue`

***

### registerDestructionCallback()

> **registerDestructionCallback**(`name`, `callback`): `void`

#### Parameters

##### name

`string`

##### callback

() => `void`

#### Returns

`void`
