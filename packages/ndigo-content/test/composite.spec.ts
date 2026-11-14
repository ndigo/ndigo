/**
 */
import { describe, test, expect } from 'vitest';
import { StaticContentSource } from '../src/content';
import { StaticThemeSource } from '../src/theme';
import { CompositeContentSource } from '../src/composite';
import { CompositeThemeResolver, CompositeThemeSource } from '../src/composite';

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

        expect(await new CompositeContentSource([a, b]).getContent('unknown', 'en')).toBe('unknown');
    });

    test('throws when constructed with no sources', () => {
        expect(() => new CompositeContentSource([])).toThrow(TypeError);
    });
});

describe('CompositeThemeSource', () => {
    test('returns theme from first source that has it', () => {
        const primary = new StaticThemeSource([{ name: 'dark', contentSource: new StaticContentSource() }], 'dark');
        const fallback = new StaticThemeSource(
            [
                { name: 'light', contentSource: new StaticContentSource() },
                { name: 'dark', contentSource: new StaticContentSource() },
            ],
            'light'
        );
        const composite = new CompositeThemeSource([primary, fallback]);

        expect(composite.getTheme('dark').name).toBe('dark');
    });

    test('falls back to next source when first throws', () => {
        const empty = new StaticThemeSource([{ name: 'light', contentSource: new StaticContentSource() }], 'light');
        const withDark = new StaticThemeSource([{ name: 'dark', contentSource: new StaticContentSource() }], 'dark');
        const composite = new CompositeThemeSource([empty, withDark]);

        expect(composite.getTheme('dark').name).toBe('dark');
    });

    test('throws when no source can provide the theme', () => {
        const source = new StaticThemeSource([{ name: 'light', contentSource: new StaticContentSource() }], 'light');
        const composite = new CompositeThemeSource([source]);

        expect(() => composite.getTheme('nonexistent')).toThrow(TypeError);
    });

    test('throws when constructed with no sources', () => {
        expect(() => new CompositeThemeSource([])).toThrow(TypeError);
    });

    test('deprecated resolver name aliases the composite theme source', () => {
        const source = new CompositeThemeResolver([
            new StaticThemeSource([{ name: 'dark', contentSource: new StaticContentSource() }], 'dark'),
        ]);

        expect(CompositeThemeResolver).toBe(CompositeThemeSource);
        expect(source).toBeInstanceOf(CompositeThemeSource);
        expect(source.getTheme('dark').name).toBe('dark');
    });
});
