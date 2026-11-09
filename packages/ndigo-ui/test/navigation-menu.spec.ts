/**
 * Navigation menu: structure, open/close, keyboard, orientation, and axe.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdNavigationMenu } from '../registry/ui/navigation-menu/nd-navigation-menu';

const MARKUP = `
    <ul data-part="list">
        <li data-part="item" data-value="products">
            <button data-part="trigger" type="button">Products</button>
            <div data-part="content">
                <a data-part="link" href="/analytics">Analytics</a>
                <a data-part="link" href="/marketing" aria-current="page">Marketing</a>
            </div>
        </li>
        <li data-part="item" data-value="pricing">
            <a data-part="link" href="/pricing">Pricing</a>
        </li>
    </ul>
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

describe('<nd-navigation-menu>', () => {
    it('wires the list, triggers, content, and links', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP, { 'aria-label': 'Main' });
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');
        const current = getPart<HTMLElement>(menu, '[data-part="link"][href="/marketing"]');
        const simple = getPart<HTMLElement>(menu, '[data-part="link"][href="/pricing"]');

        expect(menu).toBeInstanceOf(NdNavigationMenu);
        expect(menu.getAttribute('data-part')).toBe('root');
        expect(menu.getAttribute('aria-label')).toBe('Main');
        expect(menu.getAttribute('data-orientation')).toBe('horizontal');
        expect(trigger.getAttribute('aria-expanded')).toBe('false');
        expect(trigger.getAttribute('aria-controls')).toBe(content.id);
        expect(content.getAttribute('aria-labelledby')).toBe(trigger.id);
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(current.getAttribute('aria-current')).toBe('page');
        expect(simple.getAttribute('data-value')).toBe('pricing');
    });

    it('opens on click and closes on Escape', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP);
        await flush();
        const changes: string[] = [];
        menu.addEventListener('nd-value-change', (event) => {
            changes.push((event as CustomEvent<{ value: string }>).detail.value);
        });
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');

        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(menu.dataset.value).toBe('products');

        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(changes).toEqual(['products', '']);
    });

    it('navigates between items with arrow keys', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const pricing = getPart<HTMLElement>(menu, '[data-part="link"][href="/pricing"]');

        trigger.focus();
        trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
        await flush();
        expect(document.activeElement).toBe(pricing);

        pricing.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
        await flush();
        expect(document.activeElement).toBe(trigger);
    });

    it('closes when a content link is followed', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');
        const link = getPart<HTMLElement>(menu, '[data-part="link"][href="/analytics"]');
        link.addEventListener('click', (event) => event.preventDefault());

        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        link.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('reflects vertical orientation', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP, { orientation: 'vertical' });
        await flush();
        expect(menu.getAttribute('data-orientation')).toBe('vertical');

        menu.setAttribute('orientation', 'horizontal');
        await flush();
        expect(menu.getAttribute('data-orientation')).toBe('horizontal');
    });

    it('opens and closes programmatically', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP);
        await flush();
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');

        menu.show('products');
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        menu.hide();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
    });

    it('is axe-clean when open', async () => {
        const menu = mountElement<NdNavigationMenu>('nd-navigation-menu', MARKUP, { 'aria-label': 'Main' });
        await flush();
        getPart<HTMLElement>(menu, '[data-part="trigger"]').click();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
