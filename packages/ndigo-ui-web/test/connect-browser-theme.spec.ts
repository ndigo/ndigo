/**
 * `connectBrowserTheme` tests.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { Cookies } from '@ndigo/platform-web';
import { HIGH_CONTRAST_DARK_THEME, NDIGO_DARK_THEME, NDIGO_LIGHT_THEME, SOLARIZED_LIGHT_THEME } from '@ndigo/ui';
import { connectBrowserTheme, type BrowserThemeConnection } from '../src/connect-browser-theme';

const root = (): HTMLElement => document.documentElement;

/** Stubs `matchMedia` so `query` matches exactly the listed color schemes. */
const stubColorScheme = (...schemes: Array<'dark' | 'light'>): void => {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: schemes.some((scheme) => query.includes(scheme)),
        media: query,
    }));
};

describe('connectBrowserTheme', () => {
    let connection: BrowserThemeConnection | undefined;

    beforeEach(() => {
        document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        document.cookie = 'tenant-theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    afterEach(() => {
        connection?.destroy();
        connection = undefined;
        vi.unstubAllGlobals();
    });

    it('applies the persisted cookie theme and updates the context', () => {
        document.cookie = 'theme=solarized-light; path=/';
        const context = new GenericApplicationContext('test');

        connection = connectBrowserTheme(context);

        expect(connection.theme).toBe(SOLARIZED_LIGHT_THEME);
        expect(root().dataset.theme).toBe('solarized-light');
        expect(root().dataset.colorScheme).toBe('light');
        expect(context.themeName).toBe('solarized-light');
    });

    it('follows the system preference without a cookie', () => {
        stubColorScheme('light');

        connection = connectBrowserTheme(new GenericApplicationContext('test'));

        expect(connection.theme).toBe(NDIGO_LIGHT_THEME);
        expect(root().dataset.theme).toBe('ndigo-light');
    });

    it('falls back to the context default when nothing else resolves', () => {
        connection = connectBrowserTheme(new GenericApplicationContext('test'), {
            themeName: 'ndigo-dark',
        });

        expect(connection.theme).toBe(NDIGO_DARK_THEME);
        expect(root().dataset.theme).toBe('ndigo-dark');
    });

    it('discards a malformed cookie instead of applying it', () => {
        stubColorScheme('dark');
        document.cookie = `theme=${encodeURIComponent('"><script>alert(1)</script>')}; path=/`;

        connection = connectBrowserTheme(new GenericApplicationContext('test'));

        expect(connection.theme).toBe(NDIGO_DARK_THEME);
        expect(root().dataset.theme).toBe('ndigo-dark');
        expect(document.documentElement.outerHTML).not.toContain('<script>');
    });

    it('switches theme across DOM, context, and cookie', () => {
        document.cookie = 'theme=ndigo-dark; path=/';
        const context = new GenericApplicationContext('test');
        connection = connectBrowserTheme(context);

        const applied = connection.setTheme('high-contrast-dark');

        expect(applied).toBe(HIGH_CONTRAST_DARK_THEME);
        expect(connection.theme).toBe(HIGH_CONTRAST_DARK_THEME);
        expect(root().dataset.theme).toBe('high-contrast-dark');
        expect(root().dataset.colorScheme).toBe('dark');
        expect(context.themeName).toBe('high-contrast-dark');
        expect(Cookies.get('theme')).toBe('high-contrast-dark');
    });

    it('leaves the current theme in place for an unknown name', () => {
        document.cookie = 'theme=solarized-light; path=/';
        const context = new GenericApplicationContext('test');
        connection = connectBrowserTheme(context);

        expect(connection.setTheme('nope')).toBeUndefined();
        expect(connection.theme).toBe(SOLARIZED_LIGHT_THEME);
        expect(root().dataset.theme).toBe('solarized-light');
        expect(context.themeName).toBe('solarized-light');
    });

    it('uses a custom cookie name for resolution and persistence', () => {
        document.cookie = 'tenant-theme=high-contrast-dark; path=/';
        const context = new GenericApplicationContext('test');
        connection = connectBrowserTheme(context, { cookieName: 'tenant-theme' });

        expect(connection.cookieName).toBe('tenant-theme');
        expect(connection.theme).toBe(HIGH_CONTRAST_DARK_THEME);

        connection.setTheme('solarized-light');

        expect(Cookies.get('tenant-theme')).toBe('solarized-light');
        expect(Cookies.get('theme')).toBeUndefined();
    });

    it('clears the DOM theme on destroy but keeps the persisted choice', () => {
        document.cookie = 'theme=solarized-light; path=/';
        const context = new GenericApplicationContext('test');
        const handle = connectBrowserTheme(context);

        handle.destroy();

        expect(root().dataset.theme).toBeUndefined();
        expect(root().dataset.colorScheme).toBeUndefined();
        expect(Cookies.get('theme')).toBe('solarized-light');
        expect(handle.theme).toBeUndefined();
        expect(handle.setTheme('ndigo-dark')).toBeUndefined();
        expect(context.themeName).toBe('solarized-light');
    });
});
