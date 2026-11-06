/**
 * Redis-backed `LockDriver` — the shared multi-node lock for
 * `@scheduled({ lock })` and cluster work (AD-73).
 *
 * The contract lives in `@ndigo/locks`; this adapter keeps two keys per lock:
 * the lease key (value = the current fencing token, TTL = the lease) and a
 * per-key monotonic counter that issues tokens. Every mutation that must be
 * atomic (acquire, token-checked release/renew/verify) runs in one Lua
 * script, so two workers racing the same key cannot both hold the lease —
 * and a stale holder can never release or extend a successor's lease.
 *
 * Contract parity with `InProcessLockDriver`: non-blocking acquire, leases
 * expire by TTL (no sweeper — an expired lease is simply gone), monotonic
 * fencing tokens starting at `1`, and `close()` seals the handle only. The
 * connection is **borrowed** (the `RedisJobDriver` pattern): the driver
 * never connects, subscribes, or closes it.
 */
import { FrameworkError } from '@ndigo/core';
import type { LockDriver, LockHandle } from '@ndigo/locks';
import type { RedisConnection } from '../connection';

/**
 * Atomic acquire: take the per-key counter and the lease in one unit, and
 * only on SUCCESS — a contended attempt does not burn a token. Sequence
 * parity with `InProcessLockDriver` (consecutive tokens start at 1; a
 * released-then-reacquired key keeps counting). One winner even when two
 * workers race. Returns the token (≥ 1) or `0` (held).
 *
 * KEYS: lease key, token counter.
 * ARGV: ttl (ms).
 */
const ACQUIRE_SCRIPT = `local key = KEYS[1]
local seq = KEYS[2]
local ttl = tonumber(ARGV[1])
-- EXISTS is false for an expired key (the TTL reaps it), so a lapsed lease
-- is acquirable exactly like the in-process table.
if redis.call('EXISTS', key) == 1 then
  return 0
end
local token = redis.call('INCR', seq)
redis.call('SET', key, token, 'PX', ttl)
return token`;

/**
 * Atomic token-checked release. Returns `1` when this token still owns the
 * lease, `0` when a successor took over (fencing guard — nothing released).
 *
 * KEYS: lease key. ARGV: token.
 */
const RELEASE_SCRIPT = `local key = KEYS[1]
local token = ARGV[1]
if redis.call('GET', key) == token then
  redis.call('DEL', key)
  return 1
end
return 0`;

/**
 * Atomic token-checked renew. Returns `1` on success, `0` when the token no
 * longer owns the lease.
 *
 * KEYS: lease key. ARGV: token, ttl (ms).
 */
const RENEW_SCRIPT = `local key = KEYS[1]
local token = ARGV[1]
local ttl = tonumber(ARGV[2])
if redis.call('GET', key) == token then
  redis.call('PEXPIRE', key, ttl)
  return 1
end
return 0`;

/**
 * Token-checked liveness probe. Returns the remaining TTL in milliseconds
 * (≥ 0 when this token holds an unexpired lease), `-1` otherwise.
 *
 * KEYS: lease key. ARGV: token.
 */
const IS_HELD_SCRIPT = `local key = KEYS[1]
local token = ARGV[1]
if redis.call('GET', key) == token then
  return redis.call('PTTL', key)
end
return -1`;

/**
 * Validates a lease duration.
 *
 * @param ttlMs - The lease duration in milliseconds.
 * @throws When the value is not a finite positive number.
 */
function requireTtl(ttlMs: number): void {
    if (Number.isFinite(ttlMs) && ttlMs > 0) {
        return;
    }
    throw new TypeError(`RedisLockDriver: ttlMs must be a finite positive number (got ${String(ttlMs)})`);
}

/**
 * Options for {@link RedisLockDriver}.
 */
export interface RedisLockDriverOptions {
    /** Borrowed connection (already connected or connected by the application). */
    connection: RedisConnection;
    /** Application/environment namespace; isolates lock spaces sharing one Redis. */
    namespace: string;
}

/**
 * Multi-node `LockDriver` on Redis (standalone 6.2+, `SET NX PX` and
 * Lua only). One handle per namespace; construct independently in every
 * node — the Redis keys are the shared truth.
 */
export class RedisLockDriver implements LockDriver {
    /** Backend identifier for diagnostics. */
    readonly kind = 'redis';

