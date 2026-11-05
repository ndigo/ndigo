[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [metadata](../README.md) / RelationDefinition

# Interface: RelationDefinition

Metadata recorded for one `@relation` field: the relation kind, the owning
field, the lazily-resolved target entity, and the join columns for either
side of the relation.

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

> **targetEntity**: () => [`ClassType`](../type-aliases/ClassType.md)

#### Returns

[`ClassType`](../type-aliases/ClassType.md)
