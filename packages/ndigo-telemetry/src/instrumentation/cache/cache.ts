/**
 * OpenTelemetry instrumentation for the `@ndigo/cache` in-memory store.
 */
import { SpanKind } from '@opentelemetry/api';
import { MemoryCache } from '@ndigo/cache';
import { AbstractBaseInstrumentation } from '../base';

/**
 * OpenTelemetry instrumentation for `CacheInstrumentation`.
 *
 * @example
 * ```ts
 * const instrumentation = new CacheInstrumentation();
 * instrumentation.enable();
 * ```
 */
export class CacheInstrumentation extends AbstractBaseInstrumentation {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "CacheInstrumentation".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object CacheInstrumentation]"
     */
    get [Symbol.toStringTag](): string {
        return 'CacheInstrumentation';
    }

    constructor() {
        super('cache');
    }

    /**
     * Wraps the instrumented methods.
     */
    enable(): void {
        this._wrap(MemoryCache.prototype, 'get', this._patch({ name: 'Cache.get', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'set', this._patch({ name: 'Cache.set', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'has', this._patch({ name: 'Cache.has', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'delete', this._patch({ name: 'Cache.delete', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'clear', this._patch({ name: 'Cache.clear', kind: SpanKind.INTERNAL }));
        this._wrap(MemoryCache.prototype, 'size', this._patch({ name: 'Cache.size', kind: SpanKind.INTERNAL }));
    }

    /**
     * Restores the original methods.
     */
    disable(): void {
        this._unwrap(MemoryCache.prototype, 'get');
        this._unwrap(MemoryCache.prototype, 'set');
        this._unwrap(MemoryCache.prototype, 'has');
        this._unwrap(MemoryCache.prototype, 'delete');
        this._unwrap(MemoryCache.prototype, 'clear');
        this._unwrap(MemoryCache.prototype, 'size');
    }
}
