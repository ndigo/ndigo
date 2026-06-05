[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / AbstractCookieValueMethodArgumentResolver

# Abstract Class: AbstractCookieValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:21

Abstract base class for resolving cookie-backed method arguments.

## Extends

- `AbstractNamedValueMethodArgumentResolver`

## Extended by

- [`BrowserCookieValueMethodArgumentResolver`](BrowserCookieValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new AbstractCookieValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `AbstractCookieValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:33

Creates a cookie-backed resolver.

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

`AbstractCookieValueMethodArgumentResolver`

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

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:45

Resolves and converts a cookie-backed argument value.

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

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:65

Resolves the raw cookie value for the requested name.

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

### getCookieValue()

> `abstract` `protected` **getCookieValue**(`name`): `string`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:74

Retrieves a cookie value by name.

#### Parameters

##### name

`string`

#### Returns

`string`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:77

Returns whether this resolver supports cookie parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractNamedValueMethodArgumentResolver.supportsParameter`
