[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserCookieValueMethodArgumentResolver

# Class: BrowserCookieValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:85

Browser cookie argument resolver using `document.cookie` parsing.

## Extends

- [`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new BrowserCookieValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `BrowserCookieValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:93

Creates a browser cookie resolver.

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

`BrowserCookieValueMethodArgumentResolver`

#### Overrides

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`constructor`](AbstractCookieValueMethodArgumentResolver.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:101

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

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractCookieValueMethodArgumentResolver.md#handlemissingvalue)

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

#### Inherited from

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`resolveArgument`](AbstractCookieValueMethodArgumentResolver.md#resolveargument)

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

#### Inherited from

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`resolveName`](AbstractCookieValueMethodArgumentResolver.md#resolvename)

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

#### Inherited from

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`supportsParameter`](AbstractCookieValueMethodArgumentResolver.md#supportsparameter)

***

### getCookieValue()

> `protected` **getCookieValue**(`name`): `string`

Defined in: packages/blue-platform-web/src/cookie-argument-resolver.ts:106

Retrieves a raw cookie string from `document.cookie`.

#### Parameters

##### name

`string`

#### Returns

`string`

#### Overrides

[`AbstractCookieValueMethodArgumentResolver`](AbstractCookieValueMethodArgumentResolver.md).[`getCookieValue`](AbstractCookieValueMethodArgumentResolver.md#getcookievalue)
