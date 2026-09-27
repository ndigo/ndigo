[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / PropertySources

# Interface: PropertySources

Read-only view of the ordered, named [PropertySource](PropertySource.md) set.

Consumers that only look (merge, index builds, test spies) type against this
interface; mutators live on [MutablePropertySources](../classes/MutablePropertySources.md).

## See

module:context.ConfigurableEnvironment

## Extends

- `Iterable`\<[`PropertySource`](PropertySource.md)\>

## Properties

### size

> `readonly` **size**: `number`

The number of registered sources.

## Methods

### contains()

> **contains**(`name`): `boolean`

Returns whether a source is registered under the given name.

#### Parameters

##### name

`string`

The source name.

#### Returns

`boolean`

`true` when registered.

***

### get()

> **get**(`name`): [`PropertySource`](PropertySource.md) \| `undefined`

Returns the source registered under the given name.

#### Parameters

##### name

`string`

The source name.

#### Returns

[`PropertySource`](PropertySource.md) \| `undefined`

The matching source, or `undefined`.

***

### toArray()

> **toArray**(): [`PropertySource`](PropertySource.md)[]

Returns the sources in precedence order (first = highest precedence).

#### Returns

[`PropertySource`](PropertySource.md)[]

A fresh snapshot of the ordered sources.
