/**
 * `<nd-dialog>` conformance: parts, open state, focus, dismissal, and events.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdDialog } from '../registry/ui/dialog/nd-dialog';

const MARKUP = `
    <button data-part="trigger">Open</button>
    <div data-part="content">
        <h2 data-part="title">Invite teammate</h2>
        <p data-part="description">They will receive an email.</p>
        <button data-part="close-trigger">Close</button>
        <p>Body copy</p>
    </div>
`;

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-dialog>', () => {
    it('wires the trigger and content parts', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const trigger = dialog.querySelector<HTMLElement>('[data-part="trigger"]');
        const content = dialog.querySelector<HTMLElement>('[data-part="content"]');

        expect(dialog).toBeInstanceOf(NdDialog);
        expect(trigger?.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger?.getAttribute('aria-expanded')).toBe('false');
        expect(content?.getAttribute('role')).toBe('dialog');
        expect(content?.hasAttribute('hidden')).toBe(true);
        expect(dialog.querySelector('[data-part="backdrop"]')).not.toBeNull();
        expect(dialog.querySelector('[data-part="positioner"]')).not.toBeNull();
    });

    it('opens on trigger click and moves focus inside', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(dialog, '[data-part="content"]');

        trigger.click();
        await flush();

        expect(dialog.hasAttribute('open')).toBe(true);
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(content.contains(document.activeElement)).toBe(true);
    });

    it('closes on Escape and restores focus to the trigger', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');

        trigger.focus();
        trigger.click();
        await flush();

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();

        expect(dialog.hasAttribute('open')).toBe(false);
        expect(document.activeElement).toBe(trigger);
    });

    it('closes from the close part', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');
        const close = getPart<HTMLElement>(dialog, '[data-part="close-trigger"]');

        trigger.click();
        await flush();
        close.click();
        await flush();

        expect(dialog.hasAttribute('open')).toBe(false);
    });

    it('emits nd-open-change for open and close', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');
        const changes: boolean[] = [];
        dialog.addEventListener('nd-open-change', (event) => {
            changes.push((event as CustomEvent<{ open: boolean }>).detail.open);
        });

        trigger.click();
        await flush();
        trigger.click();
        await flush();

        expect(changes).toEqual([true, false]);
    });

    it('honours the open attribute', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const content = getPart<HTMLElement>(dialog, '[data-part="content"]');

        dialog.setAttribute('open', '');
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        dialog.removeAttribute('open');
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('opens and closes programmatically', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', MARKUP);
        await flush();
        const content = getPart<HTMLElement>(dialog, '[data-part="content"]');

        dialog.show();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        dialog.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('focuses the initial-focus selector on open', async () => {
        const dialog = mountElement<NdDialog>(
            'nd-dialog',
            `<button data-part="trigger">Open</button>
             <div data-part="content">
                 <h2 data-part="title">Rename</h2>
                 <input id="nd-focus-target" />
             </div>`,
            { 'initial-focus': '#nd-focus-target' }
        );
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');
        const input = getPart<HTMLInputElement>(dialog, '#nd-focus-target');

        trigger.click();
        await flush();

        expect(document.activeElement).toBe(input);
    });

    it('ignores nested component parts when building its structure', async () => {
        const dialog = mountElement<NdDialog>(
            'nd-dialog',
            `<button data-part="trigger">Open</button>
             <div data-part="content">
                 <h2 data-part="title">Nested</h2>
                 <div data-part="positioner"><div data-part="content">Nested widget</div></div>
             </div>`
        );
        await flush();

        const positioner = dialog.querySelector<HTMLElement>('[data-part="positioner"]');
        expect(positioner?.parentElement).toBe(dialog);
        expect(positioner?.querySelector('[data-part="title"]')?.textContent).toBe('Nested');
        expect(dialog.querySelectorAll('[data-part="positioner"]')).toHaveLength(2);
    });

    it('builds the wrappers when only body markup is provided', async () => {
        const dialog = mountElement<NdDialog>(
            'nd-dialog',
            '<button data-part="trigger">Open</button><p data-part="title">Minimal</p><p>Body</p>'
        );
        await flush();
        const content = dialog.querySelector<HTMLElement>('[data-part="content"]');

        expect(content).not.toBeNull();
        expect(content?.querySelector('[data-part="title"]')?.textContent).toBe('Minimal');
        expect(dialog.querySelector('[data-part="backdrop"]')).not.toBeNull();
    });
});
