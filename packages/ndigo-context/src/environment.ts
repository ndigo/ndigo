/**
 * Environment and profile activation for the application context.
 *
 * `Environment` exposes property resolution plus active-profile management;
 * `StandardEnvironment` is the default implementation backed by property sources.
 *
 * @example
 * ```ts
 * const env = new StandardEnvironment();
 * env.setActiveProfiles('prod');
 * env.getProperty('server.port');
 * ```
 */

import { AbstractEnvironment } from './abstract-environment.js';

export class MockEnvironment extends AbstractEnvironment {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "MockEnvironment".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object MockEnvironment]"
     */
    get [Symbol.toStringTag](): string {
        return 'MockEnvironment';
    }
}

/**
 * Default environment implementation used by application contexts.
 *
 * The `Symbol.toStringTag` is inherited from {@link AbstractEnvironment},
 * which exposes the active profiles (`Environment:foo,bar`).
 *
 * @example
 * ```ts
 * const env = new StandardEnvironment();
 * env.setActiveProfiles('prod');
 * ```
 */
export class StandardEnvironment extends AbstractEnvironment {}

export * from './environment-types.js';
export * from './abstract-environment.js';
export * from './environment-guards.js';
