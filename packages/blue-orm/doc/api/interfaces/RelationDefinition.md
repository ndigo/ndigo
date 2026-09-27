[**@blue/orm v0.0.1**](../README.md)

***

[@blue/orm](../README.md) / RelationDefinition

# Interface: RelationDefinition

## Properties

### fieldName

> **fieldName**: `string`

***

### inverseJoinColumn?

> `optional` **inverseJoinColumn?**: `string`

Inverse side (one-to-many, one-to-one): the `@column` field on the
TARGET entity that holds this entity's primary key.

***

### joinColumn?

> `optional` **joinColumn?**: `string`

Owning side (many-to-one, one-to-one): the `@column` field on THIS
entity that holds the target entity's primary key.

***

### kind

> **kind**: [`RelationKind`](../type-aliases/RelationKind.md)

***

### targetEntity

> **targetEntity**: () => [`ClassType`](#)

#### Returns

[`ClassType`](#)
