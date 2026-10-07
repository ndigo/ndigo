[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / IslandViewResolverOptions

# Interface: IslandViewResolverOptions

Configuration for [IslandViewResolver](../classes/IslandViewResolver.md).

## Properties

### viewNames?

> `optional` **viewNames?**: (`string` \| `RegExp`)[]

Name filter. When set, only names matching these patterns resolve;
everything else falls through the resolver chain. Defaults to
[customElementNamePattern](../variables/customElementNamePattern.md) so a default resolver claims only
names that are valid custom-element tags, never every view name.
