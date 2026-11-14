/**
 */
import { describe, test, expect, afterEach, vi } from 'vitest';
import { Route, REQUESTED_THEME_ATTRIBUTE } from '@ndigo/router';
import {
    AttributeThemeResolver,
    FixedThemeResolver,
    SystemThemeResolver,
    type SystemThemeResolverOptions,
} from '../src/theme-resolver';

const routeWith = (attributes: Record<string, unknown> = {}): Route => ({ attributes }) as unknown as Route;

/** Stubs `matchMedia` so `query` matches exactly the listed color schemes. */
const stubColorScheme = (...schemes: Array<'dark' | 'light'>): void => {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: schemes.some((scheme) => query.includes(scheme)),
        media: query,
    }));
};

describe('@ndigo/dispatcher FixedThemeResolver', () => {
    test('resolves the configured theme for every route', () => {
        const resolver = new FixedThemeResolver('ndigo-dark');

        expect(resolver.resolveThemeName(routeWith())).toBe('ndigo-dark');
        expect(resolver.resolveThemeName(routeWith({ anything: true }))).toBe('ndigo-dark');
    });
});

describe('@ndigo/dispatcher AttributeThemeResolver', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('resolves the requested theme stamped by the platform', () => {
        const resolver = new AttributeThemeResolver('ndigo-dark');

        expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: 'solarized-dark' }))).toBe(
            'solarized-dark'
        );
        expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: 'high-contrast-light' }))).toBe(
            'high-contrast-light'
        );
    });

    test('falls back to the default when the attribute is absent or non-string', () => {
        const resolver = new AttributeThemeResolver('ndigo-dark');

        expect(resolver.resolveThemeName(routeWith())).toBe('ndigo-dark');
        expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: '' }))).toBe('ndigo-dark');
        expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: ['dark'] }))).toBe('ndigo-dark');
        expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: null }))).toBe('ndigo-dark');
    });

    test('rejects markup-capable and non-canonical names', () => {
        const resolver = new AttributeThemeResolver('ndigo-dark');

        for (const value of [
            'Light',
            'solarized dark',
            "dark' onload='alert(1)",
            '"><script>alert(1)</script>',
            '-dark',
            'dark-',
            'dark--light',
            'a'.repeat(65),
        ]) {
            expect(resolver.resolveThemeName(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: value }))).toBe('ndigo-dark');
        }
    });

    test('keeps the deprecated resolveTheme shim working', () => {
        const resolver = new AttributeThemeResolver('ndigo-dark');

        expect(resolver.resolveTheme(routeWith({ [REQUESTED_THEME_ATTRIBUTE]: 'solarized-light' }))).toBe(
            'solarized-light'
        );
    });
});

describe('@ndigo/dispatcher SystemThemeResolver', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('maps the system preference to the configured theme names', () => {
        const options: SystemThemeResolverOptions = {
            darkThemeName: 'solarized-dark',
            lightThemeName: 'solarized-light',
        };

        stubColorScheme('dark');
        expect(new SystemThemeResolver('ndigo-dark', options).resolveThemeName(routeWith())).toBe('solarized-dark');

        stubColorScheme('light');
        expect(new SystemThemeResolver('ndigo-dark', options).resolveThemeName(routeWith())).toBe('solarized-light');
    });

    test('uses the Ndigo built-ins when no mapping is given', () => {
        stubColorScheme('dark');
        expect(new SystemThemeResolver('ndigo-dark').resolveThemeName(routeWith())).toBe('ndigo-dark');

        stubColorScheme('light');
        expect(new SystemThemeResolver('ndigo-dark').resolveThemeName(routeWith())).toBe('ndigo-light');
    });

    test('falls back to the default without matchMedia', () => {
        const resolver = new SystemThemeResolver('solarized-dark');

        expect(typeof matchMedia).toBe('undefined');
        expect(resolver.resolveThemeName(routeWith())).toBe('solarized-dark');
    });

    test('reads the preference at call time, never cached', () => {
        const resolver = new SystemThemeResolver('ndigo-dark');

        stubColorScheme('dark');
        expect(resolver.resolveThemeName(routeWith())).toBe('ndigo-dark');

        stubColorScheme('light');
        expect(resolver.resolveThemeName(routeWith())).toBe('ndigo-light');
    });
});
