/**
 */

/**
 * A framework-owned view of a first-party user account.
 *
 * Implementations are app-owned: the classic `UserDetailsService`
 * split — the framework owns the contract, the application owns the data
 * (typically a `@ndigo/orm`/Drizzle entity). The framework ships no
 * reference store; `packages/ndigo-auth-core/test/fixtures` provides an
 * in-memory implementation for tests and demos.
 */
export interface UserRecord {
    /** Stable unique identifier (principal `id`). */
    readonly id: string;
    /** Unique login name. */
    readonly username: string;
    /**
     * Self-describing password hash (`PasswordEncoder` output), or `null`
     * when the account has no password (e.g. OAuth-only, or an admin
     * bootstrap pending). A `null` hash never matches a password attempt.
     */
    readonly passwordHash: string | null;
    /** Roles attached to the account. */
    readonly roles?: readonly string[];
    /**
     * Token version for JWT revocation (AD-33 D-7): access/refresh tokens
     * carry a `ver` claim that must equal `tokenVersion`; bumping the
     * version revokes every outstanding token for the account.
     */
    readonly tokenVersion?: number;
    /** Disabled accounts never authenticate (single generic denial). */
    readonly disabled?: boolean;
}

/**
 * Lookup contract for first-party user accounts (Wave 1 of the auth
 * completion plan; consumed by the credentials adapter in Wave 2).
 */
export interface UserStore {
    /** Returns the account for `username`, or `null` when unknown. */
    findByUsername(username: string): Promise<UserRecord | null>;
    /** Returns the account for `id`, or `null` when unknown. */
    findById(id: string): Promise<UserRecord | null>;
    /**
     * Advances the account's `tokenVersion` by one and returns the new
     * value (AD-33 D-7). This is the revocation primitive: JWTs carry a
     * `ver` claim that must equal `tokenVersion`; every bump kills every
     * outstanding token for the account. Stores should implement this as
     * a single atomic write (`UPDATE … SET token_version = token_version
     * + 1`) — the read-modify-write must not race.
     * Throws when `id` is unknown (fail closed).
     */
    incrementTokenVersion(id: string): Promise<number>;

    /**
     * Compare-and-swap advancement of `tokenVersion` (AD-33 D-7, SEC-6):
     * bumps the version to `expected + 1` only when the current version is
     * still `expected`, returning the new value; returns `null` when the
     * current version no longer matches (someone else advanced it). This is
     * the atomic guard against refresh-token replay races — a stolen token
     * must lose to the legitimate holder's rotation even when both present
     * the same `ver` claim concurrently. Backed by a conditional UPDATE
     * (`UPDATE … SET token_version = token_version + 1 WHERE id = $1 AND
     * token_version = $2`) and the affected-rows count. Must be atomic under
     * concurrent callers.
     * Throws when `id` is unknown (fail closed).
     */
    incrementTokenVersionIfCurrent(id: string, expected: number): Promise<number | null>;
}
