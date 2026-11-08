[**@ndigo/telemetry-web v0.0.1**](../../README.md)

***

[@ndigo/telemetry-web](../../README.md) / [index](../README.md) / DispatcherInstrumentation

# Class: DispatcherInstrumentation

An OpenTelemetry instrumentation for the `@ndigo/dispatcher` package.

This instrumentation automatically creates spans for the `dispatch` method,
providing visibility into route dispatching processes.

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new DispatcherInstrumentation**(): `DispatcherInstrumentation`

#### Returns

`DispatcherInstrumentation`

#### Overrides

`AbstractBaseInstrumentation.constructor`

## Methods

### disable()

> **disable**(): `void`

Restores the original dispatcher methods.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `dispatch` and `_resolveViewName` to record dispatch spans.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
