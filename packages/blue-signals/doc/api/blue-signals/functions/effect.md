[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README-1.md) / effect

# Function: effect()

> **effect**(`target`, `context`): `void`

Method decorator that wraps the method with a reactive effect.

Requires the `@reactive` class decorator on the class that declares the
method. Decorators are not inherited: an `@effect` method declared in a
subclass of a `@reactive` class never runs unless the subclass is decorated
with `@reactive` as well.

## Parameters

### target

(...`args`) => `void`

### context

`ClassMethodDecoratorContext`\<`object`\>

## Returns

`void`
