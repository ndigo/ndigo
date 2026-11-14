/**
 * `setVisualTheme` tests.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { Cookies } from '@ndigo/platform-web';
import { SOLARIZED_LIGHT_THEME, createTheme } from '@ndigo/ui';
import { setVisualTheme, type ThemeContextLike } from '../src/set-visual-theme';

class TestThemeContext implements ThemeContextLike {
    themeName = 'ndigo-dark';

    setThemeName(name: string): void {
        this.themeName = name;
    }
}

const OCEAN_THEME = createTheme({
    name: 'ocean',
    colorScheme: 'dark',
    tokens: { '--nd-color-bg': '#001122' },
});

const target = (): HTMLElement => {
    const element = document.createElement('div');
    document.body.append(element);
    return element;
};

describe('setVisualTheme', () => {
    beforeEach(() => {
        document.body.replaceChildren();
        document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    it('applies the theme, records it on the context, and persists it', () => {
        const context = new TestThemeContext();
        const element = target();

        const applied = setVisualTheme(context, 'solarized-light', { target: element });

        expect(applied).toBe(SOLARIZED_LIGHT_THEME);
        expect(element.dataset.theme).toBe('solarized-light');
        expect(element.dataset.colorScheme).toBe('light');
        expect(element.style.getPropertyValue('--nd-color-bg')).toBe(SOLARIZED_LIGHT_THEME.tokens['--nd-color-bg']);
        expect(context.themeName).toBe('solarized-light');
        expect(Cookies.get('theme')).toBe('solarized-light');
    });

    it('returns undefined and changes nothing for an unknown theme', () => {
        const context = new TestThemeContext();
        const element = target();

        expect(setVisualTheme(context, 'nope', { target: element })).toBeUndefined();
        expect(element.dataset.theme).toBeUndefined();
        expect(context.themeName).toBe('ndigo-dark');
        expect(Cookies.get('theme')).toBeUndefined();
    });

    it('prefers an application theme over a built-in with the same name', () => {
        const context = new TestThemeContext();
        const element = target();

        const applied = setVisualTheme(context, 'solarized-light', {
            target: element,
            themes: { 'solarized-light': OCEAN_THEME },
        });

        expect(applied).toBe(OCEAN_THEME);
        expect(element.dataset.theme).toBe('ocean');
        expect(Cookies.get('theme')).toBe('ocean');
    });

    it('skips persistence when asked', () => {
        const context = new TestThemeContext();

        setVisualTheme(context, 'solarized-dark', { target: target(), persist: false });

        expect(context.themeName).toBe('solarized-dark');
        expect(Cookies.get('theme')).toBeUndefined();
    });

    it('writes a custom cookie name', () => {
        const context = new TestThemeContext();

        setVisualTheme(context, 'ndigo-light', { target: target(), cookieName: 'tenant-theme' });

        expect(Cookies.get('tenant-theme')).toBe('ndigo-light');
        expect(Cookies.get('theme')).toBeUndefined();
    });
});
