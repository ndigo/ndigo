/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { FixedLanguageResolver } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { CookieLanguageResolver, configureCookieLanguageResolver } from '../src/cookie-language-resolver';

const route = {} as Route;

describe('@ndigo/platform-web CookieLanguageResolver', () => {
    beforeEach(() => {
        document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    afterEach(() => {
        document.cookie = 'lang=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    });

    test('resolves the persisted cookie language', () => {
        document.cookie = 'lang=fr';
        const resolver = new CookieLanguageResolver('lang');

        expect(resolver.resolveLanguage(route)).toBe('fr');
    });

    test('falls back to the navigator language when no cookie is set', () => {
        // jsdom provides navigator.language; the default fallback resolver
        // must produce a language rather than the fixed default.
        const resolved = new CookieLanguageResolver('lang').resolveLanguage(route);

        expect(typeof resolved).toBe('string');
        expect(resolved.length).toBeGreaterThan(0);
    });

    test('an explicit fallback resolver wins when the cookie is absent', () => {
        const resolver = new CookieLanguageResolver('lang', new FixedLanguageResolver('de-DE'));

        expect(resolver.resolveLanguage(route)).toBe('de-DE');
    });

    test('tampered cookie values fall through to the fallback resolver', () => {
        document.cookie = 'lang=" autofocus onfocus="alert(1)';
        const resolver = new CookieLanguageResolver('lang', new FixedLanguageResolver('de-DE'));

        expect(resolver.resolveLanguage(route)).toBe('de-DE');
    });

    test('canonicalizes the persisted cookie language', () => {
        document.cookie = 'lang=EN-us';
        const resolver = new CookieLanguageResolver('lang');

        expect(resolver.resolveLanguage(route)).toBe('en-US');
    });

    test('configureCookieLanguageResolver registers the resolver on the context', () => {
        const context = new GenericApplicationContext('test');

        const resolver = configureCookieLanguageResolver(context);
        expect(resolver).toBeInstanceOf(CookieLanguageResolver);
    });
});
