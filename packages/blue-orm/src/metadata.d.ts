/** @author opencode */
import { Constructable } from '@blue/core';
export type ClassType = new (...args: any[]) => any;
export type RelationKind = 'one-to-many' | 'many-to-one' | 'many-to-many' | 'one-to-one';
export interface RelationDefinition {
    kind: RelationKind;
    fieldName: string;
    targetEntity: () => ClassType;
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
    relations: RelationDefinition[];
    lifecycleHooks: LifecycleHookDefinition[];
}
/**
 * Checks if a given class is an entity.
 * @param target - The class constructor to check.
 * @returns `true` if the class is an entity, `false` otherwise.
 */
export declare function isEntity(target: Constructable): boolean;
/**
 * Retrieves the entity metadata for a given class.
 * @param target - The class constructor for which to retrieve metadata.
 * @returns The entity metadata.
 */
export declare function getEntityMetadata(target: Constructable): EntityMetadata;
