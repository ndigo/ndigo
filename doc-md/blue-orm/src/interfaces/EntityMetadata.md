[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / EntityMetadata

# Interface: EntityMetadata

Defined in: packages/blue-orm/src/metadata.ts:53

Represents the metadata for an entity, including its name, columns, primary key, and generated columns.

## Properties

### entityName

> **entityName**: `string`

Defined in: packages/blue-orm/src/metadata.ts:54

***

### columns

> **columns**: [`ColumnDefinition`](ColumnDefinition.md)[]

Defined in: packages/blue-orm/src/metadata.ts:55

***

### primaryColumn

> **primaryColumn**: `string`

Defined in: packages/blue-orm/src/metadata.ts:56

***

### generatedColumns

> **generatedColumns**: `string`[]

Defined in: packages/blue-orm/src/metadata.ts:57

***

### relations

> **relations**: [`RelationDefinition`](RelationDefinition.md)[]

Defined in: packages/blue-orm/src/metadata.ts:58

***

### lifecycleHooks

> **lifecycleHooks**: [`LifecycleHookDefinition`](LifecycleHookDefinition.md)[]

Defined in: packages/blue-orm/src/metadata.ts:59
