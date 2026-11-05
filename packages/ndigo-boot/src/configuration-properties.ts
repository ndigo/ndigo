/**
 * `@configurationProperties` — type-safe binding from environment properties.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, JSONValue } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';
import { z } from 'zod';
import { property } from '@ndigo/context';
import { defaultValue, nestedConfig } from '@ndigo/context';
import { parseSchemaConfig } from '@ndigo/context';
import { isSecretMarkerLike, REDACTED_VALUE } from '@ndigo/context';
import type { ApplicationContext } from '@ndigo/context';
// Config metadata lives in `@ndigo/context` (`configuration-metadata.ts`) so
// tooling (`@ndigo/inspect`) can consume it without the boot layer (REU-9);
// the public functions are re-exported below unchanged.
import {
    CONFIG_PROPS_PREFIX,
    CONFIG_PROPS_RELAXED,
    CONFIG_PROPS_SCHEMA,
    DEFAULT_KEY,
    NESTED_KEY,
    PROPERTY_KEY,
    PROPERTY_KEY_TYPE,
    getMetadata,
    relaxedKeyCandidates,
    toLookupKey,
} from '@ndigo/context';

const CONFIG_PROPS = 'boot:configurationProperties';

/**
 * Options for {@link configurationProperties}.
 */
export interface ConfigurationPropertiesOptions {
    /**
     * Enable relaxed binding: a field's declared keypath and its camelCase,
     * kebab-case and snake_case spellings all match the environment either
     * way (a camelCase field finds a kebab env key and vice versa). Off by
     * default — exact keypaths are the contract (AD-15 Q8).
     */
    relaxed?: boolean;
    /**
     * Zod schema describing the bound values (AD-34 D3). When present, the
     * class binds in **schema mode**: every shape key resolves
     * `${prefix}.${key}` from the environment, and coercion, requiredness
     * and defaults all come from the schema (`z.default()` replaces
     * `@defaultValue`; no `@property` decorators needed). A missing required
     * key or a failed coercion throws at boot, naming the class. Schema mode
     * `@property`/`@defaultValue`/`@nestedConfig` decorators on the
     * class — the schema is the single source of truth (D3).
     *
     * Schema keys are resolved **exactly** as `${prefix}.${key}`: schema mode
     * never probes the relaxed kebab/snake spellings, even when `relaxed` is
     * also set (D-3). Relaxed binding is a field-decorator-mode contract.
     */
    schema?: z.ZodObject;
}

/**
 * Marks a class as a configuration properties holder and optionally sets a
 * property key prefix.
 *
 * When the application starts, every field decorated with `@property` on the
 * class is bound from the environment (converted via `getPropertyAs`). If a
 * `prefix` is given, property paths are prefixed with it (e.g. `prefix =
 * 'server'` makes `@property('port')` resolve `server.port`). The bound
 * instance is auto-registered as an entry bean keyed by the camelCase-derived
 * class name (`ServerConfig` → `serverConfig`).
 *
 * **Conversion target (CTX-11).** A field's target type is, in order: the
 * explicit type passed to `@property(path, Type)`; else the type inferred
 * from the field's initializer (`port = 0` → `number`, `flag = false` →
 * `boolean`, `at = new Date()` → `date`); else `String`. An untyped field
 * with NO initializer (`port!: number` is erased at runtime) therefore binds
 * the raw value with no conversion — declare the type explicitly or
 * initialize the field to get numeric/boolean/date conversion.
 *
 * Use with `@property` (+ optional `@defaultValue` / `@nestedConfig`) from
 * `@ndigo/context`.
 *
 * @param prefix - Optional property key prefix applied to all `@property` fields.
 * @param options - Additional binding options.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * import { property, defaultValue, nestedConfig } from '@ndigo/context';
 * import { configurationProperties } from '@ndigo/boot';
 *
 * @configurationProperties('server')
 * class ServerConfig {
 *     @property('port', Number) @defaultValue('8080') port!: number;
 *     @property('db') @nestedConfig db!: DbConfig;
 * }
 *
 * const ctx = app.run();
 * const serverConfig = ctx.getValue('serverConfig');
 * serverConfig.port // → number from server.port (or 8080)
 * ```
 */
