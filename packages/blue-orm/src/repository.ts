/** @author Jeff Rose */

import { Constructable } from '@blue/core';
import { EntityManager } from './entity-manager';
import { getEntityMetadata } from './metadata';
import { parseDerivedQuery } from './derived-query-repository';

/**
 * Defines the basic contract for a repository, providing common data access operations for entities.
 * @template T - The type of the entity.
 * @template ID - The type of the entity's primary identifier.
 */
export interface Repository<T extends object, ID> {
    /**
     * Saves a given entity. If the entity already exists, it will be updated; otherwise, it will be created.
     * @param entity - The entity to save.
     * @returns The saved entity.
     */
    save(entity: T): T;
    /**
     * Retrieves an entity by its ID.
     * @param id - The ID of the entity to retrieve.
     * @returns The entity with the given ID or `undefined` if not found.
     */
    findById(id: ID): T | undefined;
    /**
     * Retrieves all entities.
     * @returns An array containing all entities.
     */
    findAll(): T[];
    /**
     * Deletes an entity by its ID.
     * @param id - The ID of the entity to delete.
     * @returns `true` if the entity was found and deleted, `false` otherwise.
     */
    deleteById(id: ID): boolean;
    /**
     * Returns the number of entities available.
     * @returns The total number of entities.
     */
    count(): number;
    /**
     * Checks if an entity with the given ID exists.
     * @param id - The ID of the entity to check.
     * @returns `true` if an entity with the given ID exists, `false` otherwise.
     */
    existsById(id: ID): boolean;
}

/**
 * An abstract base class for implementing the `Repository` interface.
 * Provides common functionality for interacting with an `EntityManager`.
 * @template T - The type of the entity.
 * @template ID - The type of the entity's primary identifier.
 */
export abstract class AbstractRepository<T extends object, ID> implements Repository<T, ID> {
    readonly #entityClass: Constructable<T>;
    readonly #entityManager: EntityManager;

    /**
     * Creates an instance of `AbstractRepository`.
     * @param entityClass - The constructor of the entity class this repository manages.
     * @param entityManager - The `EntityManager` to use for data operations.
     */
    constructor(entityClass: Constructable<T>, entityManager: EntityManager) {
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
     * Saves a given entity by persisting it through the `EntityManager`.
     * @param entity - The entity to save.
     * @returns The saved entity.
     */
    save(entity: T): T {
        this.#entityManager.persist(entity);
        return entity;
    }

    /**
     * Retrieves an entity by its ID using the `EntityManager`.
     * @param id - The ID of the entity to retrieve.
     * @returns The entity with the given ID or `undefined` if not found.
     */
    findById(id: ID): T | undefined {
        return this.#entityManager.find(this.#entityClass, id);
    }

    /**
     * Retrieves all entities of the managed type using the `EntityManager`.
     * @returns An array containing all entities.
     */
    findAll(): T[] {
        return this.#entityManager.findAll(this.#entityClass);
    }

    /**
     * Deletes an entity by its ID. It first finds the entity and then removes it via the `EntityManager`.
     * @param id - The ID of the entity to delete.
     * @returns `true` if the entity was found and deleted, `false` otherwise.
     */
    deleteById(id: ID): boolean {
        const entity = this.findById(id);

        if (!entity) {
            return false;
        }

        this.#entityManager.remove(entity);
        return true;
    }

    /**
     * Returns the number of entities available by fetching all and counting them.
     * @returns The total number of entities.
     */
    count(): number {
        return this.findAll().length;
    }

    /**
     * Checks if an entity with the given ID exists by attempting to find it.
     * @param id - The ID of the entity to check.
     * @returns `true` if an entity with the given ID exists, `false` otherwise.
     */
    existsById(id: ID): boolean {
        return this.findById(id) !== undefined;
    }
}

/**
 * Base repository with in-memory Spring Data-style derived-query support.
 *
 * Concrete repositories declare derived methods and delegate to {@link derive}:
 *
 * ```ts
 * class AccountRepository extends InMemoryDerivedQueryRepository<Account, string> {
 *     findByEmail(email: string): Account[] {
 *         return this.derive('findByEmail', [email]);
 *     }
 * }
 * ```
 *
 * @template T - The type of the entity.
 * @template ID - The type of the entity's primary identifier.
 */
export class InMemoryDerivedQueryRepository<T extends object, ID> extends AbstractRepository<T, ID> {
    /**
     * Evaluates a derived-query method name against `this.findAll()`.
     *
     * @param methodName - The method name that was called.
     * @param args - The method arguments (query values).
     * @returns Matching entities.
     * @throws {TypeError} When the method name is not a supported derived query.
     */
    derive(methodName: string, args: unknown[]): T[] {
        const columns = getEntityMetadata(this.getEntityClass()).columns;
        const filters = parseDerivedQuery(methodName, columns);
        if (!filters) {
            throw new TypeError(`Unsupported derived query method: ${methodName}`);
        }

        return this.findAll().filter((entity) =>
            filters.every(({ property, valueIndex }) => {
                const actual = (entity as Record<string, unknown>)[property];
                return actual === args[valueIndex];
            })
        );
    }
}

/**
 * An in-memory implementation of a repository, extending `AbstractRepository`.
 * It uses an `InMemoryEntityManager` for data operations, and supports derived
 * queries via {@link InMemoryDerivedQueryRepository.derive}.
 * @template T - The type of the entity.
 * @template ID - The type of the entity's primary identifier.
 */
export class InMemoryRepository<T extends object, ID> extends InMemoryDerivedQueryRepository<T, ID> {
    /**
     * Creates an instance of `InMemoryRepository`.
     * @param entityClass - The constructor of the entity class this repository manages.
     * @param entityManager - The `EntityManager` to use for data operations.
     */
    constructor(entityClass: Constructable<T>, entityManager: EntityManager) {
        super(entityClass, entityManager);
    }
}
