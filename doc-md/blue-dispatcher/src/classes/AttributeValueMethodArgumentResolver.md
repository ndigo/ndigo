[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / AttributeValueMethodArgumentResolver

# Class: AttributeValueMethodArgumentResolver

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:174

Resolves method arguments from request attributes.

## Extends

- [`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AttributeValueMethodArgumentResolver**(`factory?`): `AttributeValueMethodArgumentResolver`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:58

Creates an instance of AbstractNamedValueMethodArgumentResolver.

#### Parameters

##### factory?

`Factory`

A factory for resolving values.

#### Returns

`AttributeValueMethodArgumentResolver`

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`constructor`](AbstractNamedValueMethodArgumentResolver.md#constructor)

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

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractNamedValueMethodArgumentResolver.md#handlemissingvalue)

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

#### Inherited from

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveArgument`](AbstractNamedValueMethodArgumentResolver.md#resolveargument)

***

### resolveName()

> `protected` **resolveName**(`name`, `parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:175

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

#### Overrides

[`AbstractNamedValueMethodArgumentResolver`](AbstractNamedValueMethodArgumentResolver.md).[`resolveName`](AbstractNamedValueMethodArgumentResolver.md#resolvename)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-dispatcher/src/argument-resolver.ts:184

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
