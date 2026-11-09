/**
 * RTL smoke and logical-property guard.
 *
 * jsdom has no layout, so this cannot prove visual mirroring. It does prove the
 * keyboard/focus paths run under `dir="rtl"` and that registry CSS does not
 * reintroduce physical `left`/`right` spacing.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { flush, getPart, mountElement } from './_fixtures.js';
import { packageRoot } from './_package-root.js';
import '../registry/ui/dialog/nd-dialog';
import '../registry/ui/select/nd-select';

const PACKAGE_ROOT = packageRoot('registry');

function cssFiles(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) return cssFiles(path);
        return entry.name.endsWith('.css') ? [path] : [];
    });
}

const DIALOG_MARKUP = `
    <button data-part="trigger" type="button">Open</button>
    <div data-part="content">
        <h2 data-part="title">Invite teammate</h2>
        <button data-part="close-trigger" type="button">Close</button>
    </div>
`;

const SELECT_MARKUP = `
    <button data-part="trigger" type="button">pick</button>
    <div data-part="positioner">
        <div data-part="content">
            <div data-part="item" data-value="apple"><span data-part="item-text">Apple</span></div>
            <div data-part="item" data-value="banana"><span data-part="item-text">Banana</span></div>
        </div>
    </div>
`;

beforeEach(() => {
    document.body.setAttribute('dir', 'rtl');
});

afterEach(() => {
    document.body.innerHTML = '';
    document.body.removeAttribute('dir');
});

describe('RTL', () => {
    it('runs the dialog focus path in a right-to-left document', async () => {
        const dialog = mountElement<HTMLElement>('nd-dialog', DIALOG_MARKUP);
        await flush();
        const trigger = getPart<HTMLElement>(dialog, '[data-part="trigger"]');
        const content = getPart<HTMLElement>(dialog, '[data-part="content"]');
        const close = getPart<HTMLElement>(dialog, '[data-part="close-trigger"]');

        trigger.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(false);

        close.click();
        await flush();
        expect(content.hasAttribute('hidden')).toBe(true);
        expect(document.activeElement).toBe(trigger);
    });

    it('selects an option in a right-to-left document', async () => {
        const select = mountElement<HTMLElement>('nd-select', SELECT_MARKUP);
        await flush();
        getPart<HTMLElement>(select, '[data-part="trigger"]').click();
        await flush();
        getPart<HTMLElement>(select, '[data-part="item"][data-value="banana"]').click();
        await flush();

        expect(select.dataset.value).toBe('banana');
    });

    it('keeps directional spacing on logical properties', () => {
        const offenders = cssFiles(join(PACKAGE_ROOT, 'registry')).filter((path) => {
            const css = readFileSync(path, 'utf8');
            return (
                /(?:^|[^-])(?:margin|padding|border)-(?:left|right)\s*:/mu.test(css) ||
                /(?:^|[^-])(?:left|right)\s*:/mu.test(css)
            );
        });

        expect(offenders).toEqual([]);
    });
});
