/**
 * Redis-backed {@link RateLimiter} — the shared-store fixed-window driver
 * (AD-79): every process counts against the same budgets, windows expire
 * server-side by TTL, and one atomic Lua script per consume keeps the
 * check-and-count race-free.
 *
 * The counter key is `${namespace}:rl:${windowMs}:${key}` — the window is
 * part of the key, exactly like the in-process limiter's bucket key, so
 * policies with different windows never share a budget.
 *
 * Failure posture is **fail-closed by default**: when the store cannot be
 * reached the consume rejects, and the platform's error path fails the
 * request rather than passing it through unthrottled (or misreporting it
 * as a 429). `onError: 'fail-open'` is the documented availability escape
 * hatch — it logs every allowance.
 *
 * @module ndigo-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@ndigo/core';
import { getLogger } from '@ndigo/log';
import {
    validateRateLimitPolicy,
    type RateLimitPolicy,
    type RateLimitResult,
    type RateLimiter,
} from '@ndigo/rate-limit';
import { RedisConnection } from '../connection';

const logger = getLogger('ndigo-redis:rate-limit');

/**
 * Atomic fixed-window consume: INCR the counter; the FIRST request of a
 * window sets the key's TTL (so the window starts at the first request,
 * matching the in-process limiter); PTTL is read back as the
 * `retryAfterMs` basis.
 *
 * KEYS: counter key. ARGV: windowMs.
 */
const CONSUME_SCRIPT = `local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
return { count, redis.call('PTTL', KEYS[1]) }`;

/**
 * Options for {@link RedisRateLimiter}.
 */
export interface RedisRateLimiterOptions {
    /** Borrowed connection (already connected or connected by the application). */
    connection: RedisConnection;
    /** Application/environment namespace; isolates limit spaces sharing one Redis. */
    namespace: string;
    /**
     * Storage-failure posture. `'fail-closed'` (default) rejects the
     * consume — the request fails instead of passing unthrottled;
     * `'fail-open'` logs through `@ndigo/log` and allows.
     */
    onError?: 'fail-closed' | 'fail-open';
}

/**
 * Multi-node {@link RateLimiter} on Redis (standalone 6.2+, Lua only).
 * One handle per namespace; construct independently in every node — the
 * Redis keys are the shared truth.
 */
export class RedisRateLimiter implements RateLimiter {
    /** Backend identifier for diagnostics. */
    readonly kind = 'redis';

    readonly #connection: RedisConnection;
    readonly #namespace: string;
    readonly #prefix: string;
    readonly #onError: 'fail-closed' | 'fail-open';
    #closed = false;

    /**
     * @param options - Borrowed connection, namespace, and failure posture.
     */
    constructor(options: RedisRateLimiterOptions) {
        if (options === null || typeof options !== 'object' || options.connection === undefined) {
            throw new TypeError('RedisRateLimiter: options.connection is required');
        }
        if (typeof options.namespace !== 'string' || !/^[A-Za-z0-9._:-]+$/.test(options.namespace)) {
            throw new TypeError(
                `RedisRateLimiter: namespace must be a non-empty [A-Za-z0-9._:-] string, got ${JSON.stringify(options.namespace)}`
            );
        }
        this.#connection = options.connection;
        this.#namespace = options.namespace;
        this.#prefix = `ndigo:rl:${options.namespace}:`;
        this.#onError = options.onError ?? 'fail-closed';
    }

    async consume(key: string, policy: RateLimitPolicy): Promise<RateLimitResult> {
        validateRateLimitPolicy(policy);
        this.#assertOpen();
        if (key.length === 0 || key.includes(' ')) {
            throw new FrameworkError('RedisRateLimiter: limit key must be a non-empty space-free string');
        }
        const redisKey = `${this.#prefix}${policy.windowMs}:${key}`;
        try {
            return await this.#connection.run(async (client) => {
                const reply: unknown = await client.eval(CONSUME_SCRIPT, {
                    keys: [redisKey],
                    arguments: [String(policy.windowMs)],
                });
                const count = Array.isArray(reply) ? Number(reply[0]) : Number.NaN;
                const ttlMs = Array.isArray(reply) ? Number(reply[1]) : Number.NaN;
                if (!Number.isInteger(count) || count < 1 || !Number.isFinite(ttlMs)) {
                    // A malformed reply is a storage failure, not a free pass.
                    throw new FrameworkError(
                        `RedisRateLimiter: unexpected CONSUME_SCRIPT reply ${JSON.stringify(reply)}`
                    );
                }
                if (count <= policy.limit) {
                    return { allowed: true, retryAfterMs: 0 };
                }
                return { allowed: false, retryAfterMs: Math.max(0, ttlMs) };
            });
        } catch (error) {
            if (this.#onError === 'fail-open') {
                // REV-013: the limit key is request-derived (IPs, user ids) —
                // it must not land in the error log; the namespace (a fixed
                // operator value) is enough to find the failing limiter.
                logger.error(
                    'RedisRateLimiter: allowing request — shared-store consume failed (fail-open)',
                    error instanceof Error ? error : String(error),
                    { namespace: this.#namespace }
                );
                return { allowed: true, retryAfterMs: 0 };
            }
            throw error;
        }
    }

    /**
     * Seals this driver; a closed driver accepts no operations. The
     * borrowed connection is untouched; idempotent.
     */
    close(): Promise<void> {
        this.#closed = true;
        return Promise.resolve();
    }

    #assertOpen(): void {
        if (this.#closed) {
            throw new FrameworkError('RedisRateLimiter is closed — a closed driver accepts no operations');
        }
    }
}
