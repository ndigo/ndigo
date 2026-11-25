/**
 * Entity, column, and relation decorators.
 */
import '@tsmetadata/polyfill';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedColumnMetadataKey,
    primaryMetadataKey,
    relationsMetadataKey,
    entityHooksMetadataKey,
} from './_constants';
import {
    ColumnDefinition,
    ColumnOptions,
    RelationDefinition,
    RelationKind,
    EntityHookDefinition,
    EntityHookEvent,
} from './metadata';
import { Constructable } from '@ndigo/core';

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
    return function <T extends Constructable<unknown>>(target: T, context: ClassDecoratorContext): T {
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
            schema: options?.schema,
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
 *   @generatedColumn()
 *   id: number;
 * }
 * ```
 */
export function generatedColumn() {
    return function (_value: undefined, context: ClassFieldDecoratorContext) {
        const generatedColumns = ((context.metadata[generatedColumnMetadataKey] as string[]) ?? []).slice();
        const fieldName = String(context.name);

        if (!generatedColumns.includes(fieldName)) {
            generatedColumns.push(fieldName);
        }

        context.metadata[generatedColumnMetadataKey] = generatedColumns;
    };
}

/**
 * Options for relation decorators. The join column must name an existing
 * `@column` field — the FK lives in a declared column so it persists and
 * reads through the normal column pipeline.
 *
 * @example
 * ```ts
 * const value = {} as RelationOptions;
 * ```
 */
export interface RelationOptions {
    /** Owning side (many-to-one, one-to-one): the `@column` field on this entity holding the target's primary key. */
    joinColumn?: string;
    /** Inverse side (one-to-many, one-to-one): the `@column` field on the target entity holding this entity's primary key. */
    inverseJoinColumn?: string;
}

/**
 * @internal
 * Shared factory for relation decorators. Records a {@link RelationDefinition}
 * on the class field's `Symbol.metadata` under the `relationsMetadataKey` key.
 */
function relationDecorator(
    kind: RelationKind,
    targetEntity: () => Constructable<object>,
    options: RelationOptions = {}
) {
    return function (_value: undefined, context: ClassFieldDecoratorContext): void {
        const relations = ((context.metadata[relationsMetadataKey] as RelationDefinition[]) ?? []).slice();
        relations.push({
            kind,
            fieldName: String(context.name),
            targetEntity,
            joinColumn: options.joinColumn,
            inverseJoinColumn: options.inverseJoinColumn,
        });
        context.metadata[relationsMetadataKey] = relations;
    };
}

/**
 * Marks a class field as the "one" side of a one-to-many relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
 *   Using a thunk avoids circular-reference issues with forward-declared classes.
 * @param options - Optional join-column overrides.
 *
 * @example
 * ```typescript
 * @entity()
 * class Author {
 *   @primaryColumn()
 *   id: number;
 *
 *   @oneToMany(() => Book)
 *   books: Book[];
 * }
 * ```
 */
export function oneToMany(targetEntity: () => Constructable<object>, options: RelationOptions = {}) {
    return relationDecorator('one-to-many', targetEntity, options);
}

/**
 * Marks a class field as the "many" side of a many-to-one relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
 * @param options - Optional join-column overrides.
 *
 * @example
 * ```typescript
 * @entity()
 * class Book {
 *   @manyToOne(() => Author)
 *   author: Author;
 * }
 * ```
 */
export function manyToOne(targetEntity: () => Constructable<object>, options: RelationOptions = {}) {
    return relationDecorator('many-to-one', targetEntity, options);
}

/**
 * Marks a class field as a many-to-many relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
 * @param options - Optional join-column overrides.
 *
 * @example
 * ```typescript
 * @entity()
 * class Student {
 *   @manyToMany(() => Course)
 *   courses: Course[];
 * }
 * ```
 */
export function manyToMany(targetEntity: () => Constructable<object>, options: RelationOptions = {}) {
    return relationDecorator('many-to-many', targetEntity, options);
}

/**
 * Marks a class field as a one-to-one relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
 * @param options - Optional join-column overrides.
 *
 * @example
 * ```typescript
 * @entity()
 * class UserProfile {
 *   @oneToOne(() => User)
 *   user: User;
 * }
 * ```
 */
export function oneToOne(targetEntity: () => Constructable<object>, options: RelationOptions = {}) {
    return relationDecorator('one-to-one', targetEntity, options);
}

/**
 * @internal
 * Shared factory for entity hook decorators. Records a {@link EntityHookDefinition}
 * on the class method's `Symbol.metadata` under the `entityHooksMetadataKey` key.
 */
function entityHookDecorator(event: EntityHookEvent) {
    return function (_value: unknown, context: ClassMethodDecoratorContext): void {
        const hooks = ((context.metadata[entityHooksMetadataKey] as EntityHookDefinition[]) ?? []).slice();
        hooks.push({ event, methodName: String(context.name) });
        context.metadata[entityHooksMetadataKey] = hooks;
    };
}

/**
 * Marks a method to be invoked by the `EntityManager` **before** an entity is persisted
 * for the first time (insert path).
 *
 * @example
 * ```typescript
 * @entity()
 * class Note {
 *   @column()
 *   createdAt: string;
 *
 *   @prePersist()
 *   onBeforePersist() {
 *     this.createdAt = new Date().toISOString();
 *   }
 * }
 * ```
 */
export function prePersist() {
    return entityHookDecorator('prePersist');
}

/**
 * Marks a method to be invoked by the `EntityManager` **after** an entity is loaded
 * from the data source.
 *
 * @example
 * ```typescript
 * @entity()
 * class User {
 *   @postLoad()
 *   onAfterLoad() {
 *     // initialise transient fields after load
 *   }
 * }
 * ```
 */
export function postLoad() {
    return entityHookDecorator('postLoad');
}

/**
 * Marks a method to be invoked by the `EntityManager` **before** an already-persisted
 * entity is updated (update path).
 *
 * @example
 * ```typescript
 * @entity()
 * class Article {
 *   @column()
 *   updatedAt: string;
 *
 *   @preUpdate()
 *   onBeforeUpdate() {
 *     this.updatedAt = new Date().toISOString();
 *   }
 * }
 * ```
 */
export function preUpdate() {
    return entityHookDecorator('preUpdate');
}

/**
 * Marks a method to be invoked by the `EntityManager` **after** an entity has been
 * removed from the data source.
 *
 * @example
 * ```typescript
 * @entity()
 * class Session {
 *   @postRemove()
 *   onAfterRemove() {
 *     // clean up associated resources
 *   }
 * }
 * ```
 */
export function postRemove() {
    return entityHookDecorator('postRemove');
}
