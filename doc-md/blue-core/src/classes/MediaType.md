[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MediaType

# Class: MediaType

Defined in: packages/blue-core/src/media-type.ts:150




## Extends

- [`Null`](Null.md)

## Implements

- [`Serializable`](../interfaces/Serializable.md)
- [`StringComparable`](../interfaces/StringComparable.md)\<`MediaType`\>
- [`Matchable`](../interfaces/Matchable.md)\<`MediaType`\>

## Constructors

### Constructor

> **new MediaType**(`type`, `subtype`, `parameters`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:221

#### Parameters

##### type

`SupportedMediaType` = `WILDCARD`

##### subtype

`string` = `WILDCARD`

##### parameters

`MediaTypeParameters` = `{}`

#### Returns

`MediaType`

#### Overrides

[`Null`](Null.md).[`constructor`](Null.md#constructor)

## Properties

### experimental

> `readonly` **experimental**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:151

***

### facets

> `readonly` **facets**: `string`[]

Defined in: packages/blue-core/src/media-type.ts:152

***

### parameters

> `readonly` **parameters**: `MediaTypeParameters`

Defined in: packages/blue-core/src/media-type.ts:153

***

### personal

> `readonly` **personal**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:154

***

### suffix

> `readonly` **suffix**: `string`

Defined in: packages/blue-core/src/media-type.ts:155

***

### subtype

> `readonly` **subtype**: `string`

Defined in: packages/blue-core/src/media-type.ts:156

***

### type

> `readonly` **type**: `SupportedMediaType`

Defined in: packages/blue-core/src/media-type.ts:157

***

### vendor

> `readonly` **vendor**: `boolean`

Defined in: packages/blue-core/src/media-type.ts:158

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: `QualityFactorComparator`

Defined in: packages/blue-core/src/media-type.ts:217

***

### specificityComparator

> `static` **specificityComparator**: `SpecificityComparator`\<`MediaType`\>

Defined in: packages/blue-core/src/media-type.ts:219

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/media-type.ts:160

##### Returns

`string`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:164

##### Returns

`boolean`

***

### isWildcardSubtype

#### Get Signature

> **get** **isWildcardSubtype**(): `boolean`

Defined in: packages/blue-core/src/media-type.ts:168

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

Defined in: packages/blue-core/src/media-type.ts:172

##### Returns

`number`

## Methods

### for()

#### Call Signature

> `static` **for**(`mediaType`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:180

##### Parameters

###### mediaType

`string`

##### Returns

`MediaType`

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:181

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

Defined in: packages/blue-core/src/media-type.ts:256

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

Defined in: packages/blue-core/src/media-type.ts:311

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

Defined in: packages/blue-core/src/media-type.ts:362

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Defined in: packages/blue-core/src/media-type.ts:372

Creates a new blob of the media type with the given parameters
    *

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

> **includes**(`value`): `boolean`

Defined in: packages/blue-core/src/media-type.ts:386

Indicates whether the `MediaType` includes the given `MediaType`.

For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.
    *

#### Parameters

##### value

`MediaType` = `null`

#### Returns

`boolean`

If this `MediaType` includes the given `MediaType`.

***

### matches()

> **matches**(`mediaType`): `boolean`

Defined in: packages/blue-core/src/media-type.ts:419

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

#### Implementation of

[`Matchable`](../interfaces/Matchable.md).[`matches`](../interfaces/Matchable.md#matches)

***

### toJSON()

> **toJSON**(): [`JSONValue`](../type-aliases/JSONValue.md)

Defined in: packages/blue-core/src/media-type.ts:429

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/src/media-type.ts:433

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)

***

### withCharset()

> **withCharset**(`charset`): `MediaType`

Defined in: packages/blue-core/src/media-type.ts:441

#### Parameters

##### charset

`string`

#### Returns

`MediaType`
