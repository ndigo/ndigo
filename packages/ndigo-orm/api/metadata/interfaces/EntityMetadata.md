[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [metadata](../README.md) / EntityMetadata

# Interface: EntityMetadata

Represents the metadata for an entity, including its name, columns, primary key, and generated columns.

## Properties

### columns

> **columns**: [`ColumnDefinition`](ColumnDefinition.md)[]

Column definitions.

***

### entityName

> **entityName**: `string`

The entity name.

***

### generatedColumns

> **generatedColumns**: `string`[]

Generated column names.

***

### lifecycleHooks

> **lifecycleHooks**: [`LifecycleHookDefinition`](LifecycleHookDefinition.md)[]

Lifecycle hooks.

***

### primaryColumn

> **primaryColumn**: `string`

The primary-key field name.

***

### relations

> **relations**: [`RelationDefinition`](RelationDefinition.md)[]

Relation definitions.
