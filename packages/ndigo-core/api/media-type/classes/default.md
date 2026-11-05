[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [media-type](../README.md) / default

# Class: default

A value that can safely be converted to a string or JSON payload.

## Extends

- [`Null`](../../null/classes/Null.md)

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`StringComparable`](../../comparable/interfaces/StringComparable.md)\<`MediaType`\>
- [`Matchable`](../../matchable/interfaces/Matchable.md)\<`MediaType`\>

## Constructors

### Constructor

> **new default**(`type?`, `subtype?`, `parameters?`): `MediaType`

#### Parameters

##### type?

[`SupportedMediaType`](../type-aliases/SupportedMediaType.md) = `WILDCARD`

##### subtype?

`string` = `WILDCARD`

##### parameters?

[`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md) = `{}`

#### Returns

`MediaType`

#### Overrides

[`Null`](../../null/classes/Null.md).[`constructor`](../../null/classes/Null.md#constructor)

## Properties

### experimental

> `readonly` **experimental**: `boolean`

***

### facets

> `readonly` **facets**: `string`[]

***

### parameters

> `readonly` **parameters**: [`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md)

***

### personal

> `readonly` **personal**: `boolean`

***

### subtype

> `readonly` **subtype**: `string`

***

### suffix

> `readonly` **suffix**: `string` \| `null`

***

### type

> `readonly` **type**: [`SupportedMediaType`](../type-aliases/SupportedMediaType.md)

***

### vendor

> `readonly` **vendor**: `boolean`

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: [`Comparator`](../../comparable/interfaces/Comparator.md)\<`MediaType`\>

***

### specificityComparator

> `static` **specificityComparator**: [`SpecificityComparator`](#)\<`MediaType`\>

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### baseType

#### Get Signature

> **get** **baseType**(): `string`

Returns the base media type without parameters or suffix.

Provides simple string format for matching (e.g., "text/html", "application/json").

##### Example

```typescript
const mt = MediaType.for('text/html;charset=UTF-8');
mt.baseType; // "text/html"

const mt2 = MediaType.for('application/atom+xml');
mt2.baseType; // "application/atom" (excludes suffix)
```

##### Returns

`string`

Base type as "type/subtype" string

***

### isJSON

#### Get Signature

> **get** **isJSON**(): `boolean`

Whether this media type is JSON: `application/json`, `text/json`,
or any `+json`-suffixed type (e.g. `application/problem+json`).
The single source for JSON-sniffing decisions previously
re-implemented in `http-request-limits` and the transform
interceptor (Wave 6, 2026-09-27).

##### Returns

`boolean`

***

### isWildcardSubtype

#### Get Signature

> **get** **isWildcardSubtype**(): `boolean`

##### Returns

`boolean`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

##### Returns

`number`

***

### registrySize

#### Get Signature

> **get** `static` **registrySize**(): `number`

Number of instances currently held by the process-wide intern
registry: the permanent registered entries plus the bounded
parameterless and parameterized caches. Exposed so the registry's
boundedness is observable in tests (DSG-1, SEC-7).

##### Returns

`number`

## Methods

### compareTo()

> **compareTo**(`mediaType`): `number`

#### Parameters

##### mediaType

`MediaType`

#### Returns

`number`

#### Implementation of

[`StringComparable`](../../comparable/interfaces/StringComparable.md).[`compareTo`](../../comparable/interfaces/StringComparable.md#compareto)

***

### compareToIgnoreCase()

> **compareToIgnoreCase**(`mediaType`): `number`

#### Parameters

##### mediaType

`MediaType`

#### Returns

`number`

#### Implementation of

[`StringComparable`](../../comparable/interfaces/StringComparable.md).[`compareToIgnoreCase`](../../comparable/interfaces/StringComparable.md#comparetoignorecase)

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Creates a new blob of the media type with the given parameters

#### Parameters

##### data?

`BlobPart`[]

##### endings?

`EndingType` = `'transparent'`

#### Returns

`Blob`

A new blob of the media type

***

### equals()

> **equals**(`mediaType`): `boolean`

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

***

### getDefaultCharset()

> **getDefaultCharset**(): `string` \| `null`

Returns the default charset for this media type, if known.

Currently returns 'utf-8' for all text/* and application/json media types.

#### Returns

`string` \| `null`

The default charset or null if unknown

***

### includes()

> **includes**(`value?`): `boolean`

Indicates whether the `MediaType` includes the given `MediaType`.

For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.

#### Parameters

##### value?

`MediaType`

#### Returns

`boolean`

If this `MediaType` includes the given `MediaType`.

***

### matches()

> **matches**(`mediaType`): `boolean`

Determines if this object matches the specified value.

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

`true` if the object matches the value, `false` otherwise.

#### Implementation of

[`Matchable`](../../matchable/interfaces/Matchable.md).[`matches`](../../matchable/interfaces/Matchable.md#matches)

***

### toContentType()

> **toContentType**(`options?`): `string`

Formats the media type for use in an HTTP Content-Type header.

Optionally adds a default charset if none is present and the media type supports it.

#### Parameters

##### options?

Formatting options

###### autoCharset?

`boolean`

Whether to automatically add a default charset

#### Returns

`string`

The formatted Content-Type string

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../serializable/type-aliases/JSONValue.md)

#### Returns

[`JSONValue`](../../serializable/type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### withCharset()

> **withCharset**(`charset`): `MediaType`

#### Parameters

##### charset

`string`

#### Returns

`MediaType`

***

### for()

#### Call Signature

> `static` **for**(`mediaType`): `MediaType` \| `null`

##### Parameters

###### mediaType

`string`

##### Returns

`MediaType` \| `null`

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType` \| `null`

##### Parameters

###### type

[`SupportedMediaType`](../type-aliases/SupportedMediaType.md)

###### subtype

`string`

###### parameters?

[`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md)

##### Returns

`MediaType` \| `null`

***

### parseAccept()

> `static` **parseAccept**(`accept`): `MediaType`[]

Parses an `Accept` header value into MediaType instances in
header order. Each entry keeps its quality factor in
`parameters.q` — use the [qualityFactor](#qualityfactor) getter and
`MediaType.qualityFactorComparator` for negotiation decisions
(`qualityFactor === 0` means "never"). Malformed entries are dropped.

#### Parameters

##### accept

`string` \| `null` \| `undefined`

The raw `Accept` header value.

#### Returns

`MediaType`[]

The parsed media types (empty when absent or all-malformed).

***

### registered()

> `static` **registered**(`type`, `subtype?`, `parameters?`): `MediaType`

Registers/retrieves a media type by authored components, guaranteed
non-null: the interned-registry path for programmatic construction
(`MediaTypes.*` constants) where a missing entry is a programming
error, not a parse outcome. Registered entries are interned
process-lifetime — they are exempt from the bounded FIFO caches that
cap parse-originated entries (SEC-7). Use [MediaType.for](#for) for
parsing user/header values — those can legitimately return `null`.

#### Parameters

##### type

`string`

The top-level type (e.g. `'application'`).

##### subtype?

`string` = `WILDCARD`

The subtype or wildcard (default `'*'`).

##### parameters?

[`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md) = `{}`

Optional parameters.

#### Returns

`MediaType`

#### Throws

When the composed expression is empty.