export function configurationProperties(prefix?: string, options?: ConfigurationPropertiesOptions) {
    return function <T extends new (...args: never[]) => unknown>(target: T, context: ClassDecoratorContext): T {
        context.metadata[CONFIG_PROPS] = true;
        if (prefix) {
            context.metadata[CONFIG_PROPS_PREFIX] = prefix;
        }
        if (options?.relaxed) {
            context.metadata[CONFIG_PROPS_RELAXED] = true;
        }
        if (options?.schema) {
            context.metadata[CONFIG_PROPS_SCHEMA] = options.schema;
        }
        return target;
    };
}

/**
 * Utility to check if a class is decorated with `@configurationProperties`.
 */
export function isConfigurationProperties(target: unknown): boolean {
    return getMetadata(target)[CONFIG_PROPS] === true;
}

/**
 * Reads the optional prefix from a `@configurationProperties` class.
 */
export function getConfigurationPropertiesPrefix(target: unknown): string | undefined {
    return getMetadata(target)[CONFIG_PROPS_PREFIX] as string | undefined;
}

export { property, defaultValue, nestedConfig };

// The declaration-probing seam moved to `@ndigo/context` (REU-9); it is
// re-exported here unchanged so existing consumers (`@ndigo/inspect`, the
// boot test suite) keep resolving through `@ndigo/boot`'s barrel.
export { declaredConfigurationProperties, relaxedKeyCandidates } from '@ndigo/context';
export type { DeclaredConfigurationProperty } from '@ndigo/context';

/**
 * Result of resolving a configuration properties class against an application context.
 */
export interface ConfigurationPropertiesResult<T> {
    /** The resolved instance with bound property values. */
    instance: T;
    /** Whether all properties resolved successfully (always true — binders throw on failure). */
    isValid: boolean;
    /**
     * Bound paths and their resolved values. Never contains decrypted secret
     * plaintext: a scalar binding whose raw source value was a `{cipher:…}`
     * marker holds `REDACTED_VALUE` instead of the plaintext. A nested
     * `@nestedConfig` field records the bound sub-object by its top-level key.
     */
    bindings: Record<string, JSONValue | undefined>;
}

const { defineProperty } = Reflect;

/**
 * A field's resolved environment key plus its value. Relaxed binding can
 * match a spelled variant, so the typed re-read MUST use the winning key —
 * not the exact path the decorator declared (CTX-01).
 */
interface ResolvedProperty {
    /** The resolver key that matched, or the exact declared key when absent. */
    key: string;
    /** The resolved value, or `undefined` when nothing matched. */
    value: JSONValue | undefined;
}

/**
 * Resolves the property key for a field under a class prefix.
 *
 * Exact keypath first (the default contract). With `{ relaxed: true }`, the
 * key's camelCase, kebab-case, and snake_case spellings are also tried so a
 * camelCase field finds a kebab/snake env key AND a kebab/snake field finds a
 * camelCase env key — symmetric normalization (CTX-01). The returned `key` is
 * the spelling that actually matched, so typed reads convert the right value.
 */
function valueAt(
    environment: { getProperty(key: string): JSONValue | undefined },
    prefix: string | undefined,
    fieldPath: string,
    relaxed: boolean
): ResolvedProperty {
    const base = prefix ? `${prefix}.${fieldPath}` : fieldPath;
    const candidates = relaxed ? relaxedKeyCandidates(base) : [toLookupKey(base)];
    for (const lookup of candidates) {
        const value = environment.getProperty(lookup);
        if (value !== undefined) return { key: lookup, value };
    }
    return { key: toLookupKey(base), value: undefined };
}

/**
 * The value recorded in {@link ConfigurationPropertiesResult.bindings} for a
 * bound key: the resolved value normally, or `REDACTED_VALUE` when the
 * key's RAW source value is a `{cipher:…}` secret marker — in which case the
 * resolved value is decrypted plaintext and must never reach the map.
 * `getRawProperty` reads the pre-decryption source value, so the marker is
 * detectable without any decryptor seam.
 *
 * LIMITATION: a marker reached indirectly through a `${placeholder}` is not
 * detected (the raw source holds the placeholder, not the marker), so such a
 * value is recorded as resolved. Documented, not silently ignored.
 */
function bindingValue(
    environment: {
        getProperty(key: string): JSONValue | undefined;
        getRawProperty(key: string): JSONValue | undefined;
    },
    key: string,
    resolved: JSONValue | undefined
): JSONValue | undefined {
    if (resolved === undefined) return resolved;
    return isSecretMarkerLike(environment.getRawProperty(key)) ? REDACTED_VALUE : resolved;
}

