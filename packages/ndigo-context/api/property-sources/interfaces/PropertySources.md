[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-sources](../README.md) / PropertySources

# Interface: PropertySources

Read-only view of the ordered, named [PropertySource](../../property-source/interfaces/PropertySource.md) set.

Consumers that only look (merge, index builds, test spies) type against this
interface; mutators live on [MutablePropertySources](../classes/MutablePropertySources.md).

## See

module:context.ConfigurableEnvironment

## Extends

- `Enumerable`\<`string`, [`PropertySource`](../../property-source/interfaces/PropertySource.md)\>
- `Iterable`\<[`PropertySource`](../../property-source/interfaces/PropertySource.md)\>

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

### entries()

> **entries**(): `Iterator`\<\[`string`, [`PropertySource`](../../property-source/interfaces/PropertySource.md)\]\>

Returns an iterator for the key-value pairs in the collection.

#### Returns

`Iterator`\<\[`string`, [`PropertySource`](../../property-source/interfaces/PropertySource.md)\]\>

An iterator that yields `[key, value]` pairs.

#### Inherited from

`Enumerable.entries`

***

### forEach()

> **forEach**(`callback`, `context?`): `void`

Executes a provided function once for each key-value pair in the collection.

#### Parameters

##### callback

(`value`, `key`, `list`) => `void`

Function to execute for each element. It receives `value`, `key`, and the `list` itself as arguments.

##### context?

`unknown`

Value to use as `this` when executing the `callback`.

#### Returns

`void`

#### Inherited from

`Enumerable.forEach`

***

### get()

> **get**(`name`): [`PropertySource`](../../property-source/interfaces/PropertySource.md) \| `undefined`

Returns the source registered under the given name.

#### Parameters

##### name

`string`

The source name.

#### Returns

[`PropertySource`](../../property-source/interfaces/PropertySource.md) \| `undefined`

The matching source, or `undefined`.

***

### keys()

> **keys**(): `Iterator`\<`string`\>

Returns an iterator for the keys in the collection.

#### Returns

`Iterator`\<`string`\>

An iterator that yields keys.

#### Inherited from

`Enumerable.keys`

***

### toArray()

> **toArray**(): [`PropertySource`](../../property-source/interfaces/PropertySource.md)[]

Returns the sources in precedence order (first = highest precedence).

#### Returns

[`PropertySource`](../../property-source/interfaces/PropertySource.md)[]

A fresh snapshot of the ordered sources.

***

### values()

> **values**(): `Iterator`\<[`PropertySource`](../../property-source/interfaces/PropertySource.md)\>

Returns an iterator for the values in the collection.

#### Returns

`Iterator`\<[`PropertySource`](../../property-source/interfaces/PropertySource.md)\>

An iterator that yields values.

#### Inherited from

`Enumerable.values`
