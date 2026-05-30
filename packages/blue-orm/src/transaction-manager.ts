/** @author opencode */

/**
 * Manages transaction boundaries for a data source.
 *
 * Concrete implementations (e.g., `DrizzleTransactionManager`) wrap
 * the underlying database's begin/commit/rollback primitives.
 * `InMemoryTransactionManager` provides a no-op implementation suitable
 * for in-memory stores and testing.
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
 * An in-memory implementation of {@link TransactionManager}.
 *
 * This implementation does **not** provide rollback semantics
 * (there is no durable state to roll back). It exists to:
 * - Allow code decorated with {@link transactional} to run in tests
 *   without a real database.
 * - Serve as a reference for the `TransactionManager` contract.
 *
 * @since 1.0.0
 */
export class InMemoryTransactionManager implements TransactionManager {
    #active = false;

    /** @inheritdoc */
    isActive(): boolean {
        return this.#active;
    }

    /** @inheritdoc */
    async run<T>(fn: () => T | Promise<T>): Promise<T> {
        this.#active = true;
        try {
            return await fn();
        } finally {
            this.#active = false;
        }
    }
}