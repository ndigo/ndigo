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
import '../src/ui/nd-date-picker/nd-date-picker';
import '../src/ui/nd-scroll-area/nd-scroll-area';
import '../src/ui/nd-navigation-menu/nd-navigation-menu';
import '../src/ui/nd-tags-input/nd-tags-input';
import '../src/ui/nd-file-upload/nd-file-upload';
import '../src/ui/nd-select/nd-select';
import '../src/ui/nd-slider/nd-slider';
import '../src/ui/nd-switch/nd-switch';
import '../src/ui/nd-tabs/nd-tabs';
import '../src/ui/nd-toast/nd-toast';
import '../src/ui/nd-tooltip/nd-tooltip';
import { initCommandPalette } from '../src/components/command/command';
import { initDataTable } from '../src/components/data-table/data-table';
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
    initCommandPalette(document);
    initDataTable(document);
});

afterEach(() => {
    document.body.innerHTML = '';
});

describe('ndigo-ui lab', () => {
    it('renders the shell landmarks', () => {
        expect(document.querySelectorAll('main')).toHaveLength(1);
        expect(
            document.querySelectorAll('.nd-app-shell__banner nav[aria-label], .nd-app-shell__sidebar nav[aria-label]')
        ).toHaveLength(2);
        expect(document.querySelector('.nd-skip-link')?.getAttribute('href')).toBe('#nd-main');
        expect(document.querySelector('h1')?.textContent).toBe('Ndigo UI lab');
    });

    it('renders the native form tier', () => {
        expect(document.querySelectorAll('label.nd-label[for]')).toHaveLength(3);
        expect(document.querySelector('#lab-email')?.getAttribute('aria-invalid')).toBe('true');
        expect(document.querySelectorAll('#form .nd-checkbox, #form .nd-radio')).toHaveLength(3);
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

    it('renders the pagination tier', () => {
        const nav = get<HTMLElement>(document, 'nav.nd-pagination');
        expect(nav.getAttribute('aria-label')).toBe('Pagination');
        expect(nav.querySelectorAll('[aria-current="page"]')).toHaveLength(1);
        expect(nav.querySelector('[aria-current="page"]')?.textContent).toBe('2');

        const previous = get<HTMLElement>(nav, '[data-direction="previous"]');
        expect(previous.getAttribute('aria-disabled')).toBe('true');
        expect(previous.hasAttribute('href')).toBe(false);

        expect(get<HTMLElement>(nav, '.nd-pagination__ellipsis').getAttribute('aria-hidden')).toBe('true');
        expect(nav.querySelectorAll('a.nd-pagination__link:not([data-direction])').length).toBe(3);
    });

    it('renders the date picker tier', async () => {
        const picker = get<HTMLElement>(document, 'nd-date-picker');
        const content = get<HTMLElement>(picker, '[data-part="content"]');
        get<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();
        expect(content.hidden).toBe(false);
        expect(get<HTMLElement>(picker, '[data-part="view-label"]').textContent).toBe('November 2026');

        get<HTMLElement>(picker, '[data-part="next-trigger"]').click();
        await flush();
        expect(get<HTMLElement>(picker, '[data-part="view-label"]').textContent).toBe('December 2026');

        get<HTMLElement>(picker, '[data-part="table-cell-trigger"][data-value="2026-12-25"]').click();
        await flush();
        expect(content.hidden).toBe(true);
        expect(picker.dataset.value).toBe('2026-12-25');
        expect(get<HTMLInputElement>(picker, '[data-part="hidden-input"]').value).toBe('2026-12-25');
    });

    it('renders the data table tier', () => {
        const table = get<HTMLElement>(document, '[data-data-table]');
        expect(get<HTMLElement>(table, '[data-status]').textContent).toBe('Showing 1–3 of 6');
        expect(table.querySelectorAll('tbody > tr:not([hidden])')).toHaveLength(3);

        get<HTMLButtonElement>(table, 'th[data-sort-key="amount"] button').click();
        expect(get<HTMLElement>(table, 'th[data-sort-key="amount"]').getAttribute('aria-sort')).toBe('ascending');
        expect(get<HTMLElement>(table, 'tbody > tr:not([hidden])').dataset.rowId).toBe('INV-006');

        get<HTMLButtonElement>(table, '[data-pagination] button[data-page="2"]').click();
        expect(get<HTMLElement>(table, '[data-status]').textContent).toBe('Showing 4–6 of 6');
    });

    it('renders the surface primitives', () => {
        const section = get<HTMLElement>(document, '#surfaces');
        expect(section.querySelectorAll('.nd-alert')).toHaveLength(2);
        expect(get<HTMLElement>(section, '.nd-alert[data-variant="success"] .nd-alert__title').textContent).toBe(
            'Saved'
        );
        expect(section.querySelectorAll('.nd-badge')).toHaveLength(5);
        expect(get<HTMLElement>(section, '.nd-card__title').textContent).toBe('Quarterly report');
        expect(get<HTMLElement>(section, '.nd-separator[role="separator"]').getAttribute('aria-orientation')).toBe(
            'vertical'
        );
        expect(section.querySelectorAll('[data-skeletons] .nd-skeleton')).toHaveLength(4);
        expect(get<HTMLElement>(section, 'p[role="status"]').textContent).toContain('Loading invoices');
    });

    it('renders the table tier', () => {
        const table = get<HTMLTableElement>(document, 'table.nd-table');
        expect(get<HTMLElement>(table, 'caption').textContent?.trim()).toBe('Open invoices');

        const sorted = get<HTMLElement>(table, 'th[aria-sort="ascending"]');
        expect(get<HTMLElement>(sorted, 'button.nd-table__sort').textContent).toContain('Amount');
        expect(get<HTMLElement>(sorted, 'button.nd-table__sort .nd-table__sort-icon').getAttribute('aria-hidden')).toBe(
            'true'
        );

        expect(table.querySelectorAll('td[data-numeric]').length).toBe(5);
        expect(get<HTMLElement>(table, 'tfoot td[data-numeric]').textContent?.trim()).toBe('$2,040.00');
    });

    it('renders the file upload tier', async () => {
        const upload = get<HTMLElement>(document, 'nd-file-upload');
        const input = get<HTMLInputElement>(upload, '[data-part="hidden-input"]');
        Object.defineProperty(input, 'files', {
            value: [new File(['brief'], 'brief.pdf', { type: 'application/pdf' })],
            configurable: true,
        });
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();

        expect(get<HTMLElement>(upload, '[data-part="item-name"]').textContent).toBe('brief.pdf');
        expect(upload.dataset.count).toBe('1');

        get<HTMLElement>(upload, '[data-part="clear-trigger"]').click();
        await flush();
        expect(upload.querySelector('[data-part="item"]')).toBeNull();
    });

    it('renders the tags input tier', async () => {
        const tags = get<HTMLElement>(document, 'nd-tags-input');
        const previews = () =>
            [...tags.querySelectorAll<HTMLElement>('[data-part="item-text"]')].map((item) => item.textContent);
        expect(previews()).toEqual(['design', 'system']);

        const input = get<HTMLInputElement>(tags, '[data-part="input"]');
        input.focus();
        await flush();
        input.value = 'accessibility';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await flush();

        expect(previews()).toEqual(['design', 'system', 'accessibility']);
        expect(tags.dataset.value).toBe('design, system, accessibility');
    });

    it('renders the navigation menu tier', async () => {
        const menu = get<HTMLElement>(document, 'nd-navigation-menu');
        expect(menu.getAttribute('aria-label')).toBe('Lab sections menu');

        const trigger = get<HTMLElement>(menu, '[data-part="trigger"]');
        const content = get<HTMLElement>(menu, '[data-part="content"]');
        trigger.click();
        await flush();
        expect(content.hidden).toBe(false);

        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await flush();
        expect(document.activeElement?.textContent).toBe('Layout');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();
        expect(content.hidden).toBe(true);
    });

    it('renders the scroll area tier', async () => {
        const area = get<HTMLElement>(document, 'nd-scroll-area');
        expect(area.querySelector('[data-part="root"]')).not.toBeNull();
        expect(area.querySelector('[data-part="viewport"]')).not.toBeNull();
        expect(area.querySelector('[data-part="content"]')?.textContent).toContain('Row 1');
        expect(area.querySelectorAll('[data-part="scrollbar"]')).toHaveLength(2);
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

    it('opens the command palette with the shortcut', async () => {
        const root = get<HTMLElement>(document, '[data-command]');
        const dialog = get<HTMLElement>(root, 'nd-dialog');
        const content = get<HTMLElement>(dialog, '[data-part="content"]');
        const input = get<HTMLInputElement>(root, '[data-part="input"]');
        const selected: string[] = [];
        root.addEventListener('nd-command', (event) => {
            selected.push((event as CustomEvent<{ value: string }>).detail.value);
        });

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
        await flush();
        expect(content.hidden).toBe(false);

        input.value = 'theme';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        get<HTMLElement>(root, '[data-part="item"][data-value="toggle-theme"]').click();
        await flush();

        expect(selected).toEqual(['toggle-theme']);
        expect(content.hidden).toBe(true);
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
