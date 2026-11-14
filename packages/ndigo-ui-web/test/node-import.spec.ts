/**
 * The adapter must stay importable outside a DOM so a shared module graph can
 * load it during SSR; only the apply call needs a document.
 *
 * @vitest-environment node
 */
import { describe, expect, test } from 'vitest';

class TestThemeContext {
    themeName = 'ndigo-dark';

    setThemeName(name: string): void {
        this.themeName = name;
    }
}

describe('@ndigo/ui-web barrel (non-DOM import)', () => {
    test('is importable with no DOM globals', async () => {
        expect(typeof document).toBe('undefined');
        expect(typeof window).toBe('undefined');

        const barrel = await import('../src/index');

        expect(typeof barrel.setVisualTheme).toBe('function');
        expect(typeof barrel.connectBrowserTheme).toBe('function');
    }, 30_000);

    test('applies to an explicit target without a document', async () => {
        const { setVisualTheme } = await import('../src/index');
        const applied: string[] = [];
        const target = {
            style: {
                removeProperty: () => {},
                setProperty: (name: string) => applied.push(name),
                colorScheme: '',
            },
            dataset: {} as Record<string, string | undefined>,
        };
        const context = new TestThemeContext();

        const theme = setVisualTheme(context, 'ndigo-light', { target, persist: false });

        expect(theme?.name).toBe('ndigo-light');
        expect(target.dataset.theme).toBe('ndigo-light');
        expect(applied).toContain('--nd-color-bg');
        expect(context.themeName).toBe('ndigo-light');
    });
});
