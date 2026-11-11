/**
 * Entity metadata recorded by the ORM decorators.
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
    /** The relation shape. */
    kind: RelationKind;
    /** The field that holds the relation. */
    fieldName: string;
    /** Lazily resolves the target entity class. */
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
    /** The lifecycle event. */
    event: LifecycleEvent;
    /** The method invoked for the event. */
    methodName: string;
}

/**
 * Options for defining a column in an entity.
 */
export interface ColumnOptions {
    /** Column name override. */
    name?: string;
    /** Column type override. */
    type?: string;
    /** Whether the column allows nulls. */
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
    /** The entity field name. */
    fieldName: string;
    /** The database column name. */
    columnName: string;
    /** The column type. */
    type?: string;
    /** Whether nulls are allowed. */
    nullable?: boolean;
    /** Optional Zod schema for the column. */
    schema?: z.ZodType;
}

/**
 * Represents the metadata for an entity, including its name, columns, primary key, and generated columns.
 */
export interface EntityMetadata {
    /** The entity name. */
    entityName: string;
    /** Column definitions. */
    columns: ColumnDefinition[];
    /** The primary-key field name. */
    primaryColumn: string;
    /** Generated column names. */
    generatedColumns: string[];
    /** Relation definitions. */
    relations: RelationDefinition[];
    /** Lifecycle hooks. */
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
 * Derived metadata per entity class. A class's metadata is fixed once its
 * decorators have run, so the object is built once and shared; callers must
 * treat the returned value (including its arrays) as immutable. A subclass is
 * keyed separately, so it never inherits the parent's cached entry.
 */
const entityMetadataCache = new WeakMap<Constructable, EntityMetadata>();

/**
 * Retrieves the entity metadata for a given class.
 *
 * The result is derived once per class and cached; treat it as immutable.
 *
 * @param target - The class constructor for which to retrieve metadata.
 * @returns The entity metadata.
 */
export function getEntityMetadata(target: Constructable): EntityMetadata {
    const cached = entityMetadataCache.get(target);
    if (cached !== undefined) {
        return cached;
    }

    const metadata = getMetadata(target);
    const entityMetadata: EntityMetadata = {
        entityName: (metadata[entityNameMetadataKey] as string) ?? target.name,
        columns: (metadata[columnsMetadataKey] as ColumnDefinition[]) ?? [],
        primaryColumn: (metadata[primaryMetadataKey] as string) ?? '',
        generatedColumns: (metadata[generatedColumnMetadataKey] as string[]) ?? [],
        relations: (metadata[relationsMetadataKey] as RelationDefinition[]) ?? [],
        lifecycleHooks: (metadata[lifecycleHooksMetadataKey] as LifecycleHookDefinition[]) ?? [],
    };
    entityMetadataCache.set(target, entityMetadata);
    return entityMetadata;
}
