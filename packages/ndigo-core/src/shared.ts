/**
 * TC39 Stage 3 decorator and metadata utilities for shared dependency declarations.
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import semver from 'semver';

export const SHARED_KEY = 'ndigo:shared';

/**
 * Options for the `@sharedDependency` class decorator.
 */
export interface SharedOptions {
    /** Whether this entry must be a singleton across the context hierarchy. Default `true`. */
    singleton?: boolean;
    /** Semver range for this entry, e.g. `'^1.0.0'`. Used to detect version skew. */
    version?: string;
}

/**
 * Class decorator that marks an entry as a shell-managed shared dependency.
 *
 * When a child (feature) context attempts to register a `@sharedDependency` entry,
 * the factory skips registration and resolves the entry from the parent chain instead.
 *
 * @example
 * ```ts
 * @sharedDependency({ version: '1.2.0' })
 * class TelemetryService { … }
 * ```
 */
export function sharedDependency(
    options?: SharedOptions
): (target: Function, context: ClassDecoratorContext) => Function {
    return function (target: Function, context: ClassDecoratorContext): Function {
        context.metadata[SHARED_KEY] = { singleton: true, ...options };
        return target;
    };
}

/**
 * Reads the `@sharedDependency` metadata from a class constructor or instance.
 *
 * @param target - Class constructor, prototype, or instance.
 * @returns The `SharedOptions` if the class is marked `@sharedDependency`, or `undefined`.
 */
export function getSharedOptions(target: unknown): SharedOptions | undefined {
    const carrier = (typeof target === 'function' ? target : target?.constructor) as
        | { [Symbol.metadata]?: Record<string, unknown> }
        | undefined;

    // Metadata polyfill guarantees a record on decorated classes; read and cast once.
    return carrier?.[Symbol.metadata]?.[SHARED_KEY] as SharedOptions | undefined;
}

/**
 * Checks whether a class or instance is marked with `@sharedDependency`.
 *
 * @param target - Class constructor, prototype, or instance.
 * @returns `true` if the class is decorated with `@sharedDependency`.
 */
export function isShared(target: unknown): boolean {
    return getSharedOptions(target) !== undefined;
}

/**
 * Checks whether the given version satisfies a semver range.
 *
 * Uses the standard `semver` library (`semver.satisfies`). When either the
 * version or the range is not a valid semver expression, returns `false`.
 *
 * @param version - The actual version string, e.g. `'1.2.0'`.
 * @param range - The range to satisfy, e.g. `'^1.0.0'`.
 * @returns `true` when the version satisfies the range.
 *
 * @example
 * ```ts
 * satisfiesVersion('1.2.0', '^1.0.0'); // true
 * satisfiesVersion('2.0.0', '^1.0.0'); // false
 * ```
 */
export function satisfiesVersion(version: string, range: string): boolean {
    try {
        return semver.satisfies(version, range);
    } catch {
        return false;
    }
}
