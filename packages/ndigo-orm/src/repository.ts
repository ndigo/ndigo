/**
 * Synchronous and asynchronous repository contracts.
 */
import { Constructable } from '@ndigo/core';
import { EntityManager } from './entity-manager';
import { getEntityMetadata } from './metadata';
import { parseDerivedQuery } from './derived-query-repository';
import { Page, PageRequest, pageFromAll, sortComparator } from './page';

/**
 * Options controlling relation loading for find operations
 * (ORM completion plan, Wave 3). Names must match declared relation fields.
 */
export interface RelationFetchOptions {
    /** Relations to load eagerly and assign onto each returned entity. */
    relations?: string[];
}

/**
 * Defines the basic contract for a repository, providing common data access operations for entities.
 * @typeParam T - The type of the entity.
 * @typeParam ID - The type of the entity's primary identifier.
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
     * @param options - Optional relation loading (eager fetch).
     * @returns The entity with the given ID or `undefined` if not found.
     */
    findById(id: ID, options?: RelationFetchOptions): T | undefined;
    /**
     * Retrieves all entities.
     * @param options - Optional relation loading (eager fetch).
     * @returns An array containing all entities.
     */
    findAll(options?: RelationFetchOptions): T[];
    /**
     * Loads a declared relation of an entity lazily and assigns it onto the
     * entity's field.
     * @param entity - The entity whose relation is loaded.
     * @param relationName - The declared relation field name.
     * @returns The loaded relation value (entity, array, or undefined/[] when
     *   nothing relates).
     */
    loadRelation(entity: T, relationName: string): unknown;
    /**
     * Retrieves one page of entities, sorted and sliced per the request.
     * Sort properties must name declared entity fields; anything else fails loud.
     * @param request - The page index (1-based), size, and optional sort orders.
     * @returns The requested page with totals. Pages beyond the last are empty.
     */
    findPage(request: PageRequest): Page<T>;
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
 * Promise-based counterpart to {@link Repository} for backend-neutral async consumers.
 * Missing entities resolve to `undefined`; operation failures reject the promise.
 */
export interface AsyncRepository<T extends object, ID> {
    /** Persists an entity. @param entity - The entity to save. */
    save(entity: T): Promise<T>;
    /** Finds an entity by id. @param id - The entity id. @param options - Optional relation loading. */
    findById(id: ID, options?: RelationFetchOptions): Promise<T | undefined>;
    /** Returns all entities. @param options - Optional relation loading. */
    findAll(options?: RelationFetchOptions): Promise<T[]>;
    /** Loads one relation onto an entity. @param entity - The entity. @param relationName - The relation field. */
    loadRelation(entity: T, relationName: string): Promise<unknown>;
    /** Returns one page of results. @param request - The page request. */
    findPage(request: PageRequest): Promise<Page<T>>;
    /** Deletes an entity by id. @param id - The entity id. */
    deleteById(id: ID): Promise<boolean>;
    /** Counts all entities. @returns The entity count. */
    count(): Promise<number>;
    /** Whether an entity exists. @param id - The entity id. */
    existsById(id: ID): Promise<boolean>;
}

/**
 * Adapts a synchronous repository to {@link AsyncRepository} without changing its
 * behavior. Calls retain the repository receiver, and synchronous exceptions
 * become promise rejections. Async repositories cannot be adapted back to sync.
 *
 * @param repository - The synchronous repository to adapt.
 * @returns Its promise-based counterpart.
 */
export function toAsyncRepository<T extends object, ID>(repository: Repository<T, ID>): AsyncRepository<T, ID> {
    return {
        async save(entity) {
            return repository.save(entity);
        },
        async findById(id, options) {
            return repository.findById(id, options);
        },
        async findAll(options) {
            return repository.findAll(options);
        },
        async loadRelation(entity, relationName) {
            return repository.loadRelation(entity, relationName);
        },
        async findPage(request) {
            return repository.findPage(request);
        },
        async deleteById(id) {
            return repository.deleteById(id);
        },
        async count() {
            return repository.count();
        },
        async existsById(id) {
            return repository.existsById(id);
        },
    };
}

