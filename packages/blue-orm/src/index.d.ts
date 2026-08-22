/** @author opencode */
export type { ColumnOptions, ColumnDefinition, EntityMetadata, RelationKind, RelationDefinition, LifecycleEvent, LifecycleHookDefinition } from './metadata';
export type { DataSource } from './data-source';
export type { EntityManager } from './entity-manager';
export type { EntityState, UnitOfWork } from './unit-of-work';
export type { TransactionManager } from './transaction-manager';
export type { Repository } from './repository';
export { entity, column, primaryColumn, generated, oneToMany, manyToOne, manyToMany, oneToOne, prePersist, postLoad, preUpdate, postRemove, transactional } from './decorators';
export { getEntityMetadata, isEntity } from './metadata';
export { InMemoryDataSource } from './data-source';
export { InMemoryEntityManager } from './entity-manager';
export { InMemoryUnitOfWork } from './unit-of-work';
export { InMemoryTransactionManager } from './transaction-manager';
export { AbstractRepository, InMemoryRepository } from './repository';
