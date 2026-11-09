/**
 * Shared structure helpers: nested-part scoping, text preservation, and the
 * overlay/root wrappers that use them.
 */
import { afterEach, describe, expect, it } from 'vitest';
import { flush } from './_fixtures.js';
import { ensureOverlayStructure, ensureRootElement, ownPart } from '../registry/base/structure-element';
import '../registry/ui/dialog/nd-dialog';
import '../registry/ui/popover/nd-popover';
import '../registry/ui/scroll-area/nd-scroll-area';
import '../registry/ui/select/nd-select';

afterEach(() => {
    document.body.innerHTML = '';
});

describe('structure helpers', () => {
    it('does not adopt a nested component positioner', () => {
        const host = document.createElement('div');
        host.innerHTML = `
            <button data-part="trigger">open</button>
            <div data-part="content">
                <div data-part="positioner"><div data-part="content">nested</div></div>
            </div>`;

        expect(ownPart(host, 'positioner')).toBeNull();
        const structure = ensureOverlayStructure(host, { triggerLabel: 'Open' });
        expect(structure.positioner.parentElement).toBe(host);
        expect(structure.content.querySelector('[data-part="positioner"]')).not.toBeNull();
    });

    it('moves direct text nodes into the content', () => {
        const host = document.createElement('div');
        host.textContent = 'hello';

        const structure = ensureOverlayStructure(host, { triggerLabel: 'Open' });
        expect(structure.content.textContent).toContain('hello');
    });

    it('adopts every child node into a generated root', () => {
        const host = document.createElement('div');
        host.textContent = 'hello';

        const root = ensureRootElement(host);
        expect(root.textContent).toBe('hello');
        expect(host.firstElementChild).toBe(root);
    });

    it('keeps a nested select positioner inside the select', async () => {
        const popover = document.createElement('nd-popover');
        popover.innerHTML = `
            <button data-part="trigger" type="button">open</button>
            <div data-part="content">
                <nd-select>
                    <div data-part="control"><button data-part="trigger" type="button">pick</button></div>
                    <div data-part="positioner">
                        <div data-part="content">
                            <div data-part="item" data-value="a"><span data-part="item-text">A</span></div>
                        </div>
                    </div>
                </nd-select>
            </div>`;
        document.body.append(popover);
        await flush();

        const select = popover.querySelector('nd-select');
        expect(select?.querySelector('[data-part="positioner"]')?.closest('nd-select')).toBe(select);
        const ownPositioner = [...popover.children].find(
            (child) => child instanceof HTMLElement && child.dataset.part === 'positioner'
        );
        expect(ownPositioner).toBeDefined();
    });

    it('keeps direct text in a scroll area viewport', async () => {
        const area = document.createElement('nd-scroll-area');
        area.textContent = 'hello';
        document.body.append(area);
        await flush();

        expect(area.querySelector('[data-part="content"]')?.textContent).toContain('hello');
    });

    it('keeps direct text in a dialog content', async () => {
        const dialog = document.createElement('nd-dialog');
        dialog.textContent = 'hello';
        document.body.append(dialog);
        await flush();

        expect(dialog.querySelector('[data-part="content"]')?.textContent).toContain('hello');
    });
});
