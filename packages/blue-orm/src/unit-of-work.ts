/** @author opencode */

import { EntityManager } from './entity-manager';

export type EntityState = 'new' | 'managed' | 'removed';

export interface UnitOfWork {
    registerNew<T extends object>(entity: T): void;
    registerDirty<T extends object>(entity: T): void;
    registerRemoved<T extends object>(entity: T): void;
    getState<T extends object>(entity: T): EntityState | undefined;
    flush(): void;
    clear(): void;
}

export class InMemoryUnitOfWork implements UnitOfWork {
    readonly #entityManager: EntityManager;
    #newEntities: Set<object>;
    #dirtyEntities: Set<object>;
    #removedEntities: Set<object>;

    constructor(entityManager: EntityManager) {
        this.#entityManager = entityManager;
        this.#newEntities = new Set<object>();
        this.#dirtyEntities = new Set<object>();
        this.#removedEntities = new Set<object>();
    }

    registerNew<T extends object>(entity: T): void {
        this.#removedEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#newEntities.add(entity);
    }

    registerDirty<T extends object>(entity: T): void {
        if (this.#newEntities.has(entity) || this.#removedEntities.has(entity)) {
            return;
        }

        this.#dirtyEntities.add(entity);
    }

    registerRemoved<T extends object>(entity: T): void {
        this.#newEntities.delete(entity);
        this.#dirtyEntities.delete(entity);
        this.#removedEntities.add(entity);
    }

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

    clear(): void {
        this.#newEntities.clear();
        this.#dirtyEntities.clear();
        this.#removedEntities.clear();
    }
}
