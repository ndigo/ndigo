/**
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { entity as entityDecorator, generatedColumn, primaryColumn, column } from '@ndigo/orm';
import { createTableStatements } from '../src/drizzle-data-source';
import {
    projectEntities,
    diffProjections,
    renderMigrationFile,
    renderSnapshot,
    readSnapshot,
    SNAPSHOT_PREDICATE,
} from '../src/schema-snapshot';
import type { SchemaSnapshot, ColumnProjection, SqliteStorageType } from '../src/schema-snapshot';

// Spec-side type wrapper; runtime-identical to the production `entity` decorator.
const entity = entityDecorator as unknown as (tableName?: string) => ClassDecorator;

@entity('snap_notes')
class SnapNote {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'varchar' })
    title!: string;

    @column()
    body: string = '';

    @column({ type: 'blob' })
    bytes: Uint8Array | undefined;

    @generatedColumn()
    @column()
    stamp: string | undefined;
}

/** A table projection with one column per given shape. */
function table(name: string, columns: ColumnProjection[]): SchemaSnapshot {
    return { predicate: SNAPSHOT_PREDICATE, tables: [{ name, columns }] };
}

function col(name: string, type: SqliteStorageType = 'TEXT', extra: Partial<ColumnProjection> = {}): ColumnProjection {
    return { name, type, primaryKey: false, generated: false, nullable: false, ...extra };
}

describe('projectEntities (AD-78 D-2/D-3)', () => {
    test('renders the same DDL predicate createTableStatements emits — byte-identical baseline', () => {
        const projection = projectEntities([SnapNote]);
        const delta = diffProjections(null, projection);
        expect(delta.statements).toEqual(createTableStatements([SnapNote]));
        expect(delta.description).toBe('create table "snap_notes"');
        expect(delta.unsupported).toEqual([]);
    });

    test('skips non-entity classes and empty tables', () => {
        expect(projectEntities([class NotAnEntity {}])).toEqual({ predicate: SNAPSHOT_PREDICATE, tables: [] });
    });
});

describe('diffProjections (AD-78 D-2)', () => {
    test('emits ALTER ADD COLUMN for added columns and keeps column order', () => {
        const before = table('t', [col('a')]);
        const after = table('t', [col('a'), col('b'), col('c', 'INTEGER')]);
        const delta = diffProjections(before, after);
        expect(delta.statements).toEqual([
            'ALTER TABLE "t" ADD COLUMN "b" TEXT NOT NULL',
            'ALTER TABLE "t" ADD COLUMN "c" INTEGER NOT NULL',
        ]);
        expect(delta.description).toBe('add column "b" to "t"; add column "c" to "t"');
        expect(delta.unsupported).toEqual([]);
    });

    test('emits ALTER DROP COLUMN for removed columns', () => {
        const delta = diffProjections(table('t', [col('a'), col('b')]), table('t', [col('a')]));
        expect(delta.statements).toEqual(['ALTER TABLE "t" DROP COLUMN "b"']);
        expect(delta.description).toBe('drop column "b" from "t"');
    });

    test('emits DROP TABLE IF EXISTS for removed tables and CREATE TABLE for added ones', () => {
        const before = table('gone', [col('a')]);
        const after = table('fresh', [col('a')]);
        const delta = diffProjections(before, after);
        expect(delta.statements).toEqual([
            'CREATE TABLE IF NOT EXISTS "fresh" (\n  "a" TEXT NOT NULL\n)',
            'DROP TABLE IF EXISTS "gone"',
        ]);
    });

    test('an identical projection produces an empty delta', () => {
        const snapshot = table('t', [col('a')]);
        const delta = diffProjections(snapshot, snapshot);
        expect(delta.statements).toEqual([]);
        expect(delta.description).toBe('');
        expect(delta.unsupported).toEqual([]);
    });
});

describe('diffProjections fidelity ceiling (AD-78 D-3)', () => {
    test('a type change goes to unsupported, never into the migration silently', () => {
        const delta = diffProjections(table('t', [col('a', 'TEXT')]), table('t', [col('a', 'INTEGER')]));
        expect(delta.statements).toEqual([]);
        expect(delta.unsupported).toHaveLength(1);
        expect(delta.unsupported[0]).toContain('hand-write');
    });

    test('a nullability change goes to unsupported', () => {
        const delta = diffProjections(table('t', [col('a')]), table('t', [col('a', 'TEXT', { nullable: true })]));
        expect(delta.statements).toEqual([]);
        expect(delta.unsupported).toHaveLength(1);
    });

    test('an added primary-key column goes to unsupported (requires a rebuild)', () => {
        const before = table('t', [col('a')]);
        const after = table('t', [col('a'), col('id', 'INTEGER', { primaryKey: true, generated: true })]);
        const delta = diffProjections(before, after);
        expect(delta.statements).toEqual([]);
        expect(delta.unsupported[0]).toContain('table rebuild');
    });

    test('a generated-flag change goes to unsupported', () => {
        const delta = diffProjections(
            table('t', [col('a')]),
            table('t', [col('a', 'TEXT', { generated: true, nullable: true })])
        );
        expect(delta.statements).toEqual([]);
        expect(delta.unsupported).toHaveLength(1);
    });
});

describe('renderMigrationFile / snapshot I/O (AD-78 D-2)', () => {
    test('renders a versioned module with single-quoted literals (oxfmt-stable)', () => {
        const statement = 'ALTER TABLE "t" ADD COLUMN "c" TEXT NOT NULL';
        const source = renderMigrationFile(7, 'add column "c" to "t"', [statement]);
        expect(source).toContain('version: 7,');
        expect(source).toContain(`description: 'add column "c" to "t"',`);
        expect(source).toContain(`            'ALTER TABLE "t" ADD COLUMN "c" TEXT NOT NULL',`);
        expect(source).toContain('    up: (ctx) =>\n        ctx.batch([');
        expect(source).toContain('export default migration;');
    });

    test('content with single quotes falls back to a JSON literal', () => {
        const source = renderMigrationFile(8, "add 'quoted' value", ['INSERT INTO "t" VALUES (\'x\')']);
        expect(source).toContain('description: "add \'quoted\' value",');
        expect(source).toContain(`            "INSERT INTO \\"t\\" VALUES ('x')",`);
    });

    test('snapshot documents round-trip and are stable for the freshness gate', () => {
        const snapshot = table('t', [col('id', 'INTEGER', { primaryKey: true, generated: true })]);
        const source = renderSnapshot(snapshot);
        expect(source).toContain('"predicate": 1');
        expect(readSnapshot(source)).toEqual(snapshot);
    });

    test('a foreign predicate version fails loud', () => {
        expect(() => readSnapshot('{"predicate": 2, "tables": []}')).toThrow(/unsupported schema snapshot predicate/);
    });
});
