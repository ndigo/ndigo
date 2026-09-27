[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README-1.md) / reactive

# Function: reactive()

> **reactive**\<`T`\>(`target`, `_context`): `T`

Class decorator that activates all `@signal` and `@effect` decorators.

This decorator processes the signal/effect metadata stored by the
`@signal`, `@effect`, and `@computed` decorators. It creates the
signals, installs getter/setters, and wires up effects.

```ts
@reactive
class Counter {
    @signal count = 0;
    @computed get doubled() { return this.count * 2; }
    @effect log() { console.log(this.count); }
}
```

## Type Parameters

### T

`T` *extends* (...`args`) => `object`

## Parameters

### target

`T`

### \_context

`ClassDecoratorContext`\<`T`\>

## Returns

`T`
