[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / hashScope

# Variable: hashScope

> `const` **hashScope**: \<`T`\>(`target`, `context`) => `T`

Decorator for hash/route scope (convenience factory): one cached instance
per active scope key (`HashScope.setCurrentKey`), torn down when the route
ends (`HashScope.endScope`) or the bean is destroyed (`destroyValue`).

## Type Parameters

### T

`T` *extends* (...`args`) => `unknown`

## Parameters

### target

`T`

### context

`ClassDecoratorContext`

## Returns

`T`
