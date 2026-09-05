[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / denialOf

# Function: denialOf()

> **denialOf**(`statusCode`, `options?`): [`InterceptorDenial`](../interfaces/InterceptorDenial.md)

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-48)

Creates an explicit [InterceptorDenial](../interfaces/InterceptorDenial.md).

## Parameters

### statusCode

`number`

HTTP status for the finalized denial (`401`/`403`).

### options?

Body and redirect for the denial outcome.

#### body?

`Record`\<`string`, `unknown`\>

#### redirect?

`string`

## Returns

[`InterceptorDenial`](../interfaces/InterceptorDenial.md)
