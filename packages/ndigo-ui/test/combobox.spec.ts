/**
 * Combobox: filtering, selection, ARIA, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdCombobox } from '../registry/ui/combobox/nd-combobox';

const MARKUP = `
    <label data-part="label">Fruit</label>
    <div data-part="control">
        <input data-part="input" placeholder="Search fruit" />
        <button data-part="trigger" type="button">v</button>
        <button data-part="clear-trigger" type="button">Clear</button>
    </div>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="item" data-value="apple">
                <span data-part="item-text">Apple</span><span data-part="item-indicator">✓</span>
            </div>
            <div data-part="item" data-value="banana">
                <span data-part="item-text">Banana</span><span data-part="item-indicator">✓</span>
            </div>
            <div data-part="item" data-value="cherry">
                <span data-part="item-text">Cherry</span><span data-part="item-indicator">✓</span>
            </div>
        </div>
    </div>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-combobox>', () => {
    it('exposes the combobox and listbox roles', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP);
        await flush();
        const input = getPart<HTMLInputElement>(combobox, '[data-part="input"]');
        const content = getPart<HTMLElement>(combobox, '[data-part="content"]');
        const items = combobox.querySelectorAll<HTMLElement>('[data-part="item"]');

        expect(combobox).toBeInstanceOf(NdCombobox);
        expect(input.getAttribute('role')).toBe('combobox');
        expect(input.getAttribute('aria-expanded')).toBe('false');
        expect(content.getAttribute('role')).toBe('listbox');
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(items[0]?.getAttribute('role')).toBe('option');
    });

    it('preselects default-value without treating it as the query', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP, { 'default-value': 'banana' });
        await flush();

        expect(combobox.dataset.value).toBe('banana');
        expect(getPart<HTMLInputElement>(combobox, '[data-part="input"]').value).toBe('Banana');
        expect(
            [...combobox.querySelectorAll<HTMLElement>('[data-part="item"]')].filter((item) => !item.hidden)
        ).toHaveLength(3);
    });

    it('filters as you type and selects an option', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP);
        await flush();
        const input = getPart<HTMLInputElement>(combobox, '[data-part="input"]');
        const apple = getPart<HTMLElement>(combobox, '[data-part="item"][data-value="apple"]');
        const banana = getPart<HTMLElement>(combobox, '[data-part="item"][data-value="banana"]');
        const cherry = getPart<HTMLElement>(combobox, '[data-part="item"][data-value="cherry"]');

        input.focus();
        input.value = 'ban';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();

        expect(banana.hidden).toBe(false);
        expect(apple.hidden).toBe(true);
        expect(cherry.hidden).toBe(true);

        banana.click();
        await flush();

        expect(combobox.dataset.value).toBe('banana');
        expect(input.value).toBe('Banana');
    });

    it('selects programmatically', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP);
        await flush();

        combobox.select('cherry');
        await flush();

        expect(combobox.dataset.value).toBe('cherry');
    });

    it('opens, closes, and clears programmatically', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP);
        await flush();
        const input = getPart<HTMLInputElement>(combobox, '[data-part="input"]');
        const content = getPart<HTMLElement>(combobox, '[data-part="content"]');

        combobox.show();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        combobox.select('cherry');
        await flush();
        expect(input.value).toBe('Cherry');

        combobox.clear();
        await flush();
        expect(input.value).toBe('');
        expect(combobox.dataset.value).toBe('');

        combobox.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('keeps the list in normal flow when inline', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP, { inline: '' });
        await flush();
        const positioner = getPart<HTMLElement>(combobox, '[data-part="positioner"]');

        expect(positioner.getAttribute('style')).toBeNull();
    });

    it('is axe-clean when open', async () => {
        const combobox = mountElement<NdCombobox>('nd-combobox', MARKUP);
        await flush();
        const input = getPart<HTMLInputElement>(combobox, '[data-part="input"]');
        input.focus();
        input.value = 'a';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
