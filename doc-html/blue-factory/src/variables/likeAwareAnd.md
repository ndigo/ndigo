[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / likeAwareAnd

# Variable: likeAwareAnd

> `const` **likeAwareAnd**: (`predicate`) => (`value`) => `boolean`

Defined in: [packages/blue-factory/src/aware.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-factory/src/aware.ts#lines-105)

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
