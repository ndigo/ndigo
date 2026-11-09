/**
 * Date picker: structure, open state, grid, keyboard, selection, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdDatePicker } from '../registry/ui/date-picker/nd-date-picker';

const MARKUP = `
    <label data-part="label">Start date</label>
    <div data-part="control">
        <input data-part="input" placeholder="Pick a date" />
        <button data-part="trigger" type="button" aria-label="Open calendar">v</button>
        <button data-part="clear-trigger" type="button">Clear</button>
    </div>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="view-control">
                <button data-part="prev-trigger" type="button">‹</button>
                <span data-part="view-label"></span>
                <button data-part="next-trigger" type="button">›</button>
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

function cell(picker: NdDatePicker, iso: string): HTMLElement {
    return getPart<HTMLElement>(picker, `[data-part="table-cell-trigger"][data-value="${iso}"]`);
}

describe('<nd-date-picker>', () => {
    it('syncs the initial value into the input and hidden field', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, {
            value: '2026-11-09',
            name: 'start',
        });
        await flush();
        const input = getPart<HTMLInputElement>(picker, '[data-part="input"]');
        const hidden = getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]');
        const trigger = getPart<HTMLElement>(picker, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(picker, '[data-part="content"]');

        expect(picker).toBeInstanceOf(NdDatePicker);
        expect(picker.dataset.value).toBe('2026-11-09');
        expect(hidden.value).toBe('2026-11-09');
        expect(hidden.name).toBe('start');
        expect(input.value).toContain('2026');
        expect(trigger.getAttribute('aria-haspopup')).toBe('grid');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('opens a labelled grid with the selected day', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        getPart<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();

        const content = getPart<HTMLElement>(picker, '[data-part="content"]');
        const table = getPart<HTMLElement>(picker, '[data-part="table"]');
        const label = getPart<HTMLElement>(picker, '[data-part="view-label"]');
        const selected = cell(picker, '2026-11-09');

        expect(content.hasAttribute('hidden')).toBe(false);
        expect(table.getAttribute('role')).toBe('grid');
        expect(table.getAttribute('aria-label')).toContain('November 2026');
        expect(label.textContent).toBe('November 2026');
        expect(selected.getAttribute('data-selected')).toBe('');
        expect(selected.closest('td')?.getAttribute('aria-selected')).toBe('true');
        expect(picker.querySelectorAll('[data-part="table-header"]')).toHaveLength(7);
    });

    it('moves focus with the keyboard and selects with Enter', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        const values: string[][] = [];
        picker.addEventListener('nd-value-change', (event) => {
            values.push((event as CustomEvent<{ valueAsString: string[] }>).detail.valueAsString);
        });
        getPart<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();

        const selected = cell(picker, '2026-11-09');
        selected.focus();
        selected.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await flush();

        expect(cell(picker, '2026-11-10').getAttribute('data-focus')).toBe('');
        expect(document.activeElement?.getAttribute('data-value')).toBe('2026-11-10');

        document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        await flush();

        expect(values).toEqual([['2026-11-10']]);
        expect(picker.dataset.value).toBe('2026-11-10');
        expect(getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]').value).toBe('2026-11-10');
        expect(getPart<HTMLElement>(picker, '[data-part="content"]').hasAttribute('hidden')).toBe(true);
    });

    it('navigates months and selects programmatically', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        getPart<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();

        getPart<HTMLElement>(picker, '[data-part="next-trigger"]').click();
        await flush();
        expect(getPart<HTMLElement>(picker, '[data-part="view-label"]').textContent).toBe('December 2026');

        getPart<HTMLElement>(picker, '[data-part="prev-trigger"]').click();
        getPart<HTMLElement>(picker, '[data-part="prev-trigger"]').click();
        await flush();
        expect(getPart<HTMLElement>(picker, '[data-part="view-label"]').textContent).toBe('October 2026');

        picker.select('2026-12-25');
        await flush();
        expect(picker.dataset.value).toBe('2026-12-25');
        expect(getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]').value).toBe('2026-12-25');
    });

    it('clears the selected date', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        getPart<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();

        getPart<HTMLElement>(picker, '[data-part="clear-trigger"]').click();
        await flush();

        expect(picker.dataset.value).toBe('');
        expect(getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]').value).toBe('');
    });

    it('opens and closes programmatically', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        const content = getPart<HTMLElement>(picker, '[data-part="content"]');

        picker.show();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        picker.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('omits a disabled picker from form data', async () => {
        const form = document.createElement('form');
        form.innerHTML = `<nd-date-picker name="start" value="2026-11-09" disabled>${MARKUP}</nd-date-picker>`;
        document.body.append(form);
        await flush();

        expect(new FormData(form).get('start')).toBeNull();
    });

    it('follows the name attribute after connect', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { name: 'start' });
        await flush();
        picker.setAttribute('name', 'end');
        await flush();

        expect(getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]').name).toBe('end');
    });

    it('is axe-clean when open', async () => {
        const picker = mountElement<NdDatePicker>('nd-date-picker', MARKUP, { value: '2026-11-09' });
        await flush();
        getPart<HTMLElement>(picker, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
