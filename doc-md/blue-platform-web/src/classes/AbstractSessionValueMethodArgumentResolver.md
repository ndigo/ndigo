[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / AbstractSessionValueMethodArgumentResolver

# Abstract Class: AbstractSessionValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:20

Abstract base class for resolving session-backed method arguments.

## Extends

- `AbstractNamedValueMethodArgumentResolver`

## Extended by

- [`BrowserSessionValueMethodArgumentResolver`](BrowserSessionValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractSessionValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `AbstractSessionValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:32

Creates a session-backed resolver.

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

`AbstractSessionValueMethodArgumentResolver`

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

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:44

Resolves and converts a session-backed argument value.

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

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:64

Resolves the raw value from `sessionStorage`.

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

### getSessionValue()

> `abstract` `protected` **getSessionValue**(`name`): `string`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:73

Retrieves a session value by name.

#### Parameters

##### name

`string`

#### Returns

`string`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:76

Returns whether this resolver supports session parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.supportsParameter`
