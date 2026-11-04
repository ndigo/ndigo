/**
 * Redis-backed {@link JobDriver} — the shared durable queue for multi-node
 * deployments.
 *
 * The driver contract lives in `@ndigo/jobs`; this adapter keeps four keys per
 * namespace — a ready ZSET (`runAt` scores), a lease ZSET (expiry scores), a
 * records hash (stored JSON), an attempts hash (claim counts) and an errors
 * hash (last failure message) — and performs every state transition that must
 * be atomic (claim/reclaim) in one Lua script, so two workers racing the same
 * namespace cannot lease the same job.
 *
 * Contract parity with `InProcessJobDriver`: `runAt` ordering, attempts
 * incremented at claim, expired leases reclaimed by the next `claim`, and
 * terminal `complete`/`fail` removal. Payloads round-trip through JSON.
 *
 * The connection is **borrowed** (the `RedisSocketFanout` pattern): the driver
 * never connects, subscribes, or closes it. `close()` only seals this handle —
 * manage the connection's lifecycle (`connect()`/`close()`), then the handle's.
 *
 * @module ndigo-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
import { FrameworkError } from '@ndigo/core';
import {
    parseJobPayload,
    resolveJobRequest,
    serializeJobPayload,
    type ClaimOptions,
    type JobDriver,
    type JobId,
    type JobRecord,
    type JobRequest,
} from '@ndigo/jobs';
import type { RedisConnection } from '../connection';

/**
 * Atomic claim: reclaim expired leases, then lease up to `limit` ready jobs.
 * Returns a flat `[id, attempts, id, attempts, …]` reply. Companion hashes
 * are swept for record-less ids so a missed `#discard` cannot leak
 * `attempts`/`errors` entries forever.
 *
 * KEYS: ready ZSET, leases ZSET, records hash, attempts hash, errors hash.
 * ARGV: now (ms), limit, leaseMs.
 */
const CLAIM_SCRIPT = `local ready = KEYS[1]
local leases = KEYS[2]
local records = KEYS[3]
local attempts = KEYS[4]
local errors = KEYS[5]
local now = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local leaseMs = tonumber(ARGV[3])
local expired = redis.call('ZRANGEBYSCORE', leases, '-inf', now, 'LIMIT', 0, limit)
for i = 1, #expired do
  local id = expired[i]
  if redis.call('ZREM', leases, id) == 1 then
    if redis.call('HEXISTS', records, id) == 1 then
      redis.call('ZADD', ready, now, id)
    else
      -- The record is already gone (a partial/missed #discard): sweep the
      -- companion hashes so attempts/errors cannot accumulate forever.
      redis.call('HDEL', attempts, id)
      redis.call('HDEL', errors, id)
    end
  end
end
local out = {}
local readyIds = redis.call('ZRANGEBYSCORE', ready, '-inf', now, 'LIMIT', 0, limit)
for i = 1, #readyIds do
  local id = readyIds[i]
  if redis.call('ZREM', ready, id) == 1 then
    if redis.call('HEXISTS', records, id) == 1 then
      local count = redis.call('HINCRBY', attempts, id, 1)
      redis.call('ZADD', leases, now + leaseMs, id)
      out[#out + 1] = id
      out[#out + 1] = tostring(count)
    else
      redis.call('HDEL', attempts, id)
      redis.call('HDEL', errors, id)
    end
  end
end
return out`;

/**
 * Atomic lease heartbeat: extend **only when the job is still leased**.
 * Two round-trips (`zScore` + `zAdd`) left the ready→leases transition
 * exposed: a stale holder could re-extend a lease a concurrent `CLAIM_SCRIPT`
 * just reclaimed for a second worker (double-claim, AD72-H1). One script
 * makes the check + extend a single atomic unit.
 *
 * KEYS: leases ZSET. ARGV: id, new expiry (ms).
 */
const HEARTBEAT_SCRIPT = `local leases = KEYS[1]
local id = ARGV[1]
local expiry = tonumber(ARGV[2])
if redis.call('ZSCORE', leases, id) ~= false then
  redis.call('ZADD', leases, expiry, id)
  return 1
end
return 0`;

/**
 * Atomic retry: requeue **only while the record still exists**. Two
 * round-trips (`hGet` + `multi`) exposed a resurrection window: a concurrent
 * `complete()`/`fail()` (`#discard`) between them could delete the record,
 * after which the retry's `hSet` re-created a terminal job as a zombie
 * (AD72-H2). One script makes the existence check + requeue atomic, and
 * refreshes the stored `runAt` so a reclaim reads the new schedule.
 *
 * KEYS: records hash, errors hash, ready ZSET, leases ZSET.
 * ARGV: id, runAt (ms), lastError.
 */
