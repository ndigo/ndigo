/**
 * The `ndigo db generate` gates (REV-002/REV-006): destructive drops and
 * unexpressible changes must block generation until acknowledged, and a
 * clean delta must plan the next migration — pure logic, no script run.
 */
import { describe, test, expect, afterEach } from 'vitest';
import { rm, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { SchemaSnapshot, TableProjection } from '@ndigo/orm-drizzle';
import { GenerationBlockedError, planGeneration } from '../src/db-generate-plan';

const snapshot = (tables: TableProjection[]): SchemaSnapshot => ({ predicate: 1, tables });

describe('planGeneration gates (REV-002/REV-006)', () => {
    const dirs: string[] = [];

    afterEach(async () => {
        for (const dir of dirs.splice(0)) {
            // oxlint-disable-next-line no-await-in-loop -- sequential rm keeps temp-dir cleanup deterministic.
            await rm(dir, { recursive: true, force: true });
        }
    });

    const emptyDir = async (): Promise<string> => {
        const dir = join(tmpdir(), `db-generate-plan-${randomUUID()}`);
        await mkdir(dir, { recursive: true });
        dirs.push(dir);
        return dir;
    };

    test('a clean delta plans the next version and no warnings', async () => {
        const dir = await emptyDir();
        await writeFile(join(dir, '0002-seeded.ts'), 'export default {};\n');

        const projection = snapshot([
            {
                name: 'notes',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
        ]);
        const plan = await planGeneration(null, projection, { dir });

        expect(plan.version).toBe(3); // one past the seeded 0002 file
        expect(plan.slug).toBe('create-table-notes');
        expect(plan.statements).toEqual([
            'CREATE TABLE IF NOT EXISTS "notes" (\n  "id" INTEGER PRIMARY KEY AUTOINCREMENT\n)',
        ]);
        expect(plan.description).toBe('create table "notes"');
        expect(plan.warnings).toEqual([]);
    });

    test('an unchanged projection plans no statements', async () => {
        const dir = await emptyDir();
        const current = snapshot([
            {
                name: 'notes',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
        ]);
        const plan = await planGeneration(current, current, { dir });

        expect(plan.statements).toEqual([]);
        expect(plan.description).toBe('');
        expect(plan.warnings).toEqual([]);
    });

    test('a type change blocks until acknowledged (REV-002)', async () => {
        const dir = await emptyDir();
        const before = snapshot([
            {
                name: 'notes',
                columns: [
                    { name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false },
                    { name: 'title', type: 'TEXT', primaryKey: false, generated: false, nullable: true },
                ],
            },
        ]);
        const after = snapshot([
            {
                name: 'notes',
                columns: [
                    { name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false },
                    { name: 'title', type: 'INTEGER', primaryKey: false, generated: false, nullable: true },
                ],
            },
        ]);

        await expect(planGeneration(before, after, { dir })).rejects.toBeInstanceOf(GenerationBlockedError);
        await expect(planGeneration(before, after, { dir })).rejects.toThrow(/NDIGO_DB_ACCEPT_UNSUPPORTED/);

        const plan = await planGeneration(before, after, { dir, acceptUnsupported: true });
        expect(plan.warnings).toEqual([expect.stringContaining('"title" on "notes" changed')]);
        expect(plan.statements).toEqual([]);
    });

    test('a table removal blocks until acknowledged (REV-006)', async () => {
        const dir = await emptyDir();
        const before = snapshot([
            {
                name: 'notes',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
            {
                name: 'legacy',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
        ]);
        const after = snapshot([
            {
                name: 'notes',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
        ]);

        await expect(planGeneration(before, after, { dir })).rejects.toThrow(/NDIGO_DB_ACCEPT_DROPS/);

        const plan = await planGeneration(before, after, { dir, acceptDrops: true });
        expect(plan.warnings).toEqual(['DROP TABLE IF EXISTS "legacy"']);
        expect(plan.statements).toEqual(['DROP TABLE IF EXISTS "legacy"']);
        expect(plan.description).toBe('drop table "legacy"');
    });

    test('a dropped column counts as destructive too', async () => {
        const dir = await emptyDir();
        const before = snapshot([
            {
                name: 'notes',
                columns: [
                    { name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false },
                    { name: 'old', type: 'TEXT', primaryKey: false, generated: false, nullable: true },
                ],
            },
        ]);
        const after = snapshot([
            {
                name: 'notes',
                columns: [{ name: 'id', type: 'INTEGER', primaryKey: true, generated: true, nullable: false }],
            },
        ]);

        await expect(planGeneration(before, after, { dir })).rejects.toThrow(/destructive DROP/);

        const plan = await planGeneration(before, after, { dir, acceptDrops: true });
        expect(plan.statements).toEqual(['ALTER TABLE "notes" DROP COLUMN "old"']);
        expect(plan.warnings).toContain('ALTER TABLE "notes" DROP COLUMN "old"');
    });
});
