[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / ContextInstrumentation

# Class: ContextInstrumentation

Defined in: packages/blue-telemetry/src/instrumentation/context/context.ts:11

An OpenTelemetry instrumentation for `GenericApplicationContext` lifecycle events.

This instrumentation automatically creates spans for the `destroy` method,
providing visibility into application context teardown processes.

## Extends

- [`BaseBlueInstrumentation`](BaseBlueInstrumentation.md)

## Constructors

### Constructor

> **new ContextInstrumentation**(): `ContextInstrumentation`

Defined in: packages/blue-telemetry/src/instrumentation/context/context.ts:12

#### Returns

`ContextInstrumentation`

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

Defined in: packages/blue-telemetry/src/instrumentation/context/context.ts:16

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`enable`](BaseBlueInstrumentation.md#enable)

***

### disable()

> **disable**(): `void`

Defined in: packages/blue-telemetry/src/instrumentation/context/context.ts:31

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

[`BaseBlueInstrumentation`](BaseBlueInstrumentation.md).[`disable`](BaseBlueInstrumentation.md#disable)
