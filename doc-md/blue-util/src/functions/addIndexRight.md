[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-util/src](../README.md) / addIndexRight

# Function: addIndexRight()

> **addIndexRight**\<`T`, `U`\>(`fn`): (`f`) => (`list`) => `U`[]

Defined in: packages/blue-util/src/ramda-extensions.d.ts:14

As with addIndex, addIndexRight creates a new list iteration function from an existing one
by adding two new parameters to its callback function: the current index, and the entire list.
Unlike addIndex, addIndexRight iterates from the right to the left.

## Type Parameters

### T

`T`

### U

`U`

## Parameters

### fn

(`f`) => (`list`) => `U`[]

## Returns

> (`f`): (`list`) => `U`[]

### Parameters

#### f

(`item`, `idx`, `list`) => `U`

### Returns

> (`list`): `U`[]

#### Parameters

##### list

readonly `T`[]

#### Returns

`U`[]
