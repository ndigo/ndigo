/**
 * `@configurationProperties` — type-safe binding from environment properties
 * to class fields (AD-15).
 *
 * Builds on `@blue/context`'s `@property` decorator, adding class-level prefix
 * support, automatic registration at refresh, conversion via `getPropertyAs`,
 * `@defaultValue` fallbacks, and `@nested` structured prefixes.
 *
 * @module
 * @since 1.0.0
 */

import { IllegalStateError, JSONValue } from '@blue/core';
import { property } from '@blue/context';
import { defaultValue, nested } from '@blue/context';
import type { ApplicationContext } from '@blue/context';

const CONFIG_PROPS = 'boot:configurationProperties';
const CONFIG_PROPS_PREFIX = 'boot:configurationProperties:prefix';
const CONFIG_PROPS_RELAXED = 'boot:configurationProperties:relaxed';

/** Field-level property metadata keys (set by the context decorators). */
const PROPERTY_KEY = 'config:property:';
const DEFAULT_KEY = 'config:defaultValue:';
const NESTED_KEY = 'config:nested:';

/**
 * Reads configuration metadata from a class constructor.
 */
function getMetadata(target: unknown): Record<string, unknown> {
    return (target as { [Symbol.metadata]?: Record<string, unknown> })?.[Symbol.metadata] ?? {};
}

/**
 * Options for {@link configurationProperties}.
 */
export interface ConfigurationPropertiesOptions {
    /**
     * Enable relaxed binding (kebab/snake env keys match camelCase fields).
     * Off by default — exact keypaths are the contract (AD-15 Q8).
     */
    relaxed?: boolean;
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
 * Use with `@property` (+ optional `@defaultValue` / `@nested`) from
 * `@blue/context`.
 *
 * @param prefix - Optional property key prefix applied to all `@property` fields.
 * @param options - Additional binding options.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * import { property, defaultValue, nested } from '@blue/context';
 * import { configurationProperties } from '@blue/boot';
 *
 * @configurationProperties('server')
 * class ServerConfig {
 *     @property('port') @defaultValue('8080') port!: number;
 *     @property('db') @nested db!: DbConfig;
 * }
 *
 * const ctx = app.run();
 * const serverConfig = ctx.getValue('serverConfig');
 * serverConfig.port // → number from server.port (or 8080)
 * ```
 */
export function configurationProperties(prefix?: string, options?: ConfigurationPropertiesOptions) {
    return function <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
        context.metadata[CONFIG_PROPS] = true;
        if (prefix) {
            context.metadata[CONFIG_PROPS_PREFIX] = prefix;
        }
        if (options?.relaxed) {
            context.metadata[CONFIG_PROPS_RELAXED] = true;
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

export { property, defaultValue, nested };

/**
 * Result of resolving a configuration properties class against an application context.
 */
export interface ConfigurationPropertiesResult<T> {
    /** The resolved instance with bound property values. */
    instance: T;
    /** Whether all properties resolved successfully (always true — binders throw on failure). */
    isValid: boolean;
    /** Bound paths and their resolved values. */
    bindings: Record<string, JSONValue | undefined>;
}

const { defineProperty } = Reflect;

/**
 * Normalizes a key for relaxed binding: kebab/snake → camel (`host-name` /
 * `host_name` → `hostName`). Exact keypaths are the default; this only runs
 * when a class opts in via `{ relaxed: true }` (AD-15 Q8).
 */
const camelize = (key: string): string => key.replace(/[-_]([a-z])/g, (_match, letter: string) => letter.toUpperCase());

/**
 * Resolves the property key for a field under a class prefix, returning the
 * environment value with relaxed fallback: exact keypath first (the default
 * contract), then the camelized kebab/snake form — only when the class opted
 * in via `{ relaxed: true }`.
 */
function valueAt(
    environment: { getProperty(key: string): JSONValue | undefined },
    prefix: string | undefined,
    fieldPath: string,
    relaxed: boolean
): JSONValue | undefined {
    const base = prefix ? `${prefix}.${fieldPath}` : fieldPath;
    const exact = environment.getProperty(base);
    if (exact !== undefined || !relaxed) return exact;
    return environment.getProperty(camelize(base));
}

/**
 * Resolves a `@configurationProperties` class against an application context,
 * binding each `@property` field to its converted value from the environment.
 *
 * Fail-loud (AD-15 D4): a missing required field (no `@defaultValue`) or a
 * conversion failure throws, naming class.field + attempted value + target
 * type. Nested fields bind recursively via `@nested`.
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
    const instance = new ctor();

    const bindings: Record<string, JSONValue | undefined> = {};

    for (const key of Object.getOwnPropertyNames(instance)) {
        const isNested = meta[`${NESTED_KEY}${key}`] === true;

        if (isNested) {
            // Bind recursively into the nested field's existing instance
            // (author provides the initializer; @nested alone, no @property —
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

        const value = valueAt(environment, prefix, fieldPath, relaxed);
        if (value === undefined) {
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
            typed = getValueAs(environment, fullPath, targetType, true) as JSONValue;
        } catch (error) {
            throw new IllegalStateError(
                `Cannot bind ${ctor.name}.${key} from "${fullPath}" (value ${JSON.stringify(value)}): ${(error as Error).message}`,
                error instanceof Error ? { cause: error } : undefined
            );
        }
        bindings[fullPath] = value;
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
 * Resolves the conversion target name for a field: the `@property(path, Type)`
 * declared type first, else inference from the instance's current value.
 */
function targetFor(instance: unknown, key: string, meta: Record<string, unknown>): string {
    const declared = meta[`${PROPERTY_KEY_TYPE}${key}`] as
        (new (...args: never[]) => number | boolean | Date | string) | string | undefined;
    if (typeof declared === 'string') return declared;
    if (typeof declared === 'function') return declared.name.toLowerCase();
    return targetFor(instance, key, meta);
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

const PROPERTY_KEY_TYPE = 'config:propertyType:';

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
 * Binds a nested `@nested` object in place: the sub-prefix is the field's
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
        const value = valueAt(environment, undefined, fullPath, relaxed);
        if (value === undefined) {
            const rawDefault = nestedMeta[`${DEFAULT_KEY}${key}`] as string | undefined;
            if (rawDefault !== undefined) {
                const typed = (getValueAs(environment, fullPath, targetFor(nestedInstance, key, nestedMeta), false) ??
                    rawDefault) as JSONValue;
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
        const typed = getValueAs(environment, fullPath, targetFor(nestedInstance, key, nestedMeta), true) as JSONValue;
        defineProperty(nestedInstance as Record<string, unknown>, key, {
            value: typed,
            configurable: true,
            writable: true,
            enumerable: true,
        });
    }
}
