/**
 * LibSQL-backed {@link OutboxStore} — the transactional outbox on the
 * application's data source.
 *
 * **Construction is the wiring.** Hand the store the *same client* the
 * application's `DrizzleDataSource` uses, and an `append()` made inside a
 * `@transactional` method writes through that connection — joining the open
 * `BEGIN`/`COMMIT`/`ROLLBACK` bracket `DrizzleTransactionManager` runs. The
 * side effect therefore commits or rolls back with the business data; the
 * `OutboxRelay` publishes what actually committed:
 *
 * ```ts
 * class OrderService {
 *     transactionManager: TransactionManager;
 *     readonly #outbox: LibSQLOutboxStore;
 *
 *     @transactional()
 *     async placeOrder(order: Order): Promise<void> {
 *         await this.#repo.save(order);
 *         await this.#outbox.append({ type: 'order.placed', payload: { id: order.id } });
 *         // commit ⇒ relay publishes; throw ⇒ neither survives
 *     }
 * }
 * ```
 *
 * Claims are lease-based (`claimPending` sets a lease; expired leases are
 * re-claimable), so a crashed relay or failed publish re-surfaces the entry —
 * at-least-once, consumers subscribe idempotently (AD-72 D-6). Published rows
 * are retained until `prunePublished`.
 *
 * Same options/dispose semantics as the sibling durable stores: owned
 * URL-created clients, borrowed injected clients unless `ownsClient`.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'node:crypto';
import type { JobId } from '@ndigo/jobs';
import {
    parseJobPayload,
    serializeJobPayload,
    type OutboxClaimOptions,
    type OutboxEntry,
    type OutboxStore,
} from '@ndigo/jobs';

/** Table/column layout (column names stay stable for migrations). One
 * statement each — `execute` is single-statement; schema DDL runs through
 * `batch`. */
const TABLE = 'ndigo_outbox';
const SCHEMA: readonly string[] = [
    `CREATE TABLE IF NOT EXISTS ${TABLE} (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  occurred_at INTEGER NOT NULL,
  lease_expires_at INTEGER,
  published_at INTEGER
)`,
    `CREATE INDEX IF NOT EXISTS ${TABLE}_pending ON ${TABLE} (published_at, occurred_at)`,
];

const DEFAULT_CLAIM_LIMIT = 100;
const DEFAULT_LEASE_MS = 60_000;

/**
 * Row shape of {@link LibSQLOutboxStore}'s `RETURNING` clause, positionally.
 */
type Row = [id: string, type: string, payload: string, occurredAt: number];

/**
 * Options for {@link LibSQLOutboxStore}.
 */
export interface LibSQLOutboxStoreOptions {
    /**
     * The application's libsql client — pass the `DrizzleDataSource.client`
     * to join `@transactional` boundaries. Borrowed by default.
     */
    client?: Client;
    /** Transfer ownership of an injected client; defaults to false. */
    ownsClient?: boolean;
    /** LibSQL URL (`'file:outbox.db'`, `':memory:'`, remote `libsql://` URL). */
    url?: string;
    /** Authentication token for remote libsql servers. */
    authToken?: string;
    /** Id factory override; defaults to `crypto.randomUUID`. */
    idFactory?: () => string;
}

/**
 * Durable {@link OutboxStore} on libSQL. Every method awaits schema creation;
 * clients created by the store are owned, injected clients are borrowed by
 * default.
 *
 * @since 1.0.0
 */
export class LibSQLOutboxStore implements OutboxStore {
    readonly #client: Client;
    readonly #ready: Promise<void>;
    readonly #ownsClient: boolean;
    readonly #idFactory: () => string;
    #disposed = false;

    /**
     * @param options - The data-source client (recommended), or url/authToken
     *   to create an owned client (url defaults to `':memory:'`).
     */
    constructor(options: LibSQLOutboxStoreOptions = {}) {
        this.#client = options.client ?? createClient({ url: options.url ?? ':memory:', authToken: options.authToken });
        this.#ownsClient = options.client === undefined || options.ownsClient === true;
        this.#idFactory = options.idFactory ?? randomUUID;
        this.#ready = this.#client.batch(SCHEMA.map((sql) => ({ sql }))).then(() => undefined);
        // Attach a handler immediately; methods still await the original
        // promise and propagate schema errors, even when first used later.
        void this.#ready.catch(() => undefined);
    }

