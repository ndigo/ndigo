/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, JSONValue, JSONObject, createNull, KeypathConverter } from '@ndigo/core';
import type { KeypathToken } from '@ndigo/core';
import type { ConversionService } from '@ndigo/core';
import { createConversionService } from '@ndigo/core';
import { like, isNil } from '@ndigo/util/types';
import { PropertySource } from './property-source';
import type { MutablePropertySources } from './property-sources';
import { resolvePlaceholders } from './placeholder-resolver';
import { isSecretMarkerLike, SecretDecryptor } from './secret-cipher';
import { redactDiagnosticValue } from './redaction';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-context:property-resolver');

const keypathConverter = new KeypathConverter();
type PrimitiveLike = 'string' | 'number' | 'boolean';

/**
 * One-time fail-open sentinel (SEC-10): a resolved value carried a secret
 * marker (`{scheme:...}`) while NO decryptor was configured, so the marker
 * bound as plaintext. Warned once per process — repeat lookups must not
 * spam the console; a later decryptor rewrite (new environment) is the fix.
 */
let secretFailOpenWarned = false;

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
    /**
     * Returns the name of the source that won the given key, or `null` when
     * the active index does not retain origins or the key is unknown.
     *
     * @param key - The property key (top-level granularity).
     * @returns The winning source name, or `null`.
     * @see PropertyIndex#originOf
     */
    originOf(key: string): string | null;
}

/**
 * @param {*} value The value to be tested.
 * @returns {boolean} Whether or not the value is like a {@link PropertyResolver|PropertyResolver}.
 */
export const likePropertyResolver = like({
    getProperty: Function,
    getRequiredProperty: Function,
    hasProperty: Function,
}) as (value: unknown) => value is PropertyResolver;

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
        const tokens = keypathConverter.convert(key);
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
    /**
     * Returns the name of the source that won the given key — optional:
     * strategies that retain origins implement it; others omit it (the
     * resolver reports `null`). Top-level-key granularity (AD-16 D1/Q7).
     *
     * @param key - The top-level property key.
     * @returns The winning source name, or `undefined` when unsupported/unknown.
     */
    originOf?(key: string): string | undefined;
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
     * Returns the name of the source that first defined the top-level segment
     * of the key (`server.port` reports the source owning `server` — top-level
     * granularity, AD-16 D1/Q7).
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

/**
 * Options controlling the resolver's internal lookup strategy.
 */
export interface ResolverOptions {
    /**
     * The lookup index to use. Defaults to the prototype chain (the
     * framework's historical behavior).
     *
     * Divergence note (ARC-7): `prototype` (PrototypeChainIndex) keeps a live
     * chain — in-place edits to a captured source map are visible without a
     * rebuild; `flat` (FlatMergedIndex) snapshots — in-place edits stay
     * invisible until the next rebuild. You must use the source-registry
     * mutation APIs (replace/add) or `refresh()` for either index to observe
     * edits; the placeholder cache clears only on registry version change or
     * refresh, not on raw object mutation.
     */
    index?: 'prototype' | 'flat';
    /**
     * The conversion service for typed lookups (`getPropertyAs`). Defaults to
     * a fresh `createConversionService()` when typed reads are used.
     */
    conversionService?: ConversionService;
    /**
     * Optional at-rest secret decryption (AD-29 Wave 2). Consulted for every
     * resolved string value AFTER placeholder resolution and BEFORE
     * conversion/typed reads: `{cipher:...}` markers decrypt, everything else
     * passes through. The resolver passes the key path as the AAD context
     * (key-path AAD binding). A `SecretSchemeRegistry` is the standard
     * implementation; the seam is an interface so a single-cipher resolver
     * can be injected without the registry.
     */
    secretDecryptor?: SecretDecryptor;
}

/**
 * Property resolver that layers sources through a live property source registry.
 */
export class PrototypalPropertyResolver implements PropertyResolver {
    #sources: PropertySource[] = [];
    #index: PropertyIndex;
    #registry!: MutablePropertySources;
    #seenVersion = -1;
    #options: ResolverOptions;
    #placeholderCache = new Map<string, JSONValue>();
    #conversionService: ConversionService | null = null;
    #forceRebuild = false;
    private constructor(options: ResolverOptions) {
        this.#options = options;
        this.#index = options.index === 'flat' ? new FlatMergedIndex() : new PrototypeChainIndex();
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
        const resolver = new PrototypalPropertyResolver(options);
        resolver.#registry = registry;
        resolver.#syncRegistry();
        return resolver;
    }

