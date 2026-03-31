/** @author opencode */

import { IllegalStateError } from '@blue/core';
import { Destroyable, Initializable } from '@blue/factory';

export interface DataSource extends Initializable, Destroyable {
    getStore<T>(entityName: string): Map<unknown, T>;
    hasStore(entityName: string): boolean;
    createStore(entityName: string): void;
    clear(): void;
}

export class InMemoryDataSource implements DataSource {
    destroyed: boolean;
    #stores: Map<string, Map<unknown, any>>;

    constructor() {
        this.destroyed = false;
        this.#stores = new Map<string, Map<unknown, any>>();
    }

    init(): void {}

    destroy(): void {
        this.clear();
        this.destroyed = true;
    }

    getStore<T>(entityName: string): Map<unknown, T> {
        const store = this.#stores.get(entityName);

        if (!store) {
            throw new IllegalStateError(`Store for entity '${entityName}' does not exist.`);
        }

        return store as Map<unknown, T>;
    }

    hasStore(entityName: string): boolean {
        return this.#stores.has(entityName);
    }

    createStore(entityName: string): void {
        if (!this.hasStore(entityName)) {
            this.#stores.set(entityName, new Map<unknown, any>());
        }
    }

    clear(): void {
        this.#stores.clear();
    }
}
