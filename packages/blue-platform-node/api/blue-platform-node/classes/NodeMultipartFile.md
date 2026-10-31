[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / NodeMultipartFile

# Class: NodeMultipartFile

Node.js implementation of [MultipartFile](../interfaces/MultipartFile.md).

Temp files are named with a random suffix — never the client-supplied
filename — so parsing can never resolve a path-traversal payload to disk.
The caller owns `transferTo(dest)` destination sanitization (see AD-26 D-6).

## Implements

- [`MultipartFile`](../interfaces/MultipartFile.md)

## Constructors

### Constructor

> **new NodeMultipartFile**(`name`, `originalFilename`, `contentType`, `backing`): `NodeMultipartFile`

#### Parameters

##### name

`string`

##### originalFilename

`string`

##### contentType

`string` \| `undefined`

##### backing

[`Backing`](../type-aliases/Backing.md)

#### Returns

`NodeMultipartFile`

## Properties

### contentType

> `readonly` **contentType**: `string` \| `undefined`

Part `Content-Type` (`getContentType`), when declared by the client.

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`contentType`](../interfaces/MultipartFile.md#contenttype)

***

### name

> `readonly` **name**: `string`

The form field name (`getName`).

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`name`](../interfaces/MultipartFile.md#name)

***

### originalFilename

> `readonly` **originalFilename**: `string`

Client-supplied original filename (`getOriginalFilename`) — untrusted, never written to disk as-is.

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`originalFilename`](../interfaces/MultipartFile.md#originalfilename)

## Accessors

### size

#### Get Signature

> **get** **size**(): `number`

Size in bytes (`getSize`).

##### Returns

`number`

Size in bytes (`getSize`).

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`size`](../interfaces/MultipartFile.md#size)

## Methods

### bytes()

> **bytes**(): `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

All bytes (`getBytes`). Buffers temp files into memory.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`bytes`](../interfaces/MultipartFile.md#bytes)

***

### dispose()

> **dispose**(): `Promise`\<`void`\>

Release the temp file. Safe to call when no temp file exists.

#### Returns

`Promise`\<`void`\>

***

### isEmpty()

> **isEmpty**(): `boolean`

`true` when no bytes were received (`isEmpty`).

#### Returns

`boolean`

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`isEmpty`](../interfaces/MultipartFile.md#isempty)

***

### stream()

> **stream**(): `Readable`

Streaming read (`getInputStream`).

#### Returns

`Readable`

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`stream`](../interfaces/MultipartFile.md#stream)

***

### transferTo()

> **transferTo**(`dest`): `Promise`\<`void`\>

Copy the part to `dest` (`transferTo`). Creates parent directories.

#### Parameters

##### dest

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`MultipartFile`](../interfaces/MultipartFile.md).[`transferTo`](../interfaces/MultipartFile.md#transferto)