/**
 * Resolves a `@configurationProperties` class against an application context,
 * binding each `@property` field to its converted value from the environment.
 *
 * Fail-loud (AD-15 D4): a missing required field (no `@defaultValue`) or a
 * conversion failure throws, naming class.field + attempted value + target
 * type. Nested fields bind recursively via `@nestedConfig`.
 *
 * @param ctor - The configuration properties class constructor.
 * @param context - The application context providing the environment.
 * @returns The resolved instance and binding metadata.
 */
export function resolveConfigurationProperties<T>(
    ctor: new () => T,
    context: ApplicationContext
): ConfigurationPropertiesResult<T> {
    const meta = getMetadata(ctor);
    const prefix = meta[CONFIG_PROPS_PREFIX] as string | undefined;
    const relaxed = meta[CONFIG_PROPS_RELAXED] === true;
    const schema = meta[CONFIG_PROPS_SCHEMA] as z.ZodObject | undefined;
    const instance = new ctor();

    if (schema) {
        return resolveFromSchema(ctor, instance, prefix, schema, context);
    }

    const bindings: Record<string, JSONValue | undefined> = {};

    for (const key of Object.getOwnPropertyNames(instance)) {
        const isNested = meta[`${NESTED_KEY}${key}`] === true;

        if (isNested) {
            // Bind recursively into the nested field's existing instance
            // (author provides the initializer; @nestedConfig alone, no @property —
            // the field NAME is the sub-prefix: `db` → `server.db`).
            const fieldInstance = (instance as Record<string, unknown>)[key] as Record<string, unknown>;
            resolveNested(ctor, key, key, prefix, fieldInstance, context, relaxed);
            Object.assign(bindings, { [`${prefix ? `${prefix}.` : ''}${key}`]: fieldInstance });
            continue;
        }

        const fieldPath = meta[`${PROPERTY_KEY}${key}`] as string | undefined;
        if (!fieldPath) continue;

        const fullPath = prefix ? `${prefix}.${fieldPath}` : fieldPath;
        const environment = context.environment;
        if (!environment) {
            throw new IllegalStateError(`Cannot bind ${ctor.name}.${key}: the application context has no environment`);
        }

        const resolved = valueAt(environment, prefix, fieldPath, relaxed);
        if (resolved.value === undefined) {
            const rawDefault = meta[`${DEFAULT_KEY}${key}`] as string | undefined;
            if (rawDefault !== undefined) {
                // The resolver's getPropertyAs(key, type, default) converts a
                // default through the same path as a real value (P1 / AD-15 D2).
                const target = targetFor(instance, key, meta);
                const typed = convertRaw(environment, fullPath, target, rawDefault, false);
                bindings[fullPath] = rawDefault;
                defineProperty(instance as Record<string, unknown>, key, {
                    value: typed,
                    configurable: true,
                    writable: true,
                    enumerable: true,
                });
                continue;
            }
            throw new IllegalStateError(`Missing required property "${fullPath}" for ${ctor.name}.${key}`);
        }

        const targetType = targetFor(instance, key, meta);
        let typed: JSONValue;
        try {
            // Read through the WINNING key so a relaxed hit converts the same
            // spelling that resolved (CTX-01).
            typed = getValueAs(environment, resolved.key, targetType, true) as JSONValue;
        } catch (error) {
            // The key path identifies the binding; the value is deliberately
            // NOT interpolated — it may be a decrypted secret (SEC-11/CF-2),
            // and the underlying resolver error already names the attempted
            // value (redacted when a decryptor is wired).
            throw new IllegalStateError(
                `Cannot bind ${ctor.name}.${key} from "${resolved.key}": ${(error as Error).message}`,
                error instanceof Error ? { cause: error } : undefined
            );
        }
        bindings[resolved.key] = bindingValue(environment, resolved.key, resolved.value);
        defineProperty(instance as Record<string, unknown>, key, {
            value: typed,
            configurable: true,
            writable: true,
            enumerable: true,
        });
    }

    return { instance, isValid: true, bindings };
}

