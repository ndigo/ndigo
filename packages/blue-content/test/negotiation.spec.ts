/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { NegotiatingContentSource, normalizeLocale, parseAcceptLanguage } from '../src/negotiation';

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

describe('normalizeLocale', () => {
    test('keeps well-formed tags and canonicalizes case', () => {
        expect(normalizeLocale('fr')).toBe('fr');
        expect(normalizeLocale('fr-CH')).toBe('fr-CH');
        expect(normalizeLocale('EN-us')).toBe('en-US');
        expect(normalizeLocale('zh-Hant-TW')).toBe('zh-Hant-TW');
        expect(normalizeLocale('de-DE-u-ca-gregory')).toBe('de-DE-u-ca-gregory');
    });

    test('rejects markup-capable and malformed values', () => {
        expect(normalizeLocale('" autofocus onfocus="alert(1)')).toBeUndefined();
        expect(normalizeLocale('en"><script>alert(1)</script>')).toBeUndefined();
        expect(normalizeLocale("fr'; DROP TABLE users; --")).toBeUndefined();
        expect(normalizeLocale('en US')).toBeUndefined();
        expect(normalizeLocale('en-US-')).toBeUndefined();
        expect(normalizeLocale('under_score')).toBeUndefined();
        expect(normalizeLocale('')).toBeUndefined();
        expect(normalizeLocale(42)).toBeUndefined();
        expect(normalizeLocale(undefined)).toBeUndefined();
        expect(normalizeLocale(null)).toBeUndefined();
    });

    test('rejects overlong tags', () => {
        const longTag = `en-${'a'.repeat(62)}`;
        expect(longTag.length).toBeGreaterThan(64);
        expect(normalizeLocale(longTag)).toBeUndefined();
    });
});

describe('NegotiatingContentSource', () => {
    const source = new StaticContentSource({
        title: { en: 'Hello', fr: 'Bonjour' },
        welcome: { en: 'Welcome', fr: 'Bienvenue', de: 'Willkommen' },
    });

    test('resolves content with bare language code', () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(negotiator.getContent('title', 'fr')).toBe('Bonjour');
    });

    test('resolves content from Accept-Language header', () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(negotiator.getContent('welcome', 'fr-CH, fr;q=0.9, en;q=0.8')).toBe('Bienvenue');
    });

    test('falls back to default language when translation is missing', () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        // de exists for welcome but not for title
        expect(negotiator.getContent('title', 'de')).toBe('Hello'); // fallback to en
    });

    test('returns key when no translation exists in any language', () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(negotiator.getContent('missing', 'fr')).toBe('missing');
    });

    test('uses default language when header cannot be parsed', () => {
        const negotiator = new NegotiatingContentSource(source, 'en');
        expect(negotiator.getContent('welcome', '')).toBe('Welcome');
    });

    test('exposes defaultLanguage', () => {
        const negotiator = new NegotiatingContentSource(source, 'de');
        expect(negotiator.defaultLanguage).toBe('de');
    });
});
