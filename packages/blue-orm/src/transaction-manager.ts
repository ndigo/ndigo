/**
 * @module blue-orm
 * @since 1.0.0
 * @author Jeff Rose
 */
import { InMemoryDataSource } from './data-source';

/**
 * Manages transaction boundaries for a data source.
 *
 * Concrete implementations (e.g., `DrizzleTransactionManager`) wrap
 * the underlying database's begin/commit/rollback primitives.
 *
 * Inject a `TransactionManager` into a service class to enable the
 * {@link transactional} decorator to enforce transaction boundaries:
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
 *
 * @since 1.0.0
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
 * On `run()`, the backing {@link InMemoryDataSource}'s stores are snapshotted;
 * if `fn` throws, the stores are restored to that snapshot (rollback).
 * Otherwise the transaction commits (writes stay).
 *
 * @since 1.0.0
 */
export class InMemoryTransactionManager implements TransactionManager {
    #active = false;
    #dataSource: InMemoryDataSource;

    /**
     * @param dataSource - The in-memory data source to snapshot/roll back.
     */
    constructor(dataSource: InMemoryDataSource) {
        this.#dataSource = dataSource;
    }

    /** @inheritdoc */
    isActive(): boolean {
        return this.#active;
    }

    /** @inheritdoc */
    async run<T>(fn: () => T | Promise<T>): Promise<T> {
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
