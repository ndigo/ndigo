/**
 * Transaction contracts and the in-memory snapshot manager.
 */
import { IllegalStateError } from '@ndigo/core';
import { InMemoryDataSource } from './data-source';

/**
 * Manages transaction boundaries for a data source.
 *
 * Concrete implementations (e.g., `DrizzleTransactionManager`) wrap
 * the underlying database's begin/commit/rollback primitives.
 *
 * Inject a `TransactionManager` into a service class to enable the
 * {@link decorators.transactional | transactional} decorator to enforce transaction boundaries:
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
 *         // runs inside a transaction
 *     }
 * }
 * ```
 */
export interface TransactionManager {
    /**
     * Executes `fn` within a transaction.
     * If `fn` throws or rejects, the transaction is rolled back.
     * Otherwise, the transaction is committed.
     * @param fn - The work to execute inside the transaction.
     * @returns A promise that resolves to the return value of `fn`.
     */
    run<T>(fn: () => T | Promise<T>): Promise<T>;

    /**
     * Returns `true` if a transaction is currently active.
     */
    isActive(): boolean;
}

/**
 * An in-memory implementation of {@link TransactionManager} with snapshot
 * rollback.
 *
 * On `run()`, the backing {@link InMemoryDataSource}'s stores are
 * deep-snapshotted; if `fn` throws, the stores are restored to that snapshot
 * (rollback). Otherwise the transaction commits (writes stay).
 *
 * Rollback restores the store-visible state: entities read back afterwards
 * are clones of their pre-transaction values. References callers held to
 * entities before the transaction keep their own later mutations — the stores
 * no longer alias them after a rollback.
 *
 * Overlapping `run()` calls are rejected (the backing store can only hold one
 * snapshot at a time); a second concurrent call fails loud rather than
 * silently discarding the first run's commits on rollback (DAT-F2).
 */
export class InMemoryTransactionManager implements TransactionManager {
    #active = false;
    #dataSource: InMemoryDataSource;

    /**
     * Creates the manager over an in-memory data source.
     *
     * @param dataSource - The in-memory data source to snapshot/roll back.
     */
    constructor(dataSource: InMemoryDataSource) {
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
     * Runs `fn` in a transaction, rolling the snapshot back on failure.
     *
     * @param fn - The work to run.
     * @returns The work's result.
     */
    async run<T>(fn: () => T | Promise<T>): Promise<T> {
        if (this.#active) {
            throw new IllegalStateError('InMemoryTransactionManager: a transaction is already active');
        }

        // Set the latch synchronously (no await in between) so a concurrent
        // run() started before this one's first await observes it.
        this.#active = true;
        const snapshot = this.#dataSource.snapshot();
        try {
            const result = await fn();
            // Commit: keep the writes (the snapshot is simply discarded).
            return result;
        } catch (error) {
            // Rollback: rewind the data source to the pre-transaction state.
            this.#dataSource.restore(snapshot);
            throw error;
        } finally {
            this.#active = false;
        }
    }
}
