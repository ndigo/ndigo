[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MediaType

# Class: MediaType

Defined in: packages/blue-core/src/media-type.ts:120

A value that can safely be converted to a string or JSON payload.

## Extends

- [`Null`](Null.md)

## Implements

- [`Serializable`](../interfaces/Serializable.md)
- [`StringComparable`](../interfaces/StringComparable.md)\<`MediaType`\>
- [`Matchable`](../interfaces/Matchable.md)\<`MediaType`\>

## Constructors

### Constructor

> **new MediaType**(`type?`, `subtype?`, `parameters?`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:224

#### Parameters

##### type?

`SupportedMediaType` = `WILDCARD`

##### subtype?

`string` = `WILDCARD`

##### parameters?

`MediaTypeParameters` = `{}`

#### Returns

`MediaType`

#### Overrides

[`Null`](Null.md).[`constructor`](Null.md#constructor)

## Properties

### experimental

> `readonly` **experimental**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:121

***

### facets

> `readonly` **facets**: `string`[]

Defined in: packages/blue-core/src/media-type.ts:122

***

### parameters

> `readonly` **parameters**: `MediaTypeParameters`

Defined in: packages/blue-core/src/media-type.ts:123

***

### personal

> `readonly` **personal**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:124

***

### suffix

> `readonly` **suffix**: `string` \| `null`

Defined in: packages/blue-core/src/media-type.ts:125

***

### subtype

> `readonly` **subtype**: `string`

Defined in: packages/blue-core/src/media-type.ts:126

***

### type

> `readonly` **type**: `SupportedMediaType`

Defined in: packages/blue-core/src/media-type.ts:127

***

### vendor

> `readonly` **vendor**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:128

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: `QualityFactorComparator`

Defined in: packages/blue-core/src/media-type.ts:220

***

### specificityComparator

> `static` **specificityComparator**: `SpecificityComparator`\<`MediaType`\>

Defined in: packages/blue-core/src/media-type.ts:222

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/media-type.ts:130

##### Returns

`string`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:134

##### Returns

`boolean`

***

### isWildcardSubtype

#### Get Signature

> **get** **isWildcardSubtype**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:138

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

Defined in: packages/blue-core/src/media-type.ts:142

##### Returns

`number`

***

### baseType

#### Get Signature

> **get** **baseType**(): `string`

Defined in: packages/blue-core/src/media-type.ts:169

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

## Methods

### for()

#### Call Signature

> `static` **for**(`mediaType`): `MediaType` \| `null`

Defined in: packages/blue-core/src/media-type.ts:173

##### Parameters

###### mediaType

`string`

##### Returns

`MediaType` \| `null`

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType` \| `null`

Defined in: packages/blue-core/src/media-type.ts:174

##### Parameters

###### type

`SupportedMediaType`

###### subtype

`string`

###### parameters?

`MediaTypeParameters`

##### Returns

`MediaType` \| `null`

***

### compareTo()

> **compareTo**(`mediaType`): `number`

Defined in: packages/blue-core/src/media-type.ts:259

#### Parameters

##### mediaType

`MediaType`

#### Returns

`number`

#### Implementation of

[`StringComparable`](../interfaces/StringComparable.md).[`compareTo`](../interfaces/StringComparable.md#compareto)

***

### compareToIgnoreCase()

> **compareToIgnoreCase**(`mediaType`): `number`

Defined in: packages/blue-core/src/media-type.ts:314

#### Parameters

##### mediaType

`MediaType`

#### Returns

`number`

#### Implementation of

[`StringComparable`](../interfaces/StringComparable.md).[`compareToIgnoreCase`](../interfaces/StringComparable.md#comparetoignorecase)

***

### equals()

> **equals**(`mediaType`): `boolean`

Defined in: packages/blue-core/src/media-type.ts:365

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Defined in: packages/blue-core/src/media-type.ts:375

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

### includes()

> **includes**(`value?`): `boolean`

Defined in: packages/blue-core/src/media-type.ts:389

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

Defined in: packages/blue-core/src/media-type.ts:422

Determines if this object matches the specified value.

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

`true` if the object matches the value, `false` otherwise.

#### Implementation of

[`Matchable`](../interfaces/Matchable.md).[`matches`](../interfaces/Matchable.md#matches)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/media-type.ts:432

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/media-type.ts:436

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)

***

### getDefaultCharset()

> **getDefaultCharset**(): `string` \| `null`

Defined in: packages/blue-core/src/media-type.ts:451

Returns the default charset for this media type, if known.

Currently returns 'utf-8' for all text/* and application/json media types.

#### Returns

`string` \| `null`

The default charset or null if unknown

***

### toContentType()

> **toContentType**(`options?`): `string`

Defined in: packages/blue-core/src/media-type.ts:464

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

### withCharset()

> **withCharset**(`charset`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:476

#### Parameters

##### charset

`string`

#### Returns

`MediaType`
