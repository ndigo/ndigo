[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserStateValueMethodArgumentResolver

# Class: BrowserStateValueMethodArgumentResolver

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:20

Browser history state argument resolver.

## Extends

- `AbstractPlatformArgumentResolver`

## Constructors

### Constructor

> **new BrowserStateValueMethodArgumentResolver**(): `BrowserStateValueMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:21

#### Returns

`BrowserStateValueMethodArgumentResolver`

#### Overrides

`AbstractPlatformArgumentResolver.constructor`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:25

##### Returns

`string`

## Methods

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-dispatcher/lib/abstract-platform-resolver.d.ts:41

Resolves and converts a method argument value.

Pipeline: resolveName → defaultValue fallback → convertType lookup → conversion → nil check.

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

`AbstractPlatformArgumentResolver.resolveArgument`

***

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

`AbstractPlatformArgumentResolver.handleMissingValue`

***

### resolveName()

> `protected` **resolveName**(`name`, `_parameter`, `_route`, `_mapping`): `any`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:30

Retrieves a value from `history.state` if it exists.

#### Parameters

##### name

`string`

##### \_parameter

`MethodParameter`

##### \_route

`Route`

##### \_mapping

`any`

#### Returns

`any`

#### Overrides

`AbstractPlatformArgumentResolver.resolveName`

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/state-argument-resolver.ts:36

Returns whether this resolver supports history-state parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Overrides

`AbstractPlatformArgumentResolver.supportsParameter`
