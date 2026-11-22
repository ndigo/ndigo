/**
 * Applies a resolved theme in the browser and persists the choice.
 */
import { applyTheme, resolveVisualTheme, type Theme, type ThemeTarget, type VisualThemeMap } from '@ndigo/ui';
import { Cookies } from '@ndigo/platform-web';

/** Default cookie name shared with the framework resolvers. */
const DEFAULT_COOKIE_NAME = 'theme';

/**
 * Structural shape of the theme state `setVisualTheme` updates.
 *
 * Deliberately narrow: any application context (or test double) that exposes
 * the default theme name and a setter works, so this package never forces a
 * specific context implementation on its consumers.
 *
 * @example
 * ```ts
 * const themeContext: ThemeContextLike = context;
 * themeContext.setThemeName('dark');
 * ```
 */
export interface ThemeContextLike {
    /** Current default theme name. */
    readonly themeName: string;
    /**
     * Records a new default theme name.
     *
     * @param name - The theme name to record.
     */
    setThemeName(name: string): void;
}

/**
 * Options for {@link setVisualTheme}.
 *
 * @example
 * ```ts
 * const theme = setVisualTheme(context, 'dark');
 * ```
 */
export interface SetVisualThemeOptions {
    /** Element to apply the theme to. Defaults to the document root. */
    target?: ThemeTarget;
    /** Application themes consulted before the built-ins. */
    themes?: VisualThemeMap;
    /** Cookie used to persist the choice. Default: `theme`. */
    cookieName?: string;
    /** Whether to persist the choice. Default: `true`. */
    persist?: boolean;
}

/**
 * Resolves, applies, and persists a theme in one call.
 *
 * The resolved theme is applied to the DOM (tokens, `color-scheme`,
 * `data-theme`, `data-color-scheme`), recorded on the context so later
 * content lookups and dispatches see it, and written to the theme cookie so a
 * reload keeps the choice. An unknown theme name changes nothing and returns
 * `undefined`, leaving the current theme in place.
 *
 * @param context - Theme state holder (an application context).
 * @param name - Requested theme name.
 * @param options - Target element, theme map, and persistence settings.
 * @returns The applied theme, or `undefined` for an unknown name.
 *
 * @example
 * ```ts
 * const theme = setVisualTheme(context, 'dark');
 * ```
 */
export function setVisualTheme(
    context: ThemeContextLike,
    name: string,
    options: SetVisualThemeOptions = {}
): Theme | undefined {
    const theme = resolveVisualTheme(name, options.themes);
    if (!theme) {
        return undefined;
    }

    applyTheme(theme, options.target);
    context.setThemeName(theme.name);

    if (options.persist !== false) {
        Cookies.set(options.cookieName ?? DEFAULT_COOKIE_NAME, theme.name, { path: '/' });
    }

    return theme;
}
