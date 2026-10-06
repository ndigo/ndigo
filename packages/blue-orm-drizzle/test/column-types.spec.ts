/**
 * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { beforeEach, describe, expect, test } from 'vitest';
import { entity, column, generated, primaryColumn } from '@blue/orm';
import { DrizzleDataSource, createTableStatements } from '../src/drizzle-data-source';
import { DrizzleEntityManager } from '../src/drizzle-entity-manager';
import { drizzleTableForEntity } from '../src/drizzle-zod';

@entity('column_types')
class TypedColumns {
    @generated()
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
    @generated()
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
        const columns = table[Symbol.for('drizzle:Columns')] as Record<string, { getSQLType(): string }>;

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
        expect(found?.payload).toBe(JSON.stringify({ tag: 'x' }));
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
