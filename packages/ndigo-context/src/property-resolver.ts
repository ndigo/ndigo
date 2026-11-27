/**
 * Property resolution with prototype-chain and merged indexes.
 */
import { Constructable, IllegalStateError, JSONValue } from '@ndigo/core';
import type { ConversionService } from '@ndigo/core';
import { createConversionService } from '@ndigo/core';
import { PropertySource } from './property-source';
import type { MutablePropertySources } from './property-sources';
import { resolvePlaceholders } from './placeholder-resolver';
import { isSecretMarkerLike } from './secret-cipher';
import { redactDiagnosticValue } from './redaction';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-context:property-resolver');

type PrimitiveLike = 'string' | 'number' | 'boolean';

/**
 * One-time fail-open sentinel: a resolved value carried a secret
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

import type { PropertyResolver, ResolverOptions, PropertyIndex } from './property-resolver-types';
import { PrototypeChainIndex, FlatMergedIndex } from './property-index';

// Re-export moved contracts for backward compat.
export * from './property-resolver-types';
export * from './property-index';

/**
 * Property resolver that layers sources through a live property source registry.
 *
 * @example
 * ```ts
 * const resolver = new PrototypalPropertyResolver({ sources: [new MapPropertySource('app', { 'server.port': '8080' })] });
 * resolver.getProperty('server.port'); // '8080'
 * ```
 */
export class PrototypalPropertyResolver implements PropertyResolver {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "PrototypalPropertyResolver".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object PrototypalPropertyResolver]"
     */
    get [Symbol.toStringTag](): string {
        return 'PrototypalPropertyResolver';
    }

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
    /** The resolver options. */
    get options(): ResolverOptions {
        return this.#options;
    }

    /** Gets a property. @param key - The key. @param defaultValue - Default. @returns The value. */
    getProperty(key: string, defaultValue?: JSONValue): JSONValue | undefined {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') return defaultValue === undefined ? undefined : defaultValue;
        return this.#decrypt(key, this.#resolve(key, raw));
    }

    /** Gets a required property. @param key - The key. @returns The value. */
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

    /** Gets a typed property. @param key - The key. @param targetType - Target type. @param defaultValue - Default. @returns The value. */
    getPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T, defaultValue?: T): T | undefined {
        this.#syncRegistry();
        const raw = this.#index.getProperty(key);
        if (typeof raw === 'undefined') return defaultValue;
        const resolved = this.#decrypt(key, this.#resolve(key, raw));
        return this.#convert(key, resolved, targetType) ?? defaultValue;
    }

    /** Gets a required typed property. @param key - The key. @param targetType - Target type. @returns The value. */
    getRequiredPropertyAs<T>(key: string, targetType: Constructable<T> | (() => T) | T): T {
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

    /** Whether a property exists. @param key - The key. @returns `true` when present. */
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
     * is unknown. Top-level-key granularity.
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
     * "recompute from the current sources". Does NOT re-run
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
     * Applies at-rest secret decryption after placeholder
     * resolution and before conversion: `{cipher:...}` markers decrypt via the
     * configured decryptor (key-path AAD binding); all other values pass
     * through untouched. No decryptor configured → identity — but a value
     * carrying a secret marker then binds as literal plaintext (fail-open):
     * warned once, values still pass through.
     */
    #decrypt(key: string, value: JSONValue | undefined): JSONValue | undefined {
        if (typeof value !== 'string') return value;
        const decryptor = this.#options.secretDecryptor;
        // SEC-10 fail-open: with NO decryptor wired, the read path
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
     * so echoing it could leak plaintext. Non-strings are bound
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
        targetType: Constructable<T> | (() => T) | T
    ): T | undefined {
        const conversion = this.#options.conversionService ?? (this.#conversionService ??= createConversionService());
        if (value === undefined) return undefined;
        // Identity short-circuit: already the target type. Primitives are
        // matched by typeof against the primitive name ('boolean' from
        // Boolean.name.toLowerCase()), constructors via instanceof.
        const targetName = (targetType as { name?: string }).name;
        const primitiveName = targetName ? primitiveNameOf(targetName) : undefined;
        if (
            value instanceof (targetType as Constructable<T>) ||
            (primitiveName !== undefined && typeof value === primitiveName)
        ) {
            return value as T;
        }
        // String target pass-through: the registry's only
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
            // Never let a converter echo the raw input: with a
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
