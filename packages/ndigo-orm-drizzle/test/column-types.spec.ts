/**
 */
import '@tsmetadata/polyfill';

import { beforeEach, describe, expect, test } from 'vitest';
import { entity, column, generatedColumn, primaryColumn } from '@ndigo/orm';
import { DrizzleDataSource, createTableStatements } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { drizzleTableForEntity } from '../src/drizzle-zod';
import { sqliteTypeForColumnType } from '../src/_column-types';

@entity('column_types')
class TypedColumns {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'int' })
    intCol!: number;

    @column({ type: 'bigint' })
    bigintCol!: number;

    @column({ type: 'real' })
    realCol!: number;

    @column({ type: 'float' })
    floatCol!: number;

    @column({ type: 'double' })
    doubleCol!: number;

    @column({ type: 'blob' })
    blobCol!: Uint8Array;

    @column({ type: 'varchar' })
    varcharCol!: string;

    @column({ type: 'char' })
    charCol!: string;

    @column({ type: 'text' })
    textCol!: string;

    @column({ type: 'string' })
    stringCol!: string;

    @column({ type: 'boolean' })
    boolCol!: boolean;

    @column({ type: 'json' })
    jsonCol!: unknown;

    @column()
    untypedCol!: string;
}

/** The entity shape from the 2026-10-06 review probe (DA-1). */
@entity('notes')
class ReviewNote {
    @primaryColumn()
    id!: string;

    @column({ type: 'varchar' })
    title!: string;

    @column({ type: 'boolean' })
    active!: boolean;

    @column({ type: 'json' })
    payload!: unknown;
}

@entity('string_codes')
class StringCode {
    @generatedColumn()
    @primaryColumn()
    id!: number;

    @column({ type: 'varchar' })
    code!: string;
}

@entity('client_keys')
class ClientKeyed {
    @primaryColumn()
    id!: number;

    @column({ type: 'text' })
    label!: string;
}

// DAT-F4: a Date on a declared date-like column must round-trip as a Date —
// previously any object (including a Date) was JSON-encoded with quotes.
@entity('date_rows')
class DateRow {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column({ type: 'datetime' })
    occurredAt!: Date;

    @column({ type: 'json' })
    payload!: unknown;

    @column({ type: 'blob' })
    bytes!: Uint8Array;
}

// DAT-F3: a non-PK @generatedColumn column is skipped by persist while undefined, so
// its DDL must not carry NOT NULL.
@entity('generated_nonpk')
class GeneratedNonPk {
    @generatedColumn()
    @primaryColumn()
    id: number | undefined;

    @column()
    name = '';

    @generatedColumn()
    @column()
    stamp: string | undefined;
}

const NON_PK_TYPES: Array<[string, string]> = [
    ['intCol', 'INTEGER'],
    ['bigintCol', 'INTEGER'],
    ['realCol', 'REAL'],
    ['floatCol', 'REAL'],
    ['doubleCol', 'REAL'],
    ['blobCol', 'BLOB'],
    ['varcharCol', 'TEXT'],
    ['charCol', 'TEXT'],
    ['textCol', 'TEXT'],
    ['stringCol', 'TEXT'],
    ['boolCol', 'TEXT'],
    ['jsonCol', 'TEXT'],
    ['untypedCol', 'TEXT'],
];

describe('metadata → SQLite type mapping (DA-1)', () => {
    test('createTableStatements emits the declared storage type per column', () => {
        const [ddl] = createTableStatements([TypedColumns]);

        expect(ddl).toContain('"id" INTEGER PRIMARY KEY AUTOINCREMENT');
        for (const [columnName, storageType] of NON_PK_TYPES) {
            expect(ddl).toContain(`"${columnName}" ${storageType} NOT NULL`);
        }
    });

    test('DDL and drizzleTableForEntity agree on every declared type', () => {
        const [ddl] = createTableStatements([TypedColumns]);
        const table = drizzleTableForEntity(TypedColumns);
        const columns = (table as unknown as Record<symbol, unknown>)[Symbol.for('drizzle:Columns')] as Record<
            string,
            { getSQLType(): string }
        >;

        for (const [fieldName, storageType] of NON_PK_TYPES) {
            expect(columns[fieldName].getSQLType().toUpperCase()).toBe(storageType);
            expect(ddl).toContain(`"${fieldName}" ${columns[fieldName].getSQLType().toUpperCase()} `);
        }
    });

    test('the review probe entity resolves the undeclared key to NUMERIC and typed columns to TEXT', () => {
        const [ddl] = createTableStatements([ReviewNote]);

        // Undeclared caller-assigned key: NUMERIC affinity keeps numeric ids
        // numeric while string keys no longer hit SQLITE_MISMATCH.
        expect(ddl).toContain('"id" NUMERIC PRIMARY KEY');
        expect(ddl).toContain('"title" TEXT NOT NULL');
        expect(ddl).toContain('"active" TEXT NOT NULL');
        expect(ddl).toContain('"payload" TEXT NOT NULL');
        expect(ddl).not.toContain('INTEGER');
    });
});

