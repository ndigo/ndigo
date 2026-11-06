/**
 */
import type { z } from 'zod';
import { Constructable } from '@ndigo/core';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedColumnMetadataKey,
    primaryMetadataKey,
    relationsMetadataKey,
    lifecycleHooksMetadataKey,
} from './_constants';

/**
 * A constructable class reference (`new (...args) => unknown`), used wherever
 * entity metadata has to name a class it resolves lazily.
 */
export type ClassType = new (...args: unknown[]) => unknown;

/**
 * The four relation shapes the decorators declare: `one-to-many`,
 * `many-to-one`, `many-to-many`, `one-to-one`.
 */
export type RelationKind = 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';

/**
 * Metadata recorded for one `@relation` field: the relation kind, the owning
 * field, the lazily-resolved target entity, and the join columns for either
 * side of the relation.
 */
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

/**
 * The entity lifecycle moments a hook can be attached to: `prePersist`,
 * `postLoad`, `preUpdate`, `postRemove`.
 */
export type LifecycleEvent = 'prePersist' | 'postLoad' | 'preUpdate' | 'postRemove';

/**
 * One registered lifecycle hook: the event it fires on and the method the
 * manager invokes when that event occurs.
 */
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
        generatedColumns: (metadata[generatedColumnMetadataKey] as string[]) ?? [],
        relations: (metadata[relationsMetadataKey] as RelationDefinition[]) ?? [],
        lifecycleHooks: (metadata[lifecycleHooksMetadataKey] as LifecycleHookDefinition[]) ?? [],
    };
}
