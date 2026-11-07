[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [aware](../README.md) / likeAwareAnd

# Function: likeAwareAnd()

> **likeAwareAnd**(`predicate`): (`value`) => `boolean`

Builds a predicate that tests whether a value is [Aware](../interfaces/Aware.md) and matches the given `predicate`.

## Parameters

### predicate

(`value`) => `boolean`

The additional test applied to aware values.

## Returns

A function that will test whether a `value` is both [Aware](../interfaces/Aware.md) and matches the the given `predicate`.

(`value`) => `boolean`

## Example

```ts
const isYellow = (value: unknown) => 'color' in value && value.color === 'yellow';
const likeAwareAndYellow = likeAwareAnd(isYellow);
likeAwareAndYellow({ color: 'yellow' }); // false
likeAwareAndYellow({ '@@aware': true, color: 'yellow' }); // true
```
