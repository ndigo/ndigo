/**
 * OpenTelemetry instrumentation for `@ndigo/redis`.
 */
import { SpanKind } from '@opentelemetry/api';
import { RedisCache } from '@ndigo/redis/cache';
import { RedisConnection } from '@ndigo/redis';
import { RedisJobDriver } from '@ndigo/redis/jobs';
import { RedisLockDriver } from '@ndigo/redis/locks';
import { RedisRateLimiter } from '@ndigo/redis/rate-limit';
import { RedisSocketFanout } from '@ndigo/redis/pubsub';
import { AbstractBaseInstrumentation } from '@ndigo/telemetry';

/**
 * OpenTelemetry instrumentation for `RedisInstrumentation`.
 */
export class RedisInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('redis');
    }

    enable(): void {
        this._wrap(RedisCache.prototype, 'get', this._patch({ name: 'RedisCache.get', kind: SpanKind.CLIENT }));
        this._wrap(RedisCache.prototype, 'set', this._patch({ name: 'RedisCache.set', kind: SpanKind.CLIENT }));
        this._wrap(RedisCache.prototype, 'has', this._patch({ name: 'RedisCache.has', kind: SpanKind.CLIENT }));
        this._wrap(RedisCache.prototype, 'delete', this._patch({ name: 'RedisCache.delete', kind: SpanKind.CLIENT }));
        this._wrap(RedisCache.prototype, 'clear', this._patch({ name: 'RedisCache.clear', kind: SpanKind.CLIENT }));
        this._wrap(RedisCache.prototype, 'size', this._patch({ name: 'RedisCache.size', kind: SpanKind.CLIENT }));

        this._wrap(RedisLockDriver.prototype, 'acquire', this._patch({ name: 'RedisLock.acquire', kind: SpanKind.CLIENT }));
        this._wrap(RedisLockDriver.prototype, 'close', this._patch({ name: 'RedisLock.close', kind: SpanKind.CLIENT }));

        this._wrap(RedisRateLimiter.prototype, 'consume', this._patch({ name: 'RedisRateLimit.consume', kind: SpanKind.CLIENT }));
        this._wrap(RedisRateLimiter.prototype, 'close', this._patch({ name: 'RedisRateLimit.close', kind: SpanKind.CLIENT }));

        this._wrap(RedisJobDriver.prototype, 'enqueue', this._patch({ name: 'RedisJob.enqueue', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'claim', this._patch({ name: 'RedisJob.claim', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'complete', this._patch({ name: 'RedisJob.complete', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'retry', this._patch({ name: 'RedisJob.retry', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'fail', this._patch({ name: 'RedisJob.fail', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'heartbeat', this._patch({ name: 'RedisJob.heartbeat', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'size', this._patch({ name: 'RedisJob.size', kind: SpanKind.CLIENT }));
        this._wrap(RedisJobDriver.prototype, 'close', this._patch({ name: 'RedisJob.close', kind: SpanKind.CLIENT }));

        this._wrap(RedisSocketFanout.prototype, 'publish', this._patch({ name: 'RedisFanout.publish', kind: SpanKind.CLIENT }));
        this._wrap(RedisSocketFanout.prototype, 'subscribe', this._patch({ name: 'RedisFanout.subscribe', kind: SpanKind.CLIENT }));

        // eslint-disable-next-line typescript/no-explicit-any
        this._wrap(RedisConnection.prototype as any, 'run' as any, this._patch({ name: 'RedisConnection.run', kind: SpanKind.CLIENT }) as any);
        this._wrap(RedisConnection.prototype, 'connect', this._patch({ name: 'RedisConnection.connect', kind: SpanKind.CLIENT }));
        this._wrap(RedisConnection.prototype, 'close', this._patch({ name: 'RedisConnection.close', kind: SpanKind.CLIENT }));
    }

    disable(): void {
        this._unwrap(RedisCache.prototype, 'get');
        this._unwrap(RedisCache.prototype, 'set');
        this._unwrap(RedisCache.prototype, 'has');
        this._unwrap(RedisCache.prototype, 'delete');
        this._unwrap(RedisCache.prototype, 'clear');
        this._unwrap(RedisCache.prototype, 'size');

        this._unwrap(RedisLockDriver.prototype, 'acquire');
        this._unwrap(RedisLockDriver.prototype, 'close');

        this._unwrap(RedisRateLimiter.prototype, 'consume');
        this._unwrap(RedisRateLimiter.prototype, 'close');

        this._unwrap(RedisJobDriver.prototype, 'enqueue');
        this._unwrap(RedisJobDriver.prototype, 'claim');
        this._unwrap(RedisJobDriver.prototype, 'complete');
        this._unwrap(RedisJobDriver.prototype, 'retry');
        this._unwrap(RedisJobDriver.prototype, 'fail');
        this._unwrap(RedisJobDriver.prototype, 'heartbeat');
        this._unwrap(RedisJobDriver.prototype, 'size');
        this._unwrap(RedisJobDriver.prototype, 'close');

        this._unwrap(RedisSocketFanout.prototype, 'publish');
        this._unwrap(RedisSocketFanout.prototype, 'subscribe');

        this._unwrap(RedisConnection.prototype, 'run');
        this._unwrap(RedisConnection.prototype, 'connect');
        this._unwrap(RedisConnection.prototype, 'close');
    }
}