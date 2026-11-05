[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-decorators](../README.md) / ServiceClientConfig

# Interface: ServiceClientConfig

Configuration for a `@service`-decorated client.

## Properties

### baseUrl

> **baseUrl**: `string`

Base URL all calls resolve against.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Optional default headers applied to every call.

***

### name

> **name**: `string`

The service name — the registry token / correlation tag.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Optional timeout in ms applied to every call.
