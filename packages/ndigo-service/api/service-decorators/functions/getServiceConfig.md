[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-decorators](../README.md) / getServiceConfig

# Function: getServiceConfig()

> **getServiceConfig**(`target`): [`ServiceClientConfig`](../interfaces/ServiceClientConfig.md) \| `undefined`

Reads the service config recorded by `@service`.

## Parameters

### target

`object`

The decorated class/interface constructor.

## Returns

[`ServiceClientConfig`](../interfaces/ServiceClientConfig.md) \| `undefined`

The service configuration, or `undefined` when not decorated.

## Example

```ts
const config = getServiceConfig(AccountsApi); // { name: 'accounts', baseUrl: '…' }
```
