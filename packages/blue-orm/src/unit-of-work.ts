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
 * @experimental This interface is complete but not yet wired into any auto-configuration.
 * Use it manually by constructing an {@link InMemoryUnitOfWork} with an `EntityManager`.
 * The interface may evolve when a concrete SQL-backed `EntityManager` is introduced.
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
 * An in-memory implementation of the `UnitOfWork` interface.
 * It tracks new, dirty, and removed entities and flushes changes via an `EntityManager`.
 *
 * @experimental This implementation is complete but not yet wired into any auto-configuration.
 * It can be used manually but is not yet proven in production workflows. The API may change
 * when a concrete SQL-backed implementation is introduced.
 */
export class InMemoryUnitOfWork implements UnitOfWork {
    readonly #entityManager: EntityManager;
    #newEntities: Set<object>;
    #dirtyEntities: Set<object>;
    #removedEntities: Set<object>;

    /**
     * Creates an instance of `InMemoryUnitOfWork`.
     * @param entityManager - The `EntityManager` to use for persisting changes.
     */
    constructor(entityManager: EntityManager) {
        this.#entityManager = entityManager;
        this.#newEntities = new Set<object>();
        this.#dirtyEntities = new Set<object>();
        this.#removedEntities = new Set<object>();
    }

    /**
     * Registers a new entity to be persisted.
     * If the entity was previously marked for removal or dirty, those registrations are cleared.
     * @param entity - The entity to register.
     */
    registerNew<T extends object>(entity: T): void {
        this.#removedEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#newEntities.add(entity);
    }

    /**
     * Registers an existing entity whose state has been modified.
     * An entity is only marked dirty if it's not new or removed.
     * @param entity - The entity to register.
     */
    registerDirty<T extends object>(entity: T): void {
        if (this.#newEntities.has(entity) || this.#removedEntities.has(entity)) {
            return;
        }

        this.#dirtyEntities.add(entity);
    }

    /**
     * Registers an entity to be removed.
     * If the entity was previously marked as new or dirty, those registrations are cleared.
     * @param entity - The entity to register.
     */
    registerRemoved<T extends object>(entity: T): void {
        this.#newEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#removedEntities.add(entity);
    }

    /**
     * Gets the current state of an entity within the Unit of Work.
     * @param entity - The entity to check.
     * @returns The `EntityState` ('new', 'managed', 'removed') or `undefined` if the entity is not tracked.
     */
    getState<T extends object>(entity: T): EntityState | undefined {
        if (this.#removedEntities.has(entity)) {
            return 'removed';
        }

        if (this.#newEntities.has(entity)) {
            return 'new';
        }

        if (this.#dirtyEntities.has(entity)) {
            return 'managed';
        }

        return undefined;
    }

    /**
     * Persists all registered changes (new, dirty, removed entities) to the `EntityManager`.
     * New and dirty entities are persisted, removed entities are removed.
     * After flushing, the Unit of Work is cleared.
     */
    flush(): void {
        for (const entity of this.#newEntities) {
            this.#entityManager.persist(entity);
        }

        for (const entity of this.#dirtyEntities) {
            this.#entityManager.persist(entity);
        }

        for (const entity of this.#removedEntities) {
            this.#entityManager.remove(entity);
        }

        this.#entityManager.flush();
        this.clear();
    }

    /**
     * Clears all registered entities from the Unit of Work, resetting its state.
     */
    clear(): void {
        this.#newEntities.clear();
        this.#dirtyEntities.clear();
        this.#removedEntities.clear();
    }
}
