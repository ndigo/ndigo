[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / CountedInstrumentation

# Class: CountedInstrumentation

Defined in: packages/blue-telemetry/src/instrumentation/counted.ts:13

An OpenTelemetry instrumentation that automatically wraps methods decorated with `@counted`.

This instrumentation discovers decorated methods via the `CountedRegistry` and
applies the counting logic using the instrumentation's patching mechanism.

## Extends

- [`BaseBlueInstrumentation`](BaseBlueInstrumentation.md)

## Constructors

### Constructor

> **new CountedInstrumentation**(): `CountedInstrumentation`

Defined in: packages/blue-telemetry/src/instrumentation/counted.ts:14

#### Returns

`CountedInstrumentation`

#### Overrides

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`constructor`](BaseBlueInstrumentation.md#constructor)

## Methods

### init()

> `protected` **init**(): `any`[]

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:64

#### Returns

`any`[]

#### Inherit Doc

#### Inherited from

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`init`](BaseBlueInstrumentation.md#init)

***

### \_patchCount()

> `protected` **\_patchCount**(`config`): (`original`) => (`this`, ...`args`) => `any`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:77

Returns a synchronous patch function that increments a counter.

#### Parameters

##### config

[`CountConfig`](../interfaces/CountConfig.md)

#### Returns

(`original`) => (`this`, ...`args`) => `any`

#### Inherited from

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`_patchCount`](BaseBlueInstrumentation.md#_patchcount)

***

### \_patchSync()

> `protected` **\_patchSync**(`config`): (`original`) => (`this`, ...`args`) => `any`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:93

Returns a synchronous patch function that wraps the original method
in a span with the given configuration.

#### Parameters

##### config

[`SpanConfig`](../interfaces/SpanConfig.md)

#### Returns

(`original`) => (`this`, ...`args`) => `any`

#### Inherited from

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`_patchSync`](BaseBlueInstrumentation.md#_patchsync)

***

### \_patchAsync()

> `protected` **\_patchAsync**(`config`): (`original`) => (`this`, ...`args`) => `Promise`\<`any`\>

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:119

Returns an asynchronous patch function that wraps the original method
in an active span with the given configuration.

#### Parameters

##### config

[`SpanConfig`](../interfaces/SpanConfig.md)

#### Returns

(`original`) => (`this`, ...`args`) => `Promise`\<`any`\>

#### Inherited from

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`_patchAsync`](BaseBlueInstrumentation.md#_patchasync)

***

### enable()

> **enable**(): `void`

Defined in: packages/blue-telemetry/src/instrumentation/counted.ts:18

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`enable`](BaseBlueInstrumentation.md#enable)

***

### disable()

> **disable**(): `void`

Defined in: packages/blue-telemetry/src/instrumentation/counted.ts:41

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`disable`](BaseBlueInstrumentation.md#disable)
