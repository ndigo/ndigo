[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-web/src](../README.md) / BrowserBindMethodArgumentResolver

# Class: BrowserBindMethodArgumentResolver

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:114

Browser-specific bind resolver.

## Extends

- [`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md)

## Constructors

### Constructor

> **new BrowserBindMethodArgumentResolver**(`converter?`, `converterRegistry?`, `converterResolutionOptions?`): `BrowserBindMethodArgumentResolver`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:34

Creates a bind-backed resolver.

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

`BrowserBindMethodArgumentResolver`

#### Inherited from

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`constructor`](AbstractBindMethodArgumentResolver.md#constructor)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:122

Resolves browser-backed bind data from the current route, state, session, or cookies.

##### Returns

`string`

The resolved source data map.

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

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`handleMissingValue`](AbstractBindMethodArgumentResolver.md#handlemissingvalue)

***

### resolveArgument()

> **resolveArgument**(`parameter`, `route`, `mapping`): `any`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:46

Resolves and converts a bind-backed argument value.

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

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`resolveArgument`](AbstractBindMethodArgumentResolver.md#resolveargument)

***

### filterByPrefix()

> `protected` **filterByPrefix**(`data`, `prefix`): `Record`\<`string`, `any`\>

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:83

Removes a prefix from keys before binding nested values.

#### Parameters

##### data

`Record`\<`string`, `any`\>

##### prefix

`string`

#### Returns

`Record`\<`string`, `any`\>

#### Inherited from

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`filterByPrefix`](AbstractBindMethodArgumentResolver.md#filterbyprefix)

***

### supportsParameter()

> **supportsParameter**(`parameter`): `boolean`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:101

Returns whether this resolver supports bind parameters.

#### Parameters

##### parameter

`MethodParameter`

#### Returns

`boolean`

#### Inherited from

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`supportsParameter`](AbstractBindMethodArgumentResolver.md#supportsparameter)

***

### resolveName()

> `protected` **resolveName**(): `any`

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:106

Resolves the source name from the parameter metadata.

#### Returns

`any`

#### Inherited from

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`resolveName`](AbstractBindMethodArgumentResolver.md#resolvename)

***

### getSourceData()

> `protected` **getSourceData**(`source`, `route`): `Record`\<`string`, `any`\>

Defined in: packages/blue-platform-web/src/bind-argument-resolver.ts:127

Retrieves the browser data source identified by [source](#getsourcedata).

#### Parameters

##### source

`string`

##### route

`Route`

#### Returns

`Record`\<`string`, `any`\>

#### Overrides

[`AbstractBindMethodArgumentResolver`](AbstractBindMethodArgumentResolver.md).[`getSourceData`](AbstractBindMethodArgumentResolver.md#getsourcedata)
