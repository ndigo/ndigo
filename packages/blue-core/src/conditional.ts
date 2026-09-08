/**
 * Conditional auto-configuration metadata helpers.
 *
 * Decorators mark configuration classes with conditions; {@link isActive}
 * evaluates them against the current platform and, when a condition context is
 * supplied, against the environment and entry registry. Lives in `@blue/core`
 * so platform packages and `@blue/boot` can use it without depending on each
 * other.
 *
 * Supported conditions:
 * - {@link conditionalOnBrowser} / {@link conditionalOnNode} — platform
 * - {@link conditionalOnProperty} — environment property present/valued
 * - {@link conditionalOnProfile} — profile expression matches (AD-14)
 * - {@link conditionalOnMissingEntry} — an entry is not already registered
 *
 * @module
 * @since 1.0.0
 */

import '@tsmetadata/polyfill';

/** Platform types for conditional auto-configuration. */
export type ConditionalPlatform = 'browser' | 'node';

const CONDITIONAL_ON = 'boot:conditionalOn';
const CONDITIONAL_PROPERTY = 'boot:conditionalOnProperty';
const CONDITIONAL_PROFILE = 'boot:conditionalOnProfile';
const CONDITIONAL_MISSING = 'boot:conditionalOnMissingEntry';

/**
 * The runtime surface an active-condition evaluation needs: the environment
 * (for property conditions) and the entry registry (for missing-entry
 * conditions). Supplied by the bootstrap as it registers sources.
 */
export interface ConditionContext {
    /**
     * Resolve a configuration property.
     *
     * @param key - The property key.
     * @returns The property value, or `undefined` when absent.
     */
    getProperty(key: string): unknown;
    /**
     * Whether an entry with the given name is already registered.
     *
     * @param name - The entry name.
     * @returns `true` when the entry exists.
     */
    hasValue(name: string): boolean;
    /**
     * Whether a profile expression matches the effective active set.
     *
     * @param expression - The profile expression (`dev`, `!prod`, `a & b`).
     * @returns `true` when the expression matches.
     */
    acceptsProfiles?(expression: string): boolean;
}

/**
 * Class decorator that marks a configuration class as requiring a specific platform.
 *
 * @param condition - The metadata condition key.
 * @param value - The condition value.
 * @param target - The decorated class.
 * @param context - The decorator context.
 * @returns The target class unchanged.
 */
function conditionalDecorator(key: string, value: unknown, target: any, context: ClassDecoratorContext): any {
    context.metadata[key] = value;
    return target;
}

/**
 * Marks a configuration class as browser-only.
 *
 * @example
 * ```ts
 * @conditionalOnBrowser
 * @class
 * class WebAutoConfiguration { … }
 * ```
 */
export function conditionalOnBrowser(target: any, context: ClassDecoratorContext): any {
    return conditionalDecorator(CONDITIONAL_ON, 'browser', target, context);
}

/**
 * Marks a configuration class as node-only.
 *
 * @example
 * ```ts
 * @conditionalOnNode
 * @class
 * class NodeAutoConfiguration { … }
 * ```
 */
export function conditionalOnNode(target: any, context: ClassDecoratorContext): any {
    return conditionalDecorator(CONDITIONAL_ON, 'node', target, context);
}

/**
 * Options for {@link conditionalOnProperty}.
 */
export interface ConditionalOnPropertyOptions {
    /** The property name to check, e.g. `'app.management.enabled'`. */
    name: string;
    /** Required value; when omitted the property must be present and truthy. */
    havingValue?: string;
    /** Whether the condition is inverted. */
    matchIfMissing?: boolean;
}

/**
 * Marks a configuration class as active only when an environment property is
 * present (and, when `havingValue` is set, matches it).
 *
 * @example
 * ```ts
 * @conditionalOnProperty({ name: 'app.management.enabled' })
 * @class
 * class ManagementConfiguration { … }
 * ```
 */
export function conditionalOnProperty(options: ConditionalOnPropertyOptions) {
    return function (target: any, context: ClassDecoratorContext): any {
        return conditionalDecorator(CONDITIONAL_PROPERTY, options, target, context);
    };
}

