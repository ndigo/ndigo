[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserStateValueMethodArgumentResolver

# Class: BrowserStateValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:84

Browser history state argument resolver.

## Extends

- [`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md)

## Constructors

### Constructor

> **new BrowserStateValueMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `BrowserStateValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:92

Creates a browser state resolver.

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

`BrowserStateValueMethodArgumentResolver`

#### Overrides

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`constructor`](AbstractStateValueMethodArgumentResolver.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:100

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

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`handleMissingValue`](AbstractStateValueMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:44

Resolves and converts a history-state-backed argument value.

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

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`resolveArgument`](AbstractStateValueMethodArgumentResolver.md#resolveargument)

***

### resolveName()

> `protected` **resolveName**(`name`, `parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:64

Resolves the raw value from `history.state`.

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

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`resolveName`](AbstractStateValueMethodArgumentResolver.md#resolvename)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:76

Returns whether this resolver supports history-state parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Inherited from

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`supportsParameter`](AbstractStateValueMethodArgumentResolver.md#supportsparameter)

***

### getStateValue()

> `protected` **getStateValue**(`name`): `any`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:105

Retrieves a value from `history.state` if it exists.

#### Parameters

##### name

`string`

#### Returns

`any`

#### Overrides

[`AbstractStateValueMethodArgumentResolver`](AbstractStateValueMethodArgumentResolver.md).[`getStateValue`](AbstractStateValueMethodArgumentResolver.md#getstatevalue)
