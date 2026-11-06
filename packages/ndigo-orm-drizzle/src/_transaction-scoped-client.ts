/**
 * The `Client` a `DrizzleDataSource` hands out: a pass-through to the pooled
 * libSQL client that routes statements into the transaction of the calling
 * async context (`currentTransaction`) when one is open.
 *
 * Without the routing, a transaction opened by `DrizzleTransactionManager`
 * would cover nothing but its own BEGIN/COMMIT: `@libsql/client` 0.18 runs each
 * `execute()` on its own pooled connection, and returns any connection it finds
 * still in a transaction straight back to the pool with a ROLLBACK.
 */
import type { Client, InArgs, InStatement, ResultSet, Transaction, TransactionMode } from '@libsql/client';
import { currentTransaction } from './_transaction-scope';

/**
 * Wraps a libSQL client so that statement execution prefers the transaction
 * bound to the current async context and falls back to the pooled client.
 *
 * Transaction control itself is never routed: `transaction()` always opens a
 * new transaction on its own pooled connection, which is how Drizzle's own
 * `db.transaction(...)` (and a nested `run()` reached from another context)
 * obtains its handle.
 */
export class TransactionScopedClient implements Client {
    readonly #base: Client;

    /**
     * @param base - The pooled client every non-transactional statement goes to.
     */
    constructor(base: Client) {
        this.#base = base;
    }

    /** {@inheritDoc} */
    get closed(): boolean {
        return this.#base.closed;
    }

    /** {@inheritDoc} */
    get protocol(): string {
        return this.#base.protocol;
    }

    /** {@inheritDoc} */
    execute(stmt: InStatement): Promise<ResultSet>;
    /** {@inheritDoc} */
    execute(sql: string, args?: InArgs): Promise<ResultSet>;
    /** {@inheritDoc} */
    execute(stmtOrSql: InStatement | string, args?: InArgs): Promise<ResultSet> {
        const transaction = currentTransaction();

        if (transaction === undefined) {
            return typeof stmtOrSql === 'string' ? this.#base.execute(stmtOrSql, args) : this.#base.execute(stmtOrSql);
        }
        // `Transaction.execute` takes the object form only, so the positional
        // overload is normalized here.
        return transaction.execute(typeof stmtOrSql === 'string' ? { sql: stmtOrSql, args: args ?? [] } : stmtOrSql);
    }

    /**
     * {@inheritDoc}
     */
    batch(stmts: Array<InStatement | [string, InArgs?]>, mode?: TransactionMode): Promise<Array<ResultSet>> {
        const transaction = currentTransaction();

        if (transaction === undefined) {
            return this.#base.batch(stmts, mode);
        }
        return transaction.batch(
            stmts.map((stmt) => (Array.isArray(stmt) ? { sql: stmt[0], args: stmt[1] ?? [] } : stmt))
        );
    }

    /**
     * {@inheritDoc}
     */
    migrate(stmts: Array<InStatement>): Promise<Array<ResultSet>> {
        return this.#base.migrate(stmts);
    }

    /** {@inheritDoc} */
    executeMultiple(sql: string): Promise<void> {
        const transaction = currentTransaction();

        return transaction === undefined ? this.#base.executeMultiple(sql) : transaction.executeMultiple(sql);
    }

    /** {@inheritDoc} */
    transaction(mode: TransactionMode): Promise<Transaction>;
    /** {@inheritDoc} */
    transaction(): Promise<Transaction>;
    /** {@inheritDoc} */
    transaction(mode?: TransactionMode): Promise<Transaction> {
        return mode === undefined ? this.#base.transaction() : this.#base.transaction(mode);
    }

    /**
     * {@inheritDoc}
     */
    sync(): ReturnType<Client['sync']> {
        return this.#base.sync();
    }

    /** {@inheritDoc} */
    close(): void {
        this.#base.close();
    }

    /** {@inheritDoc} */
    reconnect(): void {
        this.#base.reconnect();
    }
}
