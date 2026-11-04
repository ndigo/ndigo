/**
 * @module ndigo-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable, IllegalStateError } from '@ndigo/core';
import { DataSource } from './data-source';
import { runLifecycleHooks } from './lifecycle';
import { getEntityMetadata, isEntity } from './metadata';
import type { EntityMetadata } from './metadata';
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
     * Loads one declared relation of an entity: the related entity for the
     * owning side (many-to-one, one-to-one) or the related entities for the
     * inverse side (one-to-many, one-to-one). Does not mutate the entity.
     * @param entity - The entity whose relation is loaded.
     * @param relationName - The declared relation field name.
     * @returns The related entity, an array of related entities, or
     *   `undefined`/`[]` when nothing relates.
     * @throws {IllegalStateError} When the relation or its join column is not
     *   declared, or for many-to-many relations (join-table semantics not
     *   implemented).
     */
    fetchRelation(entity: object, relationName: string): unknown;
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
     * entity against its Zod schema derived from `@column` metadata (AD-07).
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
            runLifecycleHooks(entity, 'prePersist');
        } else {
            runLifecycleHooks(entity, 'preUpdate');
        }

        // Validate against the Zod schema derived from @column metadata (AD-07)
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
            runLifecycleHooks(entity, 'postLoad');
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
            runLifecycleHooks(entity, 'postLoad');
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
            runLifecycleHooks(entity, 'postRemove');
        }
    }

    /**
     * @inheritdoc
     */
    fetchRelation(entity: object, relationName: string): unknown {
        const entityClass = entity.constructor as Constructable<object>;
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));
        const relation = metadata.relations.find((candidate) => candidate.fieldName === relationName);

        if (!relation) {
            throw new IllegalStateError(`Entity '${metadata.entityName}' declares no relation '${relationName}'.`);
        }
        if (relation.kind === 'many-to-many') {
            throw new IllegalStateError(
                `Relation '${relationName}' is many-to-many; join-table fetch is not implemented.`
            );
        }

        const targetClass = relation.targetEntity() as unknown as Constructable<object>;
        const targetMetadata = getEntityMetadata(this.#assertEntityClass(targetClass));
        const record = entity as Record<string, unknown>;

        if (relation.joinColumn !== undefined) {
            const fkField = relation.joinColumn;
            this.#assertDeclaredColumn(metadata, fkField, relationName);
            const fk = record[fkField];
            return fk === undefined || fk === null ? undefined : this.find(targetClass, fk);
        }

        if (relation.inverseJoinColumn !== undefined) {
            const fkField = relation.inverseJoinColumn;
            this.#assertDeclaredColumn(targetMetadata, fkField, relationName);
            if (!this.#dataSource.hasStore(targetMetadata.entityName)) {
                return [];
            }

            const pk = record[metadata.primaryColumn];
            if (pk === undefined || pk === null) {
                return [];
            }

            return Array.from(this.#dataSource.getStore<object>(targetMetadata.entityName).values())
                .filter((row) => (row as Record<string, unknown>)[fkField] === pk)
                .map((row) => {
                    runLifecycleHooks(row, 'postLoad');
                    return row;
                });
        }

        throw new IllegalStateError(`Relation '${relationName}' declares neither joinColumn nor inverseJoinColumn.`);
    }

    #assertDeclaredColumn(metadata: EntityMetadata, fieldName: string, relationName: string): void {
        const declared = metadata.columns.some((column) => column.fieldName === fieldName);
        if (!declared) {
            throw new IllegalStateError(
                `Relation '${relationName}' join column '${fieldName}' is not a declared @column of '${metadata.entityName}'.`
            );
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

    /**
     * Validates the entity against its derived Zod schema (AD-07).
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
