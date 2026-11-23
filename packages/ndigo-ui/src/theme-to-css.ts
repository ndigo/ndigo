/**
 * Serializes a theme to a CSS rule.
 */
import type { Theme } from './theme.js';

/**
 * Builds a CSS rule that applies a theme's token overrides to `selector`.
 * @param theme - Theme to serialize.
 * @param selector - CSS selector to target. Defaults to `:root`.
 * @returns CSS text.
 *
 * @example
 * ```ts
 * themeToCss();
 * ```
 */
export function themeToCss(theme: Theme, selector: string = ':root'): string {
    const declarations = Object.entries(theme.tokens)
        .map(([name, value]) => `    ${name}: ${value};`)
        .join('\n');

    const colorScheme = `    color-scheme: ${theme.colorScheme};`;

    return `${selector} {\n${declarations}\n${colorScheme}\n}`;
}
