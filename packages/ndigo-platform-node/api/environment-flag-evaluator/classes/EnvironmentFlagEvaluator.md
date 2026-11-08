[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [environment-flag-evaluator](../README.md) / EnvironmentFlagEvaluator

# Class: EnvironmentFlagEvaluator

Environment-backed flag evaluator: flags resolve from `feature.*`
properties (default provider namespace), read immediately.

## Extends

- `ApplicationContextAware` & `Null`\<`this`\>

## Implements

- `FlagEvaluator`

## Constructors

### Constructor

> **new EnvironmentFlagEvaluator**(): `EnvironmentFlagEvaluator`

#### Returns

`EnvironmentFlagEvaluator`

#### Overrides

`AsApplicationContextAware(Null).constructor`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`AsApplicationContextAware(Null).[$aware]`

***

### applicationContext

> `readonly` **applicationContext**: `ApplicationContext`

The owning application context (container-injected).

## Accessors

### kind

#### Get Signature

> **get** **kind**(): `string`

Backend identifier — `'property'` (the local provider's kind).

##### Returns

`string`

#### Implementation of

`FlagEvaluator.kind`

## Methods

### evaluate()

> **evaluate**\<`T`\>(`flag`, `defaultValue`, `ctx?`): `Promise`\<`FlagEvaluation`\<`T`\>\>

Evaluates `flag` against the current environment state. Never
throws: an absent provider environment or a failing read resolves
as `ERROR`/`DEFAULT` with the supplied default.

#### Type Parameters

##### T

`T` *extends* `FlagValue`

#### Parameters

##### flag

`string`

The flag key.

##### defaultValue

`T`

The value returned when the flag is absent or fails.

##### ctx?

`FlagEvaluationContext`

Optional evaluation context.

#### Returns

`Promise`\<`FlagEvaluation`\<`T`\>\>

The evaluation result.

#### Implementation of

`FlagEvaluator.evaluate`

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Set the ApplicationContext that this object runs in. Normally this call will be used to initialize the object.

Invoked after population of normal value properties but before an `init` callback.

#### Parameters

##### applicationContext

`ApplicationContext`

The ApplicationContext to be used by this object.

#### Returns

`void`

#### Inherited from

`AsApplicationContextAware(Null).setApplicationContext`
