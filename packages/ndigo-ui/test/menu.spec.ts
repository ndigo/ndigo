/**
 * `<nd-menu>` conformance: parts, keyboard navigation, typeahead, and selection.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdMenu } from '../registry/ui/menu/nd-menu';

const MARKUP = `
    <button data-part="trigger">Actions</button>
    <div data-part="content">
        <div data-part="item" data-value="edit">Edit</div>
        <div data-part="item" data-value="archive">Archive</div>
        <div data-part="separator"></div>
        <div data-part="item" data-value="delete">Delete</div>
    </div>
`;

const press = (target: EventTarget, key: string): void => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
};

afterEach(() => {
    document.body.innerHTML = '';
});

describe('<nd-menu>', () => {
    it('wires the trigger and content parts', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = menu.querySelector<HTMLElement>('[data-part="trigger"]');
        const content = menu.querySelector<HTMLElement>('[data-part="content"]');

        expect(menu).toBeInstanceOf(NdMenu);
        expect(trigger?.getAttribute('aria-haspopup')).toBe('menu');
        expect(trigger?.getAttribute('aria-expanded')).toBe('false');
        expect(content?.getAttribute('role')).toBe('menu');
        expect(content?.hasAttribute('hidden')).toBe(true);
        expect(menu.querySelector('[data-part="positioner"]')).not.toBeNull();
    });

    it('opens on trigger click', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');

        trigger.click();
        await flush();

        expect(menu.hasAttribute('open')).toBe(true);
        expect(content.hasAttribute('hidden')).toBe(false);
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
    });

    it('highlights the first item on ArrowDown', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');
        const first = getPart<HTMLElement>(menu, '[data-part="item"]');

        trigger.click();
        await flush();
        press(content, 'ArrowDown');
        await flush();

        expect(first.hasAttribute('data-highlighted')).toBe(true);
        expect(content.getAttribute('aria-activedescendant')).toBe(first.getAttribute('id'));
    });

    it('supports typeahead', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');
        const archive = getPart<HTMLElement>(menu, '[data-part="item"][data-value="archive"]');

        trigger.click();
        await flush();
        press(content, 'a');
        await flush();

        expect(archive.hasAttribute('data-highlighted')).toBe(true);
    });

    it('selects on Enter, emits nd-select, and closes', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(menu, '[data-part="content"]');
        const selections: string[] = [];
        menu.addEventListener('nd-select', (event) => {
            selections.push((event as CustomEvent<{ value: string }>).detail.value);
        });

        trigger.click();
        await flush();
        press(content, 'a');
        await flush();
        press(content, 'Enter');
        await flush();

        expect(selections).toEqual(['archive']);
        expect(menu.hasAttribute('open')).toBe(false);
    });

    it('closes on Escape', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(menu, '[data-part="trigger"]');

        trigger.click();
        await flush();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await flush();

        expect(menu.hasAttribute('open')).toBe(false);
    });
});
