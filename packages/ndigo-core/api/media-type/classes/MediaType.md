[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [media-type](../README.md) / MediaType

# Class: MediaType

An interned, immutable media type (`type/subtype;param=value`) with comparison,
matching, and content-negotiation helpers. Instances are interned process-wide:
use [MediaType.for](#for) to parse header values and [MediaType.registered](#registered)
for the `MediaTypes.*` constants.

## Remarks

Instances are interned process-wide: header parsing goes through
bounded FIFO caches so attacker-controlled values cannot grow the registry
unboundedly; `MediaTypes.*` constants live for the process lifetime.

## Example

```ts
const mt = MediaType.for('text/html;charset=UTF-8');
mt.baseType; // "text/html"
mt.qualityFactor; // 1
```

## Extends

- [`Null`](../../null/classes/Null.md)

## Implements

- [`Serializable`](../../serializable/interfaces/Serializable.md)
- [`StringComparable`](../../comparable/interfaces/StringComparable.md)\<`MediaType`\>
- [`Equatable`](../../equatable/interfaces/Equatable.md)\<`MediaType`\>
- [`Matchable`](../../matchable/interfaces/Matchable.md)\<`MediaType`\>

## Constructors

### Constructor

> **new MediaType**(`type?`, `subtype?`, `parameters?`): `MediaType`

Creates (interns) a media type.

#### Parameters

##### type?

[`SupportedMediaType`](../type-aliases/SupportedMediaType.md) = `WILDCARD`

Top-level type (default `'*'`).

##### subtype?

`string` = `WILDCARD`

Subtype or wildcard (default `'*'`).

##### parameters?

[`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md) = `{}`

Optional parameters (default `{}`).

#### Returns

`MediaType`

#### Overrides

[`Null`](../../null/classes/Null.md).[`constructor`](../../null/classes/Null.md#constructor)

## Properties

### experimental

> `readonly` **experimental**: `boolean`

Whether the subtype carries the experimental `x-` facet (RFC 6838 §4.2).

***

### facets

> `readonly` **facets**: `string`[]

Dot-separated subtype facets (e.g. `vnd.api+json` → `['vnd', 'api']`).

***

### parameters

> `readonly` **parameters**: [`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md)

Parameters parsed from the expression, keyed by lower-case name.

***

### personal

> `readonly` **personal**: `boolean`

Whether the subtype carries the personal `prs` facet.

***

### subtype

> `readonly` **subtype**: `string`

Subtype without the structured-syntax suffix (e.g. `problem` for `application/problem+json`).

***

### suffix

> `readonly` **suffix**: `string` \| `null`

Structured-syntax suffix after `+` (e.g. `json`), or `null` when absent.

***

### type

> `readonly` **type**: [`SupportedMediaType`](../type-aliases/SupportedMediaType.md)

Top-level type (`application`, `text`, …).

***

### vendor

> `readonly` **vendor**: `boolean`

Whether the subtype carries the vendor `vnd` facet.

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: [`Comparator`](../../comparable/interfaces/Comparator.md)\<`MediaType`\>

Comparator ordering by descending quality factor, then specificity.

***

### specificityComparator

> `static` **specificityComparator**: [`SpecificityComparator`](SpecificityComparator.md)\<`MediaType`\>

Comparator ordering more-specific media types before wildcards.

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

Whether the subtype is the `*` wildcard.

##### Returns

`boolean`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

Whether the top-level type is the `*` wildcard.

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

Quality factor parsed from `parameters.q`, defaulting to `1` (RFC 7231 §5.3.1).

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

Compares two media types by type, subtype, and parameters.

#### Parameters

##### mediaType

`MediaType`

The media type to compare against.

#### Returns

`number`

A negative, zero, or positive number as this is less than, equal to, or greater than the other.

#### Implementation of

[`StringComparable`](../../comparable/interfaces/StringComparable.md).[`compareTo`](../../comparable/interfaces/StringComparable.md#compareto)

***

### compareToIgnoreCase()

> **compareToIgnoreCase**(`mediaType`): `number`

Compares two media types, ignoring case.

#### Parameters

##### mediaType

`MediaType`

The media type to compare against.

#### Returns

`number`

A negative, zero, or positive number as this is less than, equal to, or greater than the other.

#### Implementation of

[`StringComparable`](../../comparable/interfaces/StringComparable.md).[`compareToIgnoreCase`](../../comparable/interfaces/StringComparable.md#comparetoignorecase)

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Creates a new blob of the media type with the given parameters.

#### Parameters

##### data?

`BlobPart`[]

Blob parts to include (default `[]`).

##### endings?

`EndingType` = `'transparent'`

Line-ending mode (default `'transparent'`).

#### Returns

`Blob`

A new blob of the media type.

***

### equals()

> **equals**(`mediaType`): `boolean`

Whether this media type equals `mediaType` (case-sensitive, full parameters).

#### Parameters

##### mediaType

`MediaType`

The media type to compare.

#### Returns

`boolean`

`true` when equal.

#### Implementation of

[`Equatable`](../../equatable/interfaces/Equatable.md).[`equals`](../../equatable/interfaces/Equatable.md#equals)

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

The media type to test for inclusion.

#### Returns

`boolean`

`true` if this includes `value`.

***

### matches()

> **matches**(`mediaType`): `boolean`

Whether this media type matches `mediaType` according to wildcard rules.

#### Parameters

##### mediaType

`MediaType`

The media type to match against.

#### Returns

`boolean`

`true` when matched.

#### Implementation of

[`Matchable`](../../matchable/interfaces/Matchable.md).[`matches`](../../matchable/interfaces/Matchable.md#matches)

***

### toContentType()

> **toContentType**(`options?`): `string`

Formats the media type for use in an HTTP Content-Type header.

Optionally adds a default charset if none is present and the media type supports it.

#### Parameters

##### options?

Formatting options; `autoCharset` adds a default charset when absent.

###### autoCharset?

`boolean`

#### Returns

`string`

The formatted Content-Type string

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../serializable/type-aliases/JSONValue.md)

Serializes the media type to its string form.

#### Returns

[`JSONValue`](../../serializable/type-aliases/JSONValue.md)

The canonical media-type string.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toJSON`](../../serializable/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Returns the canonical `type/subtype;param=value` string.

#### Returns

`string`

The canonical media-type string.

#### Implementation of

[`Serializable`](../../serializable/interfaces/Serializable.md).[`toString`](../../serializable/interfaces/Serializable.md#tostring)

***

### withCharset()

> **withCharset**(`charset`): `MediaType`

Returns a copy of this media type with the given `charset` parameter.

#### Parameters

##### charset

`string`

The charset to set.

#### Returns

`MediaType`

A new interned media type.

***

### for()

Interns a media type from an expression or components.

#### Param

**typeOrExpression**

Expression or top-level type.

#### Param

**subtype**

Subtype or wildcard (default `'*'`).

#### Param

**parameters**

Optional parameters (default `{}`).

#### Call Signature

> `static` **for**(`mediaType`): `MediaType` \| `null`

Parses a media-type expression (e.g. `text/html;charset=UTF-8`), returning `null` when invalid.

##### Parameters

###### mediaType

`string`

The expression to parse.

##### Returns

`MediaType` \| `null`

The interned media type, or `null`.

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType` \| `null`

Builds an interned media type from its components.

##### Parameters

###### type

[`SupportedMediaType`](../type-aliases/SupportedMediaType.md)

Top-level type.

###### subtype

`string`

Subtype or wildcard.

###### parameters?

[`MediaTypeParameters`](../type-aliases/MediaTypeParameters.md)

Optional parameters.

##### Returns

`MediaType` \| `null`

The interned media type, or `null`.

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
