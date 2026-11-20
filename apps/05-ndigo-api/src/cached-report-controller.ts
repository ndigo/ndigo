/**
 * Demo gate: `@cached` on a controller-backed service method.
 */
import '@tsmetadata/polyfill';
import { getMapping, requestMapping } from '@ndigo/dispatcher';
import { cached } from '@ndigo/cache';
import type { Cache } from '@ndigo/cache';
import { AsApplicationContextAware, ContextToken } from '@ndigo/context';

/**
 * The reports store — typed cache handle: used by `@cached` and
 * by manual eviction (`cacheManager.getCache(REPORTS).delete(key)`).
 */
export const REPORTS = new ContextToken<Cache<{ invocations: number; value: string }>>('reports');

/**
 * `@cached` demo:
 *
 * - The entry resolves the platform's `cacheManager` entry through
 *   `ApplicationContextAware` (the same DI seam `ScheduleRegistry` uses) —
 *   no manual cache construction.
 * - `report()` is cached for 60 s under the token-identified `reports` cache:
 *   two dispatches within the TTL invoke the method once (the spec's
 *   `invocations` counter), and the manual-invalidation contract is
 *   `cacheManager.getCache(REPORTS).delete/clear`.
 * - The cached method must be public for TC39 decorator application. Shadow
 *   weaving installs the advice on the instance, so `report()`'s call to
 *   `this.reportValue()` is cached too.
 *
 * @see docs/guides/19-caching.md
 */
@requestMapping('/api')
export class CachedReportController extends AsApplicationContextAware(Object) {
    #invocations = 0;

    /**
     * `@cached` only declares; `CachedInterceptor` (registered on the
     * builder) resolves the platform's `cacheManager` entry from
     * `this.applicationContext`, injected by `AsApplicationContextAware`.
     */

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
    @cached({ cache: REPORTS, ttl: 60_000 })
    async reportValue(): Promise<{ invocations: number; value: string }> {
        this.#invocations += 1;
        return { invocations: this.#invocations, value: `report-${this.#invocations}` };
    }
}
