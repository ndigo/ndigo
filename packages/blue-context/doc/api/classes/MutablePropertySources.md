[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / MutablePropertySources

# Class: MutablePropertySources

Ordered, named property sources with O(1) name operations and keyed
enumeration in precedence order (first = highest precedence).

Backed by a `Map` (name ops O(1), precedence order) plus a lazily rebuilt
array for ordering work. Enumeration uses the map directly. Every mutation
bumps [version](#version) so index strategies can rebuild lazily on the next
lookup instead of eagerly.

Error semantics: `addBefore`/`addAfter` with an unknown anchor throw
`IllegalStateError` naming the anchor and listing the registered names
(a typo in an anchor silently changes precedence otherwise). `remove` and
`replace` return booleans — absence is a valid outcome there.

## Implements

- [`PropertySources`](../interfaces/PropertySources.md)

## Constructors

### Constructor

> **new MutablePropertySources**(): `MutablePropertySources`

#### Returns

`MutablePropertySources`

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

The number of registered sources.

##### Returns

`number`

The number of registered sources.

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`size`](../interfaces/PropertySources.md#size)

***

### version

#### Get Signature

> **get** **version**(): `number`

Incremented on every mutation; index strategies use it to detect
staleness and rebuild lazily.

##### Returns

`number`

## Methods

### \[iterator\]()

> **\[iterator\]**(): `IterableIterator`\<[`PropertySource`](../interfaces/PropertySource.md)\>

#### Returns

`IterableIterator`\<[`PropertySource`](../interfaces/PropertySource.md)\>

#### Implementation of

`PropertySources.[iterator]`

***

### addAfter()

> **addAfter**(`anchor`, `name`, `source`): `this`

Adds a source directly after the named anchor.

#### Parameters

##### anchor

`string`

The name of the existing source to follow.

##### name

`string`

The source name.

##### source

`JSONObject`

The property values to capture.

#### Returns

`this`

`this`, for chaining.

#### Throws

When the anchor is not registered.

***

### addBefore()

> **addBefore**(`anchor`, `name`, `source`): `this`

Adds a source directly before the named anchor.

#### Parameters

##### anchor

`string`

The name of the existing source to precede.

##### name

`string`

The source name.

##### source

`JSONObject`

The property values to capture.

#### Returns

`this`

`this`, for chaining.

#### Throws

When the anchor is not registered.

***

### addFirst()

> **addFirst**(`name`, `source`): `this`

Adds a source at the front of the precedence order (highest
precedence). A name already registered is moved to the front.

#### Parameters

##### name

`string`

The source name.

##### source

`JSONObject`

The property values to capture.

#### Returns

`this`

`this`, for chaining.

***

### addLast()

> **addLast**(`name`, `source`): `this`

Adds a source at the end of the precedence order (lowest precedence).
A name already registered is moved to the end.

#### Parameters

##### name

`string`

The source name.

##### source

`JSONObject`

The property values to capture.

#### Returns

`this`

`this`, for chaining.

***

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

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`contains`](../interfaces/PropertySources.md#contains)

***

### entries()

> **entries**(): `IterableIterator`\<\[`string`, [`PropertySource`](../interfaces/PropertySource.md)\]\>

Returns name/source pairs in precedence order.

#### Returns

`IterableIterator`\<\[`string`, [`PropertySource`](../interfaces/PropertySource.md)\]\>

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`entries`](../interfaces/PropertySources.md#entries)

***

### forEach()

> **forEach**(`callback`, `context?`): `void`

Visits each source in precedence order, using `context` as callback `this`.

#### Parameters

##### callback

(`value`, `key`, `list`) => `void`

##### context?

`unknown`

#### Returns

`void`

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`forEach`](../interfaces/PropertySources.md#foreach)

***

### get()

> **get**(`name`): [`PropertySource`](../interfaces/PropertySource.md) \| `undefined`

Returns the source registered under the given name.

#### Parameters

##### name

`string`

The source name.

#### Returns

[`PropertySource`](../interfaces/PropertySource.md) \| `undefined`

The matching source, or `undefined`.

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`get`](../interfaces/PropertySources.md#get)

***

### keys()

> **keys**(): `IterableIterator`\<`string`\>

Returns source names in precedence order.

#### Returns

`IterableIterator`\<`string`\>

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`keys`](../interfaces/PropertySources.md#keys)

***

### remove()

> **remove**(`name`): `boolean`

Removes the source registered under the given name.

#### Parameters

##### name

`string`

The source name.

#### Returns

`boolean`

`true` when a source was removed.

***

### replace()

> **replace**(`name`, `source`): `boolean`

Replaces the source registered under the given name, keeping its
position in the precedence order.

#### Parameters

##### name

`string`

The source name.

##### source

`JSONObject`

The replacement property values to capture.

#### Returns

`boolean`

`true` when a source was replaced.

***

### toArray()

> **toArray**(): [`PropertySource`](../interfaces/PropertySource.md)[]

Returns the sources in precedence order (first = highest precedence).

#### Returns

[`PropertySource`](../interfaces/PropertySource.md)[]

A fresh snapshot of the ordered sources.

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`toArray`](../interfaces/PropertySources.md#toarray)

***

### values()

> **values**(): `IterableIterator`\<[`PropertySource`](../interfaces/PropertySource.md)\>

Returns sources in precedence order.

#### Returns

`IterableIterator`\<[`PropertySource`](../interfaces/PropertySource.md)\>

#### Implementation of

[`PropertySources`](../interfaces/PropertySources.md).[`values`](../interfaces/PropertySources.md#values)
