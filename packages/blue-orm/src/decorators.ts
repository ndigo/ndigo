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
import {
    ColumnDefinition,
    ColumnOptions,
    RelationDefinition,
    RelationKind,
    LifecycleHookDefinition,
    LifecycleEvent,
} from './metadata';
import type { TransactionManager } from './transaction-manager';

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
 * When the decorated method is called on a class instance that has a
 * `transactionManager` property implementing {@link TransactionManager},
 * the method body is automatically wrapped in `transactionManager.run(fn)`.
 *
 * If no `transactionManager` property is found on the instance, the method
 * is called directly (graceful degradation — useful in unit tests that do
 * not need real transaction boundaries).
 *
 * Transaction metadata is also recorded on `Symbol.metadata` under the
 * `transactionalMetadataKey` key so that runtime introspection is possible.
 *
 * @example
 * ```typescript
 * class OrderService {
 *     transactionManager: TransactionManager;
 *
 *     constructor(txManager: TransactionManager) {
 *         this.transactionManager = txManager;
 *     }
 *
 *     @transactional()
 *     async placeOrder(order: Order): Promise<void> {
 *         // automatically wrapped in transactionManager.run(...)
 *     }
 * }
 * ```
 *
 * @since 1.0.0
 */
export function transactional() {
    return function (target: Function, context: ClassMethodDecoratorContext): Function {
        if (context.kind !== 'method') {
            throw new TypeError(`@transactional can only be applied to a method — received '${context.kind}'.`);
        }
        context.metadata[transactionalMetadataKey] = true;

        return async function (this: any, ...args: any[]): Promise<any> {
            const txManager: TransactionManager | undefined = this?.transactionManager;

            if (txManager) {
                return txManager.run(() => target.apply(this, args));
            }

            return target.apply(this, args);
        };
    };
}
