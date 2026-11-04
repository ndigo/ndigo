/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { NegotiatingContentSource } from '../src/negotiation';
import { LanguageCode } from '../src/language-code';
import { TtlContentSource } from '../src/ttl';
import * as LanguageCodes from '../src/language-codes';

describe('LanguageCodes', () => {
    test('exposes canonical codes', () => {
        expect(String(LanguageCodes.EN)).toBe('en');
        expect(String(LanguageCodes.EN_US)).toBe('en-US');
        expect(String(LanguageCodes.FR_CH)).toBe('fr-CH');
        expect(String(LanguageCodes.ZH_HANS)).toBe('zh-Hans');
    });
});

describe('LanguageCode in content sources', () => {
    const source = new StaticContentSource({
        title: { en: 'Hello', 'en-US': 'Howdy', fr: 'Bonjour' },
    });

    test('StaticContentSource accepts LanguageCode constants', async () => {
        expect(await source.getContent('title', LanguageCodes.EN)).toBe('Hello');
        expect(await source.getContent('title', LanguageCodes.EN_US)).toBe('Howdy');
        expect(await source.getContent('title', LanguageCodes.FR)).toBe('Bonjour');
    });

    test('hasContent accepts LanguageCode constants', () => {
        expect(source.hasContent('title', LanguageCodes.FR)).toBe(true);
        expect(source.hasContent('missing', LanguageCodes.DE)).toBe(false);
    });

    test('uses the recommended default language', async () => {
        expect(await source.getContent('title', LanguageCodes.DE)).toBe('Hello');
    });

    test('NegotiatingContentSource accepts LanguageCode constants', async () => {
        const negotiator = new NegotiatingContentSource(source, LanguageCodes.EN);
        expect(await negotiator.getContent('title', LanguageCodes.FR_CH)).toBe('Bonjour');
    });

    test('TtlContentSource caches LanguageCode lookups', async () => {
        const ttl = new TtlContentSource((key, lang) => source.getContent(key, lang), 60_000);
        expect(await ttl.getContent('title', LanguageCodes.FR)).toBe('Bonjour');
        expect(await ttl.getContent('title', 'fr')).toBe('Bonjour');
    });
});
