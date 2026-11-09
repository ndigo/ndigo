/**
 * Command palette block: composition, shortcut, filtering, selection, and axe.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import axe from 'axe-core';
import { afterEach, describe, expect, it } from 'vitest';
import { flush } from './_fixtures.js';
import '../registry/ui/dialog/nd-dialog';
import '../registry/ui/combobox/nd-combobox';
import { initCommandPalette } from '../registry/blocks/command/command';
import type { CommandPalette, CommandSelection } from '../registry/blocks/command/command';

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry/blocks/command/command.html'))
);

if (!PACKAGE_ROOT) throw new Error(`Cannot locate the command block from ${process.cwd()}`);

const HTML = readFileSync(join(PACKAGE_ROOT, 'registry/blocks/command/command.html'), 'utf8');

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

interface MountedPalette {
    readonly root: HTMLElement;
    readonly handle: CommandPalette;
    readonly dialog: HTMLElement;
    readonly content: HTMLElement;
    readonly input: HTMLInputElement;
}

function mount(): MountedPalette {
    document.body.innerHTML = HTML;
    const handle = initCommandPalette(document);
    if (handle === null) throw new Error('command palette did not initialize');
    const dialog = handle.root.querySelector<HTMLElement>('nd-dialog');
    const content = dialog?.querySelector<HTMLElement>('[data-part="content"]');
    const input = handle.root.querySelector<HTMLInputElement>('[data-part="input"]');
    if (!dialog || !content || !input) throw new Error('command palette markup is incomplete');
    return { root: handle.root, handle, dialog, content, input };
}

function pressShortcut(): void {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
}

function item(palette: MountedPalette, value: string): HTMLElement {
    const element = palette.root.querySelector<HTMLElement>(`[data-part="item"][data-value="${value}"]`);
    if (element === null) throw new Error(`missing command: ${value}`);
    return element;
}

afterEach(() => {
    document.body.innerHTML = '';
});

describe('command palette block', () => {
    it('composes the dialog and inline combobox', async () => {
        const palette = mount();
        await flush();

        const combobox = palette.root.querySelector<HTMLElement>('nd-combobox');
        const list = combobox?.querySelector<HTMLElement>('[data-part="content"]');
        const positioner = combobox?.querySelector<HTMLElement>('[data-part="positioner"]');
        const shortcut = palette.root.querySelector<HTMLElement>('[data-command-shortcut]');

        expect(palette.content.getAttribute('role')).toBe('dialog');
        expect(palette.input.getAttribute('role')).toBe('combobox');
        expect(palette.input.getAttribute('aria-expanded')).toBe('false');
        expect(list?.getAttribute('role')).toBe('listbox');
        expect(positioner?.getAttribute('style')).toBeNull();
        expect(shortcut?.textContent).toBe('Ctrl K');
        expect(palette.content.hidden).toBe(true);
    });

    it('opens on Cmd/Ctrl+K and focuses the input', async () => {
        const palette = mount();
        await flush();

        pressShortcut();
        await flush();

        expect(palette.dialog.hasAttribute('open')).toBe(true);
        expect(palette.content.hidden).toBe(false);
        expect(palette.input.getAttribute('aria-expanded')).toBe('true');
        expect(document.activeElement).toBe(palette.input);
    });

    it('filters commands and shows the empty state', async () => {
        const palette = mount();
        await flush();
        palette.handle.open();
        await flush();

        palette.input.value = 'set';
        palette.input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();

        expect(item(palette, 'open-settings').hidden).toBe(false);
        expect(item(palette, 'new-file').hidden).toBe(true);
        expect(palette.root.querySelector<HTMLElement>('[data-command-empty]')?.hidden).toBe(true);

        palette.input.value = 'zzz';
        palette.input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();

        expect(palette.root.querySelector<HTMLElement>('[data-command-empty]')?.hidden).toBe(false);
    });

    it('closes and emits nd-command on selection', async () => {
        const palette = mount();
        await flush();
        const selected: CommandSelection[] = [];
        palette.root.addEventListener('nd-command', (event) => {
            selected.push((event as CustomEvent<CommandSelection>).detail);
        });

        pressShortcut();
        await flush();
        palette.input.value = 'sign';
        palette.input.dispatchEvent(new Event('input', { bubbles: true }));
        await flush();
        item(palette, 'sign-out').click();
        await flush();

        expect(selected).toEqual([{ value: 'sign-out', label: 'Sign out' }]);
        expect(palette.dialog.hasAttribute('open')).toBe(false);
        expect(palette.content.hidden).toBe(true);
        expect(palette.input.value).toBe('');
    });

    it('opens and closes programmatically', async () => {
        const palette = mount();
        await flush();

        palette.handle.open();
        await flush();
        expect(palette.content.hidden).toBe(false);

        palette.handle.close();
        await flush();
        expect(palette.content.hidden).toBe(true);
    });

    it('is axe-clean when open', async () => {
        const palette = mount();
        await flush();
        palette.handle.open();
        await flush();

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
