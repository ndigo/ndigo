/**
 * Theme API tests.
 */
import { describe, expect, it } from 'vitest';
import {
    COMMON_THEMES,
    NDIGO_DARK_THEME,
    NDIGO_LIGHT_THEME,
    SOLARIZED_DARK_THEME,
    SOLARIZED_LIGHT_THEME,
    applyTheme,
    createTheme,
    getCommonTheme,
    removeTheme,
    themeToCss,
    withThemeTokens,
} from '@ndigo/ui';

describe('common themes', () => {
    it('ships the curated set', () => {
        expect(COMMON_THEMES.map((theme) => theme.name)).toEqual([
            'ndigo-dark',
            'ndigo-light',
            'solarized-dark',
            'solarized-light',
            'high-contrast-dark',
            'high-contrast-light',
        ]);
    });

    it('resolves a built-in by name', () => {
        expect(getCommonTheme('solarized-dark')).toBe(SOLARIZED_DARK_THEME);
        expect(getCommonTheme('nope')).toBeUndefined();
    });

    it('has non-empty token maps', () => {
        for (const theme of COMMON_THEMES) {
            expect(Object.keys(theme.tokens).length).toBeGreaterThan(0);
        }
    });
});

describe('createTheme', () => {
    it('inherits from the Ndigo theme matching the color scheme', () => {
        const theme = createTheme({ name: 'custom', colorScheme: 'dark', tokens: { '--nd-color-bg': '#123456' } });
        expect(theme.name).toBe('custom');
        expect(theme.colorScheme).toBe('dark');
        expect(theme.tokens['--nd-color-bg']).toBe('#123456');
        expect(theme.tokens['--nd-color-text']).toBe(NDIGO_DARK_THEME.tokens['--nd-color-text']);
    });

    it('uses an explicit base when provided', () => {
        const theme = createTheme({
            name: 'custom-light',
            colorScheme: 'light',
            base: SOLARIZED_LIGHT_THEME,
            tokens: { '--nd-color-bg': '#ffffff' },
        });
        expect(theme.tokens['--nd-color-text']).toBe(SOLARIZED_LIGHT_THEME.tokens['--nd-color-text']);
        expect(theme.tokens['--nd-color-bg']).toBe('#ffffff');
    });

    it('is immutable via withThemeTokens', () => {
        const base = NDIGO_LIGHT_THEME;
        const next = withThemeTokens(base, { '--nd-color-bg': '#000000' });
        expect(next.tokens['--nd-color-bg']).toBe('#000000');
        expect(base.tokens['--nd-color-bg']).not.toBe('#000000');
    });
});

describe('themeToCss', () => {
    it('serializes tokens and color-scheme', () => {
        const css = themeToCss(NDIGO_DARK_THEME, ':root[data-theme="ndigo-dark"]');
        expect(css).toContain(':root[data-theme="ndigo-dark"] {');
        expect(css).toContain('--nd-color-bg: #0a0a14;');
        expect(css).toContain('color-scheme: dark;');
    });
});

describe('applyTheme / removeTheme', () => {
    it('sets and clears inline overrides and attributes', () => {
        const root = document.documentElement;
        applyTheme(SOLARIZED_DARK_THEME, root);
        expect(root.style.getPropertyValue('--nd-color-bg')).toBe('#002b36');
        expect(root.dataset.theme).toBe('solarized-dark');
        expect(root.dataset.colorScheme).toBe('dark');

        removeTheme(root);
        expect(root.style.getPropertyValue('--nd-color-bg')).toBe('');
        expect(root.dataset.theme).toBeUndefined();
    });
});
