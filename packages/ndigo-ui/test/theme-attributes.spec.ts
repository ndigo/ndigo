/**
 * `themeAttributes` tests — Node environment, proving the helper is
 * SSR-importable without DOM globals.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import { createTheme, themeAttributes } from '@ndigo/ui';

describe('themeAttributes', () => {
    it('serializes the theme name and color scheme', () => {
        const theme = createTheme({
            name: 'solarized-dark',
            colorScheme: 'dark',
            tokens: {},
        });

        expect(themeAttributes(theme)).toEqual({
            'data-theme': 'solarized-dark',
            'data-color-scheme': 'dark',
        });
    });

    it('escapes HTML-sensitive characters in the name', () => {
        const theme = createTheme({
            name: '"><script>alert(1)</script>',
            colorScheme: 'light',
            tokens: {},
        });

        expect(themeAttributes(theme)['data-theme']).toBe('&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
    });

    it('escapes ampersands and quotes', () => {
        const theme = createTheme({
            name: "a&b'c",
            colorScheme: 'dark',
            tokens: {},
        });

        expect(themeAttributes(theme)['data-theme']).toBe('a&amp;b&#39;c');
    });
});
