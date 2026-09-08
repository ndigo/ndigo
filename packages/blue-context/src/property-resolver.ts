import { IllegalStateError, JSONValue, JSONObject, createNull, parseKeypath } from '@blue/core';
import type { KeypathToken } from '@blue/core';
import type { ConversionService } from '@blue/core';
import { createConversionService } from '@blue/core';
import { like, isNil } from '@blue/util/types';
import { PropertySource, wrapSource } from './property-source';
import type { MutablePropertySources } from './property-sources';
import { resolvePlaceholders } from './placeholder-resolver';

type PrimitiveLike = 'string' | 'number' | 'boolean';

/**
 * Maps a constructor/function name to the primitive type name, or `undefined`
 * for non-primitive targets (`Boolean` → `'boolean'`, `Number` → `'number'`,
 * `String` → `'string'`, `Date` → `undefined`).
 */
const primitiveNameOf = (name: string): PrimitiveLike | undefined => {
    const lower = name.toLowerCase();
    return lower === 'boolean' || lower === 'number' || lower === 'string' ? lower : undefined;
};

/**
 * Resolves property values from a configured set of sources.
 */
export interface PropertyResolver {
    /**
     * Resolves a property value, falling back to a default when missing.
     *
     * @param key - The property name to resolve.
     * @param defaultValue - The value to return when no property is found.
     * @returns The resolved property value or the default value.
     */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined;
    /**
     * Returns the resolved property value or throws when missing.
     *
     * @param key - The property name to resolve.
     * @returns The resolved property value.
     * @throws {IllegalStateError} When the property cannot be resolved.
     */
    getRequiredProperty(key: string): JSONValue;
    /**
     * Returns whether a property key can be resolved.
     *
     * @param key - The property name to resolve.
     * @returns `true` when the property exists.
     */
    hasProperty(key: string): boolean;
    /**
     * Resolves a property as a typed value, converting when needed.
     *
     * @param key - The property name to resolve.
     * @param targetType - The target constructor or primitive (`Number`, `Boolean`, `Date`, ...).
     * @param defaultValue - The value to return when the property is missing.
     * @returns The typed value or the default.
     * @throws {IllegalStateError} When a present value cannot be converted.
     */
    getPropertyAs<T>(
        key: string,
        targetType: (new (...args: never[]) => T) | (() => T) | T,
        defaultValue?: T
    ): T | undefined;
    /**
     * Returns a typed property or throws when missing or unconvertible.
     *
     * @param key - The property name to resolve.
     * @param targetType - The target constructor or primitive.
     * @returns The typed value.
     * @throws {IllegalStateError} When missing, unresolved, or unconvertible.
     */
    getRequiredPropertyAs<T>(key: string, targetType: (new (...args: never[]) => T) | (() => T) | T): T;
    /**
     * Raw index lookup, bypassing placeholder resolution (internal use by the
     * placeholder resolver; consumers should use {@link getProperty}).
     *
     * @param key - The property name to resolve.
     * @returns The raw value or `undefined`.
     */
    getRawProperty(key: string): JSONValue | undefined;
}

/**
 * Property resolver that exposes mutable property sources.
 */
export interface ConfigurablePropertyResolver extends PropertyResolver {
    /**
     * The ordered set of property sources used during resolution.
     */
    propertySources: JSONObject[];
}

/**
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
}) as (value: any) => value is PropertyResolver;

const pathIsDefined = (keypath: KeypathToken[], obj: unknown): boolean => {
    let value: unknown = obj;
    for (const token of keypath) {
        if (value === null || typeof value !== 'object') return false;
        value = (value as Record<string | number, unknown>)[token];
    }
    return !isNil(value);
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

/**
 * Bounded FIFO cache of parsed keypaths, so hot lookups never allocate.
 */
class TokenCache {
    #entries = new Map<string, KeypathToken[]>();
    #cap: number;

    constructor(cap = 256) {
        this.#cap = cap;
    }

    get(key: string): KeypathToken[] | null {
        const cached = this.#entries.get(key);
        if (cached) return cached;
        const tokens = parseKeypath(key);
        if (tokens) {
            if (this.#entries.size >= this.#cap) {
                // Evict the oldest entry (Map preserves insertion order).
                this.#entries.delete(this.#entries.keys().next().value as string);
            }
            this.#entries.set(key, tokens);
        }
        return tokens;
    }
}

/**
 * Internal lookup strategy behind {@link PrototypalPropertyResolver}.
 *
 * Strategies produce identical query results for identical registries; the
 * resolver picks one per platform (see the Phase 0 plan, D3/D6).
 */