/**
 * Resolves a schema-mode `@configurationProperties` class (AD-34 D3): every
 * schema shape key binds `${prefix}.${key}` from the environment; coercion,
 * requiredness and defaults follow the schema. Values materialize onto the
 * instance (writable, enumerable) with the environment's values mirrored in
 * `bindings`. Fail-loud: missing required keys and failed coercions throw an
 * `IllegalStateError` naming the class and the offending value, matching the
 * field-mode contract (AD-15 D4).
 *
 * Schema keys are probed **exactly** as `${prefix}.${key}` — the relaxed
 * kebab/snake candidate set is a field-decorator-mode contract and is never
 * consulted here, even when the class also sets `{ relaxed: true }` (D-3).
 */
function resolveFromSchema<T>(
    ctor: new () => T,
    instance: T,
    prefix: string | undefined,
    schema: z.ZodObject,
    context: ApplicationContext
): ConfigurationPropertiesResult<T> {
    const environment = context.environment;
    if (!environment) {
        throw new IllegalStateError(`Cannot bind ${ctor.name}: the application context has no environment`);
    }

    const bindings: Record<string, JSONValue | undefined> = {};
    const raw: Record<string, unknown> = {};
    const shape = schema.shape;

    for (const key of Object.keys(shape)) {
        const resolved = valueAt(environment, prefix, key, false);
        if (resolved.value !== undefined) {
            raw[key] = resolved.value;
            bindings[resolved.key] = bindingValue(environment, resolved.key, resolved.value);
        }
    }

    let parsed: Record<string, unknown>;
    try {
        parsed = parseSchemaConfig(schema, raw) as Record<string, unknown>;
    } catch (error) {
        const message = getErrorMessage(error);
        throw new IllegalStateError(
            `Cannot bind ${ctor.name} from schema keys (${Object.keys(raw).join(', ')}): ${message}`,
            error instanceof Error ? { cause: error } : undefined
        );
    }

    for (const [key, value] of Object.entries(parsed)) {
        defineProperty(instance as Record<string, unknown>, key, {
            value,
            configurable: true,
            writable: true,
            enumerable: true,
        });
    }

    return { instance, isValid: true, bindings };
}

/**
 * Resolves the conversion target name for a field: the `@property(path, Type)`
 * declared type first, else inference from the instance's current value.
 */
function targetFor(instance: unknown, key: string, meta: Record<string, unknown>): string {
    const declared = meta[`${PROPERTY_KEY_TYPE}${key}`] as
        | (new (...args: never[]) => number | boolean | Date | string)
        | string
        | undefined;
    if (typeof declared === 'string') return declared;
    if (typeof declared === 'function') return declared.name.toLowerCase();
    // No declared type: infer from the field's current value (initialized by
    // `new ctor()`; `undefined`/absent → String). Previously recursed forever.
    // T is an unconstrained generic property bag — key access needs the cast.
    const bag = instance as Record<string, unknown>;
    return inferTarget(bag[key]);
}

/**
 * Infers the conversion target from the field's current value
 * (`new ctor()` initializes fields; `undefined`/absent → String).
 */
function inferTarget(value: unknown): string {
    if (typeof value === 'number') return 'number';
    if (typeof value === 'boolean') return 'boolean';
    if (value instanceof Date) return 'date';
    return 'string';
}

/**
 * The per-field conversion target for a primitive name (`number`/`boolean`/
 * `date`/`string`), as a constructor the conversion service can key on.
 */
type ConversionTarget =
    | (new (...args: never[]) => number)
    | (new (...args: never[]) => boolean)
    | (new (...args: never[]) => Date)
    | (new (...args: never[]) => string);

function converterFor(target: string): ConversionTarget {
    switch (target) {
        case 'number':
            return Number as unknown as ConversionTarget;
        case 'boolean':
            return Boolean as unknown as ConversionTarget;
        case 'date':
            return Date as unknown as ConversionTarget;
        default:
            return String as unknown as ConversionTarget;
    }
}

/**
 * Typed read through the environment with the per-field conversion target.
 * Each branch is a separate concrete call so the generic infers a concrete
 * value type (a union target would collapse the inference).
 */
function getValueAs(
    environment: NonNullable<ApplicationContext['environment']>,
    path: string,
    target: string,
    required: boolean
): unknown {
    const field = converterFor(target);
    if (typeof field === 'function' && field.name === 'Number') {
        return required ? environment.getRequiredPropertyAs(path, Number) : environment.getPropertyAs(path, Number);
    }
    if (typeof field === 'function' && field.name === 'Boolean') {
        return required ? environment.getRequiredPropertyAs(path, Boolean) : environment.getPropertyAs(path, Boolean);
    }
    if (typeof field === 'function' && field.name === 'Date') {
        return required ? environment.getRequiredPropertyAs(path, Date) : environment.getPropertyAs(path, Date);
    }
    return required ? environment.getRequiredPropertyAs(path, String) : environment.getPropertyAs(path, String);
}

