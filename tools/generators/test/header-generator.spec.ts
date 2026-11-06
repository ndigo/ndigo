/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import headerGenerator from '../src/generators/header/generator';

vi.mock('@nx/devkit', () => ({
    formatFiles: vi.fn(async () => undefined),
}));

const HEADER = '/**\n * @since 1.0.0\n * @author Jeff Rose\n */\n';

describe('header generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
    });

    it('injects the standard header into a file without one', async () => {
        tree.write('packages/ndigo-core/src/widget.ts', 'export const x = 1;\n');

        await headerGenerator(tree, { file: 'packages/ndigo-core/src/widget.ts' });

        const content = tree.read('packages/ndigo-core/src/widget.ts', 'utf-8');
        expect(content).toBe(`${HEADER}export const x = 1;\n`);
    });

    it('honors explicit summary and author options', async () => {
        tree.write('packages/ndigo-core/src/widget.ts', 'export const x = 1;\n');

        await headerGenerator(tree, {
            file: 'packages/ndigo-core/src/widget.ts',
            summary: 'Widget utilities',
            author: 'Ada Lovelace',
        });

        const content = tree.read('packages/ndigo-core/src/widget.ts', 'utf-8');
        expect(content).toContain(' * Widget utilities.');
        expect(content).toContain(' * @author Ada Lovelace');
    });

    it('fails when the file already has a doc block', async () => {
        tree.write('packages/ndigo-core/src/widget.ts', '/**\n * Old header.\n */\nexport const x = 1;\n');

        await expect(headerGenerator(tree, { file: 'packages/ndigo-core/src/widget.ts' })).rejects.toThrow(
            /already has a top-of-file doc block/
        );
    });

    it('replaces the existing doc block with --force', async () => {
        tree.write(
            'packages/ndigo-core/src/widget.ts',
            '/**\n * Old header.\n *\n * @module legacy\n */\nexport const x = 1;\n'
        );

        await headerGenerator(tree, { file: 'packages/ndigo-core/src/widget.ts', force: true });

        const content = tree.read('packages/ndigo-core/src/widget.ts', 'utf-8');
        expect(content).toBe(`${HEADER}export const x = 1;\n`);
    });

    it('throws for unknown files', async () => {
        await expect(headerGenerator(tree, { file: 'packages/ndigo-core/src/nope.ts' })).rejects.toThrow(
            /File not found/
        );
    });
});
