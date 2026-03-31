/** @author opencode */

import { Constructable, IllegalStateError } from '@blue/core';
import { DataSource } from './data-source';
import { getEntityMetadata, isEntity } from './metadata';

export interface EntityManager {
    persist<T extends object>(entity: T): void;
    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined;
    findAll<T extends object>(entityClass: Constructable<T>): T[];
    remove<T extends object>(entity: T): void;
    flush(): void;
    clear(): void;
}

export class InMemoryEntityManager implements EntityManager {
    readonly #dataSource: DataSource;
    #identityCounters: Map<string, number>;

    constructor(dataSource: DataSource) {
        this.#dataSource = dataSource;
        this.#identityCounters = new Map<string, number>();
    }

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
        store.set(primaryId, entity);
    }

    find<T extends object>(entityClass: Constructable<T>, id: unknown): T | undefined {
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!this.#dataSource.hasStore(metadata.entityName)) {
            return undefined;
        }

        return this.#dataSource.getStore<T>(metadata.entityName).get(id);
    }

    findAll<T extends object>(entityClass: Constructable<T>): T[] {
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!this.#dataSource.hasStore(metadata.entityName)) {
            return [];
        }

        return Array.from(this.#dataSource.getStore<T>(metadata.entityName).values());
    }

    remove<T extends object>(entity: T): void {
        const entityClass = entity.constructor as Constructable<T>;
        const metadata = getEntityMetadata(this.#assertEntityClass(entityClass));

        if (!metadata.primaryColumn || !this.#dataSource.hasStore(metadata.entityName)) {
            return;
        }

        const primaryId = (entity as Record<string, unknown>)[metadata.primaryColumn];

        if (primaryId !== undefined && primaryId !== null) {
            this.#dataSource.getStore<T>(metadata.entityName).delete(primaryId);
        }
    }

    flush(): void {}

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
}
