/**
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { PriorityContentSource } from '../src/priority';

describe('PriorityContentSource', () => {
    const base = new StaticContentSource({
        title: { en: 'My App', fr: 'Mon App' },
        tagline: { en: 'Welcome', fr: 'Bienvenue' },
    });

    test('returns content from the only source when there is one', async () => {
        const source = new PriorityContentSource([base]);
        expect(await source.getContent('title', 'en')).toBe('My App');
        expect(await source.getContent('title', 'fr')).toBe('Mon App');
    });

    test('higher-priority source overrides lower-priority', async () => {
        const override = new StaticContentSource({
            tagline: { en: 'Hello!' },
        });

        const merged = new PriorityContentSource([override, base]);
        expect(await merged.getContent('title', 'en')).toBe('My App'); // from base
        expect(await merged.getContent('tagline', 'en')).toBe('Hello!'); // from override
    });

    test('higher-priority source can partially override', async () => {
        const override = new StaticContentSource({
            tagline: { en: 'Custom!' },
        });

        const merged = new PriorityContentSource([override, base]);
        // title not in override → falls through to base
        expect(await merged.getContent('title', 'fr')).toBe('Mon App');
        // tagline in override → wins (override has en fallback for fr)
        expect(await merged.getContent('tagline', 'fr')).toBe('Custom!');
    });

    test('falls back to key when no source has a translation', async () => {
        const source = new PriorityContentSource([base]);
        expect(await source.getContent('missing', 'en')).toBe('missing');
    });

    test('throws when constructed with no sources', () => {
        expect(() => new PriorityContentSource([])).toThrow(TypeError);
    });
});
