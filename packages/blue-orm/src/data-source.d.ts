/** @author opencode */
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
export declare class InMemoryDataSource implements DataSource {
    #private;
    destroyed: boolean;
    /**
     * Creates an instance of `InMemoryDataSource`.
     */
    constructor();
    /**
     * Initializes the data source. No operation for `InMemoryDataSource`.
     */
    init(): void;
    /**
     * Destroys the data source by clearing all stores and marking it as destroyed.
     */
    destroy(): void;
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
