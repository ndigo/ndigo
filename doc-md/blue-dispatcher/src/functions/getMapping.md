[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / getMapping

# Function: getMapping()

> **getMapping**(`route`): (`target`, `context`) => `any`

Defined in: packages/blue-dispatcher/src/http-method-mapping.ts:18

A request mapping with the HTTP method fixed to `'GET'`.

## Parameters

### route

`string` \| `Omit`\<[`RequestMappingConfiguration`](../interfaces/RequestMappingConfiguration.md), `"method"`\>

The route path or mapping configuration (method is overridden).

## Returns

A decorator function for the target.

(`target`, `context`) => `any`
