/**
 * Drizzle table + Zod schema derivation from `@blue/orm` entity metadata.
 * * @module blue-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { Table } from 'drizzle-orm';
import { sqliteTable, integer, text, real, blob } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Constructable } from '@blue/core';
import { getEntityMetadata } from '@blue/orm';
import { type SqliteStorageType, sqliteTypeForColumnType } from './_column-types';

/**
 * Builds the sqlite-core column builder for a resolved storage type. The
 * concrete builders are generic over their data type, so the shared
 * `SQLiteColumnBuilder` base cannot type the variable; the inferred union
 * keeps every builder's own API available.
 */
function builderForSqliteType(name: string, sqlType: SqliteStorageType) {
    switch (sqlType) {
        case 'INTEGER':
            return integer(name);
        case 'REAL':
            return real(name);
        case 'BLOB':
            return blob(name);
        default:
            // TEXT — and NUMERIC, which only the DDL primary-key resolver emits.
            return text(name);
    }
}

/**
 * Maps an entity class to a Drizzle `sqliteTable`.
 *
 * Column SQL types come from the shared metadata → SQLite storage mapping
 * also used by `createTableStatements` for DDL (`int*` → `integer`,
 * `real`/`float`/`double` → `real`, `blob` → `blob`, everything else →
 * `text`). The primary key is marked `primaryKey({ autoIncrement })` when the
 * entity declares a generated `INTEGER` column.
 *
 * @param entityClass - The `@entity`-decorated class.
 * @returns A Drizzle sqlite table.
 */
export function drizzleTableForEntity<E extends object>(entityClass: Constructable<E>) {
    const metadata = getEntityMetadata(entityClass);
    const columns: Record<string, unknown> = {};

    for (const col of metadata.columns) {
        const isPrimary = col.fieldName === metadata.primaryColumn;
        const generated = metadata.generatedColumns.includes(col.fieldName);
        const name = col.columnName;
        const sqlType = sqliteTypeForColumnType(col.type);

        const builder = builderForSqliteType(name, sqlType);

        if (isPrimary) {
            columns[col.fieldName] =
                generated && sqlType === 'INTEGER'
                    ? integer(name).primaryKey({ autoIncrement: true })
                    : builder.primaryKey();
        } else if (col.nullable === true) {
            columns[col.fieldName] = builder;
        } else {
            columns[col.fieldName] = builder.notNull();
        }
    }

    return sqliteTable(metadata.entityName, columns as never);
}

/**
 * Derives a Zod **insert** schema (the entity's writable shape) from a
 * Drizzle table built from entity metadata.
 *
 * @param entityClass - The `@entity`-decorated class.
 * @returns A Zod schema.
 */
export function insertSchemaForEntity<E extends object>(entityClass: Constructable<E>): z.ZodType {
    const table = drizzleTableForEntity(entityClass) as unknown as Parameters<typeof createInsertSchema>[0];
    return createInsertSchema(table) as z.ZodType;
}

/**
 * Derives a Zod **select** schema (the entity's readable shape) from a Drizzle
 * table built from entity metadata.
 *
 * @param entityClass - The `@entity`-decorated class.
 * @returns A Zod schema.
 */
export function selectSchemaForEntity<E extends object>(entityClass: Constructable<E>): z.ZodType {
    // The metadata-built table's columns are dynamic (typed `Record<string,
    // unknown>` at build time); drizzle-zod derives the schema from the
    // table's runtime column config, so the concrete generic table type is
    // not statically expressible here without TS deep-instantiation errors.
    // `Table` is the widest drizzle-zod schema input; the schema shape is
    // derived from the table's runtime column config.
    return createSelectSchema(drizzleTableForEntity(entityClass) as Table) as z.ZodType;
}
