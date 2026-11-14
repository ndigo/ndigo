/**
 * Theme contracts, a static source, and structural guards.
 */
import { like } from '@ndigo/util/types';
import { ContentSource } from './content';

/**
 * Describes a named theme and the content source it exposes.
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
 * @deprecated Use {@link ThemeSource} instead. This alias is kept for one
 * minor release; the registry has never performed per-request selection.
 */
export type ThemeResolver = ThemeSource;

/**
 * In-memory theme source for static theme maps.
 */
export class StaticThemeSource implements ThemeSource {
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
 * @deprecated Use {@link StaticThemeSource} instead.
 */
export type StaticThemeResolver = StaticThemeSource;

/**
 * @deprecated Use {@link StaticThemeSource} instead.
 */
export const StaticThemeResolver = StaticThemeSource;

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
 * @deprecated Use {@link likeThemeSource} instead.
 */
export const likeThemeResolver = likeThemeSource;
