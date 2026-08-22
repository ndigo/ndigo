/** @author opencode */
import '@tsmetadata/polyfill';
import { ColumnOptions } from './metadata';
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
export declare function entity(tableName?: string): <T extends ClassType>(target: T, context: ClassDecoratorContext) => T;
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
export declare function column(options?: ColumnOptions): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function primaryColumn(): (value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function generated(): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function oneToMany(targetEntity: () => ClassType): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function manyToOne(targetEntity: () => ClassType): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function manyToMany(targetEntity: () => ClassType): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function oneToOne(targetEntity: () => ClassType): (_value: undefined, context: ClassFieldDecoratorContext) => void;
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
export declare function prePersist(): (_value: unknown, context: ClassMethodDecoratorContext) => void;
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
export declare function postLoad(): (_value: unknown, context: ClassMethodDecoratorContext) => void;
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
export declare function preUpdate(): (_value: unknown, context: ClassMethodDecoratorContext) => void;
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
export declare function postRemove(): (_value: unknown, context: ClassMethodDecoratorContext) => void;
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
export declare function transactional(): (target: Function, context: ClassMethodDecoratorContext) => Function;
export {};
