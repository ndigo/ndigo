/**
 * The default {@link LockDriver}: in-process and single-node (AD-73 D-1).
 *
 * Semantics deliberately mirror a one-node deployment: the lease table is
 * **shared at module scope**, so every `InProcessLockDriver` instance in the
 * process coordinates — two schedulers (or two beans) in the same process
 * cannot run the same locked task. Leases expire by clock, there is no
 * sweeper (an expired lease is simply expired), and fencing tokens are
 * monotonic per key. Locks do **not** survive the process — durability is
 * opt-in by registering a durable driver bean (`RedisLockDriver`), exactly
 * like the in-process job driver.
 *
 * The clock is injectable so expiry behavior is testable deterministically.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@ndigo/core';
import type { LockDriver, LockHandle } from './lock-driver';

/**
 * Options for constructing {@link InProcessLockDriver}.
 */
export interface InProcessLockDriverOptions {
    /**
     * Injectable epoch-millisecond clock (defaults to `Date.now`). Tests
     * advance it to prove expiry and fencing without sleeping.
     */
    clock?: () => number;
    /**
     * Key prefix separating independent lock namespaces sharing one process
     * (default `'ndigo'`).
     */
    prefix?: string;
}

/**
 * The physical lease: token + absolute expiry.
 */
interface LeaseRecord {
    readonly token: number;
    expiresAt: number;
}

/**
 * Process-wide lease table (single-node truth) and per-key token counters.
 * Module scope is deliberate: every in-process driver in the process shares
 * the same lock space, mirroring one node.
 */
const LEASE_TABLE = new Map<string, LeaseRecord>();
const TOKEN_COUNTERS = new Map<string, number>();

/**
 * Validates a lease duration.
 *
 * @param ttlMs - The lease duration in milliseconds.
 * @throws {TypeError} When the value is not a finite positive number.
 */
function requireTtl(ttlMs: number): void {
    if (Number.isFinite(ttlMs) && ttlMs > 0) {
        return;
    }
    throw new TypeError(`InProcessLockDriver: ttlMs must be a finite positive number (got ${String(ttlMs)})`);
}

/**
 * The in-process {@link LockDriver}. See the module doc for the shared-table
 * semantics; {@link InProcessLockDriver.close} releases only the leases this
 * instance acquired.
 */
export class InProcessLockDriver implements LockDriver {
    /** Backend identifier for diagnostics. */
    readonly kind = 'in-process';

    readonly #clock: () => number;
    readonly #prefix: string;
    /** Keys this instance acquired, with the token that won at the time. */
    readonly #acquired = new Map<string, number>();

    /**
     * @param options - Clock override and key prefix (see the interface).
     */
    constructor(options: InProcessLockDriverOptions = {}) {
        this.#clock = options.clock ?? Date.now;
        this.#prefix = options.prefix ?? 'ndigo';
    }

    acquire(key: string, options: { ttlMs: number }): Promise<LockHandle | null> {
        return Promise.resolve().then(() => this.#acquireNow(key, options));
    }

    #acquireNow(key: string, { ttlMs }: { ttlMs: number }): LockHandle | null {
        requireTtl(ttlMs);
        if (key.length === 0) {
            throw new FrameworkError('InProcessLockDriver: lock key must not be empty');
        }
        const lockKey = `${this.#prefix}:${key}`;
        const now = this.#clock();
        const current = LEASE_TABLE.get(lockKey);
        if (current !== undefined && current.expiresAt > now) {
            return null; // held — non-blocking contract
        }
        const token = (TOKEN_COUNTERS.get(lockKey) ?? 0) + 1;
        TOKEN_COUNTERS.set(lockKey, token);
        LEASE_TABLE.set(lockKey, { token, expiresAt: now + ttlMs });
        this.#acquired.set(lockKey, token);
        return this.#handle(lockKey, token, now + ttlMs);
    }

    #handle(lockKey: string, token: number, expiresAt: number): LockHandle {
        // The handle's expiry must observe renewals (contention diagnostics),
        // so it lives in a mutable cell updated by the renew path.
        let expiry = expiresAt;
        return {
            token,
            get expiresAt(): number {
                return expiry;
            },
            isHeld: async (): Promise<boolean> => this.#isHeldNow(lockKey, token),
            renew: async (ttlMs: number): Promise<boolean> => {
                const next = this.#renewNow(lockKey, token, ttlMs);
                if (next < 0) {
                    return false;
                }
                expiry = next;
                return true;
            },
            release: async (): Promise<boolean> => this.#releaseNow(lockKey, token),
        };
    }

    #isHeldNow(lockKey: string, token: number): boolean {
        const current = LEASE_TABLE.get(lockKey);
        return current !== undefined && current.token === token && current.expiresAt > this.#clock();
    }

    /**
     * @returns The new absolute expiry, or `-1` when the token no longer wins.
     */
    #renewNow(lockKey: string, token: number, ttlMs: number): number {
        requireTtl(ttlMs);
        const current = LEASE_TABLE.get(lockKey);
        if (current === undefined || current.token !== token || current.expiresAt <= this.#clock()) {
            return -1; // fencing: the token no longer wins
        }
        current.expiresAt = this.#clock() + ttlMs;
        return current.expiresAt;
    }

    #releaseNow(lockKey: string, token: number): boolean {
        const current = LEASE_TABLE.get(lockKey);
        if (current === undefined || current.token !== token) {
            return false; // fencing guard — never release a successor's lease
        }
        LEASE_TABLE.delete(lockKey);
        return true;
    }

    close(): Promise<void> {
        return Promise.resolve().then(() => {
            for (const [lockKey, token] of this.#acquired) {
                const current = LEASE_TABLE.get(lockKey);
                // Fencing: never delete a lease a successor (another driver
                // or a later acquisition) currently holds.
                if (current !== undefined && current.token === token) {
                    LEASE_TABLE.delete(lockKey);
                }
            }
            this.#acquired.clear();
        });
    }
}
