[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Deferred

# Class: Deferred\<T\>

Defined in: packages/blue-core/src/deferred.ts:8

## Type Parameters

### T

`T`

## Constructors

### Constructor

> **new Deferred**\<`T`\>(): `Deferred`\<`T`\>

Defined in: packages/blue-core/src/deferred.ts:27

#### Returns

`Deferred`\<`T`\>

## Properties

### promise

> **promise**: `Promise`\<`T`\>

Defined in: packages/blue-core/src/deferred.ts:9

---

### resolve()

> **resolve**: (`value?`) => `void`

Defined in: packages/blue-core/src/deferred.ts:15

Fulfills the associated promise with the specified value, or propagates the state of an existing promise. If the associated promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing. \*

#### Parameters

##### value?

If this value is not a promise, including undefined, it becomes the fulfillment value of the associated promise. If this value is a promise, then the associated promise will be resolved to the passed promise, and follow the state as the provided promise (including any future transitions).

`T` | `PromiseLike`\<`T`\>

#### Returns

`void`

---

### reject()

> **reject**: (`reason?`) => `void`

Defined in: packages/blue-core/src/deferred.ts:21

Rejects the associated promise with the specified reason. If the promise has already been resolved, either to a value, a rejection, or another promise, this method does nothing. \*

#### Parameters

##### reason?

`any`

The rejection reason for the associated promise. Although the reason can be undefined, it is generally an external:Error object, like in exception handling.

#### Returns

`void`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-core/src/deferred.ts:23

##### Returns

`string`
