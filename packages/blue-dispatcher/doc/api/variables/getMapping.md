[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / getMapping

# Variable: getMapping

> `const` **getMapping**: (`route`) => (`target`, `context`) => `void`

A request mapping with the HTTP method fixed to `'GET'`.

## Parameters

### route

`string` \| `Omit`\<[`RequestMappingConfiguration`](../interfaces/RequestMappingConfiguration.md), `"method"`\>

The route path or mapping configuration (method is overridden).

## Returns

A method-only decorator.

(`target`, `context`) => `void`
