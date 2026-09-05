[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ResponseParser

# Type Alias: ResponseParser\<T\>

> **ResponseParser**\<`T`\> = (`mediaType`) => (`response`) => `Promise`\<`T`\>

Defined in: [packages/blue-http/src/interceptors/response-type-interceptor.ts:14](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-type-interceptor.ts#lines-14)

Factory that produces a parser for a specific media type.

## Type Parameters

### T

`T` = `any`

## Parameters

### mediaType

`string`

## Returns

(`response`) => `Promise`\<`T`\>
