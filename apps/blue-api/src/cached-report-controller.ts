/**
 * AD-24 demo gate: `@cached` on a controller-backed service method.
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@blue/dispatcher';
import { cached } from '@blue/cache';
import type { CacheManager } from '@blue/cache';
import { AsApplicationContextAware } from '@blue/context';
import type { ApplicationContext } from '@blue/context';

/**
 * `@cached` zero-wiring demo (AD-24):
 *
 * - The bean resolves the platform's `cacheManager` bean through
 *   `ApplicationContextAware` (the same DI seam `ScheduleRegistry` uses) —
 *   no manual cache construction.
 * - `report()` is cached for 60 s under the named `reports` cache: two
 *   dispatches within the TTL invoke the method once (spec counter), and the
 *   manual-invalidation contract is `cacheManager.getCache('reports')`
 *   `.delete/clear`.
 * - The cached method must be public for TC39 decorator application — the
 *   wrapper replaces the prototype method, so `this.report()` self-calls are
 *   cached too (documented semantics; stronger than Spring proxies).
 *
 * @see docs/guides/07-caching.md
 */
@requestMapping('/api')
export class CachedReportController extends AsApplicationContextAware(Object) {
    #invocations = 0;

    /**
     * Injected by the framework before bean init (ApplicationContextAware).
     */
    cacheManager?: CacheManager;

    setApplicationContext(context: ApplicationContext): void {
        this.cacheManager = context.getValue<CacheManager>('cacheManager');
    }

    /**
     * Number of times the cached method actually computed its value —
     * the counter the bootstrap spec asserts on.
     */
    get invocations(): number {
        return this.#invocations;
    }

    /**
     * Cache-aside demo: the value is computed once per TTL window and served
     * from the `reports` cache for every subsequent dispatch.
     */
    @getMapping('/cached-report')
    report() {
        return this.reportValue();
    }

    /**
     * The `@cached` method: results cached in `reports` for 60 s, keyed by
     * (no) arguments.
     */
    @cached({ cacheName: 'reports', ttl: 60_000 })
    reportValue(): { invocations: number; value: string } {
        this.#invocations += 1;
        return { invocations: this.#invocations, value: `report-${this.#invocations}` };
    }
}
