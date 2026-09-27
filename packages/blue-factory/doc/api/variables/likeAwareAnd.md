[**@blue/factory v0.0.1**](../README.md)

***

[@blue/factory](../README.md) / likeAwareAnd

# Variable: likeAwareAnd

> `const` **likeAwareAnd**: (`predicate`) => (`value`) => `boolean`

## Parameters

### predicate

(`value`) => `boolean`

## Returns

A function that will test whether a `value` is both [Aware](../interfaces/Aware.md) and matches the the given `predicate`.

(`value`) => `boolean`

## Example

```ts
const
 isYellow = ( value ) => 'color' in value && value.color === 'yellow',
 likeAwareAndYellow = likeAwareAnd( isYellow );
likeAwareAndYellow( { color: 'yellow' } ); // false
likeAwareAndYellow( { '@@aware': true, color: 'yellow' } ); // true
```
