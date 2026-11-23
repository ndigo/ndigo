/**
 * Theme contracts, a static source, and structural guards.
 */
import { like } from '@ndigo/util/types';
import { ContentSource } from './content';

/**
 * Describes a named theme and the content source it exposes.
 *
 * @example
 * ```ts
 * const value = {} as Theme;
 * ```
 */
export interface Theme {
    /**
     * Human-readable theme name.
     */
    name: string;

    /**
     * Content source associated with the theme.
     */
    contentSource: ContentSource;
}

/**
 * Looks up themes by name — the theme registry.
 *
 * @example
 * ```ts
 * const value = {} as ThemeSource;
 * ```
 */
export interface ThemeSource {
    /**
     * Gets a theme by name, or the default theme when no name is provided.
     *
     * @param name - Optional theme name.
     * @returns The resolved theme.
     */
    getTheme(name?: string): Theme;
}

/**
 * In-memory theme source for static theme maps.
 *
 * @example
 * ```ts
 * const instance = new StaticThemeSource();
 * ```
 */
export class StaticThemeSource implements ThemeSource {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "StaticThemeSource".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object StaticThemeSource]"
     */
    get [Symbol.toStringTag](): string {
        return 'StaticThemeSource';
    }

    #themes: Map<string, Theme>;
    #defaultThemeName: string;

    /**
     * Creates a theme source backed by an in-memory theme list.
     *
     * @param themes - Available themes.
     * @param defaultThemeName - Optional name of the default theme.
     * @throws When no valid default theme is available.
     */
    constructor(themes: Theme[], defaultThemeName?: string) {
        this.#themes = new Map(themes.map((theme) => [theme.name, theme]));
        this.#defaultThemeName = defaultThemeName || themes[0]?.name || '';

        if (!this.#defaultThemeName || !this.#themes.has(this.#defaultThemeName)) {
            throw new TypeError('StaticThemeSource requires at least one valid default theme');
        }
    }

    /**
     * Resolves the requested theme or falls back to the default theme.
     *
     * @param name - Optional theme name.
     * @returns The requested or default theme.
     * @throws When the theme cannot be found.
     */
    getTheme(name?: string): Theme {
        const selected = (name && this.#themes.get(name)) || this.#themes.get(this.#defaultThemeName);
        if (!selected) {
            throw new TypeError('Theme does not exist');
        }

        return selected;
    }

    /**
     * Lists the available theme names.
     *
     * @returns The available theme names in insertion order.
     */
    availableThemes(): string[] {
        return Array.from(this.#themes.keys());
    }
}

/**
 * Tests whether a value looks like a theme.
 *
 * @param value - The value to be tested.
 * @returns Whether the value matches the theme shape.
 */
export const likeTheme = like({ name: String, contentSource: Object }) as (value: unknown) => value is Theme;

/**
 * Tests whether a value looks like a theme source.
 *
 * @param value - The value to be tested.
 * @returns Whether the value matches the theme source shape.
 */
export const likeThemeSource = like({ getTheme: Function }) as (value: unknown) => value is ThemeSource;

/**
 * Shape accepted for a theme name: lowercase ASCII letters and digits
 * separated by single hyphens.
 *
 * A theme name reaches `data-theme`, `data-color-scheme`, and CSS selector
 * text, so the alphabet is deliberately narrow — quotes, whitespace, angle
 * brackets, uppercase, and empty segments never pass.
 */
const themeNamePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/** Cap on theme-name length; 64 bounds hostile cookie/header input. */
const MAX_THEME_NAME_LENGTH = 64;

/**
 * Validates a theme name from an untrusted source (cookie, header, query).
 *
 * Values are rejected, never escaped and passed on: a name that fails the
 * shape test falls back to the configured default instead of reaching markup
 * or CSS.
 *
 * @param value - The candidate theme name.
 * @returns The name when it matches the accepted shape, or `null`.
 */
export const normalizeThemeName = (value: unknown): string | null => {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_THEME_NAME_LENGTH) {
        return null;
    }

    return themeNamePattern.test(value) ? value : null;
};
