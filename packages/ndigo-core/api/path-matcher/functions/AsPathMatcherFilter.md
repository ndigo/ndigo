[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [path-matcher](../README.md) / AsPathMatcherFilter

# Function: AsPathMatcherFilter()

> **AsPathMatcherFilter**\<`T`\>(`superclass`): [`Constructable`](../../constructable/type-aliases/Constructable.md)\<[`PathMatcherFilter`](../interfaces/PathMatcherFilter.md)\> & `T`

Mixin adding include/exclude pattern filtering to a class that owns a
`pathMatcher`: `matches()` accepts a path when it satisfies every include
pattern and no exclude pattern, and rejects an empty include list.

## Type Parameters

### T

`T` *extends* [`Constructable`](../../constructable/type-aliases/Constructable.md)

## Parameters

### superclass

`T`

## Returns

[`Constructable`](../../constructable/type-aliases/Constructable.md)\<[`PathMatcherFilter`](../interfaces/PathMatcherFilter.md)\> & `T`
