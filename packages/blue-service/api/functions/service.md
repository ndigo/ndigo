[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / service

# Function: service()

> **service**(`name`, `config`): \<`T`\>(`target`, `context`) => `T`

`@service(name, config)` — class decorator declaring a named service client.

## Parameters

### name

`string`

The service name (registry token / correlation tag).

### config

`Omit`\<[`ServiceClientConfig`](../interfaces/ServiceClientConfig.md), `"name"`\>

Service configuration (base URL, timeouts, headers).

## Returns

A class decorator.

\<`T`\>(`target`, `context`) => `T`

## Example

```ts
@service('accounts', { baseUrl: 'https://api.example.com' })
class AccountsAPI {
    @getCall('/{id}') getById(id: number) { return undefined as unknown; }
}
```
