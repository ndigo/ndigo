[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / likeReduced

# Variable: likeReduced()

> `const` **likeReduced**: (`value`) => `value is Reduced<any>`

Defined in: packages/blue-core/src/transducer.ts:70

Determines whether an value is reduced. This is done using the transformer protocol; an object with the protocol-
specified `reduced` property is assumed to be reduced. If a result of a transformation is reduced, it means that the
transformation is complete and the channel should be closed.

## Parameters

### value

`any`

The value being checked for reduction.

## Returns

`value is Reduced<any>`

Whether ot not the value has been reduced.
