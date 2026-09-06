/**
 * Drizzle table + Zod schema derivation from `@blue/orm` entity metadata
 * (AD-7 follow-up: drizzle-zod).
 *
 * `blue-orm-drizzle` persists via raw SQL built from `@entity`/`@column`
 * metadata. This bridge additionally materializes a real Drizzle
 * `sqliteTable` from that same metadata so the standard Drizzle tooling —
 * especially `drizzle-zod`'s `createInsertSchema`/`createSelectSchema` —
 * can derive Zod schemas. One entity declaration thus drives persistence,
 * the Drizzle table object, and the validation/type schemas.
 *
 * @module
 */

import { sqliteTable, integer, text, real, blob } from 'drizzle-orm/sqlite-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { Constructable } from '@blue/core';
import { getEntityMetadata } from '@blue/orm';

/**
 * Maps an entity class to a Drizzle `sqliteTable`.
 *
 * Column SQL types from `@column({ type })` map to sqlite-core builders:
 * `int*` → `integer`, `real`/`float`/`double` → `real`, `blob` → `blob`,
 * everything else → `text`. The primary key is marked
 * `primaryKey({ autoIncrement })` when the entity declares a generated
 * column.
 *
 * @param entityClass - The `@entity`-decorated class.
 * @returns A Drizzle sqlite table.
 */
export function drizzleTableForEntity<E extends object>(entityClass: Constructable<E>) {
    const metadata = getEntityMetadata(entityClass);
    const columns: Record<string, unknown> = {};

    for (const col of metadata.columns) {
        const isPrimary = col.fieldName === metadata.primaryColumn;
        const type = (col.type ?? 'text').toLowerCase();
        const generated = metadata.generatedColumns.includes(col.fieldName);
        const name = col.columnName;

        let builder: ReturnType<typeof text>;
        if (type.includes('int')) {
            builder = integer(name);
        } else if (type.includes('real') || type.includes('float') || type.includes('double')) {
            builder = real(name);
        } else if (type.includes('blob')) {
            builder = blob(name);
        } else {
            builder = text(name);
        }

        if (isPrimary) {
            columns[col.fieldName] = generated
                ? (builder as ReturnType<typeof integer>).primaryKey({ autoIncrement: true })
                : (builder as ReturnType<typeof integer>).primaryKey();
        } else if (col.nullable === true) {
            columns[col.fieldName] = builder;
        } else {
            columns[col.fieldName] = (builder as ReturnType<typeof text>).notNull();
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
    // table's runtime column config, so the generic table type is not
    // statically expressible here without TS deep-instantiation errors.
    // `any` is deliberate and bounded to this bridge's boundary call.
    return createSelectSchema(drizzleTableForEntity(entityClass) as any) as z.ZodType;
}
