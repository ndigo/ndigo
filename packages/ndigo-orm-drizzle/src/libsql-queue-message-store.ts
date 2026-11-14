/**
 * LibSQL-backed {@link QueueMessageStore} — the durable `/queue` backend.
 *
 * The store contract lives in `@ndigo/socket` (isomorphic); this is the
 * libsql implementation of it: append/replay/prune/has over one table.
 * Swap it in as the broker's `queueStore` for persistence:
 *
 * ```ts
 * const broker = new StompBroker({ queueStore: new LibSQLQueueMessageStore({ url: 'file:queues.db' }) });
 * ```
 *
 * Contract parity with the in-memory backend (the reference): the replay
 * window (an absent/non-finite `limit` is unbounded), the inclusive TTL
 * boundary (age === `ttlMs` is expired), destination validation
 * (`RangeError` unless a non-empty string) and drop-oldest retention are
 * identical. Two differences are inherent to SQL storage and are relied
 * on rather than hidden:
 * - **Idempotent append** — `(destination, message_id)` is unique, so a
 *   retried append (client error mid-insert, connection retry) returns the
 *   original `seq` instead of duplicating; the memory store would append a
 *   second copy.
 * - **Global `seq`** — the table's `AUTOINCREMENT` key is monotonic across
 *   EVERY destination and never reused after prune, while the memory
 *   store's `seq` is per-destination and 1-based. Both honor the
 *   contract's watermark rule (gaps are expected; resume with `afterSeq`).
 *
 * Design:
 * - **Ordering** — the `AUTOINCREMENT` primary key doubles as the
 *   store-issued `seq`: globally monotonic, never reused after prune
 *   (SQLite autoincrement semantics), so `afterSeq` resume and
 *   per-destination ordering hold even across eviction.
 * - **Prune** — TTL and count-bound deletes run in single statements;
 *   `storedAt` is epoch ms on the appending node.
 *
 * Bodies are stored as BLOBs with a text/binary tag (`body_kind`) so
 * replay honors the D8 contract: text frames come back as UTF-8 strings,
 * binary frames byte-exact as `Uint8Array`. `headers` round-trips as
 * JSON.
 *
 * The store owns clients it creates. Injected clients are borrowed unless
 * `ownsClient: true` explicitly transfers ownership. {@link LibSQLQueueMessageStore.dispose}
 * closes only owned clients and rejects later store operations; it does not
 * drain pending writes. Stop and drain the broker before disposing the store.
 */
import { createClient, type Client } from '@libsql/client';
import { IllegalStateError } from '@ndigo/core';
import type { QueueMessageStore, StoredQueueMessage, StompBody } from '@ndigo/socket';

/** Table/column layout (column names stay stable for migrations). One
 * statement each — `execute` is single-statement; schema DDL runs through
 * `batch`. */
const TABLE = 'ndigo_queue_messages';
const SCHEMA: readonly string[] = [
    `CREATE TABLE IF NOT EXISTS ${TABLE} (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destination TEXT NOT NULL,
  message_id TEXT NOT NULL,
  body BLOB NOT NULL,
  body_kind INTEGER NOT NULL,
  headers TEXT NOT NULL,
  stored_at INTEGER NOT NULL,
  UNIQUE (destination, message_id)
)`,
    `CREATE INDEX IF NOT EXISTS ${TABLE}_order ON ${TABLE} (destination, id)`,
];

const SELECT_COLUMNS = 'destination, id, message_id, body, body_kind, headers, stored_at';

/**
 * Options for {@link LibSQLQueueMessageStore}.
 */
export interface LibSQLQueueMessageStoreOptions {
    /**
     * A borrowed libsql client (reuse an existing connection). Disposal
     * leaves it open unless `ownsClient` explicitly transfers ownership.
     */
    client?: Client;
    /** Transfer ownership of an injected client; defaults to false. */
    ownsClient?: boolean;
    /** LibSQL URL (`'file:queues.db'`, `':memory:'`, remote `libsql://` URL). */
    url?: string;
    /** Authentication token for remote libsql servers. */
    authToken?: string;
}