const RETRY_SCRIPT = `local records = KEYS[1]
local errors = KEYS[2]
local ready = KEYS[3]
local leases = KEYS[4]
local id = ARGV[1]
local runAt = tonumber(ARGV[2])
local lastError = ARGV[3]
if redis.call('HEXISTS', records, id) == 0 then
  return 0
end
local raw = redis.call('HGET', records, id)
if type(raw) == 'string' then
  local data = cjson.decode(raw)
  data['runAt'] = runAt
  redis.call('HSET', records, id, cjson.encode(data))
end
redis.call('HSET', errors, id, lastError)
redis.call('ZADD', ready, runAt, id)
redis.call('ZREM', leases, id)
return 1`;

/**
 * The record fields stored per job (attempts and lastError live in their own
 * hashes so the claim script can increment/read them without JSON parsing).
 */
interface StoredJobData {
    type: string;
    payload: unknown;
    maxAttempts: number;
    runAt: number;
    createdAt: number;
    timeoutMs?: number;
}

/**
 * Options for {@link RedisJobDriver}.
 */
export interface RedisJobDriverOptions {
    /** Borrowed connection (already connected or connected by the application). */
    connection: RedisConnection;
    /** Application/environment namespace; isolates queues sharing one Redis. */
    namespace: string;
    /** Id factory override; defaults to `crypto.randomUUID`. */
    idFactory?: () => string;
}

/**
 * Durable {@link JobDriver} on Redis (standalone 7.2+; sorted sets and Lua
 * only). One handle per namespace; construct independently in every worker.
 *
 * @since 1.0.0
 */
export class RedisJobDriver implements JobDriver {
    readonly kind = 'redis';
    readonly #connection: RedisConnection;
    readonly #prefix: string;
    readonly #idFactory: () => string;
    #closed = false;

    /**
     * @param options - Borrowed connection, namespace, optional id factory.
     */
    constructor(options: RedisJobDriverOptions) {
        if (options === null || typeof options !== 'object' || options.connection === undefined) {
            throw new TypeError('RedisJobDriver: options.connection is required');
        }
        if (typeof options.namespace !== 'string' || !/^[A-Za-z0-9._:-]+$/.test(options.namespace)) {
            throw new TypeError(
                `RedisJobDriver: namespace must be a non-empty [A-Za-z0-9._:-] string, got ${JSON.stringify(options.namespace)}`
            );
        }
        this.#connection = options.connection;
        this.#prefix = `ndigo:jobs:${options.namespace}:`;
        this.#idFactory = options.idFactory ?? (() => crypto.randomUUID());
    }

