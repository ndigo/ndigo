[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [multipart-file](../README.md) / NodeMultipartContext

# Class: NodeMultipartContext

A parsed multipart request that can dispose any temp files it created.

## Implements

- [`MultipartContext`](../interfaces/MultipartContext.md)

## Constructors

### Constructor

> **new NodeMultipartContext**(): `NodeMultipartContext`

#### Returns

`NodeMultipartContext`

## Properties

### fields

> `readonly` **fields**: `Record`\<`string`, `string` \| `string`[]\>

Text fields keyed by form field name; repeated names collapse to an array.

#### Implementation of

[`MultipartContext`](../interfaces/MultipartContext.md).[`fields`](../interfaces/MultipartContext.md#fields)

***

### files

> `readonly` **files**: `MultiValueMap`\<`string`, [`MultipartFile`](../interfaces/MultipartFile.md)\>

Uploaded file parts grouped by form field name.

#### Implementation of

[`MultipartContext`](../interfaces/MultipartContext.md).[`files`](../interfaces/MultipartContext.md#files)

## Methods

### addFile()

> **addFile**(`name`, `part`): `void`

#### Parameters

##### name

`string`

##### part

[`MultipartFile`](../interfaces/MultipartFile.md)

#### Returns

`void`

***

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Dispose any on-disk temp parts created during parsing. Idempotent and
never throws — called by the framework request lifecycle once the
request dispatch has finished (success or error), and by the parser
itself on the overflow-abort path.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MultipartContext`](../interfaces/MultipartContext.md).[`cleanup`](../interfaces/MultipartContext.md#cleanup)

***

### setField()

> **setField**(`name`, `value`): `void`

#### Parameters

##### name

`string`

##### value

`string`

#### Returns

`void`

***

### trackTemp()

> **trackTemp**(`path`): `void`

#### Parameters

##### path

`string`

#### Returns

`void`
