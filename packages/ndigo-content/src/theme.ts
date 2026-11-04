/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
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
 * Provides the currently selected theme.
 */
export interface ThemeSource {
    /**
     * The active theme.
     */
    theme: Theme;
}

/**
 * Resolves themes by name.
 */
export interface ThemeResolver {
    /**
     * Gets a theme by name, or the default theme when no name is provided.
     *
     * @param name - Optional theme name.
     * @returns The resolved theme.
     */
    getTheme(name?: string): Theme;
}

/**
 * In-memory theme resolver for static theme maps.
 */
export class StaticThemeResolver implements ThemeResolver {
    #themes: Map<string, Theme>;
    #defaultThemeName: string;

    /**
     * Creates a theme resolver backed by an in-memory theme list.
     *
     * @param themes - Available themes.
     * @param defaultThemeName - Optional name of the default theme.
     * @throws {TypeError} When no valid default theme is available.
     */
    constructor(themes: Theme[], defaultThemeName?: string) {
        this.#themes = new Map(themes.map((theme) => [theme.name, theme]));
        this.#defaultThemeName = defaultThemeName || themes[0]?.name || '';

        if (!this.#defaultThemeName || !this.#themes.has(this.#defaultThemeName)) {
            throw new TypeError('StaticThemeResolver requires at least one valid default theme');
        }
    }

    /**
     * Resolves the requested theme or falls back to the default theme.
     *
     * @param name - Optional theme name.
     * @returns The requested or default theme.
     * @throws {TypeError} When the theme cannot be found.
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
 * Tests whether a value looks like a theme resolver.
 *
 * @param value - The value to be tested.
 * @returns Whether the value matches the theme resolver shape.
 */
export const likeThemeResolver = like({ getTheme: Function }) as (value: unknown) => value is ThemeResolver;