    /** @inheritdoc */
    async append(input: { type: string; payload?: unknown }): Promise<OutboxEntry> {
        await this.#ready;
        this.#assertOpen();
        if (
            input === null ||
            typeof input !== 'object' ||
            typeof input.type !== 'string' ||
            input.type.trim().length === 0
        ) {
            throw new TypeError(`outbox append: 'type' must be a non-empty string, got ${JSON.stringify(input?.type)}`);
        }
        const entry: OutboxEntry = {
            id: this.#idFactory(),
            type: input.type,
            payload: parseJobPayload(serializeJobPayload(input.payload)),
            occurredAt: Date.now(),
        };
        await this.#client.execute({
            sql: `INSERT INTO ${TABLE} (id, type, payload, occurred_at) VALUES (?, ?, ?, ?)`,
            args: [entry.id, entry.type, serializeJobPayload(entry.payload), entry.occurredAt],
        });
        return entry;
    }

    /** @inheritdoc */
    async claimPending(options: OutboxClaimOptions = {}): Promise<OutboxEntry[]> {
        await this.#ready;
        this.#assertOpen();
        const limit = options.limit ?? DEFAULT_CLAIM_LIMIT;
        const leaseMs = options.leaseMs ?? DEFAULT_LEASE_MS;
        if (!Number.isSafeInteger(limit) || limit < 1) {
            throw new TypeError(`outbox claim: limit must be a positive integer, got ${String(options.limit)}`);
        }
        if (!Number.isFinite(leaseMs) || leaseMs <= 0) {
            throw new TypeError(`outbox claim: leaseMs must be a positive number, got ${String(options.leaseMs)}`);
        }
        const now = Date.now();
        const result = await this.#client.execute({
            sql: `UPDATE ${TABLE}
                  SET lease_expires_at = ?
                  WHERE id IN (
                    SELECT id FROM ${TABLE}
                    WHERE published_at IS NULL
                      AND (lease_expires_at IS NULL OR lease_expires_at <= ?)
                    ORDER BY occurred_at ASC, id ASC
                    LIMIT ?
                  )
                  RETURNING id, type, payload, occurred_at`,
            args: [now + leaseMs, now, limit],
        });
        return result.rows.map((row) => decodeRow(row as unknown as Row));
    }

    /** @inheritdoc */
    async markPublished(id: JobId): Promise<void> {
        await this.#ready;
        this.#assertOpen();
        await this.#client.execute({
            sql: `UPDATE ${TABLE} SET published_at = ? WHERE id = ?`,
            args: [Date.now(), id],
        });
    }

    /** @inheritdoc */
    async prunePublished(olderThanMs: number): Promise<number> {
        await this.#ready;
        this.#assertOpen();
        const result = await this.#client.execute({
            sql: `DELETE FROM ${TABLE} WHERE published_at IS NOT NULL AND published_at <= ?`,
            args: [Date.now() - olderThanMs],
        });
        return result.rowsAffected;
    }

    /** @inheritdoc */
    async size(): Promise<number> {
        await this.#ready;
        this.#assertOpen();
        const result = await this.#client.execute({
            sql: `SELECT COUNT(*) FROM ${TABLE} WHERE published_at IS NULL`,
            args: [],
        });
        return Number(result.rows[0]?.[0] ?? 0);
    }

    /**
     * Release this store. Idempotent; closes only owned clients. Later
     * operations reject with a disposed-store error, including when the
     * client is borrowed. Pending operations are not drained; stop the relay
     * first.
     */
    async close(): Promise<void> {
        if (this.#disposed) {
            return;
        }
        this.#disposed = true;
        if (this.#ownsClient) {
            this.#client.close();
        }
    }

    #assertOpen(): void {
        if (this.#disposed) {
            throw new Error('libsql outbox store is disposed');
        }
    }
}

/**
 * Decodes one `RETURNING` row into an {@link OutboxEntry}.
 *
 * @param row - The positional row.
 * @returns The entry.
 */
function decodeRow(row: Row): OutboxEntry {
    return {
        id: row[0],
        type: row[1],
        payload: parseJobPayload(row[2]),
        occurredAt: Number(row[3]),
    };
}
