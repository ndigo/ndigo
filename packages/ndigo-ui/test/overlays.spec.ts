/**
 * Popover and tooltip: parts, open state, dismissal, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdPopover } from '../registry/ui/popover/nd-popover';
import { NdTooltip } from '../registry/ui/tooltip/nd-tooltip';

const POPOVER_MARKUP = `
    <button data-part="trigger">Open settings</button>
    <div data-part="positioner">
        <div data-part="content">
            <h2 data-part="title">Settings</h2>
            <p data-part="description">Adjust the workspace.</p>
            <button data-part="close-trigger">Close</button>
            <div data-part="arrow"></div>
        </div>
    </div>
`;

const TOOLTIP_MARKUP = `
    <button data-part="trigger">Info</button>
    <div data-part="positioner">
        <div data-part="content">The shortcut is Ctrl+K.</div>
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

describe('<nd-popover>', () => {
    it('wires the parts', async () => {
        const popover = mountElement<NdPopover>('nd-popover', POPOVER_MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(popover, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(popover, '[data-part="content"]');

        expect(popover).toBeInstanceOf(NdPopover);
        expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(content.getAttribute('role')).toBe('dialog');
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('opens on click, closes on Escape, and restores focus', async () => {
        const popover = mountElement<NdPopover>('nd-popover', POPOVER_MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(popover, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(popover, '[data-part="content"]');

        trigger.focus();
        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(document.activeElement).toBe(trigger);
    });

    it('is axe-clean when open', async () => {
        const popover = mountElement<NdPopover>('nd-popover', POPOVER_MARKUP);
        await flush();
        getPart<HTMLElement>(popover, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});

describe('<nd-tooltip>', () => {
    it('wires the parts', async () => {
        const tooltip = mountElement<NdTooltip>('nd-tooltip', TOOLTIP_MARKUP);
        await flush();
        const content = getPart<HTMLElement>(tooltip, '[data-part="content"]');

        expect(tooltip).toBeInstanceOf(NdTooltip);
        expect(content.getAttribute('role')).toBe('tooltip');
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('shows and hides programmatically', async () => {
        const tooltip = mountElement<NdTooltip>('nd-tooltip', TOOLTIP_MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(tooltip, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(tooltip, '[data-part="content"]');

        tooltip.show();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(trigger.getAttribute('aria-describedby')).toBe(content.getAttribute('id'));

        tooltip.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('is axe-clean when open', async () => {
        const tooltip = mountElement<NdTooltip>('nd-tooltip', TOOLTIP_MARKUP);
        await flush();
        tooltip.show();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
