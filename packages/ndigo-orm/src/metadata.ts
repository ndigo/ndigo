/**
 * Entity metadata recorded by the ORM decorators.
 */
import type { z } from 'zod';
import { Constructable, getSymbolMetadata } from '@ndigo/core';
import {
    COLUMNS_METADATA_KEY,
    ENTITY_METADATA_KEY,
    ENTITY_NAME_METADATA_KEY,
    GENERATED_COLUMN_METADATA_KEY,
    PRIMARY_METADATA_KEY,
    RELATIONS_METADATA_KEY,
    ENTITY_HOOKS_METADATA_KEY,
} from './_constants';

/**
 * The four relation shapes the decorators declare: `one-to-many`,
 * `many-to-one`, `many-to-many`, `one-to-one`.
 *
 * @example
 * ```ts
 * type _Alias = RelationKind;
 * ```
 */
export type RelationKind = 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';

/**
 * Metadata recorded for one `@relation` field: the relation kind, the owning
 * field, the lazily-resolved target entity, and the join columns for either
 * side of the relation.
 *
 * @example
 * ```ts
 * const value = {} as RelationDefinition;
 * ```
 */
export interface RelationDefinition {
    /** The relation shape. */
    kind: RelationKind;
    /** The field that holds the relation. */
    fieldName: string;
    /** Lazily resolves the target entity class. */
    targetEntity: () => Constructable<object>;
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
 * The entity hook moments a hook can be attached to: `prePersist`,
 * `postLoad`, `preUpdate`, `postRemove`.
 *
 * @example
 * ```ts
 * type _Alias = EntityHookEvent;
 * ```
 */
export type EntityHookEvent = 'prePersist' | 'postLoad' | 'preUpdate' | 'postRemove';

/**
 * One registered entity hook: the event it fires on and the method the
 * manager invokes when that event occurs.
 *
 * @example
 * ```ts
 * const value = {} as EntityHookDefinition;
 * ```
 */
export interface EntityHookDefinition {
    /** The entity hook event. */
    event: EntityHookEvent;
    /** The method invoked for the event. */
    methodName: string;
}

/**
 * Options for defining a column in an entity.
 *
 * @example
 * ```ts
 * const value = {} as ColumnOptions;
 * ```
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
 *
 * @example
 * ```ts
 * const value = {} as ColumnDefinition;
 * ```
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
 *
 * @example
 * ```ts
 * const value = {} as EntityMetadata;
 * ```
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
    /** Entity hooks. */
    entityHooks: EntityHookDefinition[];
}

/**
 * Checks if a given class is an entity.
 * @param target - The class constructor to check.
 * @returns `true` if the class is an entity, `false` otherwise.
 *
 * @example
 * ```ts
 * if (isEntity(User)) {}
 * ```
 */
export function isEntity(target: Constructable): boolean {
    const metadata = getSymbolMetadata(target);
    return metadata[ENTITY_METADATA_KEY] === true;
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
 *
 * @example
 * ```ts
 * const meta = getEntityMetadata(User);
 * console.log(meta.columns.map((c) => c.fieldName));
 * ```
 */
export function getEntityMetadata(target: Constructable): EntityMetadata {
    const cached = entityMetadataCache.get(target);
    if (cached !== undefined) {
        return cached;
    }

    const metadata = getSymbolMetadata(target);
    const entityMetadata: EntityMetadata = {
        entityName: (metadata[ENTITY_NAME_METADATA_KEY] as string) ?? target.name,
        columns: (metadata[COLUMNS_METADATA_KEY] as ColumnDefinition[]) ?? [],
        primaryColumn: (metadata[PRIMARY_METADATA_KEY] as string) ?? '',
        generatedColumns: (metadata[GENERATED_COLUMN_METADATA_KEY] as string[]) ?? [],
        relations: (metadata[RELATIONS_METADATA_KEY] as RelationDefinition[]) ?? [],
        entityHooks: (metadata[ENTITY_HOOKS_METADATA_KEY] as EntityHookDefinition[]) ?? [],
    };
    entityMetadataCache.set(target, entityMetadata);
    return entityMetadata;
}
