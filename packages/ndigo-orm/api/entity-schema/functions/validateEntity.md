[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [entity-schema](../README.md) / validateEntity

# Function: validateEntity()

> **validateEntity**\<`T`\>(`entityClass`, `entity`): `void`

Validates an entity instance against its derived schema.

## Type Parameters

### T

`T` *extends* `object`

## Parameters

### entityClass

`Constructable`\<`T`\>

The entity constructor.

### entity

`T`

The entity instance to validate.

## Returns

`void`

## Throws

When any column fails validation, listing the
  offending field paths.