describe('declared-type round trips (DA-1)', () => {
    let dataSource: DrizzleDataSource;
    let entityManager: DrizzleEntityManager;

    beforeEach(async () => {
        dataSource = new DrizzleDataSource({ url: ':memory:' });
        await dataSource.init([ReviewNote, StringCode, ClientKeyed]);
        entityManager = new DrizzleEntityManager(dataSource);
    });

    test('a string primary key persists and finds by its string value', async () => {
        const note = new ReviewNote();
        note.id = 'note-1';
        note.title = 'hello';
        note.active = true;
        note.payload = { tag: 'x' };

        await entityManager.persist(note);

        const found = await entityManager.find(ReviewNote, 'note-1');
        expect(found?.id).toBe('note-1');
        expect(found?.title).toBe('hello');
        // DA-2: declared column types decode on read (boolean 1/0 → boolean,
        // json text → value), so the round trip matches the entity shape.
        expect(found?.active).toBe(true);
        expect(found?.payload).toEqual({ tag: 'x' });
    });

    test('numeric-looking strings round-trip as strings', async () => {
        const row = new StringCode();
        row.code = '007';

        await entityManager.persist(row);

        const found = await entityManager.find(StringCode, row.id);
        expect(found?.code).toBe('007');
        expect(typeof found?.code).toBe('string');
    });

    test('a caller-assigned numeric key round-trips as a number', async () => {
        const row = new ClientKeyed();
        row.id = 10;
        row.label = 'ten';

        await entityManager.persist(row);

        const found = await entityManager.find(ClientKeyed, 10);
        expect(found?.id).toBe(10);
        expect(found?.label).toBe('ten');
    });
});

// DAT-N1: storage types are matched on whole words, so types that merely
// contain 'int' are not mapped to INTEGER.
describe('word-boundary declared-type matching (DAT-N1)', () => {
    test('unrelated types are not read as int', () => {
        expect(sqliteTypeForColumnType('point')).toBe('TEXT');
        expect(sqliteTypeForColumnType('interval')).toBe('TEXT');
        expect(sqliteTypeForColumnType('bigint')).toBe('INTEGER');
        expect(sqliteTypeForColumnType('varchar(255)')).toBe('TEXT');
        expect(sqliteTypeForColumnType('double precision')).toBe('REAL');
    });
});

describe('Date and non-json column round trips (DAT-F4)', () => {
    let dataSource: DrizzleDataSource;
    let entityManager: DrizzleEntityManager;

    beforeEach(async () => {
        dataSource = new DrizzleDataSource({ url: ':memory:' });
        await dataSource.init([DateRow]);
        entityManager = new DrizzleEntityManager(dataSource);
    });

    test('a Date column round-trips as a Date, not a quoted JSON string', async () => {
        const at = new Date('2026-10-06T12:34:56.000Z');
        const row = new DateRow();
        row.occurredAt = at;
        row.payload = { tag: 'x' };
        row.bytes = new Uint8Array([1, 2, 3]);

        await entityManager.persist(row);

        const found = await entityManager.find(DateRow, row.id);
        expect(found?.occurredAt).toBeInstanceOf(Date);
        expect(found?.occurredAt.toISOString()).toBe(at.toISOString());
        expect(found?.payload).toEqual({ tag: 'x' });
        // BLOB cells return as an ArrayBuffer; the bytes survive verbatim.
        expect(Array.from(new Uint8Array(found?.bytes as unknown as ArrayBuffer))).toEqual([1, 2, 3]);
    });
});

// DAT-F3: a non-PK @generatedColumn column is not written by persist while
// undefined, so NOT NULL on that column must be dropped.
describe('non-PK @generatedColumn columns (DAT-F3)', () => {
    let dataSource: DrizzleDataSource;
    let entityManager: DrizzleEntityManager;

    beforeEach(async () => {
        dataSource = new DrizzleDataSource({ url: ':memory:' });
        await dataSource.init([GeneratedNonPk]);
        entityManager = new DrizzleEntityManager(dataSource);
    });

    test('DDL omits NOT NULL for the generated column', () => {
        const [ddl] = createTableStatements([GeneratedNonPk]);
        expect(ddl).toContain('"stamp" TEXT NULL');
        expect(ddl).not.toContain('"stamp" TEXT NOT NULL');
    });

    test('persist succeeds with the generated column unwritten', async () => {
        const row = new GeneratedNonPk();
        row.name = 'x';

        await entityManager.persist(row);

        const found = await entityManager.find(GeneratedNonPk, row.id);
        expect(found?.name).toBe('x');
        expect(found?.stamp == null).toBe(true);
    });
});
