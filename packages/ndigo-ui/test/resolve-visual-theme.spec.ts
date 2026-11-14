/**
 * `resolveVisualTheme` tests — Node environment, proving the helper is
 * SSR-importable without DOM globals.
 *
 * @vitest-environment node
 */
import { describe, expect, it } from 'vitest';
import {
    NDIGO_DARK_THEME,
    SOLARIZED_DARK_THEME,
    createTheme,
    resolveVisualTheme,
    type VisualThemeMap,
} from '@ndigo/ui';

const OCEAN_THEME = createTheme({
    name: 'ocean',
    colorScheme: 'dark',
    tokens: { '--nd-color-bg': '#001122' },
});

describe('resolveVisualTheme', () => {
    it('resolves a built-in theme', () => {
        expect(resolveVisualTheme('ndigo-dark')).toBe(NDIGO_DARK_THEME);
        expect(resolveVisualTheme('solarized-dark')).toBe(SOLARIZED_DARK_THEME);
    });

    it('returns undefined for an unknown name', () => {
        expect(resolveVisualTheme('nope')).toBeUndefined();
        expect(resolveVisualTheme('')).toBeUndefined();
    });

    it('prefers an application map over the built-ins', () => {
        const themes: VisualThemeMap = { 'solarized-dark': OCEAN_THEME };

        expect(resolveVisualTheme('solarized-dark', themes)).toBe(OCEAN_THEME);
        expect(resolveVisualTheme('ndigo-dark', themes)).toBe(NDIGO_DARK_THEME);
    });

    it('ignores inherited properties', () => {
        const themes: VisualThemeMap = { ocean: OCEAN_THEME };

        expect(resolveVisualTheme('toString', themes)).toBeUndefined();
        expect(resolveVisualTheme('__proto__', themes)).toBeUndefined();
    });
});
