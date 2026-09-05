/**
 * @experimental
 */

import { ApplicationBuilder } from './application-builder';

/**
 * Composes a full multi-context site from child application builders.
 *
 * **This class is experimental and not yet implemented.**
 * The API surface documented here reflects the planned 1.0 design.
 * Do not use in production — the interface may change without notice.
 *
 * @experimental
 *
 * @example
 * ```ts
 * // Planned usage (not yet functional):
 * SiteBuilder.create()
 *   .child(ApplicationBuilder.from(ShellConfig))
 *   .child(ApplicationBuilder.from(FeatureConfig))
 *   .run();
 * ```
 */
export class SiteBuilder {
    /**
     * Creates a new SiteBuilder.
     *
     * @returns A new SiteBuilder instance.
     * @experimental
     */
    static create(): SiteBuilder {
        return new SiteBuilder();
    }

    /**
     * Registers a child application builder as part of the site composition.
     *
     * @param _builder - The child application builder to include.
     * @returns This builder for chaining.
     * @experimental
     */
    child(_builder: ApplicationBuilder): this {
        return this;
    }

    /**
     * Launches all registered child contexts and mounts the site.
     *
     * @param _args - Command-line arguments forwarded to each child.
     * @experimental
     */
    run(..._args: string[]): void {
        // Not yet implemented — see AD-3
    }
}
