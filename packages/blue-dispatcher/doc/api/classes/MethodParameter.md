[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / MethodParameter

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

`string` \| `null`

##### convertType?

###### source

`unknown`

###### target

`unknown`

##### prefix?

`string` \| `null`

##### convert?

(`value`) => `unknown`

##### parameterName?

`string`

##### target?

() => `object`

##### schema?

`ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

#### Returns

`MethodParameter`

## Properties

### convert

> `readonly` **convert**: ((`value`) => `unknown`) \| `undefined`

Optional post-bind validator/converter applied to the resolved value.
Set by [validatedBy](../functions/validatedBy.md) (Zod-backed, AD-07).

***

### convertType

> `readonly` **convertType**: \{ `source`: `unknown`; `target`: `unknown`; \} \| `undefined`

***

### defaultValue

> `readonly` **defaultValue**: `string` \| `null`

***

### name

> `readonly` **name**: `string`

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

***

### required

> `readonly` **required**: `boolean`

***

### schema

> `readonly` **schema**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\> \| `undefined`

The Zod schema backing [MethodParameter.convert](#convert), when the
parameter was validated via `validatedBy` (AD-35). Generation-time
introspection seam for API docs; never used by resolution.

***

### target

> `readonly` **target**: (() => `object`) \| `undefined`

Optional target constructor for whole-source binding. When set, the
bound value is a real instance of the target (see
[ParameterExtractor.target](../type-aliases/ParameterExtractor.md#target) / `dataBinderValue(source, Target)`).

***

### type

> `readonly` **type**: [`MethodParameterType`](MethodParameterType.md)

## Methods

### toJSON()

> **toJSON**(): `JSONObject`

#### Returns

`JSONObject`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Implementation of

`Serializable.toString`
