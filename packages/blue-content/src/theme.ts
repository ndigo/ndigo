/**
 * @author Jeff Rose
 */

import { ContentSource } from './content';
import { like } from '@blue/util/types';

export interface Theme {
    name: string;
    contentSource: ContentSource;
}

export interface ThemeSource {
    theme: Theme;
}

export interface ThemeResolver {
    getTheme(name?: string): Theme;
}

/**
 * In-memory theme resolver for static theme maps.
 */
export class StaticThemeResolver implements ThemeResolver {
    #themes: Map<string, Theme>;
    #defaultThemeName: string;

    constructor(themes: Theme[], defaultThemeName?: string) {
        this.#themes = new Map(themes.map((theme) => [theme.name, theme]));
        this.#defaultThemeName = defaultThemeName || themes[0]?.name || '';

        if (!this.#defaultThemeName || !this.#themes.has(this.#defaultThemeName)) {
            throw new TypeError('StaticThemeResolver requires at least one valid default theme');
        }
    }

    getTheme(name?: string): Theme {
        const selected = (name && this.#themes.get(name)) || this.#themes.get(this.#defaultThemeName);
        if (!selected) {
            throw new TypeError('Theme does not exist');
        }

        return selected;
    }

    availableThemes(): string[] {
        return Array.from(this.#themes.keys());
    }
}

export const likeTheme = like({ name: String, contentSource: Object }) as (value) => value is Theme;

export const likeThemeResolver = like({ getTheme: Function }) as (value) => value is ThemeResolver;
