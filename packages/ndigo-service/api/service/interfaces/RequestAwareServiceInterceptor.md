[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service](../README.md) / RequestAwareServiceInterceptor

# Interface: RequestAwareServiceInterceptor

Service-level request interceptor.

Reuses the [RequestAwareHTTPInterceptor](#) contract.

## Extends

- [`RequestAwareHTTPInterceptor`](#)

## Methods

### preRequest()

> **preRequest**(`request`): `Promise`\<`void` \| `Request`\>

Runs before the request is sent.

#### Parameters

##### request

`Request`

The request to inspect or replace.

#### Returns

`Promise`\<`void` \| `Request`\>

A replacement request, or void to keep the original.

#### Overrides

`RequestAwareHTTPInterceptor.preRequest`
