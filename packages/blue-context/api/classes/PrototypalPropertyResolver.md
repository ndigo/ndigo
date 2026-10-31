[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / PrototypalPropertyResolver

# Class: PrototypalPropertyResolver

Property resolver that layers sources through a live property source registry.

## Implements

- [`PropertyResolver`](../interfaces/PropertyResolver.md)

## Accessors

### options

#### Get Signature

> **get** **options**(): [`ResolverOptions`](../interfaces/ResolverOptions.md)

##### Returns

[`ResolverOptions`](../interfaces/ResolverOptions.md)

***

### registry

#### Get Signature

> **get** **registry**(): [`MutablePropertySources`](MutablePropertySources.md)

##### Returns

[`MutablePropertySources`](MutablePropertySources.md)

The registry backing this resolver.

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Resolves a property value, falling back to a default when missing.

#### Parameters

##### key

`string`

The property name to resolve.

##### defaultValue?

`JSONValue`

The value to return when no property is found.

#### Returns

`JSONValue` \| `undefined`

The resolved property value or the default value.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getProperty`](../interfaces/PropertyResolver.md#getproperty)

***

### getPropertyAs()

> **getPropertyAs**\<`T`\>(`key`, `targetType`, `defaultValue?`): `T` \| `undefined`

Resolves a property as a typed value, converting when needed.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

The target constructor or primitive (`Number`, `Boolean`, `Date`, ...).

##### defaultValue?

`T`

The value to return when the property is missing.

#### Returns

`T` \| `undefined`

The typed value or the default.

#### Throws

When a present value cannot be converted.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getPropertyAs`](../interfaces/PropertyResolver.md#getpropertyas)

***

### getRawProperty()

> **getRawProperty**(`key`): `JSONValue` \| `undefined`

Raw index lookup, bypassing placeholder resolution.

Used internally by the placeholder resolver so value chains resolve with
cycle/depth tracking intact (each public `getProperty` would re-resolve
and lose the in-progress state, overflowing the stack on cycles).

#### Parameters

##### key

`string`

The property name.

#### Returns

`JSONValue` \| `undefined`

The raw value or `undefined`.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getRawProperty`](../interfaces/PropertyResolver.md#getrawproperty)

***

### getRequiredProperty()

> **getRequiredProperty**(`key`): `JSONValue`

Returns the resolved property value or throws when missing.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`JSONValue`

The resolved property value.

#### Throws

When the property cannot be resolved.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getRequiredProperty`](../interfaces/PropertyResolver.md#getrequiredproperty)

***

### getRequiredPropertyAs()

> **getRequiredPropertyAs**\<`T`\>(`key`, `targetType`): `T`

Returns a typed property or throws when missing or unconvertible.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The property name to resolve.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

The target constructor or primitive.

#### Returns

`T`

The typed value.

#### Throws

When missing, unresolved, or unconvertible.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getRequiredPropertyAs`](../interfaces/PropertyResolver.md#getrequiredpropertyas)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Returns whether a property key can be resolved.

#### Parameters

##### key

`string`

The property name to resolve.

#### Returns

`boolean`

`true` when the property exists.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`hasProperty`](../interfaces/PropertyResolver.md#hasproperty)

***

### originOf()

> **originOf**(`key`): `string` \| `null`

Returns the name of the source that won the given key, or `null` when
the active index does not retain origins (prototype chain) or the key
is unknown. Top-level-key granularity (AD-16 D1).

#### Parameters

##### key

`string`

The top-level property key.

#### Returns

`string` \| `null`

The winning source name, or `null`.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`originOf`](../interfaces/PropertyResolver.md#originof)

***

### refresh()

> **refresh**(): `void`

Forces the index to rebuild and clears the placeholder cache —
"recompute from the current sources" (AD-16 D3). Does NOT re-run
customizers or re-read platform snapshots (environment-scope only).

#### Returns

`void`

***

### create()

> `static` **create**(`registry`, `options?`): `PrototypalPropertyResolver`

Creates a resolver backed by a live property source registry.

The registry is read lazily: mutations are picked up on the next
lookup, so burst edits cost a single index rebuild.

#### Parameters

##### registry

[`MutablePropertySources`](MutablePropertySources.md)

The registry to resolve against.

##### options?

[`ResolverOptions`](../interfaces/ResolverOptions.md) = `{}`

Resolver options (index strategy).

#### Returns

`PrototypalPropertyResolver`

The registry-backed resolver.
