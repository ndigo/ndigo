/**
 * Property index strategies: prototype-chain and flat-merged indexes, plus
 * the internal token cache and path helpers.
 */
import { BoundedCache, createNull, getPath, JSONValue, JSONObject, KeypathToken, KeypathConverter } from '@ndigo/core';
import { isNil } from '@ndigo/util/types';
import type { PropertySource } from './property-source';
import type { PropertyIndex } from './property-resolver-types';

const keypathConverter = new KeypathConverter();

const pathIsDefined = (keypath: KeypathToken[], obj: unknown): boolean => {
    return !isNil(getPath(keypath, obj));
};

const linkPrototype = (current: object, next: object): object => {
    Reflect.setPrototypeOf(next, null);
    Reflect.setPrototypeOf(current, next);
    return next;
};

const toPrototypeChain = (list: JSONObject[]): JSONObject => {
    const data: JSONObject = createNull();
    list.reduce<object>(linkPrototype, data);
    return data; // chain of the captured source objects, by construction a JSONObject
};

class TokenCache {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "TokenCache".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object TokenCache]"
     */
    get [Symbol.toStringTag](): string {
        return 'TokenCache';
    }

    #cache = new BoundedCache<string, KeypathToken[]>({ maxSize: 256, policy: 'fifo' });

    get(key: string): KeypathToken[] | null {
        const cached = this.#cache.get(key);
        if (cached !== undefined) return cached;
        const tokens = keypathConverter.convert(key);
        if (tokens) {
            this.#cache.set(key, tokens);
        }
        return tokens;
    }
}

/**
 * Index that layers sources through a prototype chain.
 *
 * The chain object gives source precedence only for top-level keys; deeper
 * tokens index into the resolved value, matching the framework's historical
 * resolution semantics. Mutations to a captured source map remain visible
 * without a rebuild.
 */
export class PrototypeChainIndex implements PropertyIndex {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "PrototypeChainIndex".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object PrototypeChainIndex]"
     */
    get [Symbol.toStringTag](): string {
        return 'PrototypeChainIndex';
    }

    #chain: unknown;
    #tokens = new TokenCache();

    /** Builds the index from sources. @param sources - The property sources. */
    build(sources: PropertySource[]): void {
        const properties = sources.map((source) => source.properties);
        this.#chain = properties.length === 1 ? properties[0] : toPrototypeChain(properties);
    }

    /** Gets a property. @param key - The key. @returns The value. */
    getProperty(key: string): JSONValue | undefined {
        const keypath = this.#tokens.get(key);
        if (!keypath) return undefined;
        let value: unknown = this.#chain;
        for (const token of keypath) {
            if (value === null || typeof value !== 'object') return undefined;
            value = (value as Record<string | number, unknown>)[token];
        }
        return value as JSONValue | undefined;
    }

    /** Whether a property exists. @param key - The key. @returns `true` when present. */
    hasProperty(key: string): boolean {
        const keypath = this.#tokens.get(key);
        return keypath ? pathIsDefined(keypath, this.#chain) : false;
    }
}

/**
 * Index that merges sources into one flat object on build.
 *
 * Top-level keys are taken first-source-wins, so lookups are a single
 * property read instead of a prototype-chain walk. Per-key winning sources
 * are retained for origin tracking (Phase 5). Captured source maps are
 * replaced, not mutated — in-place edits after build stay invisible until
 * the next rebuild.
 */
export class FlatMergedIndex implements PropertyIndex {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "FlatMergedIndex".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object FlatMergedIndex]"
     */
    get [Symbol.toStringTag](): string {
        return 'FlatMergedIndex';
    }

    #merged: Record<string | number, unknown> = createNull();
    #origins = new Map<string, string>();
    #tokens = new TokenCache();

    /** Builds the index from sources. @param sources - The property sources. */
    build(sources: PropertySource[]): void {
        const merged: Record<string | number, unknown> = createNull();
        const origins = new Map<string, string>();
        for (const source of sources) {
            for (const key of Object.keys(source.properties)) {
                if (key in merged) continue; // first source with the key wins
                merged[key] = (source.properties as Record<string, unknown>)[key];
                origins.set(key, source.name);
            }
        }
        this.#merged = merged;
        this.#origins = origins;
    }

    /** Gets a property. @param key - The key. @returns The value. */
    getProperty(key: string): JSONValue | undefined {
        const keypath = this.#tokens.get(key);
        if (!keypath) return undefined;
        let value: unknown = this.#merged;
        for (const token of keypath) {
            if (value === null || typeof value !== 'object') return undefined;
            value = (value as Record<string | number, unknown>)[token];
        }
        return value as JSONValue | undefined;
    }

    /** Whether a property exists. @param key - The key. @returns `true` when present. */
    hasProperty(key: string): boolean {
        const keypath = this.#tokens.get(key);
        return keypath ? pathIsDefined(keypath, this.#merged) : false;
    }

    /**
     * Returns the name of the source that first defined the top-level segment
     * of the key (`server.port` reports the source owning `server` — top-level
     * granularity).
     *
     * @param key - The property key (only the top-level segment is consulted).
     * @returns The winning source name, or `undefined`.
     */
    originOf(key: string): string | undefined {
        const dot = key.indexOf('.');
        const top = dot === -1 ? key : key.slice(0, dot);
        return this.#origins.get(top);
    }
}
