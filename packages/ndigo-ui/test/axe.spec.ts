/**
 * Axe audit for the open dialog and menu surfaces.
 */
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { NdDialog } from '../registry/ui/dialog/nd-dialog';
import { NdMenu } from '../registry/ui/menu/nd-menu';

const DIALOG_MARKUP = `
    <button data-part="trigger">Open</button>
    <div data-part="content">
        <h2 data-part="title">Invite teammate</h2>
        <p data-part="description">They will receive an email.</p>
        <button data-part="close-trigger">Close</button>
        <p>Body copy</p>
    </div>
`;

const MENU_MARKUP = `
    <button data-part="trigger">Actions</button>
    <div data-part="content">
        <div data-part="item" data-value="edit">Edit</div>
        <div data-part="item" data-value="archive">Archive</div>
        <div data-part="separator"></div>
        <div data-part="item" data-value="delete">Delete</div>
    </div>
`;

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

async function violations(root: Element) {
    const results = await axe.run(root, AXE_OPTIONS);
    return results.violations;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('axe conformance', () => {
    it('finds no violations in an open dialog', async () => {
        const dialog = mountElement<NdDialog>('nd-dialog', DIALOG_MARKUP);
        await flush();
        getPart<HTMLElement>(dialog, '[data-part="trigger"]').click();
        await flush();

        expect(await violations(dialog)).toEqual([]);
    });

    it('finds no violations in an open menu', async () => {
        const menu = mountElement<NdMenu>('nd-menu', MENU_MARKUP);
        await flush();
        getPart<HTMLElement>(menu, '[data-part="trigger"]').click();
        await flush();
        getPart<HTMLElement>(menu, '[data-part="content"]').dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })
        );
        await flush();

        expect(await violations(menu)).toEqual([]);
    });
});
