/** @author opencode */

import '@tsmetadata/polyfill';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedMetadataKey,
    primaryMetadataKey,
} from './_constants';
import { ColumnDefinition, ColumnOptions } from './metadata';

type ClassType = new (...args: any[]) => any;

/**
 * Decorator that marks a class as an entity.
 * It can optionally specify a custom table name for the entity.
 * @param tableName - The custom table name for the entity (optional).
 * @example
 * ```typescript
 * @entity('users')
 * class User {
 *   // ...
 * }
 * ```
 */
export function entity(tableName?: string) {
    return function <T extends ClassType>(target: T, context: ClassDecoratorContext): T {
        context.metadata[entityMetadataKey] = true;
        context.metadata[entityNameMetadataKey] = tableName ?? target.name;
        return target;
    };
}

/**
 * Decorator that marks a class property as a column in the entity's table.
 * It can optionally specify column options like name, type, and nullability.
 * @param options - Options for the column (optional).
 * @example
 * ```typescript
 * class User {
 *   @column({ name: 'first_name', type: 'varchar', nullable: false })
 *   firstName: string;
 * }
 * ```
 */
export function column(options?: ColumnOptions) {
    return function (_value: undefined, context: ClassFieldDecoratorContext) {
        const columns = ((context.metadata[columnsMetadataKey] as ColumnDefinition[]) ?? []).slice();

        columns.push({
            fieldName: String(context.name),
            columnName: options?.name ?? String(context.name),
            type: options?.type,
            nullable: options?.nullable,
        });

        context.metadata[columnsMetadataKey] = columns;
    };
}

/**
 * Decorator that marks a class property as the primary column of the entity.
 * This implicitly also marks it as a regular column.
 * @example
 * ```typescript
 * class User {
 *   @primaryColumn()
 *   id: number;
 * }
 * ```
 */
export function primaryColumn() {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        column()(value, context);
        context.metadata[primaryMetadataKey] = String(context.name);
    };
}

/**
 * Decorator that marks a class property as a generated column.
 * This is typically used for auto-incrementing primary keys or other database-generated values.
 * @example
 * ```typescript
 * class User {
 *   @primaryColumn()
 *   @generated()
 *   id: number;
 * }
 * ```
 */
export function generated() {
    return function (_value: undefined, context: ClassFieldDecoratorContext) {
        const generatedColumns = ((context.metadata[generatedMetadataKey] as string[]) ?? []).slice();
        const fieldName = String(context.name);

        if (!generatedColumns.includes(fieldName)) {
            generatedColumns.push(fieldName);
        }

        context.metadata[generatedMetadataKey] = generatedColumns;
    };
}
