import { describe, test, expect } from 'vitest';
import { GenericApplicationContext } from '@blue/context';

// Minimal DOM parser stub for environments without DOMParser support.
const parsingGlobal = globalThis as unknown as { DOMParser: unknown };
if (typeof parsingGlobal.DOMParser === 'undefined') {
    parsingGlobal.DOMParser = class DOMParser {
        parseFromString(): Document {
            return null as unknown as Document;
        }
    };
}

describe('configureBrowserTheme', () => {
    test('registers themeResolver strategy in context', async () => {
        const context = new GenericApplicationContext('app');

        const { configureBrowserTheme } = await import('../src/browser-theme');

        const resolver = configureBrowserTheme(context);

        expect(context.getValue('themeResolver')).toBe(resolver);
        expect(resolver.cookieName).toBe('theme');
    });

    test('applies custom theme name and cookie name', async () => {
        const context = new GenericApplicationContext('app');

        const { configureBrowserTheme } = await import('../src/browser-theme');

        const resolver = configureBrowserTheme(context, {
            themeName: 'night',
            cookieName: 'site-theme',
        });

        expect(context.themeName).toBe('night');
        expect(resolver.cookieName).toBe('site-theme');
    });
});
