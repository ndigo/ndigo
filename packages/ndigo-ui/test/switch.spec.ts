/**
 * Switch: parts, checked state, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdSwitch } from '../registry/ui/switch/nd-switch';

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

describe('<nd-switch>', () => {
    it('builds the label, input, control, and thumb', async () => {
        const control = mountElement<NdSwitch>('nd-switch', '<span>Notifications</span>');
        await flush();
        const root = getPart<HTMLElement>(control, '[data-part="root"]');
        const input = getPart<HTMLInputElement>(control, '[data-part="hidden-input"]');
        const part = getPart<HTMLElement>(control, '[data-part="control"]');

        expect(control).toBeInstanceOf(NdSwitch);
        expect(root.tagName).toBe('LABEL');
        expect(root.getAttribute('for')).toBe(input.id);
        expect(part.getAttribute('data-state')).toBe('unchecked');
        expect(control.querySelector('[data-part="label"]')?.textContent).toBe('Notifications');
    });

    it('uses the label attribute when no label content is authored', async () => {
        const control = mountElement<NdSwitch>('nd-switch', '', { label: 'Notifications', checked: '' });
        await flush();
        const label = getPart<HTMLElement>(control, '[data-part="label"]');
        const input = getPart<HTMLInputElement>(control, '[data-part="hidden-input"]');

        expect(label.textContent).toBe('Notifications');
        expect(input.getAttribute('aria-labelledby')).toBe(label.id);

        control.setAttribute('label', 'Product updates');
        await flush();
        expect(label.textContent).toBe('Product updates');

        control.removeAttribute('label');
        await flush();
        expect(label.textContent).toBe('');
    });

    it('keeps authored label content over the label attribute', async () => {
        const control = mountElement<NdSwitch>('nd-switch', '<span>Authored</span>', { label: 'Attribute' });
        await flush();
        expect(getPart<HTMLElement>(control, '[data-part="label"]').textContent).toBe('Authored');
    });

    it('toggles on click and reflects the checked attribute', async () => {
        const control = mountElement<NdSwitch>('nd-switch', '<span>Notifications</span>');
        await flush();
        const root = getPart<HTMLElement>(control, '[data-part="root"]');
        const input = getPart<HTMLInputElement>(control, '[data-part="hidden-input"]');

        root.click();
        await flush();

        expect(control.hasAttribute('checked')).toBe(true);
        expect(input.checked).toBe(true);
        expect(control.querySelector('[data-part="control"]')?.getAttribute('data-state')).toBe('checked');

        root.click();
        await flush();
        expect(control.hasAttribute('checked')).toBe(false);
    });

    it('emits nd-checked-change', async () => {
        const control = mountElement<NdSwitch>('nd-switch', '<span>Notifications</span>');
        await flush();
        const changes: boolean[] = [];
        control.addEventListener('nd-checked-change', (event) => {
            changes.push((event as CustomEvent<{ checked: boolean }>).detail.checked);
        });

        getPart<HTMLElement>(control, '[data-part="root"]').click();
        await flush();

        expect(changes).toEqual([true]);
    });

    it('is axe-clean', async () => {
        mountElement<NdSwitch>('nd-switch', '<span>Notifications</span>', { checked: '' });
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