/**
 * Class decorator that marks a configuration class as active only when a
 * profile expression matches the environment's effective active set (AD-14).
 *
 * @param expression - The profile expression (`dev`, `!prod`, `a & b`, `(a | b) & c`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @conditionalOnProfile('!prod & (dev | test)')
 * class DevOnlyConfiguration { ... }
 * ```
 */
export function conditionalOnProfile(expression: string) {
    return function (target: any, context: ClassDecoratorContext): any {
        return conditionalDecorator(CONDITIONAL_PROFILE, expression, target, context);
    };
}

/**
 * Marks a configuration class as active only when an entry is NOT already
 * registered — the "provide your own override" guarantee for auto-configs.
 *
 * @example
 * ```ts
 * @conditionalOnMissingEntry('metricsController')
 * @class
 * class ManagementAutoConfiguration { … }
 * ```
 */
export function conditionalOnMissingEntry(entryName: string) {
    return function (target: any, context: ClassDecoratorContext): any {
        return conditionalDecorator(CONDITIONAL_MISSING, entryName, target, context);
    };
}

/**
 * Reads the conditional platform metadata from a class.
 *
 * @param target - The class constructor or instance to inspect.
 * @returns The required platform, or `undefined` when no condition is set.
 */
export function getConditionalPlatform(target: any): ConditionalPlatform | undefined {
    const meta: Record<string, any> = target?.[Symbol.metadata] || target?.constructor?.[Symbol.metadata] || {};
    return meta[CONDITIONAL_ON];
}

/**
 * Checks whether a class can run in the current environment (platform only).
 *
 * @param target - The class constructor or instance to check.
 * @returns `true` when the class should be registered in this environment.
 */
export function isActiveForCurrentPlatform(target: any): boolean {
    const platform = getConditionalPlatform(target);

    if (!platform) {
        return true; // No constraint → always active
    }

    if (platform === 'browser') {
        return typeof window !== 'undefined';
    }

    if (platform === 'node') {
        return typeof window === 'undefined';
    }

    return true;
}

/**
 * Evaluates ALL conditions on a class (platform, property, missing-entry).
 *
 * When a {@link ConditionContext} is provided, property and missing-entry
 * conditions are evaluated against it; without one, only the platform
 * condition is checked (property/missing-entry conditions are treated as
 * active so existing callers keep working).
 *
 * @param target - The class constructor or instance to check.
 * @param ctx - Optional context for property/entry conditions.
 * @returns `true` when all conditions pass.
 */
export function isActive(target: any, ctx?: ConditionContext): boolean {
    if (!isActiveForCurrentPlatform(target)) {
        return false;
    }

    const meta: Record<string, any> = target?.[Symbol.metadata] || target?.constructor?.[Symbol.metadata] || {};

    const property = meta[CONDITIONAL_PROPERTY] as ConditionalOnPropertyOptions | undefined;
    if (property) {
        if (!ctx) {
            return true;
        }
        if (!propertyActive(property, ctx)) {
            return false;
        }
    }

    const profile = meta[CONDITIONAL_PROFILE] as string | undefined;
    if (profile) {
        if (!ctx?.acceptsProfiles) {
            return true;
        }
        if (!ctx.acceptsProfiles(profile)) {
            return false;
        }
    }

    const missing = meta[CONDITIONAL_MISSING] as string | undefined;
    if (missing) {
        if (!ctx) {
            return true;
        }
        if (ctx.hasValue(missing)) {
            return false;
        }
    }

    return true;
}

/**
 * Evaluates a property condition against the environment.
 */
function propertyActive(options: ConditionalOnPropertyOptions, ctx: ConditionContext): boolean {
    const value = ctx.getProperty(options.name);
    const present = value !== undefined && value !== null && value !== '';

    if (!present) {
        return options.matchIfMissing ?? false;
    }

    if (options.havingValue !== undefined) {
        return String(value) === options.havingValue;
    }

    // No havingValue: the property must be truthy (or the string 'true').
    return Boolean(value) || value === 'true';
}
