/**
 * `mcp-setup` generator: wiring module and sample tool.
 */
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import type { Tree } from '@nx/devkit';
import { describe, expect, it } from 'vitest';
import mcpSetupGenerator from '../src/generators/mcp-setup/generator';

describe('mcp-setup generator', () => {
    it('writes the wiring module and a sample tool controller', async () => {
        const tree: Tree = createTreeWithEmptyWorkspace();
        tree.write('apps/demo/package.json', JSON.stringify({ name: 'demo', private: true }));

        await mcpSetupGenerator(tree, { directory: 'apps/demo' });

        expect(tree.exists('apps/demo/src/mcp.ts')).toBe(true);
        expect(tree.exists('apps/demo/src/mcp-sample-controller.ts')).toBe(true);
        const wiring = tree.read('apps/demo/src/mcp.ts', 'utf-8') ?? '';
        expect(wiring).toContain('McpToolRegistry.from');
        expect(wiring).toContain('startStdioServer');
        const sample = tree.read('apps/demo/src/mcp-sample-controller.ts', 'utf-8') ?? '';
        expect(sample).toContain("@toolMapping({ name: 'sample_echo'");
    });
});
