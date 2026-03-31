/** @author opencode */

// Types and interfaces
export type { ColumnOptions, ColumnDefinition, EntityMetadata } from './metadata';
export type { DataSource } from './data-source';
export type { EntityManager } from './entity-manager';
export type { EntityState, UnitOfWork } from './unit-of-work';
export type { Repository } from './repository';

// Decorators
export { entity, column, primaryColumn, generated } from './decorators';

// Metadata utilities
export { getEntityMetadata, isEntity } from './metadata';

// Implementations
export { InMemoryDataSource } from './data-source';
export { InMemoryEntityManager } from './entity-manager';
export { InMemoryUnitOfWork } from './unit-of-work';
export { AbstractRepository, InMemoryRepository } from './repository';
