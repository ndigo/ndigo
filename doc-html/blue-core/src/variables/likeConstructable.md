[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / likeConstructable

# Variable: likeConstructable

> `const` **likeConstructable**: (`value`) => `value is Constructable<{}>`

Defined in: [packages/blue-core/src/constructable.ts:19](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/constructable.ts#lines-19)

Type guard to check if a value is a `Constructable` (i.e., a class constructor).

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is Constructable<{}>`

`true` if the value is `Constructable`, `false` otherwise.

## Remarks

This is not a perfect test as `prototype` is optional on some constructables.
