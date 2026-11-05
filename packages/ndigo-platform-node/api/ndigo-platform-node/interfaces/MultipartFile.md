[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / MultipartFile

# Interface: MultipartFile

A single part of a `multipart/form-data` request — an uploaded file.

The shape mirrors the stable subset of the reference framework's `MultipartFile` that Ndigo
needs (`getName`, `getOriginalFilename`, `getSize`, `isEmpty`, `getBytes`,
`getInputStream`, `transferTo`). A part is backed either by an in-memory
buffer (small uploads) or a temp file (large uploads streamed above the
threshold); both are served through the same interface.

## Properties

### contentType?

> `readonly` `optional` **contentType?**: `string`

Part `Content-Type` (`getContentType`), when declared by the client.

***

### name

> `readonly` **name**: `string`

The form field name (`getName`).

***

### originalFilename

> `readonly` **originalFilename**: `string`

Client-supplied original filename (`getOriginalFilename`) — untrusted, never written to disk as-is.

***

### size

> `readonly` **size**: `number`

Size in bytes (`getSize`).

## Methods

### bytes()

> **bytes**(): `Uint8Array`\<`ArrayBufferLike`\> \| `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

All bytes (`getBytes`). Buffers temp files into memory.

#### Returns

`Uint8Array`\<`ArrayBufferLike`\> \| `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

***

### isEmpty()

> **isEmpty**(): `boolean`

`true` when no bytes were received (`isEmpty`).

#### Returns

`boolean`

***

### stream()

> **stream**(): `Readable`

Streaming read (`getInputStream`).

#### Returns

`Readable`

***

### transferTo()

> **transferTo**(`dest`): `Promise`\<`void`\>

Copy the part to `dest` (`transferTo`). Creates parent directories.

#### Parameters

##### dest

`string`

#### Returns

`Promise`\<`void`\>
