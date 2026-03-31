/** @author opencode */

import { Constructable } from '@blue/core';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedMetadataKey,
    primaryMetadataKey,
} from './_constants';

export interface ColumnOptions {
    name?: string;
    type?: string;
    nullable?: boolean;
}

export interface ColumnDefinition {
    fieldName: string;
    columnName: string;
    type?: string;
    nullable?: boolean;
}

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

export function isEntity(target: Constructable): boolean {
    const metadata = getMetadata(target);
    return metadata[entityMetadataKey] === true;
}

export function getEntityMetadata(target: Constructable): EntityMetadata {
    const metadata = getMetadata(target);

    return {
        entityName: (metadata[entityNameMetadataKey] as string) ?? target.name,
        columns: (metadata[columnsMetadataKey] as ColumnDefinition[]) ?? [],
        primaryColumn: (metadata[primaryMetadataKey] as string) ?? '',
        generatedColumns: (metadata[generatedMetadataKey] as string[]) ?? [],
    };
}
