/**
 * @module blue-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import headerGenerator, { inferModule } from '../src/generators/header/generator';

vi.mock('@nx/devkit', () => ({
    formatFiles: vi.fn(async () => undefined),
}));

const HEADER = '/**\n * @module blue-core\n * @since 1.0.0\n * @author Jeff Rose\n */\n';

describe('header generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
    });

    it('injects the standard header into a file without one', async () => {
        tree.write('packages/blue-core/src/widget.ts', 'export const x = 1;\n');

        await headerGenerator(tree, { file: 'packages/blue-core/src/widget.ts' });

        const content = tree.read('packages/blue-core/src/widget.ts', 'utf-8');
        expect(content).toBe(`${HEADER}export const x = 1;\n`);
    });

    it('infers the module from the package directory', () => {
        expect(inferModule('packages/blue-core/src/widget.ts')).toBe('blue-core');
        expect(inferModule('apps/blue-todo/src/index.ts')).toBe('blue-todo');
        expect(inferModule('src/tool.ts')).toBe('tool');
    });

    it('honors explicit module, summary, and author options', async () => {
        tree.write('packages/blue-core/src/widget.ts', 'export const x = 1;\n');

        await headerGenerator(tree, {
            file: 'packages/blue-core/src/widget.ts',
            module: 'widget',
            summary: 'Widget utilities',
            author: 'Ada Lovelace',
        });

        const content = tree.read('packages/blue-core/src/widget.ts', 'utf-8');
        expect(content).toContain(' * Widget utilities.');
        expect(content).toContain(' * @module widget');
        expect(content).toContain(' * @author Ada Lovelace');
    });

    it('fails when the file already has a doc block', async () => {
        tree.write('packages/blue-core/src/widget.ts', '/**\n * Old header.\n */\nexport const x = 1;\n');

        await expect(headerGenerator(tree, { file: 'packages/blue-core/src/widget.ts' })).rejects.toThrow(
            /already has a top-of-file doc block/
        );
    });

    it('replaces the existing doc block with --force', async () => {
        tree.write(
            'packages/blue-core/src/widget.ts',
            '/**\n * Old header.\n *\n * @module legacy\n */\nexport const x = 1;\n'
        );

        await headerGenerator(tree, { file: 'packages/blue-core/src/widget.ts', force: true });

        const content = tree.read('packages/blue-core/src/widget.ts', 'utf-8');
        expect(content).toBe(`${HEADER}export const x = 1;\n`);
    });

    it('throws for unknown files', async () => {
        await expect(headerGenerator(tree, { file: 'packages/blue-core/src/nope.ts' })).rejects.toThrow(
            /File not found/
        );
    });
});
