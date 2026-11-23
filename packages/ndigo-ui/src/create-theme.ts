/**
 * Helpers for constructing and extending themes.
 */
import type { Theme, ThemeColorScheme, ThemeTokens } from './theme.js';
import { COMMON_THEMES } from './common-themes.js';

/**
 * Options for {@link createTheme}.
 *
 * @example
 * ```ts
 * type _Alias = CreateThemeOptions;
 * ```
 */
export type CreateThemeOptions = {
    /** Theme name. */
    name: string;
    /** Light or dark presentation. */
    colorScheme: ThemeColorScheme;
    /** Token overrides; merged onto the chosen base theme. */
    tokens?: ThemeTokens;
    /** Base theme whose tokens are inherited. Defaults to the Ndigo theme matching `colorScheme`. */
    base?: Theme;
    /** Optional description. */
    description?: string;
};

/**
 * Creates a theme, inheriting tokens from a base theme when provided.
 *
 * When no `base` is given, the Ndigo theme matching `colorScheme` is used so
 * that a theme can override a handful of tokens without re-declaring the rest.
 *
 * @param options - Theme construction options.
 * @returns A new theme.
 *
 * @example
 * ```ts
 * createTheme();
 * ```
 */
export function createTheme(options: CreateThemeOptions): Theme {
    const base =
        options.base ??
        (options.colorScheme === 'dark'
            ? COMMON_THEMES.find((theme) => theme.name === 'ndigo-dark')
            : COMMON_THEMES.find((theme) => theme.name === 'ndigo-light')) ??
        COMMON_THEMES[0];

    const tokens: ThemeTokens = { ...base?.tokens, ...options.tokens };

    return {
        name: options.name,
        colorScheme: options.colorScheme,
        tokens,
        description: options.description,
    };
}

/**
 * Returns a copy of `theme` with additional token overrides merged in.
 *
 * @param theme - Source theme.
 * @param tokens - Overrides to merge.
 * @returns A new theme.
 *
 * @example
 * ```ts
 * withThemeTokens();
 * ```
 */
export function withThemeTokens(theme: Theme, tokens: ThemeTokens): Theme {
    return {
        ...theme,
        tokens: { ...theme.tokens, ...tokens },
    };
}
