/**
 * LibSQL-backed {@link JobDriver} — the durable SQL jobs backend.
 *
 * The driver contract lives in `@ndigo/jobs` (platform-neutral); this is the
 * libsql implementation over one table, the third member of the durable-store
 * family beside {@link LibSQLSessionStore} and `LibSQLQueueMessageStore`
 * (same options shape, same awaited schema, same dispose semantics).
 *
 * Contract parity with `InProcessJobDriver` (the reference): `runAt` ordering
 * (`runAt`, then `createdAt`), attempts incremented at claim, expired leases
 * reclaimed by the next `claim`, and terminal `complete`/`fail` removal.
 * `claim` is a single `UPDATE … WHERE id IN (SELECT …) RETURNING` statement,
 * so two workers racing the same table cannot lease the same job.
 *
 * Connection note: a store created with `url` owns an isolated connection —
 * the recommended shape for a worker process. A store borrowing an
 * application's client shares that connection, including any transaction open
 * through it (`DrizzleTransactionManager`); run the worker on its own client
 * when both are in the same process.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, type Client } from '@libsql/client';
import { randomUUID } from 'node:crypto';
import type { ClaimOptions, JobId, JobRecord, JobRequest } from '@ndigo/jobs';
import { parseJobPayload, resolveJobRequest, serializeJobPayload, type JobDriver } from '@ndigo/jobs';

/** Table/column layout (column names stay stable for migrations). One
 * statement each — `execute` is single-statement; schema DDL runs through
 * `batch`. */
const TABLE = 'ndigo_jobs';
const SCHEMA: readonly string[] = [
    `CREATE TABLE IF NOT EXISTS ${TABLE} (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL,
  run_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  timeout_ms INTEGER,
  last_error TEXT,
  state TEXT NOT NULL DEFAULT 'queued',
  lease_expires_at INTEGER
)`,
    `CREATE INDEX IF NOT EXISTS ${TABLE}_ready ON ${TABLE} (state, run_at)`,
    // The claim's expired-lease branch filters state='running' rows on
    // lease_expires_at (unindexed otherwise — a linear scan of every running
    // row per claim pass). Idempotent DDL: existing databases gain it on the
    // next store open.
    `CREATE INDEX IF NOT EXISTS ${TABLE}_lease ON ${TABLE} (state, lease_expires_at)`,
];

const RETURNING_COLUMNS = 'id, type, payload, attempts, max_attempts, run_at, created_at, timeout_ms, last_error';

/**
 * Row shape of {@link LibSQLJobStore}'s `RETURNING` clause, positionally.
 */
type Row = [
    id: string,
    type: string,
    payload: string,
    attempts: number,
    maxAttempts: number,
    runAt: number,
    createdAt: number,
    timeoutMs: number | null,
    lastError: string | null,
];

/**
 * Options for {@link LibSQLJobStore}.
 */
export interface LibSQLJobStoreOptions {
    /**
     * A borrowed libsql client (reuse an existing connection — including an
     * application's transactional data-source client). Disposal leaves it
     * open unless `ownsClient` explicitly transfers ownership.
     */
    client?: Client;
    /** Transfer ownership of an injected client; defaults to false. */
    ownsClient?: boolean;
    /** LibSQL URL (`'file:jobs.db'`, `':memory:'`, remote `libsql://` URL). */
    url?: string;
    /** Authentication token for remote libsql servers. */
    authToken?: string;
    /**
     * Id factory override; defaults to `crypto.randomUUID`.
     */
    idFactory?: () => string;
}

/**
 * Durable {@link JobDriver} on libSQL. Clients created by the store are
 * owned; injected clients are borrowed by default.
 *
 * @since 1.0.0
 */
export class LibSQLJobStore implements JobDriver {
    readonly kind = 'libsql';
    readonly #client: Client;
    readonly #ready: Promise<void>;
    readonly #ownsClient: boolean;
    readonly #idFactory: () => string;
    #disposed = false;

    /**
     * @param options - A borrowed client, or url/authToken to create an owned
     *   client (url defaults to `':memory:'`, matching `DrizzleDataSource`).
     */
    constructor(options: LibSQLJobStoreOptions = {}) {
        this.#client = options.client ?? createClient({ url: options.url ?? ':memory:', authToken: options.authToken });
        this.#ownsClient = options.client === undefined || options.ownsClient === true;
        this.#idFactory = options.idFactory ?? randomUUID;
        this.#ready = this.#client.batch(SCHEMA.map((sql) => ({ sql }))).then(() => undefined);
        // Attach a handler immediately; methods still await the original
        // promise and propagate schema errors, even when first used later.
        void this.#ready.catch(() => undefined);
    }

