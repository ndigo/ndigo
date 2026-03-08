import { describe, test, expect, afterEach, vi } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import Cookies from '../src/cookies';
import { CookieThemeResolver, configureCookieThemeResolver } from '../src/cookie-theme-resolver';

describe('CookieThemeResolver', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('uses cookie theme when available', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('night');

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveTheme({ path: '/hello' } as any)).toBe('night');
    });

    test('falls back to default theme name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveTheme({ path: '/hello' } as any)).toBe('default');
    });

    test('fromApplicationContext uses context theme name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const context = new GenericApplicationContext('test');
        context.setThemeName('ocean');

        const resolver = CookieThemeResolver.fromApplicationContext(context, 'theme');

        expect(resolver.resolveTheme({ path: '/hello' } as any)).toBe('ocean');
    });

    test('configureCookieThemeResolver registers strategy in context', () => {
        const context = new GenericApplicationContext('test');
        context.setThemeName('forest');

        const resolver = configureCookieThemeResolver(context, 'themeName');

        expect(context.getValue('themeResolver')).toBe(resolver);
        expect(resolver.cookieName).toBe('themeName');

        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);
        expect(resolver.resolveTheme({ path: '/hello' } as any)).toBe('forest');
    });
});
