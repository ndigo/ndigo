// @vitest-environment node
/**
 * The `capability` generator: scaffolds a schema-conformant catalog entry
 * and refuses to clobber or accept malformed input.
 */
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import type { Tree } from '@nx/devkit';
import capabilityGenerator, { type CapabilityGeneratorSchema } from '../src/generators/capability/generator';

/** Valid baseline options. */
const OPTIONS: CapabilityGeneratorSchema = {
    id: 'wave-test',
    summary: 'Deliver the wave test wiring.',
    packages: ['@ndigo/socket'],
    guide: 'websockets',
};

describe('capability generator', () => {
    let tree: Tree;

    beforeEach(() => {
        tree = createTreeWithEmptyWorkspace();
    });

    it('scaffolds capability.json at the catalog root named after the id', async () => {
        await capabilityGenerator(tree, OPTIONS);

        const file = 'packages/ndigo-cli/assets/capabilities/wave-test/capability.json';
        expect(tree.exists(file)).toBe(true);
        const entry = JSON.parse(tree.read(file, 'utf-8') ?? '{}') as Record<string, unknown>;
        expect(entry).toEqual({
            id: 'wave-test',
            kind: 'capability',
            summary: 'Deliver the wave test wiring.',
            packages: ['@ndigo/socket'],
            guide: 'websockets',
            ops: [{ op: 'addDependency', packages: ['@ndigo/socket'] }],
            checks: ['app-boot', 'typecheck'],
        });
    });

    it('honors a catalog root override', async () => {
        await capabilityGenerator(tree, { ...OPTIONS, catalog: 'scratch/catalog' });

        expect(tree.exists('scratch/catalog/wave-test/capability.json')).toBe(true);
    });

    it('refuses a non-kebab-case id, a bad package, an empty summary, and a clobber', async () => {
        await expect(capabilityGenerator(tree, { ...OPTIONS, id: 'WaveTest' })).rejects.toThrow(/not kebab-case/u);
        await expect(capabilityGenerator(tree, { ...OPTIONS, packages: ['socket'] })).rejects.toThrow(
            /@ndigo\/\* package name/u
        );
        await expect(capabilityGenerator(tree, { ...OPTIONS, summary: '' })).rejects.toThrow(/1-160 characters/u);

        await capabilityGenerator(tree, OPTIONS);
        await expect(capabilityGenerator(tree, OPTIONS)).rejects.toThrow(/already exists/u);
    });
});
