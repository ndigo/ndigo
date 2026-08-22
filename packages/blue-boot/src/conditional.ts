/**
 * TC39 Stage 3 decorators for platform-conditional auto-configuration.
 *
 * @module
 * @since 1.0.0
 */

import '@tsmetadata/polyfill';

/** Platform types for conditional auto-configuration. */
export type ConditionalPlatform = 'browser' | 'node';

const CONDITIONAL_ON = 'boot:conditionalOn';

/**
 * Class decorator that marks a configuration class as requiring a specific platform.
 *
 * The `Application` class checks this metadata when registering sources,
 * skipping configurations that don't match the current runtime.
 *
 * @param platform - The required platform (`'browser'` or `'node'`).
 * @returns A class decorator.
 *
 * @example
 * ```ts
 * @ConditionalOnBrowser
 * class WebAutoConfiguration { … }
 *
 * @ConditionalOnNode
 * class NodeAutoConfiguration { … }
 * ```
 */
function conditionalOnDecorator(
    platform: ConditionalPlatform,
    target: any,
    context: ClassDecoratorContext,
): any {
    context.metadata[CONDITIONAL_ON] = platform;
    return target;
}

/**
 * Marks a configuration class as browser-only.
 *
 * @example
 * ```ts
 * @ConditionalOnBrowser
 * @configuration
 * class WebAutoConfiguration { … }
 * ```
 */
export function ConditionalOnBrowser(target: any, context: ClassDecoratorContext): any {
    return conditionalOnDecorator('browser', target, context);
}

/**
 * Marks a configuration class as node-only.
 *
 * @example
 * ```ts
 * @ConditionalOnNode
 * @configuration
 * class NodeAutoConfiguration { … }
 * ```
 */
export function ConditionalOnNode(target: any, context: ClassDecoratorContext): any {
    return conditionalOnDecorator('node', target, context);
}

/**
 * Reads the conditional platform metadata from a class.
 *
 * @param target - The class constructor or instance to inspect.
 * @returns The required platform, or `undefined` when no condition is set.
 */
export function getConditionalPlatform(target: any): ConditionalPlatform | undefined {
    const meta: Record<string, any> =
        target?.[Symbol.metadata] ||
        target?.constructor?.[Symbol.metadata] ||
        {};
    return meta[CONDITIONAL_ON];
}

/**
 * Checks whether a class can run in the current environment.
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