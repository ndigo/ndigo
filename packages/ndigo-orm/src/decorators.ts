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
import { methodAnnotation, type AnnotationKey } from '@ndigo/core';
import { AdviceOrder, type MethodInterceptor, type MethodInvocation } from '@ndigo/advice';
import { Constructable } from '@ndigo/core';

type ClassType = new (...args: unknown[]) => unknown;

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
 * reads through the normal column pipeline (ORM completion plan, Wave 3).
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
 * `@transactional` annotation key. A method carrying it runs inside a
 * transaction when its instance exposes a `transactionManager`.
 *
 * @example
 * ```ts
 * { when: hasAnnotation(transactionalMethod), use: new TransactionalInterceptor() }
 * ```
 */
export const transactionalMethod: AnnotationKey<true> = methodAnnotation<true>(transactionalMetadataKey);

/**
 * Declares that a method runs inside a transaction.
 *
 * Records the declaration and returns the method unchanged — the boundary is
 * opened by {@link TransactionalInterceptor}, not by the decorator. A
 * decorated method is inert on its own: `new Service().run()` runs outside
 * any transaction until the instance is advised.
 *
 * @returns The method decorator.
 * @throws When applied to anything other than a method.
 *
 * @example
 * ```ts
 * class OrderService {
 *     constructor(readonly transactionManager: TransactionManager) {}
 *
 *     @transactional()
 *     async place(order: Order): Promise<void> {}
 * }
 * ```
 */
export function transactional() {
    return function <M extends Function>(target: M, context: ClassMethodDecoratorContext): M {
        if (context.kind !== 'method') {
            throw new TypeError(`@transactional can only be applied to a method — received '${context.kind}'.`);
        }
        // NOTE: AnnotationDecorator is a class-or-method union; `context.kind`
        // was just checked, so this is the method half of the signature.
        const declareMethod = transactionalMethod(true) as unknown as (
            value: M,
            context: ClassMethodDecoratorContext
        ) => M;
        return declareMethod(target, context);
    };
}

/**
 * Runs `@transactional` methods inside a transaction.
 *
 * The interceptor is reentrancy-aware: a transactional method that calls
 * another transactional method joins the open transaction instead of opening
 * a second one. Nested boundaries cannot work otherwise — both transaction
 * managers reject an already-active transaction, and a nested attempt would
 * throw exactly where the caller expected a working composite operation.
 *
 * Joining is tracked per manager, so two independent services with their own
 * managers do not mask each other's boundaries.
 *
 * The interceptor is async because a transaction boundary is: it must await
 * the body to know whether to commit or roll back. A `@transactional` method
 * therefore returns a promise even when its declared type is not one.
 *
 * @example
 * ```ts
 * class OrderService {
 *     constructor(readonly transactionManager: TransactionManager) {}
 *
 *     @transactional()
 *     async place(order: Order): Promise<void> {}
 * }
 *
 * const service = interceptMethods(
 *     new OrderService(tx),
 *     [{ when: hasAnnotation(transactional), use: new TransactionalInterceptor() }]
 * );
 * ```
 */
export class TransactionalInterceptor implements MethodInterceptor {
    /**
     * The transaction band: inside resilience, so a retry starts a fresh
     * transaction per attempt rather than retrying inside one boundary.
     */
    readonly order = AdviceOrder.Transaction;

    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * @returns The string "TransactionalInterceptor".
     */
    get [Symbol.toStringTag](): string {
        return 'TransactionalInterceptor';
    }

    /** Open-boundary depth per manager, so nesting joins instead of throwing. */
    readonly #depth = new WeakMap<TransactionManager, number>();

    /**
     * Opens a transaction around the call, or joins the one already open on
     * the instance's manager.
     *
     * An instance without a `transactionManager` degrades to a plain call —
     * useful in unit tests that do not need real boundaries.
     *
     * @param invocation - The advised call.
     * @param next - Continues the inner chain and runs the method.
     * @returns The call result, resolved inside the boundary.
     */
    async invoke(invocation: MethodInvocation, next: () => unknown): Promise<unknown> {
        const manager = (invocation.target as { transactionManager?: TransactionManager }).transactionManager;
        if (manager === undefined) {
            return next();
        }

        const open = this.#depth.get(manager) ?? 0;
        if (open > 0) {
            // Joined: the outermost boundary decides commit or rollback.
            this.#depth.set(manager, open + 1);
            try {
                return await next();
            } finally {
                this.#depth.set(manager, open);
            }
        }

        this.#depth.set(manager, 1);
        try {
            return await manager.run(() => next());
        } finally {
            this.#depth.set(manager, 0);
        }
    }
}
