[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / queryMapping

# Function: queryMapping()

> **queryMapping**(`route`): (`target`, `context`) => `any`

Defined in: [packages/blue-dispatcher/src/http-method-mapping.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/http-method-mapping.ts#lines-64)

A request mapping with the HTTP method fixed to `'QUERY'` (RFC 9889 —
safe method with a body, used for resource queries).

## Parameters

### route

`string` \| `Omit`\<[`RequestMappingConfiguration`](../interfaces/RequestMappingConfiguration.md), `"method"`\>

## Returns

(`target`, `context`) => `any`