    /** @inheritdoc */
    async enqueue(request: JobRequest): Promise<JobRecord> {
        await this.#ready;
        this.#assertOpen();
        const now = Date.now();
        const resolved = resolveJobRequest(request, now);
        const record: JobRecord = {
            id: this.#idFactory(),
            type: resolved.type,
            payload: parseJobPayload(serializeJobPayload(resolved.payload)),
            attempts: 0,
            maxAttempts: resolved.maxAttempts,
            runAt: resolved.runAt,
            createdAt: now,
            ...(resolved.timeoutMs !== undefined ? { timeoutMs: resolved.timeoutMs } : {}),
        };
        await this.#client.execute({
            sql: `INSERT INTO ${TABLE} (id, type, payload, attempts, max_attempts, run_at, created_at, timeout_ms)
                  VALUES (?, ?, ?, 0, ?, ?, ?, ?)`,
            args: [
                record.id,
                record.type,
                serializeJobPayload(record.payload),
                record.maxAttempts,
                record.runAt,
                record.createdAt,
                record.timeoutMs ?? null,
            ],
        });
        return record;
    }

    /** @inheritdoc */
    async claim(options: ClaimOptions): Promise<JobRecord[]> {
        await this.#ready;
        this.#assertOpen();
        assertClaimOptions(options);
        const now = Date.now();
        const result = await this.#client.execute({
            // One statement: expired leases and ready rows are selected
            // together and claimed atomically — two workers cannot lease the
            // same job (the reference driver's reclaim-then-pick equivalent).
            sql: `UPDATE ${TABLE}
                  SET state = 'running', attempts = attempts + 1, lease_expires_at = ?
                  WHERE id IN (
                    SELECT id FROM ${TABLE}
                    WHERE (state = 'queued' AND run_at <= ?)
                       OR (state = 'running' AND lease_expires_at IS NOT NULL AND lease_expires_at <= ?)
                    ORDER BY run_at ASC, created_at ASC
                    LIMIT ?
                  )
                  RETURNING ${RETURNING_COLUMNS}`,
            args: [now + options.leaseMs, now, now, options.limit],
        });
        return result.rows.map((row) => decodeRow(row as unknown as Row));
    }

    /** @inheritdoc */
    async complete(id: JobId): Promise<void> {
        await this.#ready;
        this.#assertOpen();
        await this.#client.execute({ sql: `DELETE FROM ${TABLE} WHERE id = ?`, args: [id] });
    }

    /** @inheritdoc */
    async retry(id: JobId, runAt: number, lastError: string): Promise<void> {
        await this.#ready;
        this.#assertOpen();
        await this.#client.execute({
            sql: `UPDATE ${TABLE}
                  SET state = 'queued', run_at = ?, last_error = ?, lease_expires_at = NULL
                  WHERE id = ?`,
            args: [runAt, lastError, id],
        });
    }

    /** @inheritdoc */
    async fail(id: JobId, lastError: string): Promise<void> {
        await this.#ready;
        this.#assertOpen();
        void lastError; // terminal errors surface through telemetry/logs, not storage (AD-72 D-2)
        await this.#client.execute({ sql: `DELETE FROM ${TABLE} WHERE id = ?`, args: [id] });
    }

    /** @inheritdoc */
    async heartbeat(id: JobId, leaseMs: number): Promise<void> {
        await this.#ready;
        this.#assertOpen();
        await this.#client.execute({
            sql: `UPDATE ${TABLE} SET lease_expires_at = ? WHERE id = ? AND state = 'running'`,
            args: [Date.now() + leaseMs, id],
        });
    }

    /** @inheritdoc */
    async size(): Promise<number> {
        await this.#ready;
        this.#assertOpen();
        const result = await this.#client.execute({ sql: `SELECT COUNT(*) FROM ${TABLE}`, args: [] });
        return Number(result.rows[0]?.[0] ?? 0);
    }

    /**
     * Release this store. Idempotent; closes only owned clients. Later
     * operations reject with a disposed-store error, including when the
     * client is borrowed. Pending operations are not drained; callers must
     * stop and drain the runner first.
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
            throw new Error('libsql job store is disposed');
        }
    }
}

/**
 * Decodes one `RETURNING` row into a {@link JobRecord}.
 *
 * @param row - The positional row.
 * @returns The record.
 */
function decodeRow(row: Row): JobRecord {
    return {
        id: row[0],
        type: row[1],
        payload: parseJobPayload(row[2]),
        attempts: Number(row[3]),
        maxAttempts: Number(row[4]),
        runAt: Number(row[5]),
        createdAt: Number(row[6]),
        ...(row[7] !== null ? { timeoutMs: Number(row[7]) } : {}),
        ...(row[8] !== null ? { lastError: row[8] } : {}),
    };
}

/**
 * Validates a claim window (positive integer limit, positive finite lease).
 *
 * @param options - The claim options to validate.
 */
function assertClaimOptions(options: ClaimOptions): void {
    if (!Number.isSafeInteger(options.limit) || options.limit < 1) {
        throw new TypeError(`claim: limit must be a positive integer, got ${String(options.limit)}`);
    }
    if (!Number.isFinite(options.leaseMs) || options.leaseMs <= 0) {
        throw new TypeError(`claim: leaseMs must be a positive number, got ${String(options.leaseMs)}`);
    }
}
