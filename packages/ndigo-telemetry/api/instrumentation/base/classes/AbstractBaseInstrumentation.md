[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [instrumentation/base](../README.md) / AbstractBaseInstrumentation

# Abstract Class: AbstractBaseInstrumentation

Base class for Ndigo OpenTelemetry instrumentations.

Eliminates the copy-pasted span lifecycle boilerplate (getTracer, startSpan,
recordException, setStatus, end) that was duplicated across every
instrumentation class.

Subclasses only declare:
- the target class/method to patch
- the span name, kind, and attributes

`enable()`/`disable()` are latched: the constructor-time enable counts as
the first cycle, a repeated `enable()` (the SDK's `registerInstrumentations`)
is a no-op, and `disable()` unwinds the wrappers once and re-arms the next
`enable()`.

## Extends

- `InstrumentationBase`

## Extended by

- [`ContextInstrumentation`](../../context/context/classes/ContextInstrumentation.md)
- [`DispatcherInstrumentation`](../../dispatcher/dispatcher/classes/DispatcherInstrumentation.md)

## Constructors

### Constructor

> **new AbstractBaseInstrumentation**(`component`): `AbstractBaseInstrumentation`

Creates the instrumentation, deriving the package name from the component.

#### Parameters

##### component

`string`

Short component name (e.g. `'context'`, `'dispatcher'`).

#### Returns

`AbstractBaseInstrumentation`

#### Overrides

`InstrumentationBase.constructor`

## Methods

### disable()

> `abstract` **disable**(): `void`

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`InstrumentationBase.disable`

***

### enable()

> `abstract` **enable**(): `void`

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`InstrumentationBase.enable`
