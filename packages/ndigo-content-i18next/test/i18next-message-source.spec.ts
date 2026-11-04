/**
 * @module ndigo-content-i18next
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { likeMessageSource } from '@ndigo/content';
import { I18nextMessageSource } from '../src/i18next-message-source';

const resources = {
    en: {
        translation: {
            greeting: 'Hello {{name}}!',
            items_one: 'one item',
            items_other: '{{count}} items',
            items_male: 'his items',
            items_female: 'her items',
            nested: { deep: { label: 'Deep value' } },
            empty: '',
        },
    },
    fr: {
        translation: {
            greeting: 'Bonjour {{name}} !',
            items_one: 'un article',
            items_other: '{{count}} articles',
        },
    },
    ru: {
        translation: {
            items_one: '{{count}} предмет',
            items_few: '{{count}} предмета',
            items_many: '{{count}} предметов',
            items_other: '{{count}} предмета',
        },
    },
    de: {},
};

describe('@ndigo/content-i18next I18nextMessageSource', () => {
    test('resolves messages with interpolation from the active language', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('greeting', { values: { name: 'Ada' } })).toBe('Hello Ada!');
        expect(await source.getMessage('nested.deep.label')).toBe('Deep value');
    });

    test('per-call language override wins over the active language', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('greeting', { values: { name: 'Ada' } }, 'fr')).toBe('Bonjour Ada !');
        expect(source.language).toBe('en');
    });

    test('selects plural forms via Intl.PluralRules', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('items', { count: 1 })).toBe('one item');
        expect(await source.getMessage('items', { count: 3 })).toBe('3 items');
    });

    test('applies language-specific plural categories', async () => {
        const source = new I18nextMessageSource({ resources, language: 'ru' });

        expect(await source.getMessage('items', { count: 1 })).toBe('1 предмет');
        expect(await source.getMessage('items', { count: 3 })).toBe('3 предмета');
        expect(await source.getMessage('items', { count: 5 })).toBe('5 предметов');
    });

    test('selects context variants', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('items', { context: 'male' })).toBe('his items');
        expect(await source.getMessage('items', { context: 'female' })).toBe('her items');
    });

    test('falls back through the fallback chain to the key', async () => {
        const source = new I18nextMessageSource({
            resources,
            language: 'de',
            fallbackLanguage: ['de', 'fr', 'en'],
        });

        expect(await source.getMessage('greeting', { values: { name: 'Ada' } })).toBe('Bonjour Ada !');
        expect(await source.getMessage('missing.key', { values: { name: 'Ada' } })).toBe('missing.key');
    });

    test('returns the key for missing and empty translations', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('unknown.key')).toBe('unknown.key');
        expect(await source.getMessage('empty')).toBe('empty');
    });

    test('junk per-call languages never throw and resolve via the instance language', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        // Unusable languages collapse onto the instance language (fallback),
        // so resolution still succeeds without throwing inside i18next.
        expect(await source.getMessage('greeting', { values: { name: 'Ada' } }, '" autofocus onfocus="alert(1)')).toBe(
            'Hello Ada!'
        );
        expect(await source.getMessage('greeting', { values: { name: 'Ada' } }, '')).toBe('Hello Ada!');
    });

    test('changeLanguage switches the active language', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(await source.getMessage('greeting', { values: { name: 'Ada' } })).toBe('Hello Ada!');

        await source.changeLanguage('fr');
        expect(source.language).toBe('fr');
        expect(await source.getMessage('greeting', { values: { name: 'Ada' } })).toBe('Bonjour Ada !');
    });

    test('preload resolves languages without a backend', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        await expect(source.preload(['fr', 'de'])).resolves.toBeUndefined();
        expect(await source.getMessage('greeting', { values: { name: 'Ada' } }, 'fr')).toBe('Bonjour Ada !');
    });

    test('satisfies the MessageSource contract guard', async () => {
        const source = new I18nextMessageSource({ resources, language: 'en' });

        expect(likeMessageSource(source)).toBe(true);
        expect(await source.getMessage('items', { count: 2 })).toBe('2 items');
    });
});
