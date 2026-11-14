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
    normalizeThemeName,
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

describe('normalizeThemeName', () => {
    test('accepts built-in and lowercase kebab-case names', () => {
        for (const name of [
            'dark',
            'light',
            'ndigo-dark',
            'ndigo-light',
            'solarized-dark',
            'high-contrast-light',
            'a1-b2',
            'x'.repeat(64),
        ]) {
            expect(normalizeThemeName(name)).toBe(name);
        }
    });

    test('rejects non-canonical shapes', () => {
        for (const name of [
            'Light',
            'solarized_dark',
            'solarized dark',
            '-dark',
            'dark-',
            'dark--light',
            '',
            'x'.repeat(65),
        ]) {
            expect(normalizeThemeName(name)).toBeNull();
        }
    });

    test('rejects markup-capable values', () => {
        for (const name of [
            '"><script>alert(1)</script>',
            "dark' onload='alert(1)",
            'dark\nlight',
            'dark;color:red',
            'dark/../light',
        ]) {
            expect(normalizeThemeName(name)).toBeNull();
        }
    });

    test('rejects non-string and absent values', () => {
        for (const value of [undefined, null, 42, true, {}, ['dark']]) {
            expect(normalizeThemeName(value)).toBeNull();
        }
    });
});
