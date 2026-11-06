/**
 * Conditional auto-configuration metadata helpers.
 */
import '@tsmetadata/polyfill';
import { FrameworkError } from './error.js';
import { Profile } from './profile.js';
import type { ProfileTerm } from './profile.js';

/** Platform types for conditional auto-configuration. */
export type ConditionalPlatform = 'browser' | 'node';

const WHEN_PLATFORM = 'boot:whenPlatform';
const WHEN_PROPERTY = 'boot:whenProperty';
const WHEN_PROFILE = 'boot:whenProfile';
const WHEN_MISSING = 'boot:whenMissingEntry';

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
function conditionalDecorator(key: string, value: unknown, target: Function, context: ClassDecoratorContext): void {
    context.metadata[key] = value;
}

/**
 * Marks a configuration class as browser-only.
 *
 * @example
 * ```ts
 * @whenBrowser
 * @class
 * class WebAutoConfiguration { … }
 * ```
 */
export function whenBrowser(target: Function, context: ClassDecoratorContext): void {
    conditionalDecorator(WHEN_PLATFORM, 'browser', target, context);
}

/**
 * Marks a configuration class as node-only.
 *
 * @example
 * ```ts
 * @whenNode
 * @class
 * class NodeAutoConfiguration { … }
 * ```
 */
export function whenNode(target: Function, context: ClassDecoratorContext): void {
    conditionalDecorator(WHEN_PLATFORM, 'node', target, context);
}

/**
 * Options for {@link whenProperty}.
 */
export interface WhenPropertyOptions {
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
 * @whenProperty({ name: 'app.management.enabled' })
 * @class
 * class ManagementConfiguration { … }
 * ```
 */
export function whenProperty(options: WhenPropertyOptions) {
    return function (target: Function, context: ClassDecoratorContext): void {
        conditionalDecorator(WHEN_PROPERTY, options, target, context);
    };
}

/**
 * Normalizes profile gate arguments into one canonical expression: a single
 * value keeps its validated, trimmed form; multiple values mean either-of
 * and fold into one union via {@link Profile.or}. Folding at decoration time
 * replaces the old per-entry OR loop, so every reader evaluates exactly one
 * expression (AD-83).
 */
const normalizeProfileCondition = (expressions: Array<string | ProfileTerm>): string => {
    if (expressions.length === 0) {
        throw new FrameworkError('@whenProfile requires at least one profile expression');
    }
    return expressions.length === 1 ? Profile.parse(String(expressions[0])) : String(Profile.or(...expressions));
};

/**
 * Class or method decorator that marks the annotated target active only when
 * a profile expression matches the environment's effective active set
 * (AD-14; unified as the single profile gate by AD-83).
 *
 * A single expression keeps its form; multiple arguments mean either-of and
 * fold into one canonical `a | b` expression at decoration time. Composed
 * {@link ProfileTerm} expressions (AD-34 D5) are accepted and normalized the
 * same way. On a class the condition gates registration; on an entry method
 * it gates that entry alone.
 *
 * @param expressions - One profile expression, or multiple for either-of.
 * @returns A class/method decorator that stores the canonical condition.
 *
 * @example
 * ```ts
 * @whenProfile('!prod & (dev | test)')
 * class DevOnlyConfiguration { ... }
 *
 * @whenProfile('dev', 'test') // either-of → 'dev | test'
 * @entry()
 * devOrTestEntry() { ... }
 * ```
 */
export function whenProfile(...expressions: Array<string | ProfileTerm>) {
    const condition = normalizeProfileCondition(expressions);
    // Generic target keeps the decorator's return type assignable to both
    // classes and methods (TS1270 would reject a bare `Function` return).
    return function <M extends Function>(target: M, context: ClassDecoratorContext | ClassMethodDecoratorContext): M {
        if (context.kind === 'class') {
            context.metadata[WHEN_PROFILE] = condition;
        } else if (context.kind === 'method') {
            context.metadata[`${WHEN_PROFILE}:${String(context.name)}`] = condition;
        } else {
            throw new FrameworkError('@whenProfile can only be applied to classes or methods');
        }
        return target;
    };
}

/**
 * Marks a configuration class as active only when an entry is NOT already
 * registered — the "provide your own override" guarantee for auto-configs.
 *
 * @example
 * ```ts
 * @whenMissingEntry('metricsController')
 * @class
 * class ManagementAutoConfiguration { … }
 * ```
 */
export function whenMissingEntry(entryName: string) {
    return function (target: Function, context: ClassDecoratorContext): void {
        conditionalDecorator(WHEN_MISSING, entryName, target, context);
    };
}

const getMetadata = (target: unknown): Record<string, unknown> => {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as
        | { [Symbol.metadata]?: Record<string, unknown> }
        | undefined;

    return carrier?.[Symbol.metadata] ?? {};
};

/**
 * Reads the conditional platform metadata from a class.
 *
 * @param target - The class constructor or instance to inspect.
 * @returns The required platform, or `undefined` when no condition is set.
 */
export function getConditionalPlatform(target: unknown): ConditionalPlatform | undefined {
    const meta = getMetadata(target);
    return meta[WHEN_PLATFORM] as ConditionalPlatform | undefined;
}

/**
 * Reads the canonical profile condition stored on a class or one of its
 * methods — the read counterpart of {@link whenProfile} (AD-83). The
 * configuration parser uses this to gate classes and entry methods; boot
 * uses {@link isActive} on classes only.
 *
 * @param target - The class constructor or instance to inspect.
 * @param methodName - When set, read the condition recorded for that method.
 * @returns The canonical profile expression, or `undefined` when unset.
 */
export function getProfileCondition(target: unknown, methodName?: string): string | undefined {
    const meta = getMetadata(target);
    return meta[methodName === undefined ? WHEN_PROFILE : `${WHEN_PROFILE}:${methodName}`] as string | undefined;
}

/**
 * Checks whether a class can run in the current environment (platform only).
 *
 * @param target - The class constructor or instance to check.
 * @returns `true` when the class should be registered in this environment.
 */
export function isActiveForCurrentPlatform(target: unknown): boolean {
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
export function isActive(target: unknown, ctx?: ConditionContext): boolean {
    if (!isActiveForCurrentPlatform(target)) {
        return false;
    }

    const meta: Record<string, unknown> = getMetadata(target);

    const property = meta[WHEN_PROPERTY] as WhenPropertyOptions | undefined;
    if (property) {
        if (!ctx) {
            return true;
        }
        if (!propertyActive(property, ctx)) {
            return false;
        }
    }

    const profile = meta[WHEN_PROFILE] as string | undefined;
    if (profile) {
        if (!ctx?.acceptsProfiles) {
            return true;
        }
        if (!ctx.acceptsProfiles(profile)) {
            return false;
        }
    }

    const missing = meta[WHEN_MISSING] as string | undefined;
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
function propertyActive(options: WhenPropertyOptions, ctx: ConditionContext): boolean {
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
