[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [http-method-mapping](../README.md) / queryMapping

# Variable: queryMapping

> `const` **queryMapping**: (`route`) => (`target`, `context`) => `void`

A request mapping with the HTTP method fixed to `'QUERY'` (RFC 9889 —
safe method with a body, used for resource queries).

## Parameters

### route

`string` \| `Omit`\<[`RequestMappingConfiguration`](../../request-mapping/interfaces/RequestMappingConfiguration.md), `"method"`\>

## Returns

(`target`, `context`) => `void`
