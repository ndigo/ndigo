/** @author opencode */

import { Constructable } from '@blue/core';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedMetadataKey,
    primaryMetadataKey,
} from './_constants';

/**
 * Options for defining a column in an entity.
 */
export interface ColumnOptions {
    name?: string;
    type?: string;
    nullable?: boolean;
}

/**
 * Defines a column's properties within an entity.
 */
export interface ColumnDefinition {
    fieldName: string;
    columnName: string;
    type?: string;
    nullable?: boolean;
}

/**
 * Represents the metadata for an entity, including its name, columns, primary key, and generated columns.
 */
export interface EntityMetadata {
    entityName: string;
    columns: ColumnDefinition[];
    primaryColumn: string;
    generatedColumns: string[];
}

type MetadataRecord = Record<string, unknown>;

function getMetadata(target: Constructable): MetadataRecord {
    return ((target as any)[Symbol.metadata] as MetadataRecord) || {};
}

/**
 * Checks if a given class is an entity.
 * @param target - The class constructor to check.
 * @returns `true` if the class is an entity, `false` otherwise.
 */
export function isEntity(target: Constructable): boolean {
    const metadata = getMetadata(target);
    return metadata[entityMetadataKey] === true;
}

/**
 * Retrieves the entity metadata for a given class.
 * @param target - The class constructor for which to retrieve metadata.
 * @returns The entity metadata.
 */
export function getEntityMetadata(target: Constructable): EntityMetadata {
    const metadata = getMetadata(target);

    return {
        entityName: (metadata[entityNameMetadataKey] as string) ?? target.name,
        columns: (metadata[columnsMetadataKey] as ColumnDefinition[]) ?? [],
        primaryColumn: (metadata[primaryMetadataKey] as string) ?? '',
        generatedColumns: (metadata[generatedMetadataKey] as string[]) ?? [],
    };
}
