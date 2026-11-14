/**
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import {
    StaticThemeResolver,
    StaticThemeSource,
    Theme,
    likeTheme,
    likeThemeResolver,
    likeThemeSource,
} from '../src/theme';

describe('@ndigo/content theme utilities', () => {
    const contentSource = new StaticContentSource({
        title: { en: 'Ndigo' },
    });

    const lightTheme: Theme = {
        name: 'light',
        contentSource,
    };

    const darkTheme: Theme = {
        name: 'dark',
        contentSource,
    };

    test('StaticThemeSource resolves theme by name and default', () => {
        const source = new StaticThemeSource([lightTheme, darkTheme], 'light');

        expect(source.getTheme().name).toBe('light');
        expect(source.getTheme('dark').name).toBe('dark');
        expect(source.availableThemes()).toEqual(['light', 'dark']);
    });

    test('StaticThemeSource throws when no default theme can be determined', () => {
        expect(() => new StaticThemeSource([], 'light')).toThrow(TypeError);
    });

    test('duck typing guards for themes and theme sources', () => {
        const source = new StaticThemeSource([lightTheme], 'light');

        expect(likeTheme(lightTheme)).toBe(true);
        expect(likeThemeSource(source)).toBe(true);
    });

    test('deprecated resolver names alias the theme source', () => {
        const source = new StaticThemeResolver([lightTheme], 'light');

        expect(StaticThemeResolver).toBe(StaticThemeSource);
        expect(likeThemeResolver).toBe(likeThemeSource);
        expect(source).toBeInstanceOf(StaticThemeSource);
        expect(source.getTheme().name).toBe('light');
    });
});
