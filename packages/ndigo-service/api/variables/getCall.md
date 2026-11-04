[**@ndigo/service v0.0.1**](../README.md)

***

[@ndigo/service](../README.md) / getCall

# Variable: getCall

> `const` **getCall**: (`path`, `config?`) => (`_target`, `context`) => `void`

Declares a GET service call.

## Parameters

### path

`string`

Path template relative to the service base URL (`:id` slots filled from args).

### config?

`Omit`\<[`ServiceCallConfig`](../interfaces/ServiceCallConfig.md), `"method"` \| `"path"`\>

Optional call config (response Zod schema).

## Returns

(`_target`, `context`) => `void`
