[**@ndigo/context v0.0.1**](../../README.md)

***

[@ndigo/context](../../README.md) / [property-resolver](../README.md) / PrototypalPropertyResolver

# Class: PrototypalPropertyResolver

Property resolver that layers sources through a live property source registry.

## Example

```ts
const resolver = new PrototypalPropertyResolver({ sources: [new MapPropertySource('app', { 'server.port': '8080' })] });
resolver.getProperty('server.port'); // '8080'
```

## Implements

- [`PropertyResolver`](../interfaces/PropertyResolver.md)

## Accessors

### options

#### Get Signature

> **get** **options**(): [`ResolverOptions`](../interfaces/ResolverOptions.md)

The resolver options.

##### Returns

[`ResolverOptions`](../interfaces/ResolverOptions.md)

***

### registry

#### Get Signature

> **get** **registry**(): [`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

##### Returns

[`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The registry backing this resolver.

## Methods

### getProperty()

> **getProperty**(`key`, `defaultValue?`): `JSONValue` \| `undefined`

Gets a property.

#### Parameters

##### key

`string`

The key.

##### defaultValue?

`JSONValue`

Default.

#### Returns

`JSONValue` \| `undefined`

The value.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getProperty`](../interfaces/PropertyResolver.md#getproperty)

***

### getPropertyAs()

> **getPropertyAs**\<`T`\>(`key`, `targetType`, `defaultValue?`): `T` \| `undefined`

Gets a typed property.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The key.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

Target type.

##### defaultValue?

`T`

Default.

#### Returns

`T` \| `undefined`

The value.

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

Gets a required property.

#### Parameters

##### key

`string`

The key.

#### Returns

`JSONValue`

The value.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getRequiredProperty`](../interfaces/PropertyResolver.md#getrequiredproperty)

***

### getRequiredPropertyAs()

> **getRequiredPropertyAs**\<`T`\>(`key`, `targetType`): `T`

Gets a required typed property.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

The key.

##### targetType

`T` \| (new (...`args`) => `T`) \| (() => `T`)

Target type.

#### Returns

`T`

The value.

#### Implementation of

[`PropertyResolver`](../interfaces/PropertyResolver.md).[`getRequiredPropertyAs`](../interfaces/PropertyResolver.md#getrequiredpropertyas)

***

### hasProperty()

> **hasProperty**(`key`): `boolean`

Whether a property exists.

#### Parameters

##### key

`string`

The key.

#### Returns

`boolean`

`true` when present.

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

[`MutablePropertySources`](../../property-sources/classes/MutablePropertySources.md)

The registry to resolve against.

##### options?

[`ResolverOptions`](../interfaces/ResolverOptions.md) = `{}`

Resolver options (index strategy).

#### Returns

`PrototypalPropertyResolver`

The registry-backed resolver.
