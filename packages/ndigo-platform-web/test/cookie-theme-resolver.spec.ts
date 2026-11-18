/**
 */
import { describe, test, expect, afterEach, vi } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { AbstractThemeResolver } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { Cookies } from '../src/cookies';
import { CookieThemeResolver, configureCookieThemeResolver } from '../src/cookie-theme-resolver';

const route = { path: '/hello' } as unknown as Route;

/** Stubs `matchMedia` so `query` matches exactly the listed color schemes. */
const stubColorScheme = (...schemes: Array<'dark' | 'light'>): void => {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: schemes.some((scheme) => query.includes(scheme)),
        media: query,
    }));
};

describe('CookieThemeResolver', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    test('uses the cookie theme when available', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('night');

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveThemeName(route)).toBe('night');
    });

    test('prefers the cookie over the system preference', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('solarized-light');
        stubColorScheme('dark');

        const resolver = new CookieThemeResolver('theme', 'ndigo-dark');
        expect(resolver.resolveThemeName(route)).toBe('solarized-light');
    });

    test('discards an invalid cookie and falls through to the system preference', () => {
        stubColorScheme('light');
        const get = vi.spyOn(Cookies, 'get');

        for (const value of ['Light', 'solarized dark', '"><script>alert(1)</script>', 'dark'.repeat(20)]) {
            get.mockReturnValue(value);

            const resolver = new CookieThemeResolver('theme', 'ndigo-dark');
            expect(resolver.resolveThemeName(route)).toBe('ndigo-light');
        }
    });

    test('falls back to the default theme name without a cookie or matchMedia', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveThemeName(route)).toBe('default');
    });

    test('accepts a custom fallback resolver', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const fallback = new (class extends AbstractThemeResolver {
            resolveThemeName() {
                return 'tenant-theme';
            }
        })('ndigo-dark');

        const resolver = new CookieThemeResolver('theme', 'ndigo-dark', fallback);
        expect(resolver.resolveThemeName(route)).toBe('tenant-theme');
    });

    test('fromApplicationContext uses the context theme name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const context = new GenericApplicationContext('test');
        context.setThemeName('ocean');

        const resolver = CookieThemeResolver.fromApplicationContext(context, 'theme');

        expect(resolver.resolveThemeName(route)).toBe('ocean');
    });

    test('configureCookieThemeResolver registers strategy in context', () => {
        const context = new GenericApplicationContext('test');
        context.setThemeName('forest');

        const resolver = configureCookieThemeResolver(context, 'themeName');

        expect(context.getValue('themeResolver')).toBe(resolver);
        expect(resolver.cookieName).toBe('themeName');

        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);
        expect(resolver.resolveThemeName(route)).toBe('forest');
    });

    test('resolver should expose Symbol.toStringTag with cookie name', () => {
        const resolver = new CookieThemeResolver('tenantTheme', 'default');

        expect(resolver[Symbol.toStringTag]).toBe('CookieThemeResolver:tenantTheme');
    });
});
