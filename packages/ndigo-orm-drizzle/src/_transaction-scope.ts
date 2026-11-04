/**
 * Async-context binding between `DrizzleTransactionManager.run(fn)` and the
 * client every statement inside `fn` is issued through.
 *
 * The binding is what makes a transaction boundary real on a pooled client:
 * `@libsql/client` 0.18 gives every local `execute()` its own pooled
 * connection, so an open transaction can only cover the statements that are
 * routed to it. `AsyncLocalStorage` keeps that routing to the async context
 * that entered `run(fn)` (and its descendants); statements issued from another
 * context — a different request, a background job — keep using the pool instead
 * of silently joining someone else's transaction.
 *
 * @module ndigo-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import type { Transaction } from '@libsql/client';

/**
 * The transaction bound to the running async context. Process-wide: a
 * transaction belongs to the data source that opened it, and the client wrapper
 * of any other data source would not be reached from inside it.
 */
const scope = new AsyncLocalStorage<Transaction>();

/**
 * The transaction bound to the calling async context.
 *
 * @returns The open transaction, or `undefined` outside a transaction boundary.
 */
export const currentTransaction = (): Transaction | undefined => scope.getStore();

/**
 * Runs `fn` with `transaction` bound to its async context.
 *
 * @param transaction - The transaction statements should be routed to.
 * @param fn - The transaction body.
 * @returns The body's result once it settles.
 */
export const runInTransaction = <T>(transaction: Transaction, fn: () => Promise<T>): Promise<T> =>
    scope.run(transaction, fn);
