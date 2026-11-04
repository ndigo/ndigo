/**
 * @module ndigo-generators
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import readmeGenerator from '../src/generators/readme/generator';

async function generate(tree: Tree, schema: Record<string, unknown>): Promise<string> {
    await readmeGenerator(tree, schema as never);
    const read = tree.read('packages/ndigo-demo-pkg/README.md', 'utf-8');
    expect(read).not.toBeNull();
    return read as string;
}

describe('readme generator', () => {
    it('scaffolds a README with the package name interpolated into every spot', async () => {
        const tree = createTreeWithEmptyWorkspace();
        const content = await generate(tree, { name: 'demo-pkg' });

        expect(content).toContain('# @ndigo/demo-pkg');
        expect(content).toContain('pnpm add @ndigo/demo-pkg');
        expect(content).toContain('pnpm --filter @ndigo/demo-pkg build:lib');
        // No template markers left behind.
        expect(content).not.toContain('<%=');
        expect(content).not.toContain('.template');
    });

    it('uses the provided description in the intro and falls back otherwise', async () => {
        const tree = createTreeWithEmptyWorkspace();
        const withDescription = await generate(tree, {
            name: 'demo-pkg',
            description: 'Caches cross-cutting state.',
        });
        expect(withDescription).toContain('Caches cross-cutting state.');

        const bare = createTreeWithEmptyWorkspace();
        const bareContent = await generate(bare, { name: 'demo-pkg' });
        expect(bareContent).toContain('A Ndigo package');
    });

    it('rejects a non-kebab-case name', async () => {
        const tree = createTreeWithEmptyWorkspace();
        await expect(readmeGenerator(tree, { name: 'Bad_Name' } as never)).rejects.toThrow(/kebab-case/);
    });

    it('honors an explicit destination path', async () => {
        const tree = createTreeWithEmptyWorkspace();
        await readmeGenerator(tree, { name: 'demo-pkg', path: 'apps/demo' } as never);
        expect(tree.read('apps/demo/README.md', 'utf-8')).not.toBeNull();
        expect(tree.read('packages/ndigo-demo-pkg/README.md', 'utf-8')).toBeNull();
    });
});
