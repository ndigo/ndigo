[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / MediaType

# Class: MediaType

Defined in: [packages/blue-core/src/media-type.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-120)

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

Defined in: [packages/blue-core/src/media-type.ts:226](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-226)

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

Defined in: [packages/blue-core/src/media-type.ts:121](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-121)

***

### facets

> `readonly` **facets**: `string`[]

Defined in: [packages/blue-core/src/media-type.ts:122](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-122)

***

### parameters

> `readonly` **parameters**: `MediaTypeParameters`

Defined in: [packages/blue-core/src/media-type.ts:123](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-123)

***

### personal

> `readonly` **personal**: `boolean`

Defined in: [packages/blue-core/src/media-type.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-124)

***

### suffix

> `readonly` **suffix**: `string` \| `null`

Defined in: [packages/blue-core/src/media-type.ts:125](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-125)

***

### subtype

> `readonly` **subtype**: `string`

Defined in: [packages/blue-core/src/media-type.ts:126](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-126)

***

### type

> `readonly` **type**: `SupportedMediaType`

Defined in: [packages/blue-core/src/media-type.ts:127](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-127)

***

### vendor

> `readonly` **vendor**: `boolean`

Defined in: [packages/blue-core/src/media-type.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-128)

***

### qualityFactorComparator

> `static` **qualityFactorComparator**: `QualityFactorComparator`

Defined in: [packages/blue-core/src/media-type.ts:222](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-222)

***

### specificityComparator

> `static` **specificityComparator**: `SpecificityComparator`\<`MediaType`\>

Defined in: [packages/blue-core/src/media-type.ts:224](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-224)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-core/src/media-type.ts:130](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-130)

##### Returns

`string`

***

### isWildcardType

#### Get Signature

> **get** **isWildcardType**(): `boolean`

Defined in: [packages/blue-core/src/media-type.ts:134](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-134)

##### Returns

`boolean`

***

### isWildcardSubtype

#### Get Signature

> **get** **isWildcardSubtype**(): `boolean`

Defined in: [packages/blue-core/src/media-type.ts:138](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-138)

##### Returns

`boolean`

***

### qualityFactor

#### Get Signature

> **get** **qualityFactor**(): `number`

Defined in: [packages/blue-core/src/media-type.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-142)

##### Returns

`number`

***

### baseType

#### Get Signature

> **get** **baseType**(): `string`

Defined in: [packages/blue-core/src/media-type.ts:169](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-169)

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

Defined in: [packages/blue-core/src/media-type.ts:173](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-173)

##### Parameters

###### mediaType

`string`

##### Returns

`MediaType` \| `null`

#### Call Signature

> `static` **for**(`type`, `subtype`, `parameters?`): `MediaType` \| `null`

Defined in: [packages/blue-core/src/media-type.ts:174](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-174)

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

Defined in: [packages/blue-core/src/media-type.ts:261](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-261)

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

Defined in: [packages/blue-core/src/media-type.ts:316](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-316)

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

Defined in: [packages/blue-core/src/media-type.ts:367](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-367)

#### Parameters

##### mediaType

`MediaType`

#### Returns

`boolean`

***

### createBlob()

> **createBlob**(`data?`, `endings?`): `Blob`

Defined in: [packages/blue-core/src/media-type.ts:377](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-377)

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

Defined in: [packages/blue-core/src/media-type.ts:391](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-391)

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

Defined in: [packages/blue-core/src/media-type.ts:424](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-424)

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

Defined in: [packages/blue-core/src/media-type.ts:434](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-434)

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md)

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toJSON`](../interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-core/src/media-type.ts:438](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-438)

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

[`Serializable`](../interfaces/Serializable.md).[`toString`](../interfaces/Serializable.md#tostring)

***

### getDefaultCharset()

> **getDefaultCharset**(): `string` \| `null`

Defined in: [packages/blue-core/src/media-type.ts:453](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-453)

Returns the default charset for this media type, if known.

Currently returns 'utf-8' for all text/* and application/json media types.

#### Returns

`string` \| `null`

The default charset or null if unknown

***

### toContentType()

> **toContentType**(`options?`): `string`

Defined in: [packages/blue-core/src/media-type.ts:466](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-466)

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

Defined in: [packages/blue-core/src/media-type.ts:478](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/media-type.ts#lines-478)

#### Parameters

##### charset

`string`

#### Returns

`MediaType`
