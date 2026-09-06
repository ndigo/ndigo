/**
 * Repository for the Drizzle-backed persistence layer.
 *
 * Mirrors the {@link Repository} contract from `@blue/orm` (save / findById /
 * findAll / deleteById / count / existsById) but asynchronously, because SQL
 * operations through {@link DrizzleEntityManager} are async. The sync
 * `Repository` interface is satisfied by the in-memory implementations; this
 * adapter exposes the same method surface as promises.
 *
 * @module
 */

import { Constructable } from '@blue/core';
import { DrizzleEntityManager } from './drizzle-entity-manager';

/**
 * Async repository over a {@link DrizzleEntityManager} for one entity type.
 *
 * @template T - The entity type.
 * @template ID - The entity's primary identifier type.
 * @since 1.0.0
 */
export class DrizzleRepository<T extends object, ID> {
    readonly #entityClass: Constructable<T>;
    readonly #entityManager: DrizzleEntityManager;

    /**
     * @param entityClass - The entity class this repository manages.
     * @param entityManager - The Drizzle entity manager used for data access.
     */
    constructor(entityClass: Constructable<T>, entityManager: DrizzleEntityManager) {
        this.#entityClass = entityClass;
        this.#entityManager = entityManager;
    }

    /**
     * The entity class this repository manages.
     */
    protected getEntityClass(): Constructable<T> {
        return this.#entityClass;
    }

    /**
     * Persists (inserts or updates) the entity.
     *
     * @param entity - The entity to save.
     * @returns The saved entity.
     */
    async save(entity: T): Promise<T> {
        await this.#entityManager.persist(entity);
        return entity;
    }

    /**
     * Retrieves an entity by its primary identifier.
     *
     * @param id - The entity's primary identifier.
     * @returns The entity, or `undefined` when not found.
     */
    findById(id: ID): Promise<T | undefined> {
        return this.#entityManager.find(this.#entityClass, id);
    }

    /**
     * Retrieves all entities of the managed type.
     */
    findAll(): Promise<T[]> {
        return this.#entityManager.findAll(this.#entityClass);
    }

    /**
     * Deletes an entity by its primary identifier.
     *
     * @param id - The entity's primary identifier.
     * @returns `true` when the entity was found and deleted, `false` otherwise.
     */
    async deleteById(id: ID): Promise<boolean> {
        const entity = await this.findById(id);
        if (!entity) return false;
        await this.#entityManager.remove(entity);
        return true;
    }

    /**
     * Returns the number of entities of the managed type.
     */
    async count(): Promise<number> {
        const all = await this.findAll();
        return all.length;
    }

    /**
     * Checks whether an entity with the given primary identifier exists.
     */
    async existsById(id: ID): Promise<boolean> {
        return (await this.findById(id)) !== undefined;
    }
}
