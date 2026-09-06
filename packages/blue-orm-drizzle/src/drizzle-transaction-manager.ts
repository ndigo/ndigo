/**
 * LibSQL/Drizzle-backed transaction manager (AD-7 completion).
 *
 * Implements the async {@link TransactionManager} contract from `@blue/orm`
 * by issuing `BEGIN` / `COMMIT` / `ROLLBACK` on the underlying libSQL client.
 * Pair with the `@transactional()` decorator: the decorated method's
 * `transactionManager` property receives this instance and every call runs
 * inside a real SQL transaction.
 *
 * @module
 */

import { TransactionManager } from '@blue/orm';
import { DrizzleDataSource } from './drizzle-data-source';

/**
 * Executes `fn` inside a BEGIN/COMMIT/ROLLBACK transaction on the libSQL
 * connection. When `fn` rejects, the transaction is rolled back and the
 * original error is rethrown.
 *
 * Nested calls throw: `@transactional` already serializes the boundary, and a
 * SQL connection can only hold one open transaction.
 *
 * @since 1.0.0
 */
export class DrizzleTransactionManager implements TransactionManager {
    readonly #dataSource: DrizzleDataSource;
    #active = false;

    /**
     * @param dataSource - The Drizzle data source whose connection is
     *   bracketed by the transaction.
     */
    constructor(dataSource: DrizzleDataSource) {
        this.#dataSource = dataSource;
    }

    /** @inheritdoc */
    isActive(): boolean {
        return this.#active;
    }

    /** @inheritdoc */
    async run<T>(fn: () => T | Promise<T>): Promise<T> {
        if (this.#active) {
            throw new Error('DrizzleTransactionManager: a transaction is already active');
        }

        await this.#dataSource.client.execute('BEGIN');
        this.#active = true;
        try {
            const result = await fn();
            await this.#dataSource.client.execute('COMMIT');
            return result;
        } catch (error) {
            await this.#dataSource.client.execute('ROLLBACK');
            throw error;
        } finally {
            this.#active = false;
        }
    }
}
