[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / MethodParameter

# Class: MethodParameter

Method parameter metadata

## Implements

- `Serializable`

## Constructors

### Constructor

> **new MethodParameter**(`type`, `name`, `required?`, `defaultValue?`, `convertType?`, `prefix?`, `convert?`, `parameterName?`, `target?`, `schema?`): `MethodParameter`

#### Parameters

##### type

[`MethodParameterType`](MethodParameterType.md)

##### name

`string`

##### required?

`boolean` = `false`

##### defaultValue?

`string` \| `null` = `null`

##### convertType?

###### source

`unknown`

###### target

`unknown`

##### prefix?

`string` \| `null` = `null`

##### convert?

(`value`) => `unknown`

##### parameterName?

`string`

##### target?

new () => `object`

##### schema?

`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Returns

`MethodParameter`

## Properties

### convert

> `readonly` **convert**: ((`value`) => `unknown`) \| `undefined`

Optional post-bind validator/converter applied to the resolved value.
Set by [validatedBy](../../zod-validated-by/functions/validatedBy.md) (Zod-backed, AD-07).

***

### convertType

> `readonly` **convertType**: \{ `source`: `unknown`; `target`: `unknown`; \} \| `undefined`

The type-based conversion pair.

***

### defaultValue

> `readonly` **defaultValue**: `string` \| `null`

Value used when the parameter is absent.

***

### name

> `readonly` **name**: `string`

The extractor's source name.

***

### parameterName

> `readonly` **parameterName**: `string`

The `@parameters` map key this parameter was declared under. For HTTP
and browser mappings this equals the method-argument name (and usually
the extractor name); for socket mappings it is the `session.params`
key, which may differ from the extractor's source name (e.g.
`via: headerValue('x-via')` → `parameterName: 'via'`,
`name: 'x-via'`).

***

### prefix

> `readonly` **prefix**: `string` \| `null`

Optional source-name prefix.

***

### required

> `readonly` **required**: `boolean`

Whether the parameter is required.

***

### schema

> `readonly` **schema**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> \| `undefined`

The Zod schema backing [MethodParameter.convert](#convert), when the
parameter was validated via `validatedBy` (AD-35). Generation-time
introspection seam for API docs; never used by resolution.

***

### target

> `readonly` **target**: (new () => `object`) \| `undefined`

Optional target constructor for whole-source binding. When set, the
bound value is a real instance of the target (see
[ParameterExtractor.target](../type-aliases/ParameterExtractor.md#target) / `dataBinderValue(source, Target)`).

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

The parameter type.

## Methods

### toJSON()

> **toJSON**(): `JSONObject`

Serializes the parameter metadata.

#### Returns

`JSONObject`

The JSON representation.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns the parameter name.

#### Returns

`string`

The parameter name.

#### Implementation of

`Serializable.toString`
