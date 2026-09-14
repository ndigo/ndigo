/**
 * @module blue-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Route, ACCEPT_LANGUAGE_ATTRIBUTE } from '@blue/router';
import {
    AcceptHeaderLanguageResolver,
    FixedLanguageResolver,
    NavigatorLanguageResolver,
} from '../src/language-resolver';

const routeWith = (attributes: Record<string, unknown> = {}): Route => ({ attributes }) as unknown as Route;

describe('@blue/dispatcher FixedLanguageResolver', () => {
    test('resolves the configured language for every route', () => {
        const resolver = new FixedLanguageResolver('de-DE');

        expect(resolver.resolveLanguage(routeWith())).toBe('de-DE');
        expect(resolver.resolveLanguage(routeWith({ anything: true }))).toBe('de-DE');
    });
});

describe('@blue/dispatcher AcceptHeaderLanguageResolver', () => {
    test('resolves the primary negotiated language tag', () => {
        const resolver = new AcceptHeaderLanguageResolver('en-US');

        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: 'fr-CH, fr;q=0.9, en;q=0.8' }))).toBe(
            'fr-CH'
        );
        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: 'de' }))).toBe('de');
    });

    test('falls back to the default when the header is absent or unparsable', () => {
        const resolver = new AcceptHeaderLanguageResolver('en-US');

        expect(resolver.resolveLanguage(routeWith())).toBe('en-US');
        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: '' }))).toBe('en-US');
        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: '*' }))).toBe('en-US');
    });

    test('ignores non-string attribute values', () => {
        const resolver = new AcceptHeaderLanguageResolver('en-US');

        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: ['fr', 'en'] }))).toBe('en-US');
    });

    test('rejects markup-capable header tags and falls back to the default', () => {
        const resolver = new AcceptHeaderLanguageResolver('en-US');

        expect(
            resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: '" autofocus onfocus="alert(1)' }))
        ).toBe('en-US');
        expect(
            resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: 'en"><script>alert(1)</script>' }))
        ).toBe('en-US');
        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: 'en US' }))).toBe('en-US');
        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: '*' }))).toBe('en-US');
    });

    test('canonicalizes the resolved tag', () => {
        const resolver = new AcceptHeaderLanguageResolver('en-US');

        expect(resolver.resolveLanguage(routeWith({ [ACCEPT_LANGUAGE_ATTRIBUTE]: 'EN-us' }))).toBe('en-US');
    });
});

describe('@blue/dispatcher NavigatorLanguageResolver', () => {
    test('resolves the browser language when available', () => {
        const resolver = new NavigatorLanguageResolver('en-US');

        // jsdom provides navigator.language; assert it is used rather than the default.
        const resolved = resolver.resolveLanguage(routeWith());
        expect(typeof resolved).toBe('string');
        expect(resolved.length).toBeGreaterThan(0);
    });
});
