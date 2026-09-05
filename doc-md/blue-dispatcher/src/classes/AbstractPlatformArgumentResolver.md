[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractPlatformArgumentResolver

# Abstract Class: AbstractPlatformArgumentResolver

Defined in: [packages/blue-dispatcher/src/abstract-platform-resolver.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-platform-resolver.ts#lines-37)

Shared base class for platform argument resolvers.

Eliminates the 11 copies of the `resolveArgument` converter pipeline
that were previously duplicated across `@blue/platform-web` and
`@blue/platform-node`.

Subclasses only need to implement:
- `resolveName()` — where to fetch the raw value
- `supportsParameter()` — which `MethodParameterType` to match

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractPlatformArgumentResolver**(`convertFn`): `AbstractPlatformArgumentResolver`

Defined in: [packages/blue-dispatcher/src/abstract-platform-resolver.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-platform-resolver.ts#lines-45)

Creates a platform argument resolver.

#### Parameters

##### convertFn

[`ConvertArgumentValueFn`](../type-aliases/ConvertArgumentValueFn.md)

Platform-specific `convertArgumentValue` function.

#### Returns

`AbstractPlatformArgumentResolver`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

## Methods

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-dispatcher/src/abstract-platform-resolver.ts:55](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/abstract-platform-resolver.ts#lines-55)

Resolves and converts a method argument value.

Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → nil check.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

[`Route`](#)

##### mapping

`any`

#### Returns

`any`

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

***

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-54)

Handles a missing argument value by throwing a TypeError.

#### Parameters

##### name

`string`

The name of the missing argument.

#### Returns

`void`

#### Throws

If the argument is undefined or null.

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveName()

> `abstract` `protected` **resolveName**(`name`, `parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:76](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-76)

#### Parameters

##### name

`string`

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

[`Route`](#)

##### mapping

`any`

#### Returns

`any`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveName`](AbstractNamedValueMethodArgumentResolver.md#resolvename)

***

### supportsParameter()

> `abstract` **supportsParameter**(`parameter`): `boolean`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:83](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-83)

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
