/**
 * The distributed-lock contract (AD-73): a lease-bearing lock with a
 * fencing token, and the driver that acquires it.
 *
 * A lock is a **lease**: acquiring sets a TTL, and the holder must extend
 * (`renew`) or finish within it. The fencing token is the safety half: every
 * acquisition gets a fresh monotonic token, and only the handle holding the
 * current token can `renew` or `release` the lease. A stale holder (its
 * lease expired and another node acquired) can therefore never interfere
 * with the successor's lease — the exact double-run the feature exists to
 * prevent.
 */

/**
 * Options for acquiring a lock.
 */
export interface LockAcquireOptions {
    /**
     * The lease duration in milliseconds. The holder must fit its work (or
     * heartbeat via {@link LockHandle.renew}) inside this window; an expired
     * lease is simply expired — the next acquirer wins.
     */
    ttlMs: number;
}

/**
 * A held (or previously held) lease. The token is checked by the backend on
 * every mutation, so a handle whose token lost the lease fails loudly rather
 * than corrupting the successor's lease.
 */
export interface LockHandle {
    /**
     * Monotonic fence token for this acquisition (per lock key), starting
     * at `1`. `renew`/`release`/`isHeld` succeed only while this handle's
     * token is the current one.
     */
    readonly token: number;
    /**
     * The lease expiry (epoch milliseconds), captured at acquire/renew.
     */
    readonly expiresAt: number;
    /**
     * Whether this handle still holds the lease. `false` once the lease
     * expired or another acquisition took the key.
     */
    isHeld(): Promise<boolean>;
    /**
     * Extends the lease from now by `ttlMs`. Returns `false` when the token
     * is no longer the current one (lease expired and was re-acquired).
     *
     * @param ttlMs - The new lease duration in milliseconds.
     */
    renew(ttlMs: number): Promise<boolean>;
    /**
     * Atomically releases the lease if — and only if — this handle's token
     * is still the current one. Returns `false` when another holder took
     * over after our expiry (fencing guard), in which case nothing is
     * released.
     */
    release(): Promise<boolean>;
}

/**
 * The lock backend contract (AD-73 D-2): lease-based, fencing-enabled,
 * crash-self-healing. Acquisition is **non-blocking** — waiting policies
 * belong to the caller (`@scheduled({ lock, lockWait })`), never to the
 * driver.
 */
export interface LockDriver {
    /**
     * Backend identifier (`'in-process'`, `'redis'`, …), for diagnostics.
     */
    readonly kind: string;
    /**
     * Acquire `key` for `ttlMs`. Returns a fencing-token handle, or `null`
     * while another holder owns the lease. A lease that expired is simply
     * expired — the next acquirer wins, no sweeper involved.
     *
     * @param key - The lock key (namespaced by the driver).
     * @param options - Acquisition options.
     * @returns The fencing handle, or `null` when the key is held.
     */
    acquire(key: string, options: LockAcquireOptions): Promise<LockHandle | null>;
    /**
     * Releases every lease this driver's handles acquired and seals it.
     * Never affects leases acquired through other driver instances.
     */
    close(): Promise<void>;
}

/**
 * Structural type guard for {@link LockDriver} — used where a bean or
 * option is declared as an unknown collaborator and must be verified.
 *
 * @param value - The value to test.
 * @returns Whether the value satisfies the driver contract shape.
 */
export function likeLockDriver(value: unknown): value is LockDriver {
    if (value === null || typeof value !== 'object') {
        return false;
    }
    const driver = value as LockDriver;
    return (
        typeof driver.kind === 'string' && typeof driver.acquire === 'function' && typeof driver.close === 'function'
    );
}
