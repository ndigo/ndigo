/**
 * Code block: wiring, clipboard copy, button state, failure path, and axe.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import axe from 'axe-core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { initCodeBlocks } from '../registry/blocks/code-block/code-block';
import type { CodeBlockCopyDetail, CodeBlockHandle } from '../registry/blocks/code-block/code-block';

const PACKAGE_ROOT = [resolve(process.cwd(), 'packages/ndigo-ui'), resolve(process.cwd())].find((candidate) =>
    existsSync(join(candidate, 'registry/blocks/code-block/code-block.html'))
);

if (!PACKAGE_ROOT) throw new Error(`Cannot locate the code block from ${process.cwd()}`);

const HTML = readFileSync(join(PACKAGE_ROOT, 'registry/blocks/code-block/code-block.html'), 'utf8');

const AXE_OPTIONS = {
    rules: {
        // jsdom has no layout, so contrast and landmark checks are meaningless here.
        'color-contrast': { enabled: false },
        region: { enabled: false },
    },
};

function firstBlock(blocks: CodeBlockHandle[]): CodeBlockHandle {
    const handle = blocks[0];
    if (handle === undefined) throw new Error('code block did not initialize');
    return handle;
}

function stubClipboard(writeText: (text: string) => Promise<void>): void {
    Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        configurable: true,
    });
}

afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
});

describe('code block', () => {
    it('copies the code, updates the button, and emits nd-copy', async () => {
        const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
        stubClipboard(writeText);
        document.body.innerHTML = HTML;
        const blocks = initCodeBlocks(document);
        expect(blocks).toHaveLength(1);

        const handle = firstBlock(blocks);
        const block = handle.root;
        const button = block.querySelector<HTMLButtonElement>('[data-copy]');
        const copies: CodeBlockCopyDetail[] = [];
        block.addEventListener('nd-copy', (event) => {
            copies.push((event as CustomEvent<CodeBlockCopyDetail>).detail);
        });

        button?.click();
        await vi.waitFor(() => expect(button?.textContent).toBe('Copied'));

        expect(writeText).toHaveBeenCalledTimes(1);
        expect(writeText.mock.calls[0]?.[0]).toContain('export function greet');
        expect(copies).toHaveLength(1);
        expect(copies[0]?.text).toContain('export function greet');

        handle.destroy();
    });

    it('copies through the handle', async () => {
        const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValue(undefined);
        stubClipboard(writeText);
        document.body.innerHTML = HTML;
        const blocks = initCodeBlocks(document);

        const handle = firstBlock(blocks);
        const copied = await handle.copy();

        expect(copied).toBe(true);
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Hello, ${name}'));
        handle.destroy();
    });

    it('leaves the button unchanged when the clipboard fails', async () => {
        const writeText = vi.fn<(text: string) => Promise<void>>().mockRejectedValue(new Error('denied'));
        stubClipboard(writeText);
        Object.defineProperty(document, 'execCommand', { value: vi.fn(() => false), configurable: true });
        document.body.innerHTML = HTML;
        const blocks = initCodeBlocks(document);
        const handle = firstBlock(blocks);
        const button = handle.root.querySelector<HTMLButtonElement>('[data-copy]');

        const copied = await handle.copy();

        expect(copied).toBe(false);
        expect(button?.textContent).toBe('Copy');
        handle.destroy();
    });

    it('is axe-clean', async () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined));
        document.body.innerHTML = HTML;
        initCodeBlocks(document);

        const results = await axe.run(document.body, AXE_OPTIONS);
        expect(results.violations).toEqual([]);
    });
});
