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

    /** @inheritdoc */
    get closed(): boolean {
        return this.#base.closed;
    }

    /** @inheritdoc */
    get protocol(): string {
        return this.#base.protocol;
    }

    /** @inheritdoc */
    execute(stmt: InStatement): Promise<ResultSet>;
    /** @inheritdoc */
    execute(sql: string, args?: InArgs): Promise<ResultSet>;
    /** @inheritdoc */
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
     * @inheritdoc
     *
     * Inside a transaction the mode argument is moot — the statements run in the
     * transaction's own mode rather than in a batch of their own.
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
     * @inheritdoc
     *
     * Never routed: `PRAGMA foreign_keys=off` around a migration body belongs on
     * a connection of its own, and `Transaction` has no `migrate`.
     */
    migrate(stmts: Array<InStatement>): Promise<Array<ResultSet>> {
        return this.#base.migrate(stmts);
    }

    /** @inheritdoc */
    executeMultiple(sql: string): Promise<void> {
        const transaction = currentTransaction();

        return transaction === undefined ? this.#base.executeMultiple(sql) : transaction.executeMultiple(sql);
    }

    /** @inheritdoc */
    transaction(mode: TransactionMode): Promise<Transaction>;
    /** @inheritdoc */
    transaction(): Promise<Transaction>;
    /** @inheritdoc */
    transaction(mode?: TransactionMode): Promise<Transaction> {
        return mode === undefined ? this.#base.transaction() : this.#base.transaction(mode);
    }

    /**
     * @inheritdoc
     *
     * Never routed: replication sync is a client-level operation and cannot run
     * inside a transaction.
     */
    sync(): ReturnType<Client['sync']> {
        return this.#base.sync();
    }

    /** @inheritdoc */
    close(): void {
        this.#base.close();
    }

    /** @inheritdoc */
    reconnect(): void {
        this.#base.reconnect();
    }
}
