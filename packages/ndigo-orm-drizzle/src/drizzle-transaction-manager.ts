/**
 * LibSQL/Drizzle-backed transaction manager (AD-07 completion).
 */
import { TransactionManager } from '@ndigo/orm';
import { IllegalStateError } from '@ndigo/core';
import { runInTransaction } from './_transaction-scope';
import { DrizzleDataSource } from './drizzle-data-source';

/**
 * Executes `fn` inside an interactive libSQL transaction: everything `fn`
 * issues through the data source's client — raw statements, the Drizzle
 * database, the durable stores built on the same client — runs in the
 * transaction, and it is committed on success or rolled back on failure.
 *
 * The boundary is bound to `fn`'s async context (`runInTransaction` in
 * `_transaction-scope.ts`), so statements from elsewhere — `@libsql/client`
 * 0.18 pools connections, one per statement — keep running on their own
 * connections instead of joining it.
 *
 * The transaction opens with `BEGIN IMMEDIATE` (`mode: 'write'`): with a pooled
 * client the write lock is claimed at BEGIN rather than upgraded on the first
 * write, which is the mode libSQL's own clients default to and what keeps a
 * concurrent writer from failing the upgrade mid-transaction.
 *
 * Nested calls throw: `@transactional` already serializes the boundary
 * (DAT-F9), and a transaction owns one connection for its lifetime.
 */
export class DrizzleTransactionManager implements TransactionManager {
    readonly #dataSource: DrizzleDataSource;
    #active = false;

    /**
     * Creates the manager over a Drizzle data source.
     *
     * @param dataSource - The Drizzle data source whose connection is
     *   bracketed by the transaction.
     */
    constructor(dataSource: DrizzleDataSource) {
        this.#dataSource = dataSource;
    }

    /**
     * Whether a transaction is currently active.
     *
     * @returns Whether a run is in progress.
     */
    isActive(): boolean {
        return this.#active;
    }

    /**
     * Runs `fn` inside an interactive libSQL transaction.
     *
     * @param fn - The work to run.
     * @returns The work's result.
     */
    async run<T>(fn: () => T | Promise<T>): Promise<T> {
        if (this.#active) {
            throw new IllegalStateError('DrizzleTransactionManager: a transaction is already active');
        }

        // Claim the boundary synchronously (no await in between) so a
        // concurrent run() cannot slip another transaction past the latch
        // while this one is acquiring its connection (DAT-F9).
        this.#active = true;
        try {
            const transaction = await this.#dataSource.client.transaction('write');

            try {
                const result = await runInTransaction(transaction, async () => fn());
                await transaction.commit();
                return result;
            } catch (error) {
                // A failed body or a failed COMMIT: the original error must
                // surface, not a rollback error. `close()` is the last resort
                // when the transaction is already gone.
                await transaction.rollback().catch(() => transaction.close());
                throw error;
            }
        } finally {
            this.#active = false;
        }
    }
}
