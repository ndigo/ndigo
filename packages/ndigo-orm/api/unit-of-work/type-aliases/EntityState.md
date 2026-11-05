[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [unit-of-work](../README.md) / EntityState

# Type Alias: EntityState

> **EntityState** = `"new"` \| `"managed"` \| `"removed"`

Represents the state of an entity within the Unit of Work.
- 'new': The entity has been created but not yet persisted.
- 'managed': The entity is being tracked and its changes will be persisted.
- 'removed': The entity has been marked for removal.
