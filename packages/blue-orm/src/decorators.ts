/** @author opencode */

import '@tsmetadata/polyfill';
import {
    columnsMetadataKey,
    entityMetadataKey,
    entityNameMetadataKey,
    generatedMetadataKey,
    primaryMetadataKey,
    relationsMetadataKey,
    lifecycleHooksMetadataKey,
    transactionalMetadataKey,
} from './_constants';
import { ColumnDefinition, ColumnOptions, RelationDefinition, RelationKind, LifecycleHookDefinition, LifecycleEvent } from './metadata';

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

/**
 * @internal
 * Shared factory for relation decorators. Records a {@link RelationDefinition}
 * on the class field's `Symbol.metadata` under the `relationsMetadataKey` key.
 */
function relationDecorator(kind: RelationKind, targetEntity: () => ClassType) {
    return function (_value: undefined, context: ClassFieldDecoratorContext): void {
        const relations = ((context.metadata[relationsMetadataKey] as RelationDefinition[]) ?? []).slice();
        relations.push({ kind, fieldName: String(context.name), targetEntity });
        context.metadata[relationsMetadataKey] = relations;
    };
}

/**
 * Marks a class field as the "one" side of a one-to-many relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
 *   Using a thunk avoids circular-reference issues with forward-declared classes.
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
export function oneToMany(targetEntity: () => ClassType) {
    return relationDecorator('one-to-many', targetEntity);
}

/**
 * Marks a class field as the "many" side of a many-to-one relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
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
export function manyToOne(targetEntity: () => ClassType) {
    return relationDecorator('many-to-one', targetEntity);
}

/**
 * Marks a class field as a many-to-many relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
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
export function manyToMany(targetEntity: () => ClassType) {
    return relationDecorator('many-to-many', targetEntity);
}

/**
 * Marks a class field as a one-to-one relation.
 *
 * @param targetEntity - A zero-argument thunk returning the related entity class.
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
export function oneToOne(targetEntity: () => ClassType) {
    return relationDecorator('one-to-one', targetEntity);
}

/**
 * @internal
 * Shared factory for lifecycle hook decorators. Records a {@link LifecycleHookDefinition}
 * on the class method's `Symbol.metadata` under the `lifecycleHooksMetadataKey` key.
 */
function lifecycleDecorator(event: LifecycleEvent) {
    return function (_value: unknown, context: ClassMethodDecoratorContext): void {
        const hooks = ((context.metadata[lifecycleHooksMetadataKey] as LifecycleHookDefinition[]) ?? []).slice();
        hooks.push({ event, methodName: String(context.name) });
        context.metadata[lifecycleHooksMetadataKey] = hooks;
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
    return lifecycleDecorator('prePersist');
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
    return lifecycleDecorator('postLoad');
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
    return lifecycleDecorator('preUpdate');
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
    return lifecycleDecorator('postRemove');
}

/**
 * Marks a method as participating in a transaction.
 *
 * This decorator records transactional metadata on the method via `Symbol.metadata`.
 * Transaction boundary enforcement is **not yet active** — a concrete `TransactionManager`
 * implementation (e.g., from `@blue/orm-drizzle` or `@blue/orm-sqlite`) is required
 * to inspect this metadata and wrap method calls in a real database transaction.
 *
 * @experimental
 *
 * @example
 * ```typescript
 * @entity()
 * class OrderService {
 *   @transactional()
 *   async placeOrder(order: Order): Promise<void> {
 *     // will be wrapped in a transaction once a TransactionManager is wired
 *   }
 * }
 * ```
 */
export function transactional() {
    return function (_value: unknown, context: ClassMethodDecoratorContext): void {
        context.metadata[transactionalMetadataKey] = true;
    };
}
