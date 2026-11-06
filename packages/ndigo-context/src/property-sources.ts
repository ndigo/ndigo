/**
 */
import { IllegalStateError, JSONObject, type Enumerable } from '@ndigo/core';
import { PropertySource, wrapSource } from './property-source';

/**
 * Read-only view of the ordered, named {@link PropertySource} set.
 *
 * Consumers that only look (merge, index builds, test spies) type against this
 * interface; mutators live on {@link MutablePropertySources}.
 *
 * @see module:context.ConfigurableEnvironment
 */
export interface PropertySources extends Enumerable<string, PropertySource>, Iterable<PropertySource> {
    /**
     * The number of registered sources.
     */
    readonly size: number;
    /**
     * Returns the source registered under the given name.
     *
     * @param name - The source name.
     * @returns The matching source, or `undefined`.
     */
    get(name: string): PropertySource | undefined;
    /**
     * Returns whether a source is registered under the given name.
     *
     * @param name - The source name.
     * @returns `true` when registered.
     */
    contains(name: string): boolean;
    /**
     * Returns the sources in precedence order (first = highest precedence).
     *
     * @returns A fresh snapshot of the ordered sources.
     */
    toArray(): PropertySource[];
}

/**
 * Ordered, named property sources with O(1) name operations and keyed
 * enumeration in precedence order (first = highest precedence).
 *
 * Backed by a `Map` (name ops O(1), precedence order) plus a lazily rebuilt
 * array for ordering work. Enumeration uses the map directly. Every mutation
 * bumps {@link version} so index strategies can rebuild lazily on the next
 * lookup instead of eagerly.
 *
 * Error semantics: `addBefore`/`addAfter` with an unknown anchor throw
 * `IllegalStateError` naming the anchor and listing the registered names
 * (a typo in an anchor silently changes precedence otherwise). `remove` and
 * `replace` return booleans — absence is a valid outcome there.
 */
export class MutablePropertySources implements PropertySources {
    #byName!: Map<string, PropertySource>;
    #ordered: PropertySource[] | null = null;
    #version = 0;

    /**
     * The number of registered sources.
     */
    get size(): number {
        return this.#byName.size;
    }

    /**
     * Incremented on every mutation; index strategies use it to detect
     * staleness and rebuild lazily.
     */
    get version(): number {
        return this.#version;
    }

    constructor() {
        this.#byName = new Map<string, PropertySource>();
    }

    get(name: string): PropertySource | undefined {
        return this.#byName.get(name);
    }

    contains(name: string): boolean {
        return this.#byName.has(name);
    }

    /** Returns name/source pairs in precedence order. */
    entries(): IterableIterator<[string, PropertySource]> {
        return this.#byName.entries();
    }

    /** Returns source names in precedence order. */
    keys(): IterableIterator<string> {
        return this.#byName.keys();
    }

    /** Returns sources in precedence order. */
    values(): IterableIterator<PropertySource> {
        return this.#byName.values();
    }

    /** Visits each source in precedence order, using `context` as callback `this`. */
    forEach(callback: (value: PropertySource, key: string, list: this) => void, context?: unknown): void {
        this.#byName.forEach((value, key) => callback.call(context, value, key, this));
    }

    toArray(): PropertySource[] {
        return (this.#ordered ??= [...this.#byName.values()]);
    }

    /**
     * Adds a source at the front of the precedence order (highest
     * precedence). A name already registered is moved to the front.
     *
     * @param name - The source name.
     * @param source - The property values to capture.
     * @returns `this`, for chaining.
     */
    addFirst(name: string, source: JSONObject): this {
        this.#insert(0, name, source);
        return this;
    }

    /**
     * Adds a source at the end of the precedence order (lowest precedence).
     * A name already registered is moved to the end.
     *
     * @param name - The source name.
     * @param source - The property values to capture.
     * @returns `this`, for chaining.
     */
    addLast(name: string, source: JSONObject): this {
        this.#insert(this.toArray().length, name, source);
        return this;
    }

    /**
     * Adds a source directly before the named anchor.
     *
     * @param anchor - The name of the existing source to precede.
     * @param name - The source name.
     * @param source - The property values to capture.
     * @returns `this`, for chaining.
     * @throws When the anchor is not registered.
     */
    addBefore(anchor: string, name: string, source: JSONObject): this {
        if (anchor === name) return this.#replaceInPlace(name, source);
        this.#assertAnchor(anchor);
        this.#insert(this.#indexOfAfterRemoval(anchor, name), name, source);
        return this;
    }

    /**
     * Adds a source directly after the named anchor.
     *
     * @param anchor - The name of the existing source to follow.
     * @param name - The source name.
     * @param source - The property values to capture.
     * @returns `this`, for chaining.
     * @throws When the anchor is not registered.
     */
    addAfter(anchor: string, name: string, source: JSONObject): this {
        if (anchor === name) return this.#replaceInPlace(name, source);
        this.#assertAnchor(anchor);
        this.#insert(this.#indexOfAfterRemoval(anchor, name) + 1, name, source);
        return this;
    }

    /**
     * Removes the source registered under the given name.
     *
     * @param name - The source name.
     * @returns `true` when a source was removed.
     */
    remove(name: string): boolean {
        if (!this.#byName.delete(name)) return false;
        this.#ordered = null;
        this.#version++;
        return true;
    }

    /**
     * Replaces the source registered under the given name, keeping its
     * position in the precedence order.
     *
     * @param name - The source name.
     * @param source - The replacement property values to capture.
     * @returns `true` when a source was replaced.
     */
    replace(name: string, source: JSONObject): boolean {
        if (!this.#byName.has(name)) return false;
        this.#byName.set(name, wrapSource(name, source));
        this.#ordered = null;
        this.#version++;
        return true;
    }

    *[Symbol.iterator](): IterableIterator<PropertySource> {
        yield* this.toArray();
    }

    #assertAnchor(anchor: string): void {
        if (!this.#byName.has(anchor)) {
            throw new IllegalStateError(
                `Unknown property source anchor "${anchor}"; available: ${this.toArray()
                    .map((source) => source.name)
                    .join(', ')}`
            );
        }
    }

    #replaceInPlace(name: string, source: JSONObject): this {
        this.replace(name, source);
        return this;
    }

    #indexOfAfterRemoval(anchor: string, name: string): number {
        let index = 0;
        for (const source of this.toArray()) {
            if (source.name === name) continue;
            if (source.name === anchor) return index;
            index++;
        }
        return 0; // unreachable: anchor asserted, self-anchor handled by replace
    }

    #insert(index: number, name: string, source: JSONObject): void {
        const wrapped = wrapSource(name, source);
        const next = this.toArray().filter((entry) => entry.name !== name);
        next.splice(Math.min(index, next.length), 0, wrapped);
        this.#commit(next);
    }

    #commit(ordered: PropertySource[]): void {
        this.#byName = new Map(ordered.map((source) => [source.name, source] as const));
        this.#ordered = ordered;
        this.#version++;
    }
}
