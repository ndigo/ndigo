[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-decorators](../README.md) / queryCall

# Function: queryCall()

> **queryCall**(`path`, `config?`): (`_target`, `context`) => `void`

Declares a QUERY service call (RFC 9889 — safe method with a body).

## Parameters

### path

`string`

### config?

`Omit`\<[`ServiceCallConfig`](../interfaces/ServiceCallConfig.md), `"method"` \| `"path"`\>

## Returns

(`_target`, `context`) => `void`
