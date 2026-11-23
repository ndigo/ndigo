/**
 * HTML attribute serialization for a theme.
 */
import type { Theme } from './theme.js';

/**
 * Attributes that select a theme in server-rendered markup.
 *
 * Spread onto the root element (`<html {...themeAttributes(theme)}>`) so the
 * same attributes that `applyTheme` sets at runtime are present in the SSR
 * document, letting hydration skip re-resolving the theme.
 *
 * @example
 * ```ts
 * const value = {} as ThemeAttributes;
 * ```
 */
export interface ThemeAttributes {
    /** Selects the theme's CSS rules and exposes the active theme to scripts. */
    readonly 'data-theme': string;
    /** Lets the browser color native widgets to match the theme. */
    readonly 'data-color-scheme': Theme['colorScheme'];
}

/**
 * Escapes an attribute value for HTML serialization.
 *
 * `normalizeThemeName` is the primary gate for untrusted names; this is
 * defense in depth for application-supplied themes that bypass it.
 *
 * @param value - Raw attribute value.
 * @returns The value with HTML-sensitive characters escaped.
 */
const escapeAttributeValue = (value: string): string =>
    value
        .replace(/&/gu, '&amp;')
        .replace(/</gu, '&lt;')
        .replace(/>/gu, '&gt;')
        .replace(/"/gu, '&quot;')
        .replace(/'/gu, '&#39;');

/**
 * Builds the HTML attributes for a theme.
 *
 * @param theme - Theme to serialize.
 * @returns Attribute names mapped to escaped values.
 *
 * @example
 * ```ts
 * themeAttributes();
 * ```
 */
export function themeAttributes(theme: Theme): ThemeAttributes {
    return {
        'data-theme': escapeAttributeValue(theme.name),
        'data-color-scheme': theme.colorScheme,
    };
}
