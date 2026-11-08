/**
 * In-memory session store for tests and single-process deployments.
 */
import { randomToken } from '@ndigo/util';
import { type SessionRecord, type SessionStore } from '@ndigo/auth-core';

/** Options for the in-memory session store. */
export interface InMemorySessionStoreOptions {
    /**
     * Hard cap on concurrently stored sessions (default 512). The
     * opportunistic sweep reclaims expired entries at the cap; a create
     * that still finds the store full after sweeping throws.
     */
    maxSessions?: number;
}

/** Default cap on live sessions (see {@link InMemorySessionStoreOptions}). */
const DEFAULT_MAX_SESSIONS = 512;

/**
 * Reference {@link SessionStore} implementation: an in-memory map with
 * TTL enforcement.
 *
 * Security/behavior contract:
 * - expiry is checked on read (expired entries are purged on access);
 * - `rotate` deletes the old id before issuing a new one, so fixation
 *   attacks can never re-use a client-chosen id;
 * - rotate on an unknown id throws (fail closed);
 * - `delete` is idempotent.
 *
 * The `kind` marker (`'in-memory'`) matches the `QueueMessageStore`
 * convention: persistent backends (Redis/LibSQL) implement the same
 * contract with their own identifier. Memory hygiene: expired entries are
 * swept opportunistically at the capacity (`maxSessions`, default 512);
 * a create that still finds the store full after the sweep throws — the
 * cap bounds the live-session map (SEC-4, 2026-09-27 review).
 */
export class InMemorySessionStore implements SessionStore {
    /** Store identifier (`'in-memory'`). */
    readonly kind = 'in-memory';

    readonly #sessions = new Map<string, { record: SessionRecord; expiresAt: number }>();
    readonly #maxSessions: number;

    /**
     * Creates a store with the given capacity.
     *
     * @param options - Store options (maximum live sessions).
     */
    constructor(options: InMemorySessionStoreOptions = {}) {
        this.#maxSessions = options.maxSessions ?? DEFAULT_MAX_SESSIONS;
        if (!Number.isInteger(this.#maxSessions) || this.#maxSessions < 1) {
            throw new RangeError(
                `InMemorySessionStore maxSessions must be a positive integer, got ${String(this.#maxSessions)}`
            );
        }
    }

    /**
     * Creates a session record.
     *
     * @param record - The session record to store.
     * @param ttlMs - The session lifetime in milliseconds.
     * @returns The generated session id.
     */
    async create(record: SessionRecord, ttlMs: number): Promise<string> {
        return this.#insert(record, ttlMs).id;
    }

    /**
     * Returns the live session record for an id.
     *
     * @param sessionId - The session id.
     * @returns The record, or `null` when missing or expired.
     */
    async get(sessionId: string): Promise<SessionRecord | null> {
        const entry = this.#sessions.get(sessionId);
        if (!entry) return null;
        if (entry.expiresAt <= Date.now()) {
            this.#sessions.delete(sessionId);
            return null;
        }
        return entry.record;
    }

    /**
     * Rotates a session, preserving its remaining TTL.
     *
     * @param sessionId - The current session id.
     * @param record - The record to store under the new id.
     * @returns The new session id and its effective expiry.
     */
    async rotate(sessionId: string, record: SessionRecord): Promise<{ id: string; expiresAt: number }> {
        const entry = this.#sessions.get(sessionId);
        if (!entry) {
            throw new Error(`Session store: session "${sessionId}" not found`);
        }
        // COR-13: preserve the remaining TTL (absolute expiry kept) and report
        // the effective expiry back to the caller.
        const ttlMs = Math.max(1, entry.expiresAt - Date.now());
        this.#sessions.delete(sessionId);
        return this.#insert(record, ttlMs);
    }

    /**
     * Deletes one session.
     *
     * @param sessionId - The session id.
     * @returns A promise that resolves once deleted.
     */
    async delete(sessionId: string): Promise<void> {
        this.#sessions.delete(sessionId);
    }

    /**
     * Deletes every live session belonging to a user.
     *
     * @param userId - The account id.
     * @returns The number of live sessions removed.
     */
    async deleteForUser(userId: string): Promise<number> {
        const now = Date.now();
        let removed = 0;
        for (const [sessionId, entry] of this.#sessions) {
            if (entry.record.principal.id !== userId) continue;
            this.#sessions.delete(sessionId);
            if (entry.expiresAt > now) removed += 1;
        }
        return removed;
    }

    /** Bounds the store, sweeps at the cap, and stores `record` for `ttlMs`. */
    #insert(record: SessionRecord, ttlMs: number): { id: string; expiresAt: number } {
        if (this.#sessions.size >= this.#maxSessions) this.#sweep();
        if (this.#sessions.size >= this.#maxSessions) {
            throw new Error(`Session store at capacity (${this.#maxSessions} live sessions)`);
        }
        const id = randomToken(32);
        const expiresAt = Date.now() + ttlMs;
        this.#sessions.set(id, { record, expiresAt });
        return { id, expiresAt };
    }

    #sweep(): void {
        const now = Date.now();
        for (const [sessionId, entry] of this.#sessions) {
            if (entry.expiresAt <= now) {
                this.#sessions.delete(sessionId);
            }
        }
    }
}
