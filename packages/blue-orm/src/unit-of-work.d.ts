/** @author opencode */
import { EntityManager } from './entity-manager';
/**
 * Represents the state of an entity within the Unit of Work.
 * - 'new': The entity has been created but not yet persisted.
 * - 'managed': The entity is being tracked and its changes will be persisted.
 * - 'removed': The entity has been marked for removal.
 */
export type EntityState = 'new' | 'managed' | 'removed';
/**
 * Manages a set of changes to entities that will be committed as a single transaction.
 *
 * Use {@link InMemoryUnitOfWork} for in-memory stores or implement this interface
 * for SQL-backed data sources. Pair with {@link TransactionManager} and the
 * {@link transactional} decorator for full transactional workflows.
 *
 * @since 1.0.0
 */
export interface UnitOfWork {
    /**
     * Registers a new entity to be persisted.
     * @param entity - The entity to register.
     */
    registerNew<T extends object>(entity: T): void;
    /**
     * Registers an existing entity whose state has been modified.
     * @param entity - The entity to register.
     */
    registerDirty<T extends object>(entity: T): void;
    /**
     * Registers an entity to be removed.
     * @param entity - The entity to register.
     */
    registerRemoved<T extends object>(entity: T): void;
    /**
     * Gets the current state of an entity within the Unit of Work.
     * @param entity - The entity to check.
     * @returns The `EntityState` or `undefined` if the entity is not tracked.
     */
    getState<T extends object>(entity: T): EntityState | undefined;
    /**
     * Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
     * After flushing, the Unit of Work is cleared.
     */
    flush(): void;
    /**
     * Clears all registered entities from the Unit of Work, resetting its state.
     */
    clear(): void;
}
/**
 * An in-memory implementation of the {@link UnitOfWork} interface.
 * Tracks new, dirty, and removed entities and flushes changes via an `EntityManager`.
 *
 * Use this class in tests or with `InMemoryEntityManager`. For SQL-backed stores,
 * implement `UnitOfWork` with your `EntityManager` adapter.
 *
 * @since 1.0.0
 */
export declare class InMemoryUnitOfWork implements UnitOfWork {
    #private;
    /**
     * Creates an instance of `InMemoryUnitOfWork`.
     * @param entityManager - The `EntityManager` to use for persisting changes.
     */
    constructor(entityManager: EntityManager);
    /**
     * Registers a new entity to be persisted.
     * If the entity was previously marked for removal or dirty, those registrations are cleared.
     * @param entity - The entity to register.
     */
    registerNew<T extends object>(entity: T): void;
    /**
     * Registers an existing entity whose state has been modified.
     * An entity is only marked dirty if it's not new or removed.
     * @param entity - The entity to register.
     */
    registerDirty<T extends object>(entity: T): void;
    /**
     * Registers an entity to be removed.
     * If the entity was previously marked as new or dirty, those registrations are cleared.
     * @param entity - The entity to register.
     */
    registerRemoved<T extends object>(entity: T): void;
    /**
     * Gets the current state of an entity within the Unit of Work.
     * @param entity - The entity to check.
     * @returns The `EntityState` ('new', 'managed', 'removed') or `undefined` if the entity is not tracked.
     */
    getState<T extends object>(entity: T): EntityState | undefined;
    /**
     * Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
     * New and dirty entities are persisted, removed entities are removed.
     * After flushing, the Unit of Work is cleared.
     */
    flush(): void;
    /**
     * Clears all registered entities from the Unit of Work, resetting its state.
     */
    clear(): void;
}
