/**
 * Repository for the Drizzle-backed persistence layer.
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
import type { AsyncRepository, PageRequest, Page, RelationFetchOptions } from '@blue/orm';
import { DrizzleEntityManager } from './drizzle-entity-manager';

/**
 * Async repository over a {@link DrizzleEntityManager} for one entity type.
 *
 * @template T - The entity type.
 * @template ID - The entity's primary identifier type.
 * @since 1.0.0
 */
export class DrizzleRepository<T extends object, ID> implements AsyncRepository<T, ID> {
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
     * The entity manager used for data access (subclass extension point).
     */
    protected getEntityManager(): DrizzleEntityManager {
        return this.#entityManager;
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
     * @param options - Optional relation loading (eager fetch).
     * @returns The entity, or `undefined` when not found.
     */
    async findById(id: ID, options: RelationFetchOptions = {}): Promise<T | undefined> {
        const entity = await this.#entityManager.find(this.#entityClass, id);
        return entity === undefined ? undefined : this.#fetchRelations(entity, options);
    }

    /**
     * Retrieves all entities of the managed type.
     *
     * @param options - Optional relation loading (eager fetch).
     */
    async findAll(options: RelationFetchOptions = {}): Promise<T[]> {
        const all = await this.#entityManager.findAll(this.#entityClass);
        return Promise.all(all.map((entity) => this.#fetchRelations(entity, options)));
    }

    /**
     * Loads a declared relation of an entity lazily and assigns it onto the
     * entity's field.
     *
     * @param entity - The entity whose relation is loaded.
     * @param relationName - The declared relation field name.
     * @returns The loaded relation value (entity, array, or undefined/[] when
     *   nothing relates).
     */
    async loadRelation(entity: T, relationName: string): Promise<unknown> {
        const value = await this.#entityManager.fetchRelation(entity, relationName);
        (entity as Record<string, unknown>)[relationName] = value;
        return value;
    }

    async #fetchRelations(entity: T, options: RelationFetchOptions): Promise<T> {
        // Relations are independent of each other — fetch concurrently.
        await Promise.all(
            (options.relations ?? []).map(async (relationName) => {
                (entity as Record<string, unknown>)[relationName] = await this.#entityManager.fetchRelation(
                    entity,
                    relationName
                );
            })
        );
        return entity;
    }

    /**
     * Retrieves one page of entities; ordering and slicing happen in SQL.
     *
     * @param request - The page index (1-based), size, and optional sort orders.
     * @returns The requested page with totals.
     */
    findPage(request: PageRequest): Promise<Page<T>> {
        return this.#entityManager.findPage(this.#entityClass, request);
    }

    /**
     * Deletes an entity by its primary identifier.
     *
     * @param id - The entity's primary identifier.
     * @returns `true` when the entity was found and deleted, `false` otherwise.
     */
    async deleteById(id: ID): Promise<boolean> {
        return this.#entityManager.deleteById(this.#entityClass, id);
    }

    /**
     * Returns the number of entities of the managed type.
     */
    async count(): Promise<number> {
        return this.#entityManager.count(this.#entityClass);
    }

    /**
     * Checks whether an entity with the given primary identifier exists.
     */
    async existsById(id: ID): Promise<boolean> {
        return this.#entityManager.existsById(this.#entityClass, id);
    }
}
