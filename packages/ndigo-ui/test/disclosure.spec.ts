/**
 * Tabs and accordion: roles, selection, keyboard paths, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdAccordion } from '../registry/ui/accordion/nd-accordion';
import { NdTabs } from '../registry/ui/tabs/nd-tabs';
// Ensure the modules evaluate even when the class is only used in a type position.
import '../registry/ui/accordion/nd-accordion';
import '../registry/ui/tabs/nd-tabs';

const TABS_MARKUP = `
    <div data-part="root">
        <div data-part="list">
            <button data-part="trigger" data-value="overview">Overview</button>
            <button data-part="trigger" data-value="install">Install</button>
        </div>
        <div data-part="content" data-value="overview">Overview panel</div>
        <div data-part="content" data-value="install">Install panel</div>
    </div>
`;

const ACCORDION_MARKUP = `
    <div data-part="item" data-value="shipping">
        <button data-part="item-trigger" data-value="shipping">
            Shipping <span data-part="item-indicator">+</span>
        </button>
        <div data-part="item-content" data-value="shipping"><p>Ships in two days.</p></div>
    </div>
    <div data-part="item" data-value="returns">
        <button data-part="item-trigger" data-value="returns">
            Returns <span data-part="item-indicator">+</span>
        </button>
        <div data-part="item-content" data-value="returns"><p>Thirty-day returns.</p></div>
    </div>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

function press(target: EventTarget, key: string): void {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-tabs>', () => {
    it('exposes the tab roles and the initial selection', async () => {
        const tabs = mountElement<NdTabs>('nd-tabs', TABS_MARKUP, { value: 'overview' });
        await flush();

        const list = getPart<HTMLElement>(tabs, '[data-part="list"]');
        const triggers = tabs.querySelectorAll<HTMLElement>('[data-part="trigger"]');
        const panels = tabs.querySelectorAll<HTMLElement>('[data-part="content"]');

        expect(list.getAttribute('role')).toBe('tablist');
        expect(triggers[0]?.getAttribute('role')).toBe('tab');
        expect(triggers[0]?.getAttribute('aria-selected')).toBe('true');
        expect(triggers[1]?.getAttribute('aria-selected')).toBe('false');
        expect(panels[0]?.getAttribute('role')).toBe('tabpanel');
        expect(panels[0]?.hasAttribute('hidden')).toBe(false);
        expect(panels[1]?.hasAttribute('hidden')).toBe(true);
    });

    it('selects on click', async () => {
        const tabs = mountElement<NdTabs>('nd-tabs', TABS_MARKUP, { value: 'overview' });
        await flush();
        const triggers = tabs.querySelectorAll<HTMLElement>('[data-part="trigger"]');

        triggers[1]?.click();
        await flush();

        expect(triggers[1]?.getAttribute('aria-selected')).toBe('true');
    });

    it('moves focus with the arrow keys', async () => {
        const tabs = mountElement<NdTabs>('nd-tabs', TABS_MARKUP, { value: 'overview' });
        await flush();
        const triggers = tabs.querySelectorAll<HTMLElement>('[data-part="trigger"]');

        triggers[0]?.focus();
        press(triggers[0] ?? tabs, 'ArrowRight');
        await flush();

        // jsdom orders the focus and selection rAFs differently from browsers;
        // the focus move is the contract we can assert reliably here.
        expect(document.activeElement).toBe(triggers[1]);
        expect(triggers[1]?.getAttribute('data-focus')).toBe('');
    });

    it('is axe-clean with a panel selected', async () => {
        const tabs = mountElement<NdTabs>('nd-tabs', TABS_MARKUP, { value: 'overview' });
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});

describe('<nd-accordion>', () => {
    it('expands and collapses an item', async () => {
        const accordion = mountElement<NdAccordion>('nd-accordion', ACCORDION_MARKUP, { collapsible: '' });
        await flush();
        const trigger = getPart<HTMLElement>(accordion, '[data-part="item-trigger"]');
        const content = getPart<HTMLElement>(accordion, '[data-part="item-content"]');

        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(content.hasAttribute('hidden')).toBe(true);

        trigger.focus();
        trigger.click();
        await flush();
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(content.hasAttribute('hidden')).toBe(false);

        trigger.click();
        await flush();
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
    });

    it('moves focus with the arrow keys', async () => {
        const accordion = mountElement<NdAccordion>('nd-accordion', ACCORDION_MARKUP);
        await flush();
        const triggers = accordion.querySelectorAll<HTMLElement>('[data-part="item-trigger"]');

        triggers[0]?.focus();
        press(triggers[0] ?? accordion, 'ArrowDown');
        await flush();
        expect(document.activeElement).toBe(triggers[1]);
    });

    it('switches the open item in single mode', async () => {
        const accordion = mountElement<NdAccordion>('nd-accordion', ACCORDION_MARKUP);
        await flush();
        accordion.toggle('shipping');
        await flush();
        accordion.toggle('returns');
        await flush();

        expect(accordion.dataset.value).toBe('returns');
        const triggers = accordion.querySelectorAll<HTMLElement>('[data-part="item-trigger"]');
        expect(triggers[0]?.getAttribute('aria-expanded')).toBe('false');
        expect(triggers[1]?.getAttribute('aria-expanded')).toBe('true');
    });

    it('is axe-clean with an item open', async () => {
        const accordion = mountElement<NdAccordion>('nd-accordion', ACCORDION_MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(accordion, '[data-part="item-trigger"]');
        trigger.focus();
        trigger.click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