    /** @inheritdoc */
    async enqueue(request: JobRequest): Promise<JobRecord> {
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
        const data: StoredJobData = {
            type: record.type,
            payload: record.payload,
            maxAttempts: record.maxAttempts,
            runAt: record.runAt,
            createdAt: record.createdAt,
            ...(record.timeoutMs !== undefined ? { timeoutMs: record.timeoutMs } : {}),
        };
        const keys = this.#keys();
        await this.#connection.run(async (client) => {
            await client
                .multi()
                .hSet(keys.records, record.id, JSON.stringify(data))
                .zAdd(keys.ready, { score: record.runAt, value: record.id })
                .exec();
        });
        return record;
    }

    /** @inheritdoc */
    async claim(options: ClaimOptions): Promise<JobRecord[]> {
        this.#assertOpen();
        assertClaimOptions(options);
        const now = Date.now();
        const keys = this.#keys();
        return this.#connection.run(async (client) => {
            const reply = await client.eval(CLAIM_SCRIPT, {
                keys: [keys.ready, keys.leases, keys.records, keys.attempts, keys.errors],
                arguments: [String(now), String(options.limit), String(options.leaseMs)],
            });
            const pairs = toIdAttemptPairs(reply);
            if (pairs.length === 0) {
                return [];
            }
            const ids = pairs.map((pair) => pair.id);
            const dataRows = await client.hmGet(keys.records, ids);
            const errorRows = await client.hmGet(keys.errors, ids);
            const claimed: JobRecord[] = [];
            for (let index = 0; index < pairs.length; index += 1) {
                const serialized = dataRows[index];
                if (serialized === null || serialized === undefined) {
                    continue; // the record was completed while this claim was in flight
                }
                const pair = pairs[index];
                if (pair === undefined) {
                    continue;
                }
                const data = decodeStoredData(serialized, pair.id);
                const lastError = errorRows[index];
                claimed.push({
                    id: pair.id,
                    type: data.type,
                    payload: data.payload,
                    attempts: pair.attempts,
                    maxAttempts: data.maxAttempts,
                    runAt: data.runAt,
                    createdAt: data.createdAt,
                    ...(data.timeoutMs !== undefined ? { timeoutMs: data.timeoutMs } : {}),
                    ...(typeof lastError === 'string' && lastError.length > 0 ? { lastError } : {}),
                });
            }
            return claimed;
        });
    }

    /** @inheritdoc */
    async complete(id: JobId): Promise<void> {
        this.#assertOpen();
        await this.#discard(id);
    }

    /** @inheritdoc */
    async retry(id: JobId, runAt: number, lastError: string): Promise<void> {
        this.#assertOpen();
        const keys = this.#keys();
        await this.#connection.run(async (client) => {
            // One atomic unit: the existence check and the requeue cannot be
            // separated by a concurrent complete()/fail() #discard, so a
            // terminal job is never resurrected (AD72-H2).
            await client.eval(RETRY_SCRIPT, {
                keys: [keys.records, keys.errors, keys.ready, keys.leases],
                arguments: [id, String(runAt), lastError],
            });
        });
    }

    /** @inheritdoc */
    async fail(id: JobId, lastError: string): Promise<void> {
        this.#assertOpen();
        void lastError; // terminal errors surface through telemetry/logs, not storage (AD-72 D-2)
        await this.#discard(id);
    }

    /** @inheritdoc */
    async heartbeat(id: JobId, leaseMs: number): Promise<void> {
        this.#assertOpen();
        const keys = this.#keys();
        await this.#connection.run(async (client) => {
            // One atomic unit: the still-leased check and the extend cannot
            // be separated by a concurrent claim, so a stale holder can
            // never revive a lease a successor just moved to ready (AD72-H1).
            await client.eval(HEARTBEAT_SCRIPT, {
                keys: [keys.leases],
                arguments: [id, String(Date.now() + leaseMs)],
            });
        });
    }

    /** @inheritdoc */
    async size(): Promise<number> {
        this.#assertOpen();
        const keys = this.#keys();
        return this.#connection.run(async (client) => {
            const reply: unknown = await client.multi().zCard(keys.ready).zCard(keys.leases).exec();
            if (!Array.isArray(reply) || reply.length !== 2) {
                throw new FrameworkError('RedisJobDriver: size reply was not two cardinalities');
            }
            return Number(reply[0]) + Number(reply[1]);
        });
    }

    /**
     * Seals this handle (borrowed connection untouched; idempotent). Later
     * operations reject with a closed-handle error.
     */
    async close(): Promise<void> {
        this.#closed = true;
    }

    async #discard(id: JobId): Promise<void> {
        const keys = this.#keys();
        await this.#connection.run(async (client) => {
            await client
                .multi()
                .hDel(keys.records, id)
                .hDel(keys.attempts, id)
                .hDel(keys.errors, id)
                .zRem(keys.leases, id)
                .zRem(keys.ready, id)
                .exec();
        });
    }

    #keys(): { ready: string; leases: string; records: string; attempts: string; errors: string } {
        return {
            ready: `${this.#prefix}ready`,
            leases: `${this.#prefix}leases`,
            records: `${this.#prefix}records`,
            attempts: `${this.#prefix}attempts`,
            errors: `${this.#prefix}errors`,
        };
    }

    #assertOpen(): void {
        if (this.#closed) {
            throw new FrameworkError('RedisJobDriver is closed — a closed driver accepts no operations');
        }
    }
}

/**
 * Narrows a Lua reply to `[id, attempts]` pairs.
 *
 * @param reply - The raw `EVAL` reply.
 * @returns The parsed pairs.
 */
function toIdAttemptPairs(reply: unknown): Array<{ id: string; attempts: number }> {
    if (!Array.isArray(reply)) {
        throw new FrameworkError('RedisJobDriver: claim script returned a non-array reply');
    }
    const pairs: Array<{ id: string; attempts: number }> = [];
    for (let index = 0; index + 1 < reply.length; index += 2) {
        const id = String(reply[index]);
        const attempts = Number(reply[index + 1]);
        if (!Number.isSafeInteger(attempts) || attempts < 1) {
            throw new FrameworkError(`RedisJobDriver: claim script returned an invalid attempt count for '${id}'`);
        }
        pairs.push({ id, attempts });
    }
    return pairs;
}

/**
 * Decodes stored record JSON, failing loud on corruption.
 *
 * @param serialized - The stored JSON text.
 * @param id - The job id (error context).
 * @returns The stored data.
 */
function decodeStoredData(serialized: string, id: string): StoredJobData {
    const raw = parseJobPayload(serialized);
    if (raw === null || typeof raw !== 'object') {
        throw new FrameworkError(`RedisJobDriver: stored record for '${id}' is not an object`);
    }
    const data = raw as Partial<StoredJobData>; // validated below before use
    if (typeof data.type !== 'string' || typeof data.maxAttempts !== 'number') {
        throw new FrameworkError(`RedisJobDriver: stored record for '${id}' is missing type/maxAttempts`);
    }
    if (typeof data.runAt !== 'number' || typeof data.createdAt !== 'number') {
        throw new FrameworkError(`RedisJobDriver: stored record for '${id}' is missing runAt/createdAt`);
    }
    return {
        type: data.type,
        payload: data.payload,
        maxAttempts: data.maxAttempts,
        runAt: data.runAt,
        createdAt: data.createdAt,
        ...(typeof data.timeoutMs === 'number' ? { timeoutMs: data.timeoutMs } : {}),
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
