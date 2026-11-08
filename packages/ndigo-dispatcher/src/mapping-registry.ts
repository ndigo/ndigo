/**
 * Handler-mapping registry.
 */

import { MultiValueMap } from '@ndigo/core';
import { RouteHandlerMethod } from './route-handler-method';

/**
 * Internal registry entry for a mapping and its resolved handler method.
 */
class MappingEntry<T = unknown> {
    readonly mapping: T;
    readonly handlerMethod: RouteHandlerMethod;
    readonly directPaths: string[];
    readonly mappingName: string;

    get [Symbol.toStringTag](): string {
        return 'MappingEntry';
    }

    /**
     * Create a mapping registry entry.
     *
     * @param mapping - The mapping key.
     * @param handlerMethod - The resolved handler method.
     * @param mappingName - The mapping name, if any.
     * @param directPaths - Paths that map directly to this entry.
     */
    constructor(mapping: T, handlerMethod: RouteHandlerMethod, mappingName: string, directPaths: string[] = []) {
        this.mapping = mapping;
        this.handlerMethod = handlerMethod;
        this.mappingName = mappingName;
        this.directPaths = directPaths;
    }
}

/**
 * Maintains mapping-to-handler-method lookups.
 */
class MappingRegistry<T = unknown> {
    #registry = new Map<T, MappingEntry<T>>();
    #mappingLookup = new Map<T, RouteHandlerMethod>();
    #pathLookup = new MultiValueMap<string, T>();
    #nameLookup = new MultiValueMap<string, RouteHandlerMethod>();

    get [Symbol.toStringTag](): string {
        return 'MappingRegistry';
    }

    /**
     * Return the current mapping table.
     *
     * @returns The mapping-to-handler-method map.
     */
    get mappings(): Map<T, RouteHandlerMethod> {
        return this.#mappingLookup;
    }

    /**
     * Find mappings that are associated with a path.
     *
     * @param path - The request path.
     * @returns The matching mappings.
     */
    getMappingsByPath(path: string): T[] {
        return this.#pathLookup.get(path) ?? [];
    }

    /**
     * Find handler methods registered under a mapping name.
     *
     * @param name - The mapping name.
     * @returns The matching handler methods.
     */
    getHandlerMethodsByMappingName(name: string): RouteHandlerMethod[] {
        return this.#nameLookup.get(name) ?? [];
    }

    /**
     * Return every registered entry, in registration order.
     *
     * Unlike {@link mappings}, an entry carries the mapping object, the
     * handler method, its mapping name and any direct paths — the read model
     * introspection tooling needs without touching dispatch behavior.
     *
     * @returns A snapshot array of the registered entries.
     */
    entries(): MappingEntry<T>[] {
        return [...this.#registry.values()];
    }

    /**
     * Register a mapping and its handler method.
     *
     * @param mapping - The mapping key.
     * @param handlerMethod - The handler method to associate.
     * @param mappingName - The name the handler method is exposed under, if any.
     * @param directPaths - Paths that map directly to this entry.
     */
    register(mapping: T, handlerMethod: RouteHandlerMethod, mappingName: string, directPaths: string[] = []): void {
        this.#mappingLookup.set(mapping, handlerMethod);
        const length = directPaths.length;
        for (let i = 0; i < length; i++) {
            this.#pathLookup.add(directPaths[i], mapping);
        }
        if (mappingName) {
            this.#nameLookup.add(mappingName, handlerMethod);
        }

        this.#registry.set(mapping, new MappingEntry(mapping, handlerMethod, mappingName, directPaths));
    }

    unregister(mapping: T): void {
        if (!this.#registry.has(mapping)) {
            return;
        } else {
            const entry = this.#registry.get(mapping);
            if (!entry) {
                return;
            }
            const { directPaths } = entry,
                length = directPaths.length;

            this.#registry.delete(mapping);
            this.#mappingLookup.delete(entry.mapping);

            for (let index = 0; index < length; index++) {
                const path = directPaths[index];
                if (this.#pathLookup.has(path)) {
                    const list = this.#pathLookup.get(path) ?? [];
                    const listIndex = list.indexOf(entry.mapping);
                    if (listIndex !== -1) {
                        list.splice(listIndex, 1);
                    }
                }
            }

            this._removeMappingName(entry);
        }
    }

    private _removeMappingName({ mappingName, handlerMethod }: MappingEntry): void {
        if (!mappingName) {
            return;
        }

        const _nameLookup = this.#nameLookup,
            oldList = _nameLookup.get(mappingName);

        if (!oldList) {
            return;
        }

        if (oldList.length <= 1) {
            _nameLookup.delete(mappingName);
            return;
        }

        const newList: RouteHandlerMethod[] = oldList.filter((hm) => hm !== handlerMethod);

        _nameLookup.set(mappingName, newList);
    }
}

export { MappingEntry, MappingRegistry };
