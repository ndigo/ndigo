[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [multipart-file](../README.md) / MultipartContext

# Interface: MultipartContext

A parsed `multipart/form-data` request, stored on [NodeRequest.multipart](../../node-request/interfaces/NodeRequest.md#multipart).
Populated by the adapter before dispatch so argument resolvers can read it.

## Properties

### fields

> `readonly` **fields**: `Record`\<`string`, `string` \| `string`[]\>

Text fields keyed by form field name; repeated names collapse to an array.

***

### files

> `readonly` **files**: `Map`\<`string`, [`MultipartFile`](MultipartFile.md)[]\>

Uploaded file parts grouped by form field name.

## Methods

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Dispose any on-disk temp parts created during parsing. Idempotent and
never throws — called by the framework request lifecycle once the
request dispatch has finished (success or error), and by the parser
itself on the overflow-abort path.

#### Returns

`Promise`\<`void`\>
