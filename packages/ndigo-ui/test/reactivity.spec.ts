/**
 * Live attribute updates and lifecycle idempotence.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import '../registry/ui/date-picker/nd-date-picker';
import '../registry/ui/dialog/nd-dialog';
import '../registry/ui/select/nd-select';
import '../registry/ui/switch/nd-switch';
import '../registry/ui/toast/nd-toast';
import type { NdToast } from '../registry/ui/toast/nd-toast';

const SELECT_MARKUP = `
    <button data-part="trigger" type="button">pick</button>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="item" data-value="apple"><span data-part="item-text">Apple</span></div>
            <div data-part="item" data-value="banana"><span data-part="item-text">Banana</span></div>
        </div>
    </div>
`;

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

describe('attribute reactivity', () => {
    it('disables a connected switch when the attribute is added', async () => {
        const control = mountElement<HTMLElement>('nd-switch', 'Notify');
        await flush();
        control.setAttribute('disabled', '');
        await flush();

        expect(getPart<HTMLInputElement>(control, '[data-part="hidden-input"]').disabled).toBe(true);
    });

    it('stops submitting a select disabled after connect', async () => {
        const form = document.createElement('form');
        form.innerHTML = `<nd-select name="fruit" value="apple">${SELECT_MARKUP}</nd-select>`;
        document.body.append(form);
        await flush();
        expect(new FormData(form).get('fruit')).toBe('apple');

        form.querySelector('nd-select')?.setAttribute('disabled', '');
        await flush();

        expect(new FormData(form).get('fruit')).toBeNull();
    });

    it('selects a date when the value attribute changes', async () => {
        const picker = mountElement<HTMLElement>(
            'nd-date-picker',
            `
            <input data-part="input" />
            <button data-part="trigger" type="button">open</button>
            <div data-part="content"></div>
        `
        );
        await flush();
        picker.setAttribute('value', '2026-12-25');
        await flush();

        expect(picker.dataset.value).toBe('2026-12-25');
        expect(getPart<HTMLInputElement>(picker, '[data-part="hidden-input"]').value).toBe('2026-12-25');
    });

    it('keeps part ids stable across a reconnect', async () => {
        const dialog = mountElement<HTMLElement>(
            'nd-dialog',
            `
            <button data-part="trigger" type="button">open</button>
            <div data-part="content"><h2 data-part="title">Title</h2></div>
        `
        );
        await flush();
        const id = getPart<HTMLElement>(dialog, '[data-part="trigger"]').id;

        document.body.append(dialog);
        await flush();

        expect(getPart<HTMLElement>(dialog, '[data-part="trigger"]').id).toBe(id);
    });

    it('adds one close listener per connect', async () => {
        const toast = mountElement<NdToast>('nd-toast', '<button data-part="close-trigger">Close</button>', {
            open: '',
        });
        await flush();
        const hide = vi.spyOn(toast, 'hide');

        document.body.append(toast);
        await flush();
        getPart<HTMLElement>(toast, '[data-part="close-trigger"]').click();

        expect(hide).toHaveBeenCalledTimes(1);
    });
});
