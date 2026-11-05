[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [decorators](../README.md) / RelationOptions

# Interface: RelationOptions

Options for relation decorators. The join column must name an existing
`@column` field — the FK lives in a declared column so it persists and
reads through the normal column pipeline (ORM completion plan, Wave 3).

## Properties

### inverseJoinColumn?

> `optional` **inverseJoinColumn?**: `string`

Inverse side (one-to-many, one-to-one): the `@column` field on the target entity holding this entity's primary key.

***

### joinColumn?

> `optional` **joinColumn?**: `string`

Owning side (many-to-one, one-to-one): the `@column` field on this entity holding the target's primary key.
