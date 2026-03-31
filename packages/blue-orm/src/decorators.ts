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

export function entity(tableName?: string) {
    return function <T extends ClassType>(target: T, context: ClassDecoratorContext): T {
        context.metadata[entityMetadataKey] = true;
        context.metadata[entityNameMetadataKey] = tableName ?? target.name;
        return target;
    };
}

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

export function primaryColumn() {
    return function (value: undefined, context: ClassFieldDecoratorContext) {
        column()(value, context);
        context.metadata[primaryMetadataKey] = String(context.name);
    };
}

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
