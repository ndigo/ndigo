/**
 * @module ndigo-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { StaticThemeResolver } from '../src/theme';
import { CompositeContentSource } from '../src/composite';
import { CompositeThemeResolver } from '../src/composite';

describe('CompositeContentSource', () => {
    test('returns the first real translation', async () => {
        const primary = new StaticContentSource({ greeting: { en: 'Hello' } });
        const fallback = new StaticContentSource({ greeting: { en: 'Hi' }, farewell: { en: 'Bye' } });
        const composite = new CompositeContentSource([primary, fallback]);

        expect(await composite.getContent('greeting', 'en')).toBe('Hello');
        expect(await composite.getContent('farewell', 'en')).toBe('Bye');
    });

    test('falls back to key when no source has a translation', async () => {
        const a = new StaticContentSource({});
        const b = new StaticContentSource({});
        const composite = new CompositeContentSource([a, b]);

        expect(await composite.getContent('unknown', 'en')).toBe('unknown');
    });

    test('throws when constructed with no sources', () => {
        expect(() => new CompositeContentSource([])).toThrow(TypeError);
    });
});

describe('CompositeThemeResolver', () => {
    test('returns theme from first resolver that has it', () => {
        const primary = new StaticThemeResolver([{ name: 'dark', contentSource: new StaticContentSource() }], 'dark');
        const fallback = new StaticThemeResolver(
            [
                { name: 'light', contentSource: new StaticContentSource() },
                { name: 'dark', contentSource: new StaticContentSource() },
            ],
            'light'
        );
        const composite = new CompositeThemeResolver([primary, fallback]);

        expect(composite.getTheme('dark').name).toBe('dark');
    });

    test('falls back to next resolver when first throws', () => {
        const empty = new StaticThemeResolver([{ name: 'light', contentSource: new StaticContentSource() }], 'light');
        const withDark = new StaticThemeResolver([{ name: 'dark', contentSource: new StaticContentSource() }], 'dark');
        const composite = new CompositeThemeResolver([empty, withDark]);

        expect(composite.getTheme('dark').name).toBe('dark');
    });

    test('throws when no resolver can provide the theme', () => {
        const resolver = new StaticThemeResolver(
            [{ name: 'light', contentSource: new StaticContentSource() }],
            'light'
        );
        const composite = new CompositeThemeResolver([resolver]);

        expect(() => composite.getTheme('nonexistent')).toThrow(TypeError);
    });

    test('throws when constructed with no resolvers', () => {
        expect(() => new CompositeThemeResolver([])).toThrow(TypeError);
    });
});
