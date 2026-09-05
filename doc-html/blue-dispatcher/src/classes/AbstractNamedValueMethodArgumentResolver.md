[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractNamedValueMethodArgumentResolver

# Abstract Class: AbstractNamedValueMethodArgumentResolver

Defined in: [packages/blue-dispatcher/src/argument-resolver.ts:48](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/argument-resolver.ts#lines-48)

Abstract base class for resolving method arguments from a named value.

Subclasses define how to:
* Obtain named value information for a method parameter
* Resolve names into argument values
* Handle missing argument values when argument values are required
* Optionally handle a resolved value

## Extended by

- [`MatrixValueMethodArgumentResolver`](MatrixValueMethodArgumentResolver.md)
- [`QueryValueMethodArgumentResolver`](QueryValueMethodArgumentResolver.md)
- [`PathValueMethodArgumentResolver`](PathValueMethodArgumentResolver.md)
- [`AttributeValueMethodArgumentResolver`](AttributeValueMethodArgumentResolver.md)
- [`AbstractPlatformArgumentResolver`](AbstractPlatformArgumentResolver.md)

## Implements

- [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractNamedValueMethodArgumentResolver**(): `AbstractNamedValueMethodArgumentResolver`

#### Returns

`AbstractNamedValueMethodArgumentResolver`

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

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`resolveArgument`](../interfaces/HandlerMethodArgumentResolver.md#resolveargument)

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

#### Implementation of

[`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md).[`supportsParameter`](../interfaces/HandlerMethodArgumentResolver.md#supportsparameter)
