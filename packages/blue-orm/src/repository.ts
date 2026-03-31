/** @author opencode */

import { Constructable } from '@blue/core';
import { EntityManager } from './entity-manager';

export interface Repository<T extends object, ID> {
    save(entity: T): T;
    findById(id: ID): T | undefined;
    findAll(): T[];
    deleteById(id: ID): boolean;
    count(): number;
    existsById(id: ID): boolean;
}

export abstract class AbstractRepository<T extends object, ID> implements Repository<T, ID> {
    readonly #entityClass: Constructable<T>;
    readonly #entityManager: EntityManager;

    constructor(entityClass: Constructable<T>, entityManager: EntityManager) {
        this.#entityClass = entityClass;
        this.#entityManager = entityManager;
    }

    save(entity: T): T {
        this.#entityManager.persist(entity);
        return entity;
    }

    findById(id: ID): T | undefined {
        return this.#entityManager.find(this.#entityClass, id);
    }

    findAll(): T[] {
        return this.#entityManager.findAll(this.#entityClass);
    }

    deleteById(id: ID): boolean {
        const entity = this.findById(id);

        if (!entity) {
            return false;
        }

        this.#entityManager.remove(entity);
        return true;
    }

    count(): number {
        return this.findAll().length;
    }

    existsById(id: ID): boolean {
        return this.findById(id) !== undefined;
    }
}

export class InMemoryRepository<T extends object, ID> extends AbstractRepository<T, ID> {
    constructor(entityClass: Constructable<T>, entityManager: EntityManager) {
        super(entityClass, entityManager);
    }
}
