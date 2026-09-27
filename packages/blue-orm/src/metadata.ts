/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { z } from 'zod';
import { Constructable } from '@blue/core';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedMetadataKey,
    primaryMetadataKey,
    relationsMetadataKey,
    lifecycleHooksMetadataKey,
} from './_constants';

export type ClassType = new (...args: unknown[]) => unknown;

export type RelationKind = 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';

export interface RelationDefinition {
    kind: RelationKind;
    fieldName: string;
    targetEntity: () => ClassType;
    /**
     * Owning side (many-to-one, one-to-one): the `@column` field on THIS
     * entity that holds the target entity's primary key.
     */
    joinColumn?: string;
    /**
     * Inverse side (one-to-many, one-to-one): the `@column` field on the
     * TARGET entity that holds this entity's primary key.
     */
    inverseJoinColumn?: string;
}

export type LifecycleEvent = 'prePersist' | 'postLoad' | 'preUpdate' | 'postRemove';

export interface LifecycleHookDefinition {
    event: LifecycleEvent;
    methodName: string;
}

/**
 * Options for defining a column in an entity.
 */
export interface ColumnOptions {
    name?: string;
    type?: string;
    nullable?: boolean;
    /**
     * Optional Zod schema validating this column's value. When set, the
     * entity's derived schema (see `schemaForEntity`) validates the field
     * with this type instead of an untyped passthrough.
     */
    schema?: z.ZodType;
}

/**
 * Defines a column's properties within an entity.
 */
export interface ColumnDefinition {
    fieldName: string;
    columnName: string;
    type?: string;
    nullable?: boolean;
    schema?: z.ZodType;
}

/**
 * Represents the metadata for an entity, including its name, columns, primary key, and generated columns.
 */
export interface EntityMetadata {
    entityName: string;
    columns: ColumnDefinition[];
    primaryColumn: string;
    generatedColumns: string[];
    relations: RelationDefinition[];
    lifecycleHooks: LifecycleHookDefinition[];
}

type MetadataRecord = Record<string, unknown>;

function getMetadata(target: Constructable): MetadataRecord {
    // TS's Function type doesn't declare the TC39 Symbol.metadata property;
    // it exists on every decorated class constructor at runtime.
    return (target as unknown as { [Symbol.metadata]?: MetadataRecord })?.[Symbol.metadata] ?? {};
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
        relations: (metadata[relationsMetadataKey] as RelationDefinition[]) ?? [],
        lifecycleHooks: (metadata[lifecycleHooksMetadataKey] as LifecycleHookDefinition[]) ?? [],
    };
}