export interface PropertyIndex {
    /**
     * Rebuilds the index from the given ordered sources (first = highest
     * precedence).
     *
     * @param sources - The ordered property sources.
     */
    build(sources: PropertySource[]): void;
    /**
     * Resolves a property value, or `undefined` when absent.
     *
     * @param key - The property name (keypath syntax).
     * @returns The resolved value or `undefined`.
     */
    getProperty(key: string): JSONValue | undefined;
    /**
     * Returns whether the property resolves to a non-null value.
     *
     * @param key - The property name (keypath syntax).
     * @returns `true` when the property is defined.
     */
    hasProperty(key: string): boolean;
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
    #chain: unknown;
    #tokens = new TokenCache();

    build(sources: PropertySource[]): void {
        const properties = sources.map((source) => source.properties);
        this.#chain = properties.length === 1 ? properties[0] : toPrototypeChain(properties);
    }

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
    #merged: Record<string | number, unknown> = createNull();
    #origins = new Map<string, string>();
    #tokens = new TokenCache();

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

    hasProperty(key: string): boolean {
        const keypath = this.#tokens.get(key);
        return keypath ? pathIsDefined(keypath, this.#merged) : false;
    }

    /**
     * Returns the name of the source that first defined the top-level key.
     *
     * Internal origin surface for Phase 5 origin tracking; not part of the
     * index contract.
     *
     * @param key - The top-level property key.
     * @returns The winning source name, or `undefined`.
     */
    getOrigin(key: string): string | undefined {
        return this.#origins.get(key);
    }
}

/**
 * Options controlling the resolver's internal lookup strategy.
 */
export interface ResolverOptions {
    /**
     * The lookup index to use. Defaults to the prototype chain (the
     * framework's historical behavior).
     */
    index?: 'prototype' | 'flat';
    /**
     * The conversion service for typed lookups (`getPropertyAs`). Defaults to
     * a fresh `createConversionService()` when typed reads are used.
     */
    conversionService?: ConversionService;
}

/**
 * Property resolver that layers sources through a configured index.
 *
 * Preferred construction is {@link PrototypalPropertyResolver.create}, which
 * backs the resolver with a live {@link PropertySources|registry} (mutations
 * are picked up lazily). The plain constructor stays for compatibility: the
 * source array is captured once and replaced via the `propertySources`
 * setter.
 */
export class PrototypalPropertyResolver implements ConfigurablePropertyResolver {
    #sources!: PropertySource[];
    #index: PropertyIndex;
    #registry: MutablePropertySources | null = null;
    #seenVersion = -1;
    #options: ResolverOptions;
    #placeholderCache = new Map<string, JSONValue>();
    #conversionService: ConversionService | null = null;

    /**
     * The live registry backing this resolver, when created via
     * {@link PrototypalPropertyResolver.create}.
     *
     * @returns The registry, or throws when this resolver is array-backed.
     * @throws {IllegalStateError} When the resolver was not created from a registry.
     */
    get registry(): MutablePropertySources {
        if (!this.#registry) {
            throw new IllegalStateError('Resolver is not backed by a property source registry');
        }
        return this.#registry;
    }

    /**
     * The options this resolver was created with.
     */
    get options(): ResolverOptions {
        return this.#options;
    }

    /**
     * The ordered set of configured property sources (snapshot).
     */
    get propertySources(): JSONObject[] {
        this.#syncRegistry();
        return this.#sources.map((source) => source.properties);
    }

    /**
     * Replaces the property sources and rebuilds the lookup index.
     *
     * @param propertySources - The new property sources.
     */
    set propertySources(propertySources) {
        this.#sources = propertySources.map((source, index) => wrapSource(`source:${index}`, source));
        this.#registry = null; // explicit array replaces any live registry binding
        this.#index.build(this.#sources);
    }

    /**
     * Creates a resolver over the given sources (compatibility path).
     *
     * @param propertySources - The ordered property sources.
     * @param options - Resolver options (index strategy).
     */
    constructor(propertySources: JSONObject[] = [], options: ResolverOptions = {}) {
        this.#options = options;
        this.#index = options.index === 'flat' ? new FlatMergedIndex() : new PrototypeChainIndex();
        this.propertySources = propertySources;
    }

    /**
     * Creates a resolver backed by a live property source registry.
     *
     * The registry is read lazily: mutations are picked up on the next
     * lookup, so burst edits cost a single index rebuild.
     *
     * @param registry - The registry to resolve against.
     * @param options - Resolver options (index strategy).
     * @returns The registry-backed resolver.
     */
    static create(registry: MutablePropertySources, options: ResolverOptions = {}): PrototypalPropertyResolver {
        const resolver = new PrototypalPropertyResolver([], options);
        resolver.#registry = registry;
        resolver.#syncRegistry();
        return resolver;
    }

    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        this.#syncRegistry();
        return (
            this.#resolve(key, this.#index.getProperty(key)) ?? (defaultValue === undefined ? undefined : defaultValue)
        );
    }

