/**
 * Shared-vector spec for the migration filename contract (AD-78 D-1/D-5):
 * the CLI's scaffold probe (`migration-probe`) and the framework loader's
 * `nextMigrationVersion` must agree on every directory shape, so a
 * scaffolded version is never one the runner would not load.
 * @module ndigo-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { nextMigrationVersion as loaderNextVersion } from '@ndigo/orm-drizzle';
import { nextMigrationVersion as cliNextVersion } from '../src/helpers/migration-probe';

async function withDir(fn: (dir: string) => Promise<void>): Promise<void> {
    const dir = await mkdtemp('ndigo-db-new-');
    try {
        await fn(dir);
    } finally {
        await rm(dir, { recursive: true, force: true });
    }
}

describe('migration version probe parity (AD-78 shared vector)', () => {
    test('both probes agree on empty, missing, and populated directories', async () => {
        await withDir(async (dir) => {
            await expect(cliNextVersion(dir)).resolves.toBe(await loaderNextVersion(dir));

            await writeFile(join(dir, '0001-first.mjs'), 'export default {};');
            await writeFile(join(dir, '0003-third.mjs'), 'export default {};');
            await writeFile(join(dir, 'notes.md'), 'junk');
            expect(await cliNextVersion(dir)).toBe(4);
            expect(await cliNextVersion(dir)).toBe(await loaderNextVersion(dir));
        });

        expect(await cliNextVersion('/nonexistent/migrations')).toBe(1);
        expect(await loaderNextVersion('/nonexistent/migrations')).toBe(1);
    });

    test('both probes ignore the same filename shapes', async () => {
        await withDir(async (dir) => {
            await writeFile(join(dir, '0001-a.ts'), 'export default {};');
            await writeFile(join(dir, 'x-0002.ts'), 'export default {};');
            await writeFile(join(dir, '0001-b.mjs.bak'), 'junk');
            expect(await cliNextVersion(dir)).toBe(2);
            expect(await cliNextVersion(dir)).toBe(await loaderNextVersion(dir));
        });
    });
});