    readonly #connection: RedisConnection;
    readonly #prefix: string;
    /** Keys this instance acquired, with the token that won. */
    readonly #acquired = new Map<string, number>();
    #closed = false;

    /**
     * @param options - Borrowed connection and namespace.
     */
    constructor(options: RedisLockDriverOptions) {
        if (options === null || typeof options !== 'object' || options.connection === undefined) {
            throw new TypeError('RedisLockDriver: options.connection is required');
        }
        if (typeof options.namespace !== 'string' || !/^[A-Za-z0-9._:-]+$/.test(options.namespace)) {
            throw new TypeError(
                `RedisLockDriver: namespace must be a non-empty [A-Za-z0-9._:-] string, got ${JSON.stringify(options.namespace)}`
            );
        }
        this.#connection = options.connection;
        this.#prefix = `ndigo:locks:${options.namespace}:`;
    }

    /** {@inheritDoc} */
    async acquire(key: string, options: { ttlMs: number }): Promise<LockHandle | null> {
        this.#assertOpen();
        requireTtl(options.ttlMs);
        if (key.length === 0 || key.includes(' ')) {
            throw new FrameworkError('RedisLockDriver: lock key must be a non-empty space-free string');
        }
        const now = Date.now();
        const lockKey = `${this.#prefix}${key}`;
        return this.#connection.run(async (client) => {
            const reply: unknown = await client.eval(ACQUIRE_SCRIPT, {
                keys: [lockKey, `${lockKey}:seq`],
                arguments: [String(options.ttlMs)],
            });
            if (typeof reply !== 'number' || reply < 1) {
                return null; // held — non-blocking contract
            }
            this.#acquired.set(lockKey, reply);
            return this.#handle(lockKey, reply, now + options.ttlMs);
        });
    }

    #handle(lockKey: string, token: number, expiresAt: number): LockHandle {
        const closed = (): void => this.#assertOpen();
        // The handle's expiry must observe renewals (contention diagnostics).
        let expiry = expiresAt;
        return {
            token,
            get expiresAt(): number {
                return expiry;
            },
            isHeld: async (): Promise<boolean> => {
                closed();
                return this.#connection.run(async (client) => {
                    const reply: unknown = await client.eval(IS_HELD_SCRIPT, {
                        keys: [lockKey],
                        arguments: [String(token)],
                    });
                    return typeof reply === 'number' && reply >= 0;
                });
            },
            renew: async (ttlMs: number): Promise<boolean> => {
                closed();
                requireTtl(ttlMs);
                const next = Date.now() + ttlMs;
                return this.#connection.run(async (client) => {
                    const reply: unknown = await client.eval(RENEW_SCRIPT, {
                        keys: [lockKey],
                        arguments: [String(token), String(ttlMs)],
                    });
                    if (typeof reply !== 'number' || reply < 1) {
                        return false; // fencing: the token no longer wins
                    }
                    expiry = next;
                    return true;
                });
            },
            release: async (): Promise<boolean> => {
                closed();
                return this.#connection.run(async (client) => {
                    const reply: unknown = await client.eval(RELEASE_SCRIPT, {
                        keys: [lockKey],
                        arguments: [String(token)],
                    });
                    const released = typeof reply === 'number' && reply === 1;
                    if (released && this.#acquired.get(lockKey) === token) {
                        this.#acquired.delete(lockKey);
                    }
                    return released;
                });
            },
        };
    }

    /**
     * Releases this driver's own leases (token-checked — a successor's
     * lease is never touched) and seals the handle. The borrowed connection
     * is untouched; idempotent.
     */
    async close(): Promise<void> {
        if (this.#closed) {
            return;
        }
        // SPI parity with InProcessLockDriver.close: release every lease
        // acquired through THIS instance, fencing-guarded by token. A lease
        // that already expired or was superseded is left alone either way.
        // Releases are independent (each is token-checked server-side), so
        // they drain in parallel.
        const owned = [...this.#acquired.entries()];
        this.#acquired.clear();
        await Promise.all(
            owned.map(([lockKey, token]) =>
                this.#connection.run(async (client) => {
                    await client.eval(RELEASE_SCRIPT, {
                        keys: [lockKey],
                        arguments: [String(token)],
                    });
                })
            )
        );
        this.#closed = true;
    }

    #assertOpen(): void {
        if (this.#closed) {
            throw new FrameworkError('RedisLockDriver is closed — a closed driver accepts no operations');
        }
    }
}