/**
 * Durable `/queue` backend on libsql. Every method awaits schema creation.
 * Multi-writer processes on one database are safe by virtue of atomic
 * AUTOINCREMENT — seq issuance is a single INSERT. Clients created by the
 * store are owned; injected clients are borrowed by default.
 */
export class LibSQLQueueMessageStore implements QueueMessageStore {
    /** Store identifier (`'libsql'`). */
    readonly kind = 'libsql';
    readonly #client: Client;
    readonly #ready: Promise<void>;
    readonly #ownsClient: boolean;
    #disposed = false;

    /**
     * @param options - A borrowed client, or url/authToken to create an owned
     *   client (url defaults to `':memory:'`, matching `DrizzleDataSource`).
     */
    constructor(options: LibSQLQueueMessageStoreOptions = {}) {
        this.#client = options.client ?? createClient({ url: options.url ?? ':memory:', authToken: options.authToken });
        this.#ownsClient = options.client === undefined || options.ownsClient === true;
        this.#ready = this.#client.batch(SCHEMA.map((sql) => ({ sql }))).then(() => undefined);
        // Attach a handler immediately; methods still await the original
        // promise and propagate schema errors, even when first used later.
        void this.#ready.catch(() => undefined);
    }

    /**
     * Appends one message to its destination.
     *
     * @param message - The message payload (sequence and stored time are assigned here).
     * @returns The stored message.
     */
    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        const destination = assertDestination(message.destination);
        await this.#ready;
        this.#assertOpen();
        const { body, bodyKind } = encodeBody(message.body);
        const storedAt = Date.now();
        const result = await this.#client.execute({
            sql: `INSERT INTO ${TABLE} (destination, message_id, body, body_kind, headers, stored_at)
                  VALUES (?, ?, ?, ?, ?, ?)
                  ON CONFLICT (destination, message_id) DO NOTHING
                  RETURNING id, stored_at`,
            args: [destination, message.messageId, body, bodyKind, JSON.stringify(message.headers), storedAt],
        });
        if (result.rows.length === 1) {
            const row = result.rows[0];
            return {
                messageId: message.messageId,
                destination,
                body: message.body,
                headers: { ...message.headers },
                seq: Number(row[0]),
                storedAt: Number(row[1]),
            };
        }
        // Conflict: a retried append of a message already stored — return
        // the original seq (idempotent).
        const existing = await this.#client.execute({
            sql: `SELECT ${SELECT_COLUMNS} FROM ${TABLE} WHERE destination = ? AND message_id = ?`,
            args: [destination, message.messageId],
        });
        const row = existing.rows[0];
        if (row === undefined) {
            throw new Error('libsql queue append conflicted but no row found');
        }
        // NOTE: bridging to Row — the source type is wider than this consumer's contract.
        return decodeRow(row as unknown as Row);
    }

    /**
     * Replays retained messages after a sequence cursor.
     *
     * @param destination - The destination to replay.
     * @param options - Sequence cursor and result limit.
     * @returns The retained messages in sequence order.
     */
    async replay(
        destination: string,
        options: { afterSeq?: number; limit?: number } = {}
    ): Promise<StoredQueueMessage[]> {
        const name = assertDestination(destination);
        await this.#ready;
        this.#assertOpen();
        const afterSeq = Math.max(0, Math.floor(options.afterSeq ?? 0));
        // Contract parity with the memory store: absent / `NaN` / `+Infinity`
        // are unbounded (LIMIT -1 in SQLite), other values floor and clamp
        // at 0.
        const requested =
            options.limit === undefined ? Number.POSITIVE_INFINITY : Math.max(0, Math.floor(options.limit));
        const limit = Number.isFinite(requested) ? requested : -1;
        const result = await this.#client.execute({
            // `limit` is a NEWEST-window (contract parity with the memory
            // store): take the tail via DESC, then re-ASCend for append
            // order. LIMIT -1 = unlimited (SQLite).
            sql: `SELECT ${SELECT_COLUMNS} FROM (
                    SELECT ${SELECT_COLUMNS} FROM ${TABLE}
                    WHERE destination = ? AND id > ?
                    ORDER BY id DESC LIMIT ?
                  ) ORDER BY id ASC`,
            args: [name, afterSeq, limit],
        });
        // NOTE: bridging to Row — the source type is wider than this consumer's contract.
        return result.rows.map((row) => decodeRow(row as unknown as Row));
    }

    /**
     * Applies a retention policy to one destination.
     *
     * @param destination - The destination to prune.
     * @param retention - TTL and count bounds.
     * @returns The number of pruned messages.
     */
    async prune(destination: string, retention: { ttlMs?: number; maxMessages?: number }): Promise<number> {
        const name = assertDestination(destination);
        await this.#ready;
        this.#assertOpen();
        let pruned = 0;
        if (retention.ttlMs !== undefined) {
            const cutoff = Date.now() - retention.ttlMs;
            const expired = await this.#client.execute({
                // Inclusive boundary (contract parity): age === ttlMs is expired.
                sql: `DELETE FROM ${TABLE} WHERE destination = ? AND stored_at <= ?`,
                args: [name, cutoff],
            });
            pruned += expired.rowsAffected;
        }
        if (retention.maxMessages !== undefined && retention.maxMessages >= 0) {
            const overflow = await this.#client.execute({
                // Keep the NEWEST maxMessages rows of the destination;
                // delete the rest, oldest first.
                sql: `DELETE FROM ${TABLE}
                      WHERE destination = ? AND id IN (
                        SELECT id FROM ${TABLE}
                        WHERE destination = ?
                        ORDER BY id ASC
                        LIMIT (SELECT MAX(0, COUNT(*) - ?) FROM ${TABLE} WHERE destination = ?)
                      )`,
                args: [name, name, retention.maxMessages, name],
            });
            pruned += overflow.rowsAffected;
        }
        return pruned;
    }

    /**
     * Whether a destination currently retains messages.
     *
     * @param destination - The destination to check.
     * @returns `true` when the destination has retained messages.
     */
    async has(destination: string): Promise<boolean> {
        const name = assertDestination(destination);
        await this.#ready;
        this.#assertOpen();
        const result = await this.#client.execute({
            sql: `SELECT 1 FROM ${TABLE} WHERE destination = ? LIMIT 1`,
            args: [name],
        });
        return result.rows.length > 0;
    }

    /**
     * Release this store. Idempotent; closes only owned clients. Later
     * operations reject with a disposed-store error, including when the
     * client is borrowed. Pending operations are not drained; callers must
     * stop and drain the broker first.
     */
    dispose(): void {
        if (this.#disposed) return;
        this.#disposed = true;
        if (this.#ownsClient) this.#client.close();
    }

    #assertOpen(): void {
        if (this.#disposed) throw new IllegalStateError('libsql queue store is disposed');
    }
}

/** Reject a destination that is not a non-empty string — the contract
 * validation, shared verbatim with the in-memory store. */
function assertDestination(destination: string): string {
    if (typeof destination !== 'string' || destination.length === 0) {
        throw new RangeError(`invalid queue destination: ${String(destination)}`);
    }
    return destination;
}

/** One result row: column order matches `SELECT_COLUMNS`. */
type Row = [
    destination: string,
    seq: number,
    messageId: string,
    body: Uint8Array,
    bodyKind: number,
    headers: string,
    storedAt: number,
];

/** Decode a stored row back to the contract type (rows are indexable
 * objects, not arrays — no destructuring). */
function decodeRow(row: Row): StoredQueueMessage {
    const rawBody = row[3] as Uint8Array | ArrayBuffer;
    const bodyBytes = rawBody instanceof Uint8Array ? rawBody : new Uint8Array(rawBody);
    return {
        destination: String(row[0]),
        seq: Number(row[1]),
        messageId: String(row[2]),
        body: Number(row[4]) === 1 ? bodyBytes : new TextDecoder('utf-8', { fatal: false }).decode(bodyBytes),
        headers: JSON.parse(String(row[5])) as Record<string, string>,
        storedAt: Number(row[6]),
    };
}

/** Encode a body for storage: BLOB bytes + 0 text / 1 binary tag. */
function encodeBody(body: StompBody): { body: Uint8Array; bodyKind: number } {
    if (typeof body === 'string') {
        return { body: new TextEncoder().encode(body), bodyKind: 0 };
    }
    return { body, bodyKind: 1 };
}
