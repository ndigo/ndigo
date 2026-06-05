[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-model/src](../README.md) / EventModel

# Function: EventModel()

> **EventModel**(`def`): `any`

Defined in: packages/blue-model/src/event.ts:108

Creates a model constructor that emits change events for assigned properties.

Uses the public ObjectModel API and wraps each instance in a Proxy that
intercepts successful property sets and fires `change:<key>` events (which
bubble up through colon-delimited prefixes, e.g. `change`).

## Parameters

### def

`any`

ObjectModel definition used to validate values.

## Returns

`any`

A model constructor with minimal `emit`, `on`, and `off` support.
