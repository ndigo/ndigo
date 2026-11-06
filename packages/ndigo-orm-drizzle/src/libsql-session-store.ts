/**
 * Durable opaque sessions on LibSQL. Schema creation is deliberately explicit:
 * await store.initialize() during application provisioning/startup, or provision
 * the same table through an application migration. Construction performs no SQL.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createClient, type Client, type InValue, type Row } from '@libsql/client';
import { DefaultPrincipal, type SessionRecord, type SessionStore } from '@ndigo/auth-core';
import type { Closeable } from '@ndigo/factory';
import { randomToken } from '@ndigo/util';

const TABLE = 'ndigo_sessions';
const COLUMNS = 'principal_id, principal_name, roles, token_version, issued_at, expires_at';
const SCHEMA = [
    `CREATE TABLE IF NOT EXISTS ${TABLE} (
        session_id TEXT PRIMARY KEY NOT NULL,
        principal_id TEXT NOT NULL,
        principal_name TEXT NOT NULL,
        roles TEXT NOT NULL,
        token_version INTEGER NOT NULL,
        issued_at INTEGER NOT NULL,
        expires_at INTEGER NOT NULL
    )`,
    `CREATE INDEX IF NOT EXISTS ${TABLE}_expiry ON ${TABLE} (expires_at)`,
];

/**
 * Options for `LibSQLSessionStore`: either a borrowed `client` (ownership
 * transfers only with `ownsClient`) or a `url`/`authToken` pair for a client the
 * store owns, plus the shared-table `maxSessions` cap.
 */
export interface LibSQLSessionStoreOptions {
    /**
     * Injected clients are borrowed unless ownership is explicitly transferred.
     * Use the default `intMode: 'number'`; strict decoding rejects other modes.
     */
    client?: Client;
    ownsClient?: boolean;
    /** URL for an owned client; defaults to ':memory:'. */
    url?: string;
    authToken?: string;
    /**
     * Shared-table live-session cap (default 512); enforced on create via a
     * count-gated insert in one `batch()` — single-file SQLite serializes
     * writers, but two racing creates against a remote libsql server can
     * over-admit by one.
     */
    maxSessions?: number;
}

/**
 * Sessions share the application-owned `ndigo_sessions` table. Rotation is a
 * single conditional UPDATE: exactly one contender replaces a live id, retaining its
 * absolute expiry. Expired/unknown ids never rotate. Backend/corruption errors
 * reject, never become authentication misses. Principal methods are restored
 * with DefaultPrincipal; only id, name and roles are persisted.
 *
 * Expired rows are purged on access and on create. The live-table cap bounds
 * session growth, including across independent clients. Applications sharing a
 * table should configure the same cap and synchronize their clocks.
 *
 * Stop/drain consumers before close/dispose; pending operations are not drained.
 * `close` is the container's supported shutdown bridge, not automatic migration.
 */
export class LibSQLSessionStore implements SessionStore, Closeable {
    readonly kind = 'libsql';
    readonly #client: Client;
    readonly #ownsClient: boolean;
    readonly #maxSessions: number;
    #disposed = false;

