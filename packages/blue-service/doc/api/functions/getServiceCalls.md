[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / getServiceCalls

# Function: getServiceCalls()

> **getServiceCalls**(`target`): `Record`\<`string`, [`ServiceCallConfig`](../interfaces/ServiceCallConfig.md)\>

Reads the call configs recorded by `@*Call`.

## Parameters

### target

`object`

The decorated class/interface constructor.

## Returns

`Record`\<`string`, [`ServiceCallConfig`](../interfaces/ServiceCallConfig.md)\>

A map of method name → call config, or an empty record.
