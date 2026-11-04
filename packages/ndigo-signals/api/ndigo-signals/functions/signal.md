[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [ndigo-signals](../README-1.md) / signal

# Function: signal()

> **signal**\<`T`, `V`\>(`_target`, `context`): (`this`, `initialValue`) => `V`

Class field decorator that wraps the field with a reactive signal.

Requires the `@reactive` class decorator on the class that declares the
field. Decorators are not inherited: a `@signal` field declared in a
subclass of a `@reactive` class stays a plain property — and `getSignal`
throws — unless the subclass is decorated with `@reactive` as well.

## Type Parameters

### T

`T` *extends* `object`

### V

`V`

## Parameters

### \_target

`undefined`

### context

`ClassFieldDecoratorContext`\<`T`, `V`\>

## Returns

(`this`, `initialValue`) => `V`