/**
 * An abstract base class for implementing the `Repository` interface.
 * Provides common functionality for interacting with an `EntityManager`.
 * @typeParam T - The type of the entity.
 * @typeParam ID - The type of the entity's primary identifier.
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
     *
     * @returns The entity constructor.
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
     * @param options - Optional relation loading (eager fetch).
     * @returns The entity with the given ID or `undefined` if not found.
     */
    findById(id: ID, options: RelationFetchOptions = {}): T | undefined {
        const entity = this.#entityManager.find(this.#entityClass, id);
        return entity === undefined ? undefined : this.#fetchRelations(entity, options);
    }

    /**
     * Retrieves all entities of the managed type using the `EntityManager`.
     * @param options - Optional relation loading (eager fetch).
     * @returns All entities of the managed type.
     */
    findAll(options: RelationFetchOptions = {}): T[] {
        return this.#entityManager.findAll(this.#entityClass).map((entity) => this.#fetchRelations(entity, options));
    }

    /**
     * Loads one relation onto an entity.
     *
     * @param entity - The entity to update.
     * @param relationName - The relation field to load.
     * @returns The loaded relation value.
     */
    loadRelation(entity: T, relationName: string): unknown {
        const value = this.#entityManager.fetchRelation(entity, relationName);
        (entity as Record<string, unknown>)[relationName] = value;
        return value;
    }

    #fetchRelations(entity: T, options: RelationFetchOptions): T {
        for (const relationName of options.relations ?? []) {
            (entity as Record<string, unknown>)[relationName] = this.#entityManager.fetchRelation(entity, relationName);
        }
        return entity;
    }

    /**
     * Retrieves one page of entities, sorted and sliced per the request.
     * Sort properties must name declared entity fields; anything else fails loud.
     * @param request - The page index (1-based), size, and optional sort orders.
     * @returns The requested page with totals. Pages beyond the last are empty.
     */
    findPage(request: PageRequest): Page<T> {
        const meta = getEntityMetadata(this.#entityClass);
        const allowed = new Set(meta.columns.map((column) => column.fieldName));
        return pageFromAll(this.findAll(), request, allowed);
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
 * Base repository with in-memory derived-query support.
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
 * @typeParam T - The type of the entity.
 * @typeParam ID - The type of the entity's primary identifier.
 */
export class InMemoryDerivedQueryRepository<T extends object, ID> extends AbstractRepository<T, ID> {
    /**
     * Evaluates a derived-query method name against `this.findAll()`.
     *
     * @param methodName - The method name that was called.
     * @param args - The method arguments (query values).
     * @returns Matching entities.
     * @throws When the method name is not a supported derived query.
     */
    derive(methodName: string, args: unknown[]): T[] {
        const columns = getEntityMetadata(this.getEntityClass()).columns;
        const query = parseDerivedQuery(methodName, columns);
        if (!query) {
            throw new TypeError(`Unsupported derived query method: ${methodName}`);
        }

        const matched = this.findAll().filter((entity) =>
            query.filters.every(({ property, valueIndex }) => {
                const actual = (entity as Record<string, unknown>)[property];
                return actual === args[valueIndex];
            })
        );

        const ordered = query.orderBy === undefined ? matched : [...matched].sort(sortComparator(query.orderBy));
        return query.limit === undefined ? ordered : ordered.slice(0, query.limit);
    }
}

/**
 * An in-memory implementation of a repository, extending `AbstractRepository`.
 * It uses an `InMemoryEntityManager` for data operations, and supports derived
 * queries via {@link InMemoryDerivedQueryRepository.derive}.
 * @typeParam T - The type of the entity.
 * @typeParam ID - The type of the entity's primary identifier.
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
