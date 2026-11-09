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
import '../src/ui/nd-accordion/nd-accordion';
import '../src/ui/nd-dialog/nd-dialog';
import '../src/ui/nd-drawer/nd-drawer';
import '../src/ui/nd-menu/nd-menu';
import '../src/ui/nd-popover/nd-popover';
import '../src/ui/nd-combobox/nd-combobox';
import '../src/ui/nd-select/nd-select';
import '../src/ui/nd-slider/nd-slider';
import '../src/ui/nd-switch/nd-switch';
import '../src/ui/nd-tabs/nd-tabs';
import '../src/ui/nd-toast/nd-toast';
import '../src/ui/nd-tooltip/nd-tooltip';
import type { NdToast } from '../src/ui/nd-toast/nd-toast';
import type { NdTooltip } from '../src/ui/nd-tooltip/nd-tooltip';

class TestResizeObserver implements ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
}

// The menu's popper positioning uses ResizeObserver; jsdom does not ship one.
if (typeof globalThis.ResizeObserver === 'undefined') {
    globalThis.ResizeObserver = TestResizeObserver;
}

// Select scrolls the content into view; jsdom does not implement it.
if (typeof Element !== 'undefined' && typeof Element.prototype.scrollTo !== 'function') {
    Element.prototype.scrollTo = () => {};
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

    it('renders the native form tier', () => {
        expect(document.querySelectorAll('label.nd-label[for]')).toHaveLength(3);
        expect(document.querySelector('#lab-email')?.getAttribute('aria-invalid')).toBe('true');
        expect(document.querySelectorAll('.nd-checkbox, .nd-radio')).toHaveLength(3);
        expect(document.querySelector('#lab-name')?.getAttribute('aria-describedby')).toBe('lab-name-help');
    });

    it('renders the selection tier', async () => {
        const select = get<HTMLElement>(document, 'nd-select');
        get<HTMLElement>(select, '[data-part="trigger"]').click();
        await flush();
        get<HTMLElement>(select, '[data-part="item"][data-value="banana"]').click();
        await flush();
        expect(select.dataset.value).toBe('banana');

        const combobox = get<HTMLElement>(document, 'nd-combobox');
        const input = get<HTMLInputElement>(combobox, '[data-part="input"]');
        input.focus();
        input.value = 'cher';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        get<HTMLElement>(combobox, '[data-part="item"][data-value="cherry"]').click();
        await flush();
        expect(combobox.dataset.value).toBe('cherry');
        expect(input.value).toBe('Cherry');
    });

    it('renders the feedback tier', async () => {
        const control = get<HTMLElement>(document, 'nd-switch');
        const root = get<HTMLElement>(control, '[data-part="root"]');
        root.click();
        await flush();
        expect(control.hasAttribute('checked')).toBe(false);

        const slider = get<HTMLElement>(document, 'nd-slider');
        const thumb = get<HTMLElement>(slider, '[data-part="thumb"]');
        expect(thumb.getAttribute('aria-valuenow')).toBe('40');
        thumb.focus();
        thumb.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await flush();
        expect(thumb.getAttribute('aria-valuenow')).toBe('41');

        const toast = get<HTMLElement>(document, 'nd-toast') as NdToast;
        toast.show();
        await flush();
        expect(toast.hidden).toBe(false);
    });

    it('renders the overlay and disclosure tier', async () => {
        const popover = get<HTMLElement>(document, 'nd-popover');
        const popoverContent = get<HTMLElement>(popover, '[data-part="content"]');
        get<HTMLElement>(popover, '[data-part="trigger"]').click();
        await flush();
        expect(popoverContent.hasAttribute('hidden')).toBe(false);

        const tooltip = get<HTMLElement>(document, 'nd-tooltip') as NdTooltip;
        tooltip.show();
        await flush();
        expect(get<HTMLElement>(tooltip, '[data-part="content"]').hasAttribute('hidden')).toBe(false);

        const tabs = get<HTMLElement>(document, 'nd-tabs');
        const tabTriggers = tabs.querySelectorAll<HTMLElement>('[data-part="trigger"]');
        tabTriggers[1]?.click();
        await flush();
        expect(tabTriggers[1]?.getAttribute('aria-selected')).toBe('true');

        const accordion = get<HTMLElement>(document, 'nd-accordion');
        const itemTrigger = get<HTMLElement>(accordion, '[data-part="item-trigger"]');
        itemTrigger.focus();
        itemTrigger.click();
        await flush();
        expect(itemTrigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('opens and closes the drawer', async () => {
        const drawer = get<HTMLElement>(document, 'nd-drawer');
        const content = get<HTMLElement>(drawer, '[data-part="content"]');
        get<HTMLElement>(drawer, '[data-part="trigger"]').click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        get<HTMLElement>(drawer, '[data-part="close-trigger"]').click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
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
