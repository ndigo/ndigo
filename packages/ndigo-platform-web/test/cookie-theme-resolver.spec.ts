/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, afterEach, vi } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { Route } from '@ndigo/router';
import Cookies from '../src/cookies';
import { CookieThemeResolver, configureCookieThemeResolver } from '../src/cookie-theme-resolver';

describe('CookieThemeResolver', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('uses cookie theme when available', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue('night');

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveTheme({ path: '/hello' } as unknown as Route)).toBe('night');
    });

    test('falls back to default theme name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const resolver = new CookieThemeResolver('theme', 'default');
        expect(resolver.resolveTheme({ path: '/hello' } as unknown as Route)).toBe('default');
    });

    test('fromApplicationContext uses context theme name', () => {
        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);

        const context = new GenericApplicationContext('test');
        context.setThemeName('ocean');

        const resolver = CookieThemeResolver.fromApplicationContext(context, 'theme');

        expect(resolver.resolveTheme({ path: '/hello' } as unknown as Route)).toBe('ocean');
    });

    test('configureCookieThemeResolver registers strategy in context', () => {
        const context = new GenericApplicationContext('test');
        context.setThemeName('forest');

        const resolver = configureCookieThemeResolver(context, 'themeName');

        expect(context.getValue('themeResolver')).toBe(resolver);
        expect(resolver.cookieName).toBe('themeName');

        vi.spyOn(Cookies, 'get').mockReturnValue(undefined);
        expect(resolver.resolveTheme({ path: '/hello' } as unknown as Route)).toBe('forest');
    });

    test('resolver should expose Symbol.toStringTag with cookie name', () => {
        const resolver = new CookieThemeResolver('tenantTheme', 'default');

        expect(resolver[Symbol.toStringTag]).toBe('CookieThemeResolver:tenantTheme');
    });
});
