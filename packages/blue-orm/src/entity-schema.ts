/**
 * Zod schema derivation for `@blue/orm` entities (AD-07).
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import { Constructable, FrameworkError } from '@blue/core';
import { type ColumnDefinition, getEntityMetadata } from './metadata';

/**
 * Base Zod type for a declared SQL column type. Unknown/untyped columns pass
 * through unvalidated (`z.unknown`).
 *
 * @param type - The declared column `type` (e.g. `'varchar'`, `'int'`).
 * @returns The base Zod schema, or `z.unknown` when no mapping applies.
 */
export function baseSchemaForType(type: string): z.ZodType {
    const normalized = type.toLowerCase();
    if (normalized.includes('int')) return z.number();
    if (normalized.includes('bool')) return z.boolean();
    if (normalized.includes('json')) return z.unknown();
    if (normalized.includes('text') || normalized.includes('char') || normalized.includes('string')) {
        return z.string();
    }
    return z.unknown();
}

/**
 * Builds the Zod schema for a single column: the column's declared `schema`
 * if present, else the base mapping for its `type`, else a passthrough;
 * `nullable: true` allows `null`.
 *
 * @param column - The column definition from entity metadata.
 * @returns The column's Zod schema.
 */
export function schemaForColumn(column: ColumnDefinition): z.ZodType {
    let schema = column.schema ?? (column.type ? baseSchemaForType(column.type) : z.unknown());
    if (column.nullable === true) {
        schema = schema.nullable();
    }
    return schema;
}

/**
 * Derives a Zod object schema for an entity class from its `@column` metadata.
 *
 * @param entityClass - The entity constructor (must be decorated with `@entity`).
 * @returns A Zod object schema keyed by field name.
 */
export function schemaForEntity<T extends object>(
    entityClass: Constructable<T>
): z.ZodObject<Record<string, z.ZodType>> {
    const metadata = getEntityMetadata(entityClass);
    const shape: Record<string, z.ZodType> = {};
    for (const column of metadata.columns) {
        shape[column.fieldName] = schemaForColumn(column);
    }
    return z.object(shape);
}

/**
 * Derives a Zod **insert** schema for an entity: the writable shape for a new
 * row. Identical to {@link schemaForEntity} except that the primary key and
 * any `@generated()` columns are omitted — the database owns them, so a
 * client-created payload must not carry (or be required to carry) them.
 *
 * Use this for request-body validation of create endpoints:
 *
 * ```ts
 * @postMapping('/')
 * @parameters({ note: validatedBody(insertSchemaForEntity(Note)) })
 * create(note: z.infer<ReturnType<typeof insertSchemaForEntity<Note>>>) { … }
 * ```
 *
 * @param entityClass - The entity constructor (must be decorated with `@entity`).
 * @returns A Zod object schema over the writable columns.
 */
export function insertSchemaForEntity<T extends object>(
    entityClass: Constructable<T>
): z.ZodObject<Record<string, z.ZodType>> {
    const metadata = getEntityMetadata(entityClass);
    const shape: Record<string, z.ZodType> = {};
    for (const column of metadata.columns) {
        if (column.fieldName === metadata.primaryColumn || metadata.generatedColumns.includes(column.fieldName)) {
            continue;
        }
        let schema = schemaForColumn(column);
        // Insert semantics: a column the client is not obligated to supply —
        // nullable (an explicit "no value" is allowed, so absence is too) or
        // untyped (no constraint declared) — is optional in the writable
        // shape. Server-managed columns (e.g. filled by a @prePersist hook)
        // declare themselves with nullable: true.
        if (column.nullable === true || (!column.type && !column.schema)) {
            schema = schema.optional();
        }
        shape[column.fieldName] = schema;
    }
    return z.object(shape);
}

/**
 * Validates an entity instance against its derived schema.
 *
 * @param entityClass - The entity constructor.
 * @param entity - The entity instance to validate.
 * @throws {FrameworkError} When any column fails validation, listing the
 *   offending field paths.
 */
export function validateEntity<T extends object>(entityClass: Constructable<T>, entity: T): void {
    const result = schemaForEntity(entityClass).safeParse(entity);
    if (result.success) {
        return;
    }
    const fields = result.error.issues.map((issue) => issue.path.join('.') || 'unknown');
    throw new FrameworkError(`Entity validation failed for fields: ${fields.join(', ')}`);
}
