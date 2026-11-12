/**
 * Drawer: placement, open/close, focus restore, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdDrawer } from '../registry/ui/drawer/nd-drawer';

const MARKUP = `
    <button data-part="trigger">Open</button>
    <div data-part="content">
        <h2 data-part="title">Filters</h2>
        <p data-part="description">Narrow the list.</p>
        <button data-part="close-trigger">Close</button>
        <p>Drawer body</p>
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

describe('<nd-drawer>', () => {
    it('defaults to the end placement', async () => {
        const drawer = mountElement<NdDrawer>('nd-drawer', MARKUP);
        await flush();

        expect(drawer).toBeInstanceOf(NdDrawer);
        expect(drawer.dataset.placement).toBe('end');
        expect(drawer.querySelector('[data-part="backdrop"]')).not.toBeNull();
    });

    it('reflects placement and rejects unknown values', async () => {
        const drawer = mountElement<NdDrawer>('nd-drawer', MARKUP, { placement: 'bottom' });
        await flush();
        expect(drawer.dataset.placement).toBe('bottom');

        drawer.setAttribute('placement', 'diagonal');
        expect(drawer.dataset.placement).toBe('end');

        drawer.setAttribute('placement', 'start');
        expect(drawer.dataset.placement).toBe('start');
    });

    it('opens, closes, and restores focus', async () => {
        const drawer = mountElement<NdDrawer>('nd-drawer', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(drawer, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(drawer, '[data-part="content"]');

        trigger.focus();
        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);
        // Open: the trigger is aria-hidden background content, so it must not
        // stay tabbable while the modal owns the page.
        expect(trigger.hasAttribute('inert')).toBe(true);

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(trigger.hasAttribute('inert')).toBe(false);
        expect(document.activeElement).toBe(trigger);
    });

    it('opens and closes programmatically', async () => {
        const drawer = mountElement<NdDrawer>('nd-drawer', MARKUP);
        await flush();
        const content = getPart<HTMLElement>(drawer, '[data-part="content"]');

        drawer.show();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        drawer.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('is axe-clean when open', async () => {
        const drawer = mountElement<NdDrawer>('nd-drawer', MARKUP, { placement: 'bottom' });
        await flush();
        getPart<HTMLElement>(drawer, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
