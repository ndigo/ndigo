[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserModelValueMethodArgumentResolver

# Class: BrowserModelValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:87

Browser model argument resolver.

Resolves values from route data by:
1) direct key lookup (`profile`)
2) dotted key-path lookup (`profile.name`)

## Extends

- [`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new BrowserModelValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `BrowserModelValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:95

Creates a browser model resolver.

#### Parameters

##### converter?

[`ArgumentValueConverter`](../type-aliases/ArgumentValueConverter.md) = `identityArgumentValueConverter`

Default converter to apply to resolved values.

##### converterRegistry?

[`ArgumentValueConverterRegistry`](../type-aliases/ArgumentValueConverterRegistry.md) = `argumentValueConverters`

Named converter registry used for lookups.

##### converterResolutionOptions?

[`ConverterResolutionOptions`](../type-aliases/ConverterResolutionOptions.md) = `{}`

Resolution behavior overrides.

#### Returns

`BrowserModelValueMethodArgumentResolver`

#### Overrides

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`constructor`](AbstractModelValueMethodArgumentResolver.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:103

##### Returns

`string`

## Methods

### handleMissingValue()

> **handleMissingValue**(`name`): `void`

Defined in: packages/blue-dispatcher/lib/argument-resolver.d.ts:55

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

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractModelValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:44

Resolves and converts a model-backed argument value.

#### Parameters

##### parameter

`MethodParameter`

##### route

`Route`

##### mapping

`any`

#### Returns

`any`

#### Inherited from

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`resolveArgument`](AbstractModelValueMethodArgumentResolver.md#resolveargument)

***

### resolveName()

> `protected` **resolveName**(`name`, `parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:64

Resolves the raw value from route-scoped model data.

#### Parameters

##### name

`string`

##### parameter

`MethodParameter`

##### route

`Route`

##### mapping

`any`

#### Returns

`any`

#### Inherited from

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`resolveName`](AbstractModelValueMethodArgumentResolver.md#resolvename)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:75

Returns whether this resolver supports model parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Inherited from

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`supportsParameter`](AbstractModelValueMethodArgumentResolver.md#supportsparameter)

***

### resolveModelValue()

> `protected` **resolveModelValue**(`name`, `route`): `any`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:108

Resolves model data from the current route.

#### Parameters

##### name

`string`

##### route

`Route`

#### Returns

`any`

#### Overrides

[`AbstractModelValueMethodArgumentResolver`](AbstractModelValueMethodArgumentResolver.md).[`resolveModelValue`](AbstractModelValueMethodArgumentResolver.md#resolvemodelvalue)
