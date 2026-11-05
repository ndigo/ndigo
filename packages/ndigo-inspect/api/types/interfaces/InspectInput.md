[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [types](../README.md) / InspectInput

# Interface: InspectInput

The input to [inspectApplication](../../inspect-application/functions/inspectApplication.md).

## Properties

### configurationClasses?

> `optional` **configurationClasses?**: `Function`[]

Configuration-properties classes whose declared keys are enumerated.

***

### context

> **context**: `ApplicationContext`

The application context to inspect.

***

### mappings?

> `optional` **mappings?**: [`MappingSource`](../type-aliases/MappingSource.md)

Handler mappings; omitted ⇒ the manifest has no mappings.

***

### now?

> `optional` **now?**: `string`

A fixed `generatedAt` timestamp (ISO 8601), for deterministic output.

***

### routes?

> `optional` **routes?**: [`RouteSource`](../type-aliases/RouteSource.md)

Declarative routes; omitted ⇒ the manifest has no routes.
