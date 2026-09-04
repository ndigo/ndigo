[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-orm/src](../README.md) / EntityState

# Type Alias: EntityState

> **EntityState** = `"new"` \| `"managed"` \| `"removed"`

Defined in: packages/blue-orm/src/unit-of-work.ts:11

Represents the state of an entity within the Unit of Work.
- 'new': The entity has been created but not yet persisted.
- 'managed': The entity is being tracked and its changes will be persisted.
- 'removed': The entity has been marked for removal.
