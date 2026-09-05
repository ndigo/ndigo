[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / RegistryProxyHandler

# Class: RegistryProxyHandler\<T\>

Defined in: [packages/blue-factory/src/registry.ts:41](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-41)

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

Defined in: [packages/blue-factory/src/registry.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-42)

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

Defined in: [packages/blue-factory/src/registry.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-51)

A trap for getting a property value.

#### Type Parameters

##### U

`U` = `any`

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

Defined in: [packages/blue-factory/src/registry.ts:56](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-56)

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

Defined in: [packages/blue-factory/src/registry.ts:60](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/registry.ts#lines-60)

A trap for setting a property value.

#### Type Parameters

##### U

`U` = `any`

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
