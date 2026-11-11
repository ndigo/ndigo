/**
 * OpenTelemetry instrumentation for the `@ndigo/cache` in-memory store.
 */
import { SpanKind } from '@opentelemetry/api';
import { MemoryCache } from '@ndigo/cache';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `CacheInstrumentation`.
 */
export class CacheInstrumentation extends AbstractBaseInstrumentation {
    constructor() {
        super('cache');
    }

    enable(): void {
        this._wrap(MemoryCache.prototype, 'get', this._patch({ name: 'Cache.get', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'set', this._patch({ name: 'Cache.set', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'has', this._patch({ name: 'Cache.has', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'delete', this._patch({ name: 'Cache.delete', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'clear', this._patch({ name: 'Cache.clear', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'size', this._patch({ name: 'Cache.size', kind: SpanKind.INTERNAL }));
    }

    disable(): void {
        this._unwrap(MemoryCache.prototype, 'get');
        this._unwrap(MemoryCache.prototype, 'set');
        this._unwrap(MemoryCache.prototype, 'has');
        this._unwrap(MemoryCache.prototype, 'delete');
        this._unwrap(MemoryCache.prototype, 'clear');
        this._unwrap(MemoryCache.prototype, 'size');
    }
}