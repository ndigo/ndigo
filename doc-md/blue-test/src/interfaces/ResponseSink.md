[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / ResponseSink

# Interface: ResponseSink

Defined in: [packages/blue-test/src/memory-response.ts:34](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-response.ts#lines-34)

The minimal `ServerResponse`-shaped sink the pipeline writes to. Only the
members `HTTPResponseViewTarget` / `ResponseEntityView` touch are present.

## Properties

### headersSent

> `readonly` **headersSent**: `boolean`

Defined in: [packages/blue-test/src/memory-response.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-response.ts#lines-36)

Whether the response head has been written.

## Methods

### writeHead()

> **writeHead**(`status`, `headers?`): `void`

Defined in: [packages/blue-test/src/memory-response.ts:38](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-response.ts#lines-38)

Record the status and headers.

#### Parameters

##### status

`number`

##### headers?

`Record`\<`string`, `string`\>

#### Returns

`void`

***

### end()

> **end**(`body?`): `void`

Defined in: [packages/blue-test/src/memory-response.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-test/src/memory-response.ts#lines-40)

Finalize the response with the given body.

#### Parameters

##### body?

`unknown`

#### Returns

`void`
