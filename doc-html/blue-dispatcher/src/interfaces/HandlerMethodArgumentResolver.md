[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / HandlerMethodArgumentResolver

# Interface: HandlerMethodArgumentResolver

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-12)

Strategy interface for resolving method parameters into argument values in the context of a given route.

## Methods

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-18)

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-26)

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](../classes/MethodParameter.md)

The method parameter to resolve.

##### route

[`Route`](#)

The current route.

##### mapping

`any`

The route handler mapping.

#### Returns

`any`

The resolved argument value, or `null` if not resolvable.
