/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { randomBytes } from 'node:crypto';
import { type SessionRecord, type SessionStore } from '@blue/auth-core';

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
    readonly kind = 'in-memory';

    readonly #sessions = new Map<string, { record: SessionRecord; expiresAt: number }>();
    readonly #maxSessions: number;

    constructor(options: InMemorySessionStoreOptions = {}) {
        this.#maxSessions = options.maxSessions ?? DEFAULT_MAX_SESSIONS;
        if (!Number.isInteger(this.#maxSessions) || this.#maxSessions < 1) {
            throw new RangeError(
                `InMemorySessionStore maxSessions must be a positive integer, got ${String(this.#maxSessions)}`
            );
        }
    }

    async create(record: SessionRecord, ttlMs: number): Promise<string> {
        if (this.#sessions.size >= this.#maxSessions) this.#sweep();
        if (this.#sessions.size >= this.#maxSessions) {
            throw new Error(`Session store at capacity (${this.#maxSessions} live sessions)`);
        }
        const sessionId = randomBytes(32).toString('base64url');
        this.#sessions.set(sessionId, { record, expiresAt: Date.now() + ttlMs });
        return sessionId;
    }

    async get(sessionId: string): Promise<SessionRecord | null> {
        const entry = this.#sessions.get(sessionId);
        if (!entry) return null;
        if (entry.expiresAt <= Date.now()) {
            this.#sessions.delete(sessionId);
            return null;
        }
        return entry.record;
    }

    async rotate(sessionId: string, record: SessionRecord): Promise<string> {
        const entry = this.#sessions.get(sessionId);
        if (!entry) {
            throw new Error(`Session store: session "${sessionId}" not found`);
        }
        const ttlMs = Math.max(1, entry.expiresAt - Date.now());
        this.#sessions.delete(sessionId);
        return this.create(record, ttlMs);
    }

    async delete(sessionId: string): Promise<void> {
        this.#sessions.delete(sessionId);
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
