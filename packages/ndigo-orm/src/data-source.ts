/**
 */
import { IllegalStateError } from '@ndigo/core';
import { Destroyable, Initializable } from '@ndigo/factory';

/**
 * Well-known symbol an entity class implements to control how it is cloned for
 * {@link InMemoryDataSource.snapshot} / `restore` (DAT-F7).
 *
 * `snapshot()` clones own enumerable properties, so ECMAScript private fields
 * (`#field`) are not carried over — a restored instance lacks its private
 * brand and any access throws. An entity that owns private state implements
 * this hook to copy it explicitly:
 *
 * ```typescript
 * class ApiKey {
 *     #secret = '';
 *     [ENTITY_CLONE](): ApiKey {
 *         const copy = new ApiKey();
 *         copy.#secret = this.#secret;
 *         return copy;
 *     }
 * }
 * ```
 *
 * The hook owns its clone completely: it returns a fresh instance (or a plain
 * object) and is responsible for copying whatever state it holds.
 */
export const ENTITY_CLONE: unique symbol = Symbol.for('@ndigo/orm:entityClone');

/**
 * Contract for classes that customize their snapshot clone; see
 * {@link ENTITY_CLONE}.
 */
export interface EntityCloneHook {
    [ENTITY_CLONE](): object;
}

/**
 * Represents a data source for managing entity stores.
 * It extends `Initializable` and `Destroyable` for lifecycle management.
 */
export interface DataSource extends Initializable, Destroyable {
    /**
     * Retrieves the store for a given entity name.
     * @param entityName - The name of the entity.
     * @returns A Map representing the entity store.
     * @throws If the store for the entity does not exist.
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
    #stores: Map<string, Map<unknown, unknown>>;

    /**
     * Creates an instance of `InMemoryDataSource`.
     */
    constructor() {
        this.destroyed = false;
        this.#stores = new Map<string, Map<unknown, unknown>>();
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
     * @throws If the store for the entity does not exist.
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
            this.#stores.set(entityName, new Map<unknown, unknown>());
        }
    }

    /**
     * Clears all entity stores.
     */
    clear(): void {
        this.#stores.clear();
    }

    /**
     * Captures a deep snapshot of all entity stores (for transaction rollback).
     *
     * Every stored entity is deep-cloned — values and nested references are
     * copied, object prototypes are preserved so restored entities remain
     * valid class instances, and cycles/shared references are kept intact.
     * Store keys are kept as-is (primary identifiers), and the snapshot is
     * isolated from mutations made after this call.
     *
     * Own enumerable state is copied, so entities with ECMAScript private
     * fields should implement the {@link ENTITY_CLONE} hook to carry that
     * state across a snapshot/restore (DAT-F7).
     *
     * @returns An opaque snapshot handle to pass to {@link restore}.
     */
    snapshot(): { stores: Map<string, Map<unknown, unknown>> } {
        const seen = new Map<object, unknown>();
        const stores = new Map<string, Map<unknown, unknown>>();
        for (const [name, store] of this.#stores) {
            const copy = new Map<unknown, unknown>();
            for (const [key, entity] of store) {
                copy.set(key, cloneStoredValue(entity, seen));
            }
            stores.set(name, copy);
        }
        return { stores };
    }

    /**
     * Restores entity stores to a previously captured snapshot, discarding any
     * writes made after it. Used for transaction rollback.
     *
     * Entities are re-cloned from the snapshot, so the handle stays pristine
     * and can be restored repeatedly. Rollback restores the store-visible
     * state: entities read back after a restore are clones of their
     * pre-snapshot values. References callers held to entities before the
     * snapshot still observe their own later mutations — after a restore the
     * stores no longer alias those objects.
     *
     * @param snapshot - The snapshot from `snapshot()`.
     */
    restore(snapshot: { stores: Map<string, Map<unknown, unknown>> }): void {
        const seen = new Map<object, unknown>();
        this.#stores = new Map<string, Map<unknown, unknown>>();
        for (const [name, store] of snapshot.stores) {
            const copy = new Map<unknown, unknown>();
            for (const [key, entity] of store) {
                copy.set(key, cloneStoredValue(entity, seen));
            }
            this.#stores.set(name, copy);
        }
    }
}

/**
 * Deep-clones one stored value for {@link InMemoryDataSource.snapshot} /
 * `restore`. Entity data is a graph of primitives, arrays, dates, maps/sets,
 * and class instances (entities and their loaded relations), so the clone
 * walks those shapes, preserving object prototypes — clones must still answer
 * `entity.constructor`/lifecycle lookups — and memoizing visited objects so
 * cycles and shared references survive. Built-ins with internal slots (typed
 * arrays, buffers, regexes) are copied verbatim via `structuredClone`.
 *
 * @param value - The value to clone.
 * @param seen - Memo of objects already cloned in this pass.
 * @returns The cloned value.
 */
function cloneStoredValue<T>(value: T, seen: Map<object, unknown>): T {
    if (value === null || typeof value !== 'object') {
        return value;
    }

    const cloned = seen.get(value);
    if (cloned !== undefined) {
        return cloned as T;
    }

    // Entities with private state opt into a custom clone (DAT-F7); they own
    // the whole copy, so no prototype/own-property walk runs for them.
    const cloneHook = (value as Partial<EntityCloneHook>)[ENTITY_CLONE];
    if (typeof cloneHook === 'function') {
        const clone = cloneHook.call(value);
        seen.set(value, clone);
        return clone as T;
    }

    if (value instanceof Date) {
        return new Date(value.getTime()) as T;
    }

    if (value instanceof RegExp || value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
        return structuredClone(value) as T;
    }

    if (Array.isArray(value)) {
        const clone: unknown[] = [];
        seen.set(value, clone);
        for (const item of value) {
            clone.push(cloneStoredValue(item, seen));
        }
        return clone as T;
    }

    if (value instanceof Map) {
        const clone = new Map<unknown, unknown>();
        seen.set(value, clone);
        for (const [key, entry] of value) {
            clone.set(cloneStoredValue(key, seen), cloneStoredValue(entry, seen));
        }
        return clone as T;
    }

    if (value instanceof Set) {
        const clone = new Set<unknown>();
        seen.set(value, clone);
        for (const entry of value) {
            clone.add(cloneStoredValue(entry, seen));
        }
        return clone as T;
    }

    // Plain objects and class instances: keep the prototype so restored
    // entities remain valid class instances, and copy own enumerable state.
    const clone = Object.create(Object.getPrototypeOf(value)) as Record<string, unknown>;
    seen.set(value, clone);
    for (const key of Object.keys(value)) {
        clone[key] = cloneStoredValue((value as Record<string, unknown>)[key], seen);
    }
    return clone as T;
}
