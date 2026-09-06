/**
 * Zod schema derivation for `@blue/orm` entities (AD-7).
 *
 * Entity classes stay decorator-annotated (`@entity`/`@column`/`@primaryColumn`);
 * validation is *derived* from that metadata rather than declared as a
 * parallel constraint API. Per column:
 *
 * - an explicit `@column({ schema })` Zod type wins,
 * - otherwise the declared SQL `type` maps to a base Zod type
 *   (`int*` → `z.number()`, `bool*` → `z.boolean()`, text family → `z.string()`),
 * - untyped columns are `z.unknown()` passthroughs — validation enforces only
 *   what the annotations declare.
 *
 * `z.infer<ReturnType<typeof schemaForEntity>>` yields the validated entity
 * shape, giving static types from the same source of truth.
 *
 * @module
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
