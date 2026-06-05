[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AbstractNamedValueMethodArgumentResolver

# Abstract Class: AbstractNamedValueMethodArgumentResolver

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:51

Abstract base class for resolving method arguments from a named value.

Subclasses define how to:
* Obtain named value information for a method parameter
* Resolve names into argument values
* Handle missing argument values when argument values are required
* Optionally handle a resolved value

A Factory must be supplied to the class constructor.

## Extended by

- [`MatrixValueMethodArgumentResolver`](MatrixValueMethodArgumentResolver.md)
- [`QueryValueMethodArgumentResolver`](QueryValueMethodArgumentResolver.md)
- [`PathValueMethodArgumentResolver`](PathValueMethodArgumentResolver.md)
- [`AttributeValueMethodArgumentResolver`](AttributeValueMethodArgumentResolver.md)

## Implements

- [`HandlerMethodArgumentResolver`](../interfaces/HandlerMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractNamedValueMethodArgumentResolver**(`factory?`): `AbstractNamedValueMethodArgumentResolver`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:58

Creates an instance of AbstractNamedValueMethodArgumentResolver.

#### Parameters

##### factory?

`Factory`

A factory for resolving values.

#### Returns

`AbstractNamedValueMethodArgumentResolver`

## Methods

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:67

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

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:78

Resolves a method parameter into an argument value from a given route.

#### Parameters

##### parameter

[`MethodParameter`](MethodParameter.md)

The method parameter to resolve.

##### route

`Route`

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

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:87

#### Parameters

##### name

`string`

##### parameter

[`MethodParameter`](MethodParameter.md)

##### route

`Route`

##### mapping

`any`

#### Returns

`any`

***

### supportsParameter()

> `abstract` **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:94

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
