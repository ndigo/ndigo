[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / RegistryProxyHandler

# Class: RegistryProxyHandler\<T\>

A handler implementation that when applied to a [Registry](../interfaces/Registry.md) instance via [roxy\|Proxy](#) causes the registry
to behave like a plain object. This is used to implement `ProxiedFactory`.

## See

[ProxiedFactory](ProxiedFactory.md)

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

A trap for the `delete` operator.

#### Parameters

##### target

`T`

The original object which is being proxied.

##### key

`PropertyKey`

#### Returns

`boolean`

A `Boolean` indicating whether or not the property was deleted.

#### Implementation of

`ProxyHandler.deleteProperty`

***

### get()

> **get**\<`U`\>(`target`, `key`): `U`

A trap for getting a property value.

#### Type Parameters

##### U

`U` = `unknown`

#### Parameters

##### target

`T`

The original object which is being proxied.

##### key

`PropertyKey`

#### Returns

`U`

#### Implementation of

`ProxyHandler.get`

***

### has()

> **has**(`target`, `key`): `boolean`

A trap for the `in` operator.

#### Parameters

##### target

`T`

The original object which is being proxied.

##### key

`PropertyKey`

#### Returns

`boolean`

#### Implementation of

`ProxyHandler.has`

***

### set()

> **set**\<`U`\>(`target`, `key`, `value`): `boolean`

A trap for setting a property value.

#### Type Parameters

##### U

`U` = `unknown`

#### Parameters

##### target

`T`

The original object which is being proxied.

##### key

`PropertyKey`

##### value

`U`

#### Returns

`boolean`

A `Boolean` indicating whether or not the property was set.

#### Implementation of

`ProxyHandler.set`
