[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HandlerMethodArgumentResolver

# Interface: HandlerMethodArgumentResolver

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:10

## Methods

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:11

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

#### Returns

`boolean`

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:12

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

##### route

[`Route`](../../../blue-router/src/interfaces/Route.md)

##### mapping

`any`

#### Returns

`any`
