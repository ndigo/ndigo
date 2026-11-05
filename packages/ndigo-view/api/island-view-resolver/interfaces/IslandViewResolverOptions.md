[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [island-view-resolver](../README.md) / IslandViewResolverOptions

# Interface: IslandViewResolverOptions

Configuration for [IslandViewResolver](../classes/IslandViewResolver.md).

## Properties

### viewNames?

> `optional` **viewNames?**: (`string` \| `RegExp`)[]

Name filter. When set, only names matching these patterns resolve;
everything else falls through the resolver chain. Defaults to the
[isValidCustomElementName](../../island-view/functions/isValidCustomElementName.md) predicate so a default resolver claims
only valid, non-reserved custom-element tags — never every view name.
