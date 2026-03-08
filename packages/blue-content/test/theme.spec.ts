import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { StaticThemeResolver, Theme, likeTheme, likeThemeResolver } from '../src/theme';

describe('@blue/content theme utilities', () => {
    const contentSource = new StaticContentSource({
        title: { en: 'Blue' },
    });

    const lightTheme: Theme = {
        name: 'light',
        contentSource,
    };

    const darkTheme: Theme = {
        name: 'dark',
        contentSource,
    };

    test('StaticThemeResolver resolves theme by name and default', () => {
        const resolver = new StaticThemeResolver([lightTheme, darkTheme], 'light');

        expect(resolver.getTheme().name).toBe('light');
        expect(resolver.getTheme('dark').name).toBe('dark');
        expect(resolver.availableThemes()).toEqual(['light', 'dark']);
    });

    test('StaticThemeResolver throws when no default theme can be determined', () => {
        expect(() => new StaticThemeResolver([], 'light')).toThrow(TypeError);
    });

    test('duck typing guards for themes and resolvers', () => {
        const resolver = new StaticThemeResolver([lightTheme], 'light');

        expect(likeTheme(lightTheme)).toBe(true);
        expect(likeThemeResolver(resolver)).toBe(true);
    });
});
