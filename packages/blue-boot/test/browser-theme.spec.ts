import { describe, test, expect } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { configureBrowserTheme } from '../src/browser-theme';

describe('configureBrowserTheme', () => {
    test('registers themeResolver strategy in context', () => {
        const context = new GenericApplicationContext('app');

        const resolver = configureBrowserTheme(context);

        expect(context.getValue('themeResolver')).toBe(resolver);
        expect(resolver.cookieName).toBe('theme');
    });

    test('applies custom theme name and cookie name', () => {
        const context = new GenericApplicationContext('app');

        const resolver = configureBrowserTheme(context, {
            themeName: 'night',
            cookieName: 'site-theme',
        });

        expect(context.themeName).toBe('night');
        expect(resolver.cookieName).toBe('site-theme');
    });
});
