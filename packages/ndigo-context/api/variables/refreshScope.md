[**@ndigo/context v0.0.1**](../README.md)

***

[@ndigo/context](../README.md) / refreshScope

# Variable: refreshScope

> `const` **refreshScope**: \<`T`\>(`target`, `context`) => `T`

Decorator for refresh scope (convenience factory): the instance cache is
cleared when the environment refreshes (`config:refresh`, AD-29 D-2), so
the next `getValue` re-creates the instance from its factory.

## Type Parameters

### T

`T` *extends* new (...`args`) => `unknown`

## Parameters

### target

`T`

### context

`ClassDecoratorContext`

## Returns

`T`
