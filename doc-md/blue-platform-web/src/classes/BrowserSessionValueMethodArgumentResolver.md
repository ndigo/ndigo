[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserSessionValueMethodArgumentResolver

# Class: BrowserSessionValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:84

Browser session argument resolver using `sessionStorage`.

## Extends

- [`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new BrowserSessionValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `BrowserSessionValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:92

Creates a browser session resolver.

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

`BrowserSessionValueMethodArgumentResolver`

#### Overrides

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`constructor`](AbstractSessionValueMethodArgumentResolver.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:100

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

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractSessionValueMethodArgumentResolver.md#handlemissingvalue)

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

#### Inherited from

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`resolveArgument`](AbstractSessionValueMethodArgumentResolver.md#resolveargument)

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

#### Inherited from

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`resolveName`](AbstractSessionValueMethodArgumentResolver.md#resolvename)

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

#### Inherited from

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`supportsParameter`](AbstractSessionValueMethodArgumentResolver.md#supportsparameter)

***

### getSessionValue()

> `protected` **getSessionValue**(`name`): `string`

Defined in: packages/blue-platform-web/src/session-argument-resolver.ts:105

Retrieves a value from `sessionStorage` if available.

#### Parameters

##### name

`string`

#### Returns

`string`

#### Overrides

[`AbstractSessionValueMethodArgumentResolver`](AbstractSessionValueMethodArgumentResolver.md).[`getSessionValue`](AbstractSessionValueMethodArgumentResolver.md#getsessionvalue)
