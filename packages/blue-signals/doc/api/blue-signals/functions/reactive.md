[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README-1.md) / reactive

# Function: reactive()

> **reactive**\<`T`\>(`target`, `_context`): `T`

Class decorator that activates the `@signal` and `@effect` members declared
on the decorated class.

This decorator processes the signal/effect metadata stored by the
`@signal`, `@effect`, and `@computed` decorators. It creates the
signals, installs getter/setters, and wires up effects.

Activation runs at the end of the decorated class's construction — before
subclass field initializers — so reactive members declared in subclasses are
not activated. Apply `@reactive` to every class in the hierarchy that
declares `@signal`/`@effect` members:

```ts
@reactive
class Counter {
    @signal count = 0;
    @computed get doubled() { return this.count * 2; }
    @effect log() { console.log(this.count); }
}

@reactive
class NamedCounter extends Counter {
    @signal label = 'unnamed';
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
