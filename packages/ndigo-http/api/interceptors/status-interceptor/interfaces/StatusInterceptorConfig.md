[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/status-interceptor](../README.md) / StatusInterceptorConfig

# Interface: StatusInterceptorConfig

Configuration options for the StatusInterceptor.

## Properties

### defaultStatus?

> `optional` **defaultStatus?**: `string`

The default status string to use when no mapping is found.

#### Default

```ts
'UNKNOWN'
```

***

### statusMappings?

> `optional` **statusMappings?**: `Record`\<`number`, `string`\>

A mapping of HTTP status codes to application-specific status strings.

#### Example

```ts
{ 200: 'SUCCESS', 404: 'NOT_FOUND', 500: 'SERVER_ERROR' }
```