/**
 * Converts a raw string through the environment's ConversionService for the
 * given target name. Uses the resolver's native default-value path when the
 * property is absent (`getPropertyAs(key, type, default)` already converts
 * the fallback, P1).
 */
function convertRaw(
    environment: NonNullable<ApplicationContext['environment']>,
    path: string,
    target: string,
    raw: string,
    required: boolean
): unknown {
    const converter = converterFor(target);
    const name = (converter as { name?: string }).name;
    if (name === 'Number') {
        return required
            ? environment.getRequiredPropertyAs(path, Number)
            : environment.getPropertyAs(path, Number, Number(raw));
    }
    if (name === 'Boolean') {
        return required
            ? environment.getRequiredPropertyAs(path, Boolean)
            : environment.getPropertyAs(path, Boolean, Boolean(raw));
    }
    if (name === 'Date') {
        return required
            ? environment.getRequiredPropertyAs(path, Date)
            : environment.getPropertyAs(path, Date, new Date(raw));
    }
    return required ? environment.getRequiredPropertyAs(path, String) : environment.getPropertyAs(path, String, raw);
}

/**
 * Binds a nested `@nestedConfig` object in place: the sub-prefix is the field's
 * `@property` keypath, and the nested object's own `@property` fields bind
 * under it. The nested object is the field's existing instance (the author
 * writes a field initializer — decorators cannot see field types).
 */
function resolveNested<T>(
    root: new () => T,
    fieldName: string,
    fieldPath: string,
    prefix: string | undefined,
    nestedInstance: Record<string, unknown>,
    context: ApplicationContext,
    relaxed: boolean
): void {
    const nestedMeta = getMetadata(nestedInstance.constructor as new () => unknown);
    const base = prefix ? `${prefix}.${fieldPath}` : fieldPath;

    for (const key of Object.getOwnPropertyNames(nestedInstance)) {
        const fieldPathInner = nestedMeta[`${PROPERTY_KEY}${key}`] as string | undefined;
        if (!fieldPathInner) continue;
        const innerNested = nestedMeta[`${NESTED_KEY}${key}`] === true;
        const fullPath = `${base}.${fieldPathInner}`;
        const environment = context.environment;
        if (!environment) {
            throw new IllegalStateError(
                `Cannot bind ${root.name}.${fieldName}.${key}: the application context has no environment`
            );
        }
        if (innerNested) {
            const innerInstance = nestedInstance[key] as Record<string, unknown>;
            resolveNested(
                root,
                `${fieldName}.${key}`,
                `${fieldPath}.${fieldPathInner}`,
                prefix,
                innerInstance,
                context,
                relaxed
            );
            continue;
        }
        const resolved = valueAt(environment, undefined, fullPath, relaxed);
        if (resolved.value === undefined) {
            const rawDefault = nestedMeta[`${DEFAULT_KEY}${key}`] as string | undefined;
            if (rawDefault !== undefined) {
                // CF-4: the nested default goes through `convertRaw` — the
                // same conversion path as top-level defaults (and real
                // values) — so `@defaultValue('5432')` binds a number, not
                // the raw string.
                const typed = convertRaw(
                    environment,
                    fullPath,
                    targetFor(nestedInstance, key, nestedMeta),
                    rawDefault,
                    false
                ) as JSONValue;
                defineProperty(nestedInstance as Record<string, unknown>, key, {
                    value: typed,
                    configurable: true,
                    writable: true,
                    enumerable: true,
                });
                continue;
            }
            throw new IllegalStateError(`Missing required property "${fullPath}" for ${root.name}.${fieldName}.${key}`);
        }
        // Winning-key read for nested relaxed hits too (CTX-01).
        const typed = getValueAs(
            environment,
            resolved.key,
            targetFor(nestedInstance, key, nestedMeta),
            true
        ) as JSONValue;
        defineProperty(nestedInstance as Record<string, unknown>, key, {
            value: typed,
            configurable: true,
            writable: true,
            enumerable: true,
        });
    }
}
