/**
 * @module blue-auth-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Principal } from './principal';

/**
 * A stored server-side session.
 *
 * Sessions are **opaque**: the session id (a random token) is the only
 * credential held by the client; the record below lives in the store.
 * Opaque sessions are trivially revocable (delete the record) and carry no
 * replay window — the deliberate contrast to JWTs, which stay for the
 * client/OIDC path (AD-33 D-6).
 */
export interface SessionRecord {
    /** The authenticated principal. */
    readonly principal: Principal;
    /**
     * Token version at issue time (AD-33 D-7): the JWT `ver` claim must
     * match the user record's `tokenVersion`; sessions snapshot the value
     * they were issued under.
     */
    readonly tokenVersion: number;
    /** Issue timestamp in milliseconds. */
    readonly issuedAt: number;
}

/**
 * Backing store contract for opaque server sessions (audit M4).
 *
 * The `kind` identifier mirrors `QueueMessageStore` (socket package):
 * `'in-memory'` first, persistent backends (Redis/LibSQL) later — the
 * interface is the deliverable, in-memory is the reference implementation.
 * Implementations MUST enforce TTL expiry on read and MUST NOT resurrect
 * expired or deleted sessions. Implementations SHOULD bound concurrent
 * storage (an unbounded live-session map is a memory DoS) — the reference
 * implementation rejects creates at its capacity (SEC-4, 2026-09-27
 * review).
 */
export interface SessionStore {
    /**
     * Backend identifier for observability/diagnostics
     * (e.g. `'in-memory'`, `'redis'`).
     */
    readonly kind: string;

    /**
     * Persists `record` for `ttlMs` and returns the new opaque session id.
     */
    create(record: SessionRecord, ttlMs: number): Promise<string>;

    /**
     * Returns the session record, or `null` when unknown or expired
     * (expired sessions are also purged).
     */
    get(sessionId: string): Promise<SessionRecord | null>;

    /**
     * Replaces `sessionId` with a new id carrying `record` (session
     * fixation protection: login rotates the id so an attacker-chosen id
     * can never be adopted). The old id must stop working immediately.
     * Throws when `sessionId` is unknown (fail closed).
     *
     * Returns the new session's id together with its **effective absolute
     * expiry** (COR-13): the caller must report this exact timestamp rather
     * than derive one from `issuedAt` + TTL — TTL semantics are
     * implementation-documented (the reference `InMemorySessionStore`
     * preserves the **remaining** TTL, so a refresh near expiry yields a
     * short-lived session; a sliding-window store would reset to a full
     * window).
     */
    rotate(sessionId: string, record: SessionRecord): Promise<{ id: string; expiresAt: number }>;

    /**
     * Terminates the session. Unknown ids are a no-op.
     */
    delete(sessionId: string): Promise<void>;
}
