// @vitest-environment jsdom
/**
 * Lab conformance: the installed elements upgrade from the app markup, the
 * keyboard paths work, and the rendered page is axe-clean.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import axe from 'axe-core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import '../src/ui/nd-dialog/nd-dialog';
import '../src/ui/nd-menu/nd-menu';

class TestResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

// The menu's popper positioning uses ResizeObserver; jsdom does not ship one.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = TestResizeObserver;
}

const APP_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const HTML = readFileSync(join(APP_ROOT, 'index.html'), 'utf8');
const bodyPattern = /<body[^>]*>([\s\S]*)<\/body>/u;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

async function flush(): Promise<void> {
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
    if (typeof requestAnimationFrame === 'function') {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    }
}

function get<T extends Element>(root: ParentNode, selector: string): T {
    const element = root.querySelector<T>(selector);
    if (element === null) throw new Error(`missing ${selector}`);
    return element;
}

function press(target: EventTarget, key: string): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

beforeEach(() => {
    const match = bodyPattern.exec(HTML);
    document.body.innerHTML = match?.[1] ?? '';
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('ndigo-ui lab', () => {
    it('renders the shell landmarks', () => {
        expect(document.querySelectorAll('main')).toHaveLength(1);
        expect(document.querySelectorAll('nav[aria-label]')).toHaveLength(2);
        expect(document.querySelector('.nd-skip-link')?.getAttribute('href')).toBe('#nd-main');
        expect(document.querySelector('h1')?.textContent).toBe('Ndigo UI lab');
    });

    it('opens and closes the dialog', async () => {
        const dialog = get<HTMLElement>(document, 'nd-dialog');
        const trigger = get<HTMLElement>(dialog, '[data-part="trigger"]');
        const content = get<HTMLElement>(dialog, '[data-part="content"]');

        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        get<HTMLElement>(dialog, '[data-part="close-trigger"]').click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('selects the first menu item with the keyboard', async () => {
        const menu = get<HTMLElement>(document, 'nd-menu');
        const trigger = get<HTMLElement>(menu, '[data-part="trigger"]');
        const content = get<HTMLElement>(menu, '[data-part="content"]');
        const selected: string[] = [];
        menu.addEventListener('nd-select', (event) => {
            selected.push((event as CustomEvent<{ value: string }>).detail.value);
        });

        trigger.click();
        await flush();
        press(content, 'ArrowDown');
        await flush();
        press(content, 'Enter');
        await flush();

        expect(selected).toEqual(['edit']);
        expect(menu.hasAttribute('open')).toBe(false);
    });

    it('is axe-clean with the dialog open', async () => {
        const dialog = get<HTMLElement>(document, 'nd-dialog');
        get<HTMLElement>(dialog, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });

    it('is axe-clean with the menu open', async () => {
        const menu = get<HTMLElement>(document, 'nd-menu');
        get<HTMLElement>(menu, '[data-part="trigger"]').click();
        await flush();
        press(get<HTMLElement>(menu, '[data-part="content"]'), 'ArrowDown');
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });

    it('reads the typed token catalog', async () => {
        await import('../src/main');
        await flush();

        const count = Number(get<HTMLElement>(document, '#token-count').textContent);
        expect(count).toBeGreaterThan(0);
    });
});
