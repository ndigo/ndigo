[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / RouteHandlerMapping

# Interface: RouteHandlerMapping

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-26)

Resolves a route to a handler execution chain.

## Extended by

- [`MatchableHandlerMapping`](MatchableHandlerMapping.md)

## Methods

### getHandler()

> **getHandler**(`route`): `RouteHandlerExecutionChain` \| `null`

Defined in: [packages/blue-dispatcher/src/abstract-handler-mapping.ts:33](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-handler-mapping.ts#lines-33)

Resolve the handler for a route.

#### Parameters

##### route

[`Route`](#)

The current route.

#### Returns

`RouteHandlerExecutionChain` \| `null`

The execution chain for the chosen handler, or `null`.
