/** @author opencode */

import { IllegalStateError } from '@blue/core';
import { Destroyable, Initializable } from '@blue/factory';

/**
 * Represents a data source for managing entity stores.
 * It extends `Initializable` and `Destroyable` for lifecycle management.
 */
export interface DataSource extends Initializable, Destroyable {
    /**
     * Retrieves the store for a given entity name.
     * @param entityName - The name of the entity.
     * @returns A Map representing the entity store.
     * @throws {IllegalStateError} If the store for the entity does not exist.
     */
    getStore<T>(entityName: string): Map<unknown, T>;
    /**
     * Checks if a store for the given entity name exists.
     * @param entityName - The name of the entity.
     * @returns `true` if the store exists, `false` otherwise.
     */
    hasStore(entityName: string): boolean;
    /**
     * Creates a new store for the given entity name if it doesn't already exist.
     * @param entityName - The name of the entity.
     */
    createStore(entityName: string): void;
    /**
     * Clears all entity stores.
     */
    clear(): void;
}

/**
 * An in-memory implementation of the `DataSource` interface.
 * It stores entity data in JavaScript Maps.
 */
export class InMemoryDataSource implements DataSource {
    destroyed: boolean;
    #stores: Map<string, Map<unknown, any>>;

    /**
     * Creates an instance of `InMemoryDataSource`.
     */
    constructor() {
        this.destroyed = false;
        this.#stores = new Map<string, Map<unknown, any>>();
    }

    /**
     * Initializes the data source. No operation for `InMemoryDataSource`.
     */
    init(): void {}

    /**
     * Destroys the data source by clearing all stores and marking it as destroyed.
     */
    destroy(): void {
        this.clear();
        this.destroyed = true;
    }

    /**
     * Retrieves the store for a given entity name.
     * @param entityName - The name of the entity.
     * @returns A Map representing the entity store.
     * @throws {IllegalStateError} If the store for the entity does not exist.
     */
    getStore<T>(entityName: string): Map<unknown, T> {
        const store = this.#stores.get(entityName);

        if (!store) {
            throw new IllegalStateError(`Store for entity '${entityName}' does not exist.`);
        }

        return store as Map<unknown, T>;
    }

    /**
     * Checks if a store for the given entity name exists.
     * @param entityName - The name of the entity.
     * @returns `true` if the store exists, `false` otherwise.
     */
    hasStore(entityName: string): boolean {
        return this.#stores.has(entityName);
    }

    /**
     * Creates a new store for the given entity name if it doesn't already exist.
     * @param entityName - The name of the entity.
     */
    createStore(entityName: string): void {
        if (!this.hasStore(entityName)) {
            this.#stores.set(entityName, new Map<unknown, any>());
        }
    }

    /**
     * Clears all entity stores.
     */
    clear(): void {
        this.#stores.clear();
    }
}
