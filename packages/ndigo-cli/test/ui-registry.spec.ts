// @vitest-environment node
/**
 * Registry loader and validator specs against a temporary local registry.
 */
import { unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
    loadRegistry,
    normalizeRegistrySource,
    readRegistryFile,
    resolveItemClosure,
    validateRegistry,
} from '../src/ui/registry.js';
import type { LocatedRegistryItem } from '../src/ui/registry-types.js';
import { createRegistryFixture } from './_ui-registry-fixture.js';

let cleanup: (() => void) | undefined;

afterEach(() => {
    cleanup?.();
    cleanup = undefined;
});

function item(registry: readonly LocatedRegistryItem[], name: string): LocatedRegistryItem {
    const found = registry.find((candidate) => candidate.name === name);
    if (found === undefined) throw new Error(`fixture item '${name}' missing`);
    return found;
}

describe('registry loader', () => {
    it('merges includes and locates items relative to their chunk', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;

        const registry = await loadRegistry(fixture.registry);

        expect(registry.items.map((entry) => entry.name)).toEqual(['lib', 'dialog']);
        expect(item(registry.items, 'dialog').base.endsWith('pkg')).toBe(true);
        const file = item(registry.items, 'dialog').files?.[0];
        if (file === undefined) throw new Error('fixture dialog file missing');
        expect(await readRegistryFile(item(registry.items, 'dialog'), file)).toBe('export const dialog = true;\n');
    });

    it('normalizes a directory to its registry.json', () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;

        expect(normalizeRegistrySource(fixture.root)).toBe(fixture.registry);
    });

    it('accepts a valid registry', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;

        expect(validateRegistry(await loadRegistry(fixture.registry))).toEqual([]);
    });

    it('reports a missing local file', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        unlinkSync(join(fixture.root, 'pkg', 'files', 'dialog.ts'));

        const errors = validateRegistry(await loadRegistry(fixture.registry));

        expect(errors.some((message) => message.includes('does not exist'))).toBe(true);
    });

    it('rejects registry file paths that escape the selected registry', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        writeFileSync(
            join(fixture.root, 'pkg', 'registry.json'),
            JSON.stringify({
                items: [
                    {
                        name: 'dialog',
                        type: 'registry:ui',
                        files: [{ path: '../../../../../etc/passwd', type: 'registry:ui' }],
                    },
                ],
            })
        );

        const errors = validateRegistry(await loadRegistry(fixture.registry));

        expect(errors.some((message) => message.includes('must stay within the selected registry'))).toBe(true);
    });

    it('reports duplicate item names across chunks', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        writeFileSync(
            join(fixture.root, 'registry.json'),
            JSON.stringify({
                name: 'fixture',
                include: ['pkg/registry.json'],
                items: [{ name: 'lib', type: 'registry:lib', files: [] }],
            })
        );

        const errors = validateRegistry(await loadRegistry(fixture.registry));

        expect(errors.some((message) => message.includes("duplicate item 'lib'"))).toBe(true);
    });

    it('resolves registry dependencies in install order', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const registry = await loadRegistry(fixture.registry);

        expect(resolveItemClosure(registry, ['dialog']).map((entry) => entry.name)).toEqual(['lib', 'dialog']);
    });

    it('rejects unknown items and dependency cycles', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        writeFileSync(
            join(fixture.root, 'pkg', 'registry.json'),
            JSON.stringify({
                items: [
                    { name: 'a', type: 'registry:lib', registryDependencies: ['b'], files: [] },
                    { name: 'b', type: 'registry:lib', registryDependencies: ['a'], files: [] },
                ],
            })
        );
        const registry = await loadRegistry(fixture.registry);

        expect(() => resolveItemClosure(registry, ['missing'])).toThrow(/unknown registry item 'missing'/);
        expect(() => resolveItemClosure(registry, ['a'])).toThrow(/dependency cycle/);
    });
});
