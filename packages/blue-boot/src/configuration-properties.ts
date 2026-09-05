/**
 * `@ConfigurationProperties` — type-safe binding from environment properties to class fields.
 *
 * Builds on `@blue/context`'s `@property` decorator, adding class-level prefix support
 * and a bulk resolution helper tied to the application lifecycle.
 *
 * @module
 * @since 1.0.0
 */

import { JSONValue } from '@blue/core';
import { ApplicationContext } from '@blue/context';
import { property } from '@blue/context';

const CONFIG_PROPS = 'boot:configurationProperties';
const CONFIG_PROPS_PREFIX = 'boot:configurationProperties:prefix';

/**
 * Reads configuration metadata from a class constructor.
 */
function getMetadata(target: any): Record<string, any> {
    return (target as any)?.[Symbol.metadata] ?? {};
}

/**
 * Marks a class as a configuration properties holder and optionally sets a property key prefix.
 *
 * When the application starts, every field decorated with `@property` on the class is resolved
 * from the environment. If a `prefix` is given, property paths are prefixed with it (e.g.
 * `prefix = 'server'` makes `@property('port')` resolve `server.port`).
 *
 * Use with the existing `@property` decorator from `@blue/context` for field-level binding.
 *
 * @param prefix - Optional property key prefix applied to all `@property` fields.
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * import { property } from '@blue/context';
 * import { ConfigurationProperties, resolveConfigurationProperties } from '@blue/boot';
 *
 * @ConfigurationProperties('server')
 * class ServerConfig {
 *     @property('port')
 *     port: number = 8080;
 *
 *     @property('host')
 *     host: string = 'localhost';
 * }
 *
 * const ctx = app.run();
 * const { instance, isValid } = resolveConfigurationProperties(ServerConfig, ctx);
 * instance.port // → resolved from server.port in environment
 * ```
 */
export function ConfigurationProperties(prefix?: string) {
    return function <T extends new (...args: any[]) => any>(target: T, context: ClassDecoratorContext): T {
        context.metadata[CONFIG_PROPS] = true;
        if (prefix) {
            context.metadata[CONFIG_PROPS_PREFIX] = prefix;
        }
        return target;
    };
}

/**
 * Utility to check if a class is decorated with `@ConfigurationProperties`.
 */
export function isConfigurationProperties(target: any): boolean {
    return getMetadata(target)[CONFIG_PROPS] === true;
}

/**
 * Reads the optional prefix from a `@ConfigurationProperties` class.
 */
export function getConfigurationPropertiesPrefix(target: any): string | undefined {
    return getMetadata(target)[CONFIG_PROPS_PREFIX];
}

export { property };

/**
 * Result of resolving a configuration properties class against an application context.
 */
export interface ConfigurationPropertiesResult<T> {
    /** The resolved instance with bound property values. */
    instance: T;
    /** Whether all properties resolved successfully. */
    isValid: boolean;
    /** Failed paths and their resolved values (or undefined when missing). */
    bindings: Record<string, JSONValue | undefined>;
}

/**
 * Resolves a `@ConfigurationProperties` class against an application context,
 * binding each `@property` field to its value from the environment.
 *
 * @param ctor - The configuration properties class constructor.
 * @param context - The application context providing the environment.
 * @returns The resolved instance and binding metadata.
 *
 * @example
 * ```ts
 * const { instance, isValid } = resolveConfigurationProperties(ServerConfig, appContext);
 * instance.port // → number from env
 * ```
 */
const { defineProperty } = Reflect;

export function resolveConfigurationProperties<T>(
    ctor: new () => T,
    context: ApplicationContext
): ConfigurationPropertiesResult<T> {
    const meta = getMetadata(ctor);
    const prefix = meta[CONFIG_PROPS_PREFIX] as string | undefined;
    const instance = new ctor();

    const bindings: Record<string, JSONValue | undefined> = {};
    let isValid = true;

    // Find all @property-decorated fields via metadata
    for (const key of Object.getOwnPropertyNames(instance)) {
        const fieldPath = meta[`config:property:${key}`] as string | undefined;
        if (!fieldPath) continue;

        const fullPath = prefix ? `${prefix}.${fieldPath}` : fieldPath;
        const value = context.environment?.getProperty(fullPath);

        bindings[fullPath] = value;
        if (value === undefined) {
            isValid = false;
        }

        if (value !== undefined) {
            defineProperty(instance as any, key, {
                value,
                configurable: true,
                writable: true,
                enumerable: true,
            });
        }
    }

    return { instance, isValid, bindings };
}
