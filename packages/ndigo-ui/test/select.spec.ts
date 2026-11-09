/**
 * Select: collection from markup, hidden form value, keyboard, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdSelect } from '../registry/ui/select/nd-select';

const MARKUP = `
    <label data-part="label">Fruit</label>
    <div data-part="control">
        <button data-part="trigger" type="button">
            <span data-part="value-text"></span>
            <span data-part="indicator">v</span>
        </button>
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

describe('<nd-select>', () => {
    it('derives the collection, value text, and hidden select', async () => {
        const select = mountElement<NdSelect>('nd-select', MARKUP, { value: 'banana', name: 'fruit' });
        await flush();
        const valueText = getPart<HTMLElement>(select, '[data-part="value-text"]');
        const hidden = getPart<HTMLSelectElement>(select, '[data-part="hidden-select"]');

        expect(select).toBeInstanceOf(NdSelect);
        expect(valueText.textContent).toBe('Banana');
        expect(hidden.value).toBe('banana');
        expect(hidden.options).toHaveLength(3);
        expect(hidden.name).toBe('fruit');
    });

    it('opens and selects by click', async () => {
        const select = mountElement<NdSelect>('nd-select', MARKUP, { value: 'apple' });
        await flush();
        const trigger = getPart<HTMLElement>(select, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(select, '[data-part="content"]');

        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        getPart<HTMLElement>(select, '[data-part="item"][data-value="cherry"]').click();
        await flush();

        expect(select.dataset.value).toBe('cherry');
        expect(getPart<HTMLElement>(select, '[data-part="value-text"]').textContent).toBe('Cherry');
        expect(getPart<HTMLSelectElement>(select, '[data-part="hidden-select"]').value).toBe('cherry');
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('selects with the keyboard and programmatically', async () => {
        const select = mountElement<NdSelect>('nd-select', MARKUP, { value: 'apple' });
        await flush();
        const trigger = getPart<HTMLElement>(select, '[data-part="trigger"]');

        const content = getPart<HTMLElement>(select, '[data-part="content"]');
        trigger.focus();
        trigger.click();
        await flush();
        content.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        await flush();
        content.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await flush();
        expect(select.dataset.value).toBe('banana');

        select.select('cherry');
        await flush();
        expect(select.dataset.value).toBe('cherry');
    });

    it('is axe-clean when open', async () => {
        const select = mountElement<NdSelect>('nd-select', MARKUP, { value: 'apple' });
        await flush();
        getPart<HTMLElement>(select, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
