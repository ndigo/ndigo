/**
 * Visual theme lookup by name.
 */
import { getCommonTheme } from './common-themes.js';
import type { Theme } from './theme.js';

/**
 * Application-supplied map of theme names to themes.
 *
 * Names may deliberately shadow a built-in theme; the map wins.
 *
 * @example
 * ```ts
 * type _Alias = VisualThemeMap;
 * ```
 */
export type VisualThemeMap = Readonly<Record<string, Theme>>;

/**
 * Resolves a negotiated theme name to a visual theme.
 *
 * Lookup order is the application map first, then the built-in
 * `COMMON_THEMES`. An unknown name resolves to `undefined` rather than
 * throwing: the request keeps rendering with the base tokens, so a missing
 * visual theme never fails a page.
 *
 * @param name - Theme name, normally the negotiated route theme.
 * @param themes - Optional application theme map.
 * @returns The matching theme, or `undefined` when the name is unknown.
 *
 * @example
 * ```ts
 * resolveVisualTheme();
 * ```
 */
export function resolveVisualTheme(name: string, themes?: VisualThemeMap): Theme | undefined {
    if (themes && Object.hasOwn(themes, name)) {
        const theme = themes[name];
        if (theme) {
            return theme;
        }
    }

    return getCommonTheme(name);
}
