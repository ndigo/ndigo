[**@blue/inspect v0.0.1**](../README.md)

***

[@blue/inspect](../README.md) / InspectMappingTable

# Interface: InspectMappingTable

A handler-mapping read model: the enumeration seam an
`AbstractHandlerMethodMapping` exposes. A structural subset, so callers may
pass any mapping that provides either accessor.

## Methods

### getHandlerMethods()?

> `optional` **getHandlerMethods**(): `ReadonlyMap`\<`RouteMappingInfo`, `RouteHandlerMethod`\>

Enumerate mapping → handler-method pairs, when the mapping supports it.

#### Returns

`ReadonlyMap`\<`RouteMappingInfo`, `RouteHandlerMethod`\>

***

### getMappingEntries()?

> `optional` **getMappingEntries**(): readonly `MappingEntry`\<`RouteMappingInfo`\>[]

Enumerate registered mapping entries, when the mapping supports it.

#### Returns

readonly `MappingEntry`\<`RouteMappingInfo`\>[]
