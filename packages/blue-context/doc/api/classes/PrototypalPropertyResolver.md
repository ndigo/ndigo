[**@blue/context v0.0.1**](../README.md)

***

[@blue/context](../README.md) / PrototypalPropertyResolver

# Class: PrototypalPropertyResolver

Property resolver that layers sources through a configured index.

Preferred construction is [PrototypalPropertyResolver.create](#create), which
backs the resolver with a live `PropertySources` registry (mutations
are picked up lazily). The plain constructor stays for compatibility: the
source array is captured once and replaced via the `propertySources`
setter.

## Implements

- [`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md)

## Constructors

### Constructor

> **new PrototypalPropertyResolver**(`propertySources?`, `options?`): `PrototypalPropertyResolver`

Creates a resolver over the given sources (compatibility path).

#### Parameters

##### propertySources?

`JSONObject`[] = `[]`

The ordered property sources.

##### options?

[`ResolverOptions`](../interfaces/ResolverOptions.md) = `{}`

Resolver options (index strategy).

#### Returns

`PrototypalPropertyResolver`

## Accessors

### options

#### Get Signature

> **get** **options**(): [`ResolverOptions`](../interfaces/ResolverOptions.md)

The options this resolver was created with.

##### Returns

[`ResolverOptions`](../interfaces/ResolverOptions.md)

***

### propertySources

#### Get Signature

> **get** **propertySources**(): `JSONObject`[]

The ordered set of configured property sources (snapshot).

##### Returns

`JSONObject`[]

#### Set Signature

> **set** **propertySources**(`propertySources`): `void`

Replaces the property sources and rebuilds the lookup index.

##### Parameters

###### propertySources

`JSONObject`[]

The new property sources.

##### Returns

`void`

The ordered set of property sources used during resolution.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`propertySources`](../interfaces/ConfigurablePropertyResolver.md#propertysources)

***

### registry

#### Get Signature

> **get** **registry**(): [`MutablePropertySources`](MutablePropertySources.md)

The live registry backing this resolver, when created via
[PrototypalPropertyResolver.create](#create).

##### Throws

When the resolver was not created from a registry.

##### Returns

[`MutablePropertySources`](MutablePropertySources.md)

The registry, or throws when this resolver is array-backed.

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getProperty`](../interfaces/ConfigurablePropertyResolver.md#getproperty)

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

`T` \| ((...`args`) => `T`) \| (() => `T`)

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getPropertyAs`](../interfaces/ConfigurablePropertyResolver.md#getpropertyas)

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getRawProperty`](../interfaces/ConfigurablePropertyResolver.md#getrawproperty)

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getRequiredProperty`](../interfaces/ConfigurablePropertyResolver.md#getrequiredproperty)

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

`T` \| ((...`args`) => `T`) \| (() => `T`)

The target constructor or primitive.

#### Returns

`T`

The typed value.

#### Throws

When missing, unresolved, or unconvertible.

#### Implementation of

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`getRequiredPropertyAs`](../interfaces/ConfigurablePropertyResolver.md#getrequiredpropertyas)

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`hasProperty`](../interfaces/ConfigurablePropertyResolver.md#hasproperty)

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

[`ConfigurablePropertyResolver`](../interfaces/ConfigurablePropertyResolver.md).[`originOf`](../interfaces/ConfigurablePropertyResolver.md#originof)

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
