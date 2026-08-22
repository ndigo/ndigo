/** @author opencode */
import { Constructable } from '@blue/core';
import { DataSource } from './data-source';
/**
 * Manages the lifecycle of entities, including persistence, retrieval, and removal.
 */
export interface EntityManager {
    /**
     * Persists a new entity or updates an existing one.
     * @param entity - The entity to persist.
     * @throws {IllegalStateError} If the entity class is not decorated with `@entity` or is missing a `@primaryColumn`.
     */
    persist<T extends object>(entity: T): void | Promise<void>;
    /**
     * Finds an entity by its class and primary ID.
     * @param entityClass - The constructor of the entity class.
     * @param id - The primary ID of the entity.
     * @returns The found entity or `undefined` if not found.
     */
    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined | Promise<T | undefined>;
    /**
     * Finds all entities of a given class.
     * @param entityClass - The constructor of the entity class.
     * @returns An array of all found entities.
     */
    findAll<T extends object>(entityClass: Constructable<T>): T[] | Promise<T[]>;
    /**
     * Removes an entity from persistence.
     * @param entity - The entity to remove.
     */
    remove<T extends object>(entity: T): void | Promise<void>;
    /**
     * Flushes any pending changes to the data source.
     */
    flush(): void | Promise<void>;
    /**
     * Clears all managed entities and resets identity counters.
     */
    clear(): void | Promise<void>;
}
/**
 * An in-memory implementation of the `EntityManager` interface.
 * It uses an `InMemoryDataSource` to store and manage entities.
 */
export declare class InMemoryEntityManager implements EntityManager {
    #private;
    /**
     * Creates an instance of `InMemoryEntityManager`.
     * @param dataSource - The data source to use for entity storage.
     */
    constructor(dataSource: DataSource);
    /**
     * Persists a new entity or updates an existing one in the in-memory store.
     * Automatically assigns generated primary IDs if applicable.
     * Runs any `@prePersist` / `@preUpdate` lifecycle hooks and calls `validate()`
     * on the entity if the method exists (e.g. via `@validated` from `@blue/validate`).
     *
     * @param entity - The entity to persist.
     * @throws {IllegalStateError} If the entity class is not decorated with `@entity`,
     * is missing a `@primaryColumn`, or the primary column value is `undefined` or `null`.
     * @throws {Error} If the entity has a `validate()` method and validation fails.
     */
    persist<T extends object>(entity: T): void;
    /**
     * Finds an entity by its class and primary ID in the in-memory store.
     * @param entityClass - The constructor of the entity class.
     * @param id - The primary ID of the entity.
     * @returns The found entity or `undefined` if not found.
     */
    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined;
    /**
     * Finds all entities of a given class in the in-memory store.
     * @param entityClass - The constructor of the entity class.
     * @returns An array of all found entities.
     */
    findAll<T extends object>(entityClass: Constructable<T>): T[];
    /**
     * Removes an entity from the in-memory store.
     * @param entity - The entity to remove.
     */
    remove<T extends object>(entity: T): void;
    /**
     * Flushes any pending changes to the data source. No operation for `InMemoryEntityManager`.
     */
    flush(): void;
    /**
     * Clears all managed entities and resets identity counters in the in-memory store.
     */
    clear(): void;
}