    constructor(options: LibSQLSessionStoreOptions = {}) {
        this.#maxSessions = options.maxSessions ?? 512;
        if (!Number.isSafeInteger(this.#maxSessions) || this.#maxSessions < 1) {
            throw new RangeError('LibSQLSessionStore maxSessions must be a positive safe integer');
        }
        this.#client = options.client ?? createClient({ url: options.url ?? ':memory:', authToken: options.authToken });
        this.#ownsClient = options.client === undefined || options.ownsClient === true;
    }

    /** Explicit, idempotent provisioning of this store's table/index only. */
    async initialize(): Promise<void> {
        this.#assertOpen();
        await this.#client.batch(SCHEMA, 'write');
    }

    async create(record: SessionRecord, ttlMs: number): Promise<string> {
        this.#assertOpen();
        const values = encodeRecord(record);
        const now = Date.now();
        const expiresAt = now + ttlMs;
        if (!Number.isSafeInteger(ttlMs) || ttlMs <= 0 || !Number.isSafeInteger(expiresAt)) {
            throw new RangeError('LibSQLSessionStore ttlMs must produce a positive safe integer expiry');
        }
        const id = randomToken(32);
        const results = await this.#client.batch(
            [
                { sql: `DELETE FROM ${TABLE} WHERE expires_at <= ?`, args: [now] },
                {
                    sql: `INSERT INTO ${TABLE} (session_id, ${COLUMNS})
                      SELECT ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM ${TABLE}) < ?
                      RETURNING session_id`,
                    args: [id, ...values, expiresAt, this.#maxSessions],
                },
            ],
            'write'
        );
        if (results[1].rows.length !== 1) throw new Error('LibSQL session store at capacity');
        return id;
    }

    async get(sessionId: string): Promise<SessionRecord | null> {
        this.#assertOpen();
        const result = await this.#client.execute({
            sql: `SELECT ${COLUMNS} FROM ${TABLE} WHERE session_id = ?`,
            args: [sessionId],
        });
        const row = result.rows[0];
        if (row === undefined) return null;
        const entry = decodeRow(row);
        const now = Date.now();
        if (entry.expiresAt <= now) {
            await this.#client.execute({
                sql: `DELETE FROM ${TABLE} WHERE session_id = ? AND expires_at <= ?`,
                args: [sessionId, now],
            });
            return null;
        }
        return entry.record;
    }

    async rotate(sessionId: string, record: SessionRecord): Promise<{ id: string; expiresAt: number }> {
        this.#assertOpen();
        const values = encodeRecord(record);
        // Validate persisted identity before replacing it; corruption is an error,
        // never an authentication miss or an opportunity to repair a credential.
        const result = await this.#client.execute({
            sql: `SELECT ${COLUMNS} FROM ${TABLE} WHERE session_id = ?`,
            args: [sessionId],
        });
        const row = result.rows[0];
        if (row === undefined) throw new Error('LibSQL session not found or expired');
        const { expiresAt } = decodeRow(row);
        const now = Date.now();
        if (expiresAt <= now) {
            await this.#client.execute({
                sql: `DELETE FROM ${TABLE} WHERE session_id = ? AND expires_at <= ?`,
                args: [sessionId, now],
            });
            throw new Error('LibSQL session not found or expired');
        }
        const id = randomToken(32);
        // The id and expiry predicates are checked by SQLite inside the write.
        // Exactly one contender wins; a failed statement retains the old row.
        // Avoid interactive transactions: local LibSQL detaches their connection,
        // which would replace an injected :memory: database on its next operation.
        const updated = await this.#client.execute({
            sql: `UPDATE ${TABLE} SET session_id = ?, principal_id = ?, principal_name = ?,
                  roles = ?, token_version = ?, issued_at = ?
                  WHERE session_id = ? AND expires_at > ? RETURNING expires_at`,
            args: [id, ...values, sessionId, Date.now()],
        });
        if (updated.rows.length !== 1) throw new Error('LibSQL session not found or expired');
        const effectiveExpiry = updated.rows[0][0];
        if (typeof effectiveExpiry !== 'number' || !Number.isSafeInteger(effectiveExpiry)) {
            throw new Error('Malformed LibSQL session expiry');
        }
        return { id, expiresAt: effectiveExpiry };
    }

    async delete(sessionId: string): Promise<void> {
        this.#assertOpen();
        await this.#client.execute({ sql: `DELETE FROM ${TABLE} WHERE session_id = ?`, args: [sessionId] });
    }

    async deleteForUser(userId: string): Promise<number> {
        this.#assertOpen();
        const result = await this.#client.execute({
            sql: `DELETE FROM ${TABLE} WHERE principal_id = ? AND expires_at > ?`,
            args: [userId, Date.now()],
        });
        return result.rowsAffected;
    }

    /** Idempotent: only owned clients close; all later store operations reject. */
    dispose(): void {
        if (this.#disposed) return;
        this.#disposed = true;
        if (this.#ownsClient) this.#client.close();
    }

    /** Supported Closeable bridge used by application-context shutdown. */
    close(): void {
        this.dispose();
    }

    #assertOpen(): void {
        if (this.#disposed) throw new Error('LibSQL session store is disposed');
    }
}

function encodeRecord(record: SessionRecord): InValue[] {
    const { principal, tokenVersion, issuedAt } = record;
    assertFields(principal.id, principal.name, principal.roles, tokenVersion, issuedAt);
    return [principal.id, principal.name, JSON.stringify(principal.roles), tokenVersion, issuedAt];
}

function decodeRow(row: Row): { record: SessionRecord; expiresAt: number } {
    if (typeof row[2] !== 'string') throw new Error('Malformed LibSQL session roles');
    let roles: unknown;
    try {
        roles = JSON.parse(row[2]);
    } catch {
        throw new Error('Malformed LibSQL session roles');
    }
    assertFields(row[0], row[1], roles, row[3], row[4]);
    if (typeof row[5] !== 'number' || !Number.isSafeInteger(row[5])) {
        throw new Error('Malformed LibSQL session expiry');
    }
    return {
        record: {
            principal: new DefaultPrincipal(row[0] as string, row[1] as string, roles as string[]),
            tokenVersion: row[3] as number,
            issuedAt: row[4] as number,
        },
        expiresAt: row[5],
    };
}

function assertFields(id: unknown, name: unknown, roles: unknown, tokenVersion: unknown, issuedAt: unknown): void {
    if (
        typeof id !== 'string' ||
        typeof name !== 'string' ||
        !Array.isArray(roles) ||
        !roles.every((role: unknown) => typeof role === 'string') ||
        typeof tokenVersion !== 'number' ||
        !Number.isSafeInteger(tokenVersion) ||
        tokenVersion < 0 ||
        typeof issuedAt !== 'number' ||
        !Number.isSafeInteger(issuedAt)
    ) {
        throw new Error('Malformed LibSQL session record');
    }
}
