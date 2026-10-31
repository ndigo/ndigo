[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / postCall

# Variable: postCall

> `const` **postCall**: (`path`, `config?`) => (`_target`, `context`) => `void`

Declares a POST service call.

## Parameters

### path

`string`

Path template relative to the service base URL.

### config?

`Omit`\<[`ServiceCallConfig`](../interfaces/ServiceCallConfig.md), `"method"` \| `"path"`\>

Optional call config (response Zod schema).

## Returns

(`_target`, `context`) => `void`