    getRequiredProperty(key: string): JSONValue {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') {
            throw new IllegalStateError(`Required property "${key}" missing`);
        }
        const resolved = this.#resolve(key, raw);
        if (typeof resolved === 'string' && resolved.includes('${')) {
            throw new IllegalStateError(
                `Required property "${key}" could not be resolved: unresolved placeholder in value "${resolved}"`
            );
        }
        return resolved as JSONValue;
    }

    getPropertyAs<T>(
        key: string,
        targetType: (new (...args: never[]) => T) | (() => T) | T,
        defaultValue?: T
    ): T | undefined {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') return defaultValue;
        const resolved = this.#resolve(key, raw);
        return this.#convert(key, resolved, targetType) ?? defaultValue;
    }

    getRequiredPropertyAs<T>(key: string, targetType: (new (...args: never[]) => T) | (() => T) | T): T {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') {
            throw new IllegalStateError(`Required property "${key}" missing`);
        }
        const resolved = this.#resolve(key, raw);
        if (typeof resolved === 'string' && resolved.includes('${')) {
            throw new IllegalStateError(
                `Required property "${key}" could not be resolved: unresolved placeholder in value "${resolved}"`
            );
        }
        const value = this.#convert(key, resolved, targetType);
        if (value === undefined) {
            // Label extraction only: the targetType union has no narrowing for
            // `name`; the message is cosmetic, so a structural read suffices.
            const label = (targetType as { name?: string }).name ?? String(targetType);
            throw new IllegalStateError(
                `Required property "${key}" could not be converted to ${label}: ${JSON.stringify(resolved)}`
            );
        }
        return value;
    }

    hasProperty(key: string): boolean {
        this.#syncRegistry();
        return this.#index.hasProperty(key);
    }

    /**
     * Raw index lookup, bypassing placeholder resolution.
     *
     * Used internally by the placeholder resolver so value chains resolve with
     * cycle/depth tracking intact (each public `getProperty` would re-resolve
     * and lose the in-progress state, overflowing the stack on cycles).
     *
     * @param key - The property name.
     * @returns The raw value or `undefined`.
     */
    getRawProperty(key: string): JSONValue | undefined {
        this.#syncRegistry();
        return this.#index.getProperty(key);
    }

    #syncRegistry(): void {
        const registry = this.#registry;
        if (registry && registry.version !== this.#seenVersion) {
            this.#seenVersion = registry.version;
            this.#sources = registry.toArray();
            this.#index.build(this.#sources);
            this.#placeholderCache.clear(); // version change → stale resolutions
        }
    }

    /** Resolves placeholders in a raw value, engaging the cache only for `${`-bearing strings. */
    #resolve(key: string, raw: JSONValue | undefined): JSONValue | undefined {
        if (typeof raw !== 'string' || !raw.includes('${')) return raw;
        const cached = this.#placeholderCache.get(key);
        if (cached !== undefined) return cached;
        const resolved = resolvePlaceholders(raw, this);
        this.#placeholderCache.set(key, resolved);
        return resolved;
    }

    /** Converts a resolved value to the target type via the injected conversion service. */
    #convert<T>(
        key: string,
        value: JSONValue | undefined,
        targetType: (new (...args: never[]) => T) | (() => T) | T
    ): T | undefined {
        const conversion = this.#options.conversionService ?? (this.#conversionService ??= createConversionService());
        if (value === undefined) return undefined;
        // Identity short-circuit: already the target type. Primitives are
        // matched by typeof against the primitive name ('boolean' from
        // Boolean.name.toLowerCase()), constructors via instanceof.
        const targetName = (targetType as { name?: string }).name;
        const primitiveName = targetName ? primitiveNameOf(targetName) : undefined;
        if (
            value instanceof (targetType as { new (...args: never[]): T }) ||
            (primitiveName !== undefined && typeof value === primitiveName)
        ) {
            return value as T;
        }
        const converted = conversion.convert(value, targetType);
        // NaN rejection: NumberConverter yields NaN for non-numeric strings.
        if (typeof converted === 'number' && Number.isNaN(converted)) {
            throw new IllegalStateError(
                `Property "${key}" could not be converted to ${targetName ?? String(targetType)}: ${JSON.stringify(value)} (NaN)`
            );
        }
        return converted as T;
    }
}
