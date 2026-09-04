/** @author Jeff Rose */

// Types and interfaces
export type { ColumnOptions, ColumnDefinition, EntityMetadata, RelationKind, RelationDefinition, LifecycleEvent, LifecycleHookDefinition } from './metadata';
export type { DataSource } from './data-source';
export type { EntityManager } from './entity-manager';
export type { EntityState, UnitOfWork } from './unit-of-work';
export type { TransactionManager } from './transaction-manager';
export type { Repository } from './repository';

// Decorators
export { entity, column, primaryColumn, generated, oneToMany, manyToOne, manyToMany, oneToOne, prePersist, postLoad, preUpdate, postRemove, transactional } from './decorators';

// Metadata utilities
export { getEntityMetadata, isEntity } from './metadata';

// Implementations
export { InMemoryDataSource } from './data-source';
export { InMemoryEntityManager } from './entity-manager';
export { InMemoryUnitOfWork } from './unit-of-work';
export { InMemoryTransactionManager } from './transaction-manager';
export { AbstractRepository, InMemoryRepository, InMemoryDerivedQueryRepository } from './repository';
export { parseDerivedQuery } from './derived-query-repository';
export type { DerivedQueryResult } from './derived-query-repository';