    /**
     * @returns The registry backing this resolver.
     */
    get registry(): MutablePropertySources {
        return this.#registry;
    }
    get options(): ResolverOptions {
        return this.#options;
    }

    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') return defaultValue === undefined ? undefined : defaultValue;
        return this.#decrypt(key, this.#resolve(key, raw));
    }

    getRequiredProperty(key: string): JSONValue {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') {
            throw new IllegalStateError(this.#missingMessage(key));
        }
        const resolved = this.#resolve(key, raw);
        if (typeof resolved === 'string' && resolved.includes('${')) {
            throw new IllegalStateError(
                `Required property "${key}" could not be resolved: unresolved placeholder in value "${resolved}"`
            );
        }
        return this.#decrypt(key, resolved) as JSONValue;
    }

    getPropertyAs<T>(
        key: string,
        targetType: (new (...args: never[]) => T) | (() => T) | T,
        defaultValue?: T
    ): T | undefined {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') return defaultValue;
        const resolved = this.#decrypt(key, this.#resolve(key, raw));
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
        const value = this.#convert(key, this.#decrypt(key, resolved), targetType);
        if (value === undefined) {
            // Label extraction only: the targetType union has no narrowing for
            // `name`; the message is cosmetic, so a structural read suffices.
            const label = (targetType as { name?: string }).name ?? String(targetType);
            throw new IllegalStateError(
                `Required property "${key}" could not be converted to ${label}: ${this.#diagnosticValue(resolved)}`
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

    /**
     * Returns the name of the source that won the given key, or `null` when
     * the active index does not retain origins (prototype chain) or the key
     * is unknown. Top-level-key granularity (AD-16 D1).
     *
     * @param key - The top-level property key.
     * @returns The winning source name, or `null`.
     */
    originOf(key: string): string | null {
        this.#syncRegistry();
        return this.#index.originOf?.(key) ?? null;
    }

    /**
     * Forces the index to rebuild and clears the placeholder cache —
     * "recompute from the current sources" (AD-16 D3). Does NOT re-run
     * customizers or re-read platform snapshots (environment-scope only).
     */
    refresh(): void {
        this.#placeholderCache.clear();
        this.#forceRebuild = true;
        this.#syncRegistry();
        this.#forceRebuild = false;
    }

    #missingMessage(key: string): string {
        const origin = this.#index.originOf?.(key);
        return origin
            ? `Required property "${key}" missing (from source: ${origin})`
            : `Required property "${key}" missing`;
    }

    #syncRegistry(): void {
        const registry = this.#registry;
        if (registry && (registry.version !== this.#seenVersion || this.#forceRebuild)) {
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

    /**
     * Applies at-rest secret decryption (AD-29 Wave 2) after placeholder
     * resolution and before conversion: `{cipher:...}` markers decrypt via the
     * configured decryptor (key-path AAD binding); all other values pass
     * through untouched. No decryptor configured → identity — but a value
     * carrying a secret marker then binds as literal plaintext (SEC-10's
     * fail-open): warned once, values still pass through.
     */
    #decrypt(key: string, value: JSONValue | undefined): JSONValue | undefined {
        if (typeof value !== 'string') return value;
        const decryptor = this.#options.secretDecryptor;
        // SEC-10 fail-open (CTX-04): with NO decryptor wired, the read path
        // must never throw — a marker-shaped value (even a malformed one)
        // passes through as literal plaintext, warned once per process.
        // Parsing (and its fail-loud malformed-version error) only runs when
        // a decryptor is configured, where failing loud is the contract.
        if (!decryptor) {
            if (!secretFailOpenWarned && isSecretMarkerLike(value)) {
                secretFailOpenWarned = true;
                logger.warn(
                    `[@ndigo/context] Property "${key}" holds a secret marker ({scheme:...}) but no secret ` +
                        'decryptor is wired — the ciphertext binds as a literal plaintext value (SEC-10 fail-open). ' +
                        'Call environment.applySecretDecryptor(...) (e.g. builder.secrets(...) with NDIGO_SECRET_KEY ' +
                        'set) to decrypt at-rest secrets.'
                );
            }
            return value;
        }
        return decryptor.decrypt(value, { key });
    }

    /**
     * Formats a resolved value for an error message, redacting it when a
     * decryptor is configured: the value reached this point post-decryption,
     * so echoing it could leak plaintext (SEC-11). Non-strings are bound
     * values, not secrets — only string echoes are a concern, but a configured
     * decryptor redacts uniformly for a single, predictable diagnostic shape.
     */
    #diagnosticValue(value: JSONValue | undefined): string {
        return redactDiagnosticValue(value, Boolean(this.#options.secretDecryptor));
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
        // String target pass-through (CTX-10): the registry's only
        // (String, String) converter is the UUID converter, which is wrong
        // for a plain string target — a non-string source would crash on
        // `.trim is not a function`. `String(value)` is the documented
        // pass-through semantics, so a non-string binds without the registry.
        if (primitiveName === 'string') {
            return String(value) as T;
        }
        let converted: unknown;
        try {
            converted = conversion.convert(value, targetType);
        } catch (error) {
            // Never let a converter echo the raw input (CTX-03): with a
            // decryptor configured that input may be decrypted plaintext, and
            // the converter's own message embeds it. The wrapped message
            // redacts uniformly; the raw cause is dropped in secret context so
            // the plaintext is not reachable through the error chain either.
            throw new IllegalStateError(
                `Property "${key}" could not be converted to ${targetName ?? String(targetType)}: ${this.#diagnosticValue(value)}`,
                !this.#options.secretDecryptor && error instanceof Error ? { cause: error } : undefined
            );
        }
        // NaN rejection: NumberConverter yields NaN for non-numeric strings.
        if (typeof converted === 'number' && Number.isNaN(converted)) {
            throw new IllegalStateError(
                `Property "${key}" could not be converted to ${targetName ?? String(targetType)}: ${this.#diagnosticValue(value)} (NaN)`
            );
        }
        return converted as T;
    }
}
