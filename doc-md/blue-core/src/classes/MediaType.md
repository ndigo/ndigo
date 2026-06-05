[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MediaType

# Class: MediaType

Defined in: packages/blue-core/src/media-type.ts:149

## Param

## Param

## Param

## Implements

module:core.Serializable

## Implements

module:core.StringComparable

## Extends

- [`Null`](Null.md)

## Implements

- [`Serializable`](../interfaces/Serializable.md)
- [`StringComparable`](../interfaces/StringComparable.md)\<`MediaType`\>
- [`Matchable`](../interfaces/Matchable.md)\<`MediaType`\>

## Constructors

### Constructor

> **new MediaType**(`type?`, `subtype?`, `parameters?`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:245

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

Defined in: packages/blue-core/src/media-type.ts:150

***

### facets

> `readonly` **facets**: `string`[]

Defined in: packages/blue-core/src/media-type.ts:151

***

### parameters

> `readonly` **parameters**: `MediaTypeParameters`

Defined in: packages/blue-core/src/media-type.ts:152

***

### personal

> `readonly` **personal**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:153

***

### suffix

> `readonly` **suffix**: `string`

Defined in: packages/blue-core/src/media-type.ts:154

***

### subtype

> `readonly` **subtype**: `string`

Defined in: packages/blue-core/src/media-type.ts:155

***

### type

> `readonly` **type**: `SupportedMediaType`

Defined in: packages/blue-core/src/media-type.ts:156

***

### vendor

> `readonly` **vendor**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:157

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: `QualityFactorComparator`

Defined in: packages/blue-core/src/media-type.ts:241

***

### specificityComparator

> `static` **specificityComparator**: `SpecificityComparator`\<`MediaType`\>

Defined in: packages/blue-core/src/media-type.ts:243

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/media-type.ts:159

##### Returns

`string`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:163

##### Returns

`boolean`

***

### isWildcardSubtype

#### Get Signature

> **get** **isWildcardSubtype**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:167

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

Defined in: packages/blue-core/src/media-type.ts:171

##### Returns

`number`

***

### baseType

#### Get Signature

> **get** **baseType**(): `string`

Defined in: packages/blue-core/src/media-type.ts:198

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

> `static` **for**(`mediaType`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:202

##### Parameters

###### mediaType

`string`

##### Returns

`MediaType`

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:203

##### Parameters

###### type

`SupportedMediaType`

###### subtype

`string`

###### parameters?

`MediaTypeParameters`

##### Returns

`MediaType`

***

### compareTo()

> **compareTo**(`mediaType`): `number`

Defined in: packages/blue-core/src/media-type.ts:280

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

Defined in: packages/blue-core/src/media-type.ts:335

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

Defined in: packages/blue-core/src/media-type.ts:386

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Defined in: packages/blue-core/src/media-type.ts:396

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

Defined in: packages/blue-core/src/media-type.ts:410

Indicates whether the `MediaType` includes the given `MediaType`.

For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.

#### Parameters

##### value?

`MediaType` = `null`

#### Returns

`boolean`

If this `MediaType` includes the given `MediaType`.

***

### matches()

> **matches**(`mediaType`): `boolean`

Defined in: packages/blue-core/src/media-type.ts:443

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

Defined in: packages/blue-core/src/media-type.ts:453

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/media-type.ts:457

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)

***

### getDefaultCharset()

> **getDefaultCharset**(): `string`

Defined in: packages/blue-core/src/media-type.ts:472

Returns the default charset for this media type, if known.

Currently returns 'utf-8' for all text/* and application/json media types.

#### Returns

`string`

The default charset or null if unknown

***

### toContentType()

> **toContentType**(`options?`): `string`

Defined in: packages/blue-core/src/media-type.ts:485

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

Defined in: packages/blue-core/src/media-type.ts:497

#### Parameters

##### charset

`string`

#### Returns

`MediaType`
