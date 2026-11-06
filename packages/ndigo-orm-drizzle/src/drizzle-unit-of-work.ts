/**
 * Unit of work for the Drizzle-backed persistence layer.
 */
import { EntityState } from '@ndigo/orm';
import { DrizzleEntityManager } from './drizzle-entity-manager';

/**
 * Tracks new, dirty, and removed entities and flushes them to a Drizzle store
 * as a single async batch.
 *
 * @since 1.0.0
 */
export class DrizzleUnitOfWork {
    readonly #entityManager: DrizzleEntityManager;
    #newEntities: Set<object>;
    #dirtyEntities: Set<object>;
    #removedEntities: Set<object>;

    /**
     * @param entityManager - The Drizzle entity manager used to persist.
     */
    constructor(entityManager: DrizzleEntityManager) {
        this.#entityManager = entityManager;
        this.#newEntities = new Set<object>();
        this.#dirtyEntities = new Set<object>();
        this.#removedEntities = new Set<object>();
    }

    /**
     * Registers a new entity to be persisted on the next flush.
     * Clears any prior removed/dirty registrations for the same entity.
     */
    registerNew<T extends object>(entity: T): void {
        this.#removedEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#newEntities.add(entity);
    }

    /**
     * Registers an existing entity whose state has changed. A new or removed
     * entity is not also marked dirty.
     */
    registerDirty<T extends object>(entity: T): void {
        if (this.#newEntities.has(entity) || this.#removedEntities.has(entity)) {
            return;
        }
        this.#dirtyEntities.add(entity);
    }

    /**
     * Registers an entity to be removed on the next flush.
     * Clears any prior new/dirty registrations for the same entity.
     */
    registerRemoved<T extends object>(entity: T): void {
        this.#newEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#removedEntities.add(entity);
    }

    /**
     * Gets the current tracked state of an entity.
     *
     * @returns `'new'`, `'managed'` (dirty), `'removed'`, or `undefined` when
     *   the entity is not tracked.
     */
    getState<T extends object>(entity: T): EntityState | undefined {
        if (this.#removedEntities.has(entity)) return 'removed';
        if (this.#newEntities.has(entity)) return 'new';
        if (this.#dirtyEntities.has(entity)) return 'managed';
        return undefined;
    }

    /**
     * Persists all registered changes through the Drizzle entity manager:
     * new and dirty entities are upserted, removed entities are deleted.
     *
     * @returns A promise that resolves once all writes have completed.
     */
    async flush(): Promise<void> {
        // Each registration batch is independent; writes run concurrently.
        await Promise.all([...this.#newEntities].map((entity) => this.#entityManager.persist(entity)));
        await Promise.all([...this.#dirtyEntities].map((entity) => this.#entityManager.persist(entity)));
        await Promise.all([...this.#removedEntities].map((entity) => this.#entityManager.remove(entity)));
        this.clear();
    }

    /**
     * Clears all registered entities without persisting.
     */
    clear(): void {
        this.#newEntities.clear();
        this.#dirtyEntities.clear();
        this.#removedEntities.clear();
    }
}
