[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / AbstractModelValueMethodArgumentResolver

# Abstract Class: AbstractModelValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:20

Abstract base class for resolving model-backed method arguments.

## Extends

- `AbstractNamedValueMethodArgumentResolver`

## Extended by

- [`BrowserModelValueMethodArgumentResolver`](BrowserModelValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractModelValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `AbstractModelValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:32

Creates a model-backed resolver.

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

`AbstractModelValueMethodArgumentResolver`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.constructor`

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

`AbstractNamedValueMethodArgumentResolver.handleMissingValue`

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

#### Overrides

`AbstractNamedValueMethodArgumentResolver.resolveArgument`

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

#### Overrides

`AbstractNamedValueMethodArgumentResolver.resolveName`

***

### resolveModelValue()

> `abstract` `protected` **resolveModelValue**(`name`, `route`): `any`

Defined in: packages/blue-platform-web/src/model-argument-resolver.ts:72

Retrieves a raw model value by name.

#### Parameters

##### name

`string`

##### route

`Route`

#### Returns

`any`

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

#### Overrides

`AbstractNamedValueMethodArgumentResolver.supportsParameter`
