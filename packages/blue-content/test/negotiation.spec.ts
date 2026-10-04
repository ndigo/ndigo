/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { NegotiatingContentSource, parseAcceptLanguage } from '../src/negotiation';

describe('parseAcceptLanguage', () => {
    test('parses simple language tag', () => {
        expect(parseAcceptLanguage('fr')).toBe('fr');
    });

    test('parses first tag from weighted list', () => {
        expect(parseAcceptLanguage('fr-CH, fr;q=0.9, en;q=0.8')).toBe('fr-CH');
    });

    test('parses en-US', () => {
        expect(parseAcceptLanguage('en-US,en;q=0.5')).toBe('en-US');
    });

    test('returns undefined for empty string', () => {
        expect(parseAcceptLanguage('')).toBeUndefined();
    });
});

describe('NegotiatingContentSource', () => {
    const source = new StaticContentSource({
        title: { en: 'Hello', fr: 'Bonjour' },
        welcome: { en: 'Welcome', fr: 'Bienvenue', de: 'Willkommen' },
    });

    test('resolves content with bare language code', async () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(await negotiator.getContent('title', 'fr')).toBe('Bonjour');
    });

    test('resolves content from Accept-Language header', async () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(await negotiator.getContent('welcome', 'fr-CH, fr;q=0.9, en;q=0.8')).toBe('Bienvenue');
    });

    test('falls back to default language when translation is missing', async () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        // de exists for welcome but not for title
        expect(await negotiator.getContent('title', 'de')).toBe('Hello'); // fallback to en
    });

    test('returns key when no translation exists in any language', async () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(await negotiator.getContent('missing', 'fr')).toBe('missing');
    });

    test('uses default language when header cannot be parsed', async () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(await negotiator.getContent('welcome', '')).toBe('Welcome');
    });

    test('exposes defaultLanguage', () => {
        const negotiator = new NegotiatingContentSource(source, 'de');
        expect(negotiator.defaultLanguage).toBe('de');
    });
});
