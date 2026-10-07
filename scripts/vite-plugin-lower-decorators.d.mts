/**
 * Type declarations for {@link ./vite-plugin-lower-decorators.mjs}.
 *
 * @module scripts/vite-plugin-lower-decorators
 * @since 1.0.0
 * @author Jeff Rose
 */

/** A minimal Vite plugin shape (avoids depending on Vite's types from `scripts/`). */
export interface LowerDecoratorsPlugin {
    name: string;
    enforce: 'pre';
    transform(code: string, id: string): Promise<{ code: string; map: string | null } | null>;
}

/**
 * Creates the decorator-lowering plugin.
 *
 * @returns The plugin object.
 */
export declare function lowerDecorators(): LowerDecoratorsPlugin;
