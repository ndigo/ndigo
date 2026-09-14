/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable, IllegalStateError } from '@blue/core';
import { DataSource } from './data-source';
import { getEntityMetadata, isEntity } from './metadata';
import { validateEntity } from './entity-schema';

/**
 * Manages the lifecycle of entities, including persistence, retrieval, and removal.
 */
export interface EntityManager {
    /**
     * Persists a new entity or updates an existing one.
     * @param entity - The entity to persist.
     * @throws {IllegalStateError} If the entity class is not decorated with `@entity` or is missing a `@primaryColumn`.
     */
    persist<T extends object>(entity: T): void;
    /**
     * Finds an entity by its class and primary ID.
     * @param entityClass - The constructor of the entity class.
     * @param id - The primary ID of the entity.
     * @returns The found entity or `undefined` if not found.
     */
    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined;
    /**
     * Finds all entities of a given class.
     * @param entityClass - The constructor of the entity class.
     * @returns An array of all found entities.
     */
    findAll<T extends object>(entityClass: Constructable<T>): T[];
    /**
     * Removes an entity from persistence.
     * @param entity - The entity to remove.
     */
    remove<T extends object>(entity: T): void;
    /**
     * Flushes any pending changes to the data source.
     */
    flush(): void;
    /**
     * Clears all managed entities and resets identity counters.
     */
    clear(): void;
}

/**
 * An in-memory implementation of the `EntityManager` interface.
 * It uses an `InMemoryDataSource` to store and manage entities.
 */
export class InMemoryEntityManager implements EntityManager {
    readonly #dataSource: DataSource;
    #identityCounters: Map<string, number>;

    /**
     * Creates an instance of `InMemoryEntityManager`.
     * @param dataSource - The data source to use for entity storage.
     */
    constructor(dataSource: DataSource) {
        this.#dataSource = dataSource;
        this.#identityCounters = new Map<string, number>();
    }

    /**
     * Persists a new entity or updates an existing one in the in-memory store.
     * Automatically assigns generated primary IDs if applicable.
     * Runs any `@prePersist` / `@preUpdate` lifecycle hooks, then validates the
     * entity against its Zod schema derived from `@column` metadata (AD-7).
     *
     * @param entity - The entity to persist.
     * @throws {IllegalStateError} If the entity class is not decorated with `@entity`,
     * is missing a `@primaryColumn`, or the primary column value is `undefined` or `null`.
     * @throws {Error} If the entity has a `validate()` method and validation fails.
     */
    persist<T extends object>(entity: T): void {
        const entityClass = entity.constructor as Constructable<T>;
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!metadata.primaryColumn) {
            throw new IllegalStateError(`Entity '${metadata.entityName}' is missing a @primaryColumn field.`);
        }

        if (!this.#dataSource.hasStore(metadata.entityName)) {
            this.#dataSource.createStore(metadata.entityName);
        }

        this.#assignGeneratedPrimaryId(entity, metadata.entityName, metadata.primaryColumn, metadata.generatedColumns);

        const primaryId = (entity as Record<string, unknown>)[metadata.primaryColumn];

        if (primaryId === undefined || primaryId === null) {
            throw new IllegalStateError(
                `Entity '${metadata.entityName}' primary column '${metadata.primaryColumn}' is undefined or null.`
            );
        }

        const store = this.#dataSource.getStore<T>(metadata.entityName);
        const isNew = !store.has(primaryId);
        if (isNew) {
            this.#callLifecycleHooks(entity, 'prePersist');
        } else {
            this.#callLifecycleHooks(entity, 'preUpdate');
        }

        // Validate against the Zod schema derived from @column metadata (AD-7)
        this.#validateEntity(entityClass, entity);

        store.set(primaryId, entity);
    }

    /**
     * Finds an entity by its class and primary ID in the in-memory store.
     * @param entityClass - The constructor of the entity class.
     * @param id - The primary ID of the entity.
     * @returns The found entity or `undefined` if not found.
     */
    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined {
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!this.#dataSource.hasStore(metadata.entityName)) {
            return undefined;
        }

        const entity = this.#dataSource.getStore<T>(metadata.entityName).get(id);
        if (entity !== undefined) {
            this.#callLifecycleHooks(entity, 'postLoad');
        }
        return entity;
    }

    /**
     * Finds all entities of a given class in the in-memory store.
     * @param entityClass - The constructor of the entity class.
     * @returns An array of all found entities.
     */
    findAll<T extends object>(entityClass: Constructable<T>): T[] {
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!this.#dataSource.hasStore(metadata.entityName)) {
            return [];
        }

        const entities = Array.from(this.#dataSource.getStore<T>(metadata.entityName).values());
        for (const entity of entities) {
            this.#callLifecycleHooks(entity, 'postLoad');
        }
        return entities;
    }

    /**
     * Removes an entity from the in-memory store.
     * @param entity - The entity to remove.
     */
    remove<T extends object>(entity: T): void {
        const entityClass = entity.constructor as Constructable<T>;
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!metadata.primaryColumn || !this.#dataSource.hasStore(metadata.entityName)) {
            return;
        }

        const primaryId = (entity as Record<string, unknown>)[metadata.primaryColumn];

        if (primaryId !== undefined && primaryId !== null) {
            this.#dataSource.getStore<T>(metadata.entityName).delete(primaryId);
            this.#callLifecycleHooks(entity, 'postRemove');
        }
    }

    /**
     * Flushes any pending changes to the data source. No operation for `InMemoryEntityManager`.
     */
    flush(): void {}

    /**
     * Clears all managed entities and resets identity counters in the in-memory store.
     */
    clear(): void {
        this.#dataSource.clear();
        this.#identityCounters.clear();
    }

    #assertEntityClass<T extends object>(entityClass: Constructable<T>): Constructable<T> {
        if (!isEntity(entityClass)) {
            throw new IllegalStateError(`Class '${entityClass.name}' is not decorated with @entity.`);
        }

        return entityClass;
    }

    #assignGeneratedPrimaryId<T extends object>(
        entity: T,
        entityName: string,
        primaryColumn: string,
        generatedColumns: string[]
    ): void {
        if (!generatedColumns.includes(primaryColumn)) {
            return;
        }

        const record = entity as Record<string, unknown>;
        if (record[primaryColumn] !== undefined && record[primaryColumn] !== null) {
            return;
        }

        const nextId = (this.#identityCounters.get(entityName) ?? 0) + 1;
        this.#identityCounters.set(entityName, nextId);
        record[primaryColumn] = nextId;
    }

    #callLifecycleHooks<T extends object>(entity: T, event: string): void {
        const entityClass = entity.constructor as Constructable<T>;
        const metadata = getEntityMetadata(entityClass);
        const hooks = metadata.lifecycleHooks.filter((h) => h.event === event);
        const record = entity as Record<string, (...args: unknown[]) => unknown>;
        for (const hook of hooks) {
            if (typeof record[hook.methodName] === 'function') {
                record[hook.methodName]();
            }
        }
    }

    /**
     * Validates the entity against its derived Zod schema (AD-7).
     * Throws a `FrameworkError` when validation fails.
     *
     * @param entityClass - The entity constructor.
     * @param entity - The entity to validate.
     * @throws {FrameworkError} When validation fails.
     */
    #validateEntity<T extends object>(entityClass: Constructable<T>, entity: T): void {
        validateEntity(entityClass, entity);
    }
}
