/**
 * LibSQL/Drizzle-backed transaction manager (AD-07 completion).
 * @module ndigo-orm-drizzle
 * @since 1.0.0
 * @author Jeff Rose
 */
import { TransactionManager } from '@ndigo/orm';
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

        // Claim the boundary synchronously (no await in between) so a
        // concurrent run() cannot slip another BEGIN onto the same connection
        // while this one is starting up (DAT-F9).
        this.#active = true;
        let begun = false;
        try {
            await this.#dataSource.client.execute('BEGIN');
            begun = true;
            const result = await fn();
            await this.#dataSource.client.execute('COMMIT');
            return result;
        } catch (error) {
            // Only roll back a transaction that actually opened; a failed
            // BEGIN must surface its own error, not a masked ROLLBACK failure.
            if (begun) {
                await this.#dataSource.client.execute('ROLLBACK');
            }
            throw error;
        } finally {
            this.#active = false;
        }
    }
}
