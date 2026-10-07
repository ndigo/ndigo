[**@blue/inspect v0.0.1**](../README.md)

***

[@blue/inspect](../README.md) / InspectRoute

# Interface: InspectRoute

A declarative route definition as emitted by the manifest.

## Properties

### name

> **name**: `string`

The route's stable key (the `RouteRegistry` dotted key, or the pattern).

***

### partition?

> `optional` **partition?**: `string`

The partition prefix the route belongs to, when known.

***

### path

> **path**: `string`

The route pattern (e.g. `/users/{id}`).
