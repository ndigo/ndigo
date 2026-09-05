[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / InterceptorDenial

# Interface: InterceptorDenial

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-22)

The outcome of a denied `preHandle`. `statusCode` is the HTTP status the
platform adapter finalizes; `body` is a JSON-safe payload (never internal
detail); `redirect` optionally names a client-side redirect target.

## Properties

### statusCode?

> `readonly` `optional` **statusCode?**: `number`

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:24](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-24)

HTTP status code for the finalized denial response (default `403`).

***

### body?

> `readonly` `optional` **body?**: `Record`\<`string`, `unknown`\>

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-26)

JSON-safe response body. Callers receive only this — never stack traces.

***

### redirect?

> `readonly` `optional` **redirect?**: `string`

Defined in: [packages/blue-dispatcher/src/route-handler-denial.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-handler-denial.ts#lines-28)

Optional redirect target for browser denials.
