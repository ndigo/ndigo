[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / MatrixValueMethodArgumentResolver

# Class: MatrixValueMethodArgumentResolver

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-89)

Resolves method arguments from matrix variables in the URL path.

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new MatrixValueMethodArgumentResolver**(): `MatrixValueMethodArgumentResolver`

#### Returns

`MatrixValueMethodArgumentResolver`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

## Methods

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

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-65)

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

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

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

***

### resolveName()

> `protected` **resolveName**(`name`, `parameter`, `route`, `mapping`): `any`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:90](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-90)

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

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveName`](AbstractNamedValueMethodArgumentResolver.md#resolvename)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:119](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-119)

Whether the given method parameter is supported by this resolver.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter to check.

#### Returns

`boolean`

Whether or not the given method parameter is supported by this resolver.

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`supportsParameter`](AbstractNamedValueMethodArgumentResolver.md#supportsparameter)
