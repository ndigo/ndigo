[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-telemetry/src](../README.md) / BaseBlueInstrumentation

# Abstract Class: BaseBlueInstrumentation

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:53

Base class for BlueJS OpenTelemetry instrumentations.

Eliminates the copy-pasted span lifecycle boilerplate (getTracer, startSpan,
recordException, setStatus, end) that was duplicated across every
instrumentation class.

Subclasses only declare:
- the target class/method to patch
- the span name, kind, and attributes

## Extends

- `InstrumentationBase`

## Extended by

- [`ContextInstrumentation`](ContextInstrumentation.md)
- [`DispatcherInstrumentation`](DispatcherInstrumentation.md)
- [`RouterInstrumentation`](RouterInstrumentation.md)
- [`CountedInstrumentation`](CountedInstrumentation.md)

## Constructors

### Constructor

> **new BaseBlueInstrumentation**(`component`): `BaseBlueInstrumentation`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:59

Creates the instrumentation, deriving the package name from the component.

#### Parameters

##### component

`string`

Short component name (e.g. `'context'`, `'dispatcher'`).

#### Returns

`BaseBlueInstrumentation`

#### Overrides

`InstrumentationBase.constructor`

## Methods

### init()

> `protected` **init**(): `any`[]

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:64

#### Returns

`any`[]

#### Inherit Doc

#### Overrides

`InstrumentationBase.init`

***

### enable()

> `abstract` **enable**(): `void`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:69

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`InstrumentationBase.enable`

***

### disable()

> `abstract` **disable**(): `void`

Defined in: packages/blue-telemetry/src/instrumentation/base.ts:72

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`InstrumentationBase.disable`

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
