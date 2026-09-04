[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / StatusInterceptorConfig

# Interface: StatusInterceptorConfig

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:10

Configuration options for the StatusInterceptor.

## Properties

### statusMappings?

> `optional` **statusMappings?**: `Record`\<`number`, `string`\>

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:15

A mapping of HTTP status codes to application-specific status strings.

#### Example

```ts
{ 200: 'SUCCESS', 404: 'NOT_FOUND', 500: 'SERVER_ERROR' }
```

***

### defaultStatus?

> `optional` **defaultStatus?**: `string`

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:20

The default status string to use when no mapping is found.

#### Default

```ts
'UNKNOWN'
```
