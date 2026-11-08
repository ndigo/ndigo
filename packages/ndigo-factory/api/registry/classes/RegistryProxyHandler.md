[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [registry](../README.md) / RegistryProxyHandler

# Class: RegistryProxyHandler\<T\>

A handler implementation that when applied to a [Registry](../interfaces/Registry.md) instance via `Proxy` causes the registry
to behave like a plain object. This is used to implement `ProxiedFactory`.

## See

[ProxiedFactory](../../default-factory/classes/ProxiedFactory.md)

## Type Parameters

### T

`T` *extends* [`Registry`](../interfaces/Registry.md)

## Implements

- `ProxyHandler`\<`T`\>

## Constructors

### Constructor

> **new RegistryProxyHandler**\<`T`\>(): `RegistryProxyHandler`\<`T`\>

#### Returns

`RegistryProxyHandler`\<`T`\>

## Methods

### deleteProperty()

> **deleteProperty**(`target`, `key`): `boolean`

Destroys the value behind a deleted property.

#### Parameters

##### target

`T`

The registry.

##### key

`PropertyKey`

The property key.

#### Returns

`boolean`

Whether the property was deleted.

#### Implementation of

`ProxyHandler.deleteProperty`

***

### get()

> **get**\<`U`\>(`target`, `key`): `U`

Resolves a property through the registry.

#### Type Parameters

##### U

`U` = `unknown`

#### Parameters

##### target

`T`

The registry.

##### key

`PropertyKey`

The property key.

#### Returns

`U`

The resolved value or bound member.

#### Implementation of

`ProxyHandler.get`

***

### has()

> **has**(`target`, `key`): `boolean`

Whether the registry has the property.

#### Parameters

##### target

`T`

The registry.

##### key

`PropertyKey`

The property key.

#### Returns

`boolean`

Whether the value is registered.

#### Implementation of

`ProxyHandler.has`

***

### set()

> **set**\<`U`\>(`target`, `key`, `value`): `boolean`

Stores a property through the registry.

#### Type Parameters

##### U

`U` = `unknown`

#### Parameters

##### target

`T`

The registry.

##### key

`PropertyKey`

The property key.

##### value

`U`

The value to store.

#### Returns

`boolean`

Whether the property was stored.

#### Implementation of

`ProxyHandler.set`
