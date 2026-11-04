/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { AbstractDataBindingArgumentResolver, type DataBindingSource } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import Cookies from './cookies';
import { dumpStorage } from './browser-storage-argument-resolver';

/**
 * The explicit browser bindable-source allow-list (D-3): kind validation in
 * `SOURCES_BY_KIND` is the outer guard; this set keeps a stray `data-*`
 * source (e.g. `data-body` on a browser dispatch) from silently binding
 * nothing.
 */
const BROWSER_BINDABLE_SOURCES: readonly DataBindingSource[] = ['query', 'cookie', 'session-storage', 'local-storage'];

/**
 * Browser whole-source data-binding resolver.
 *
 * Resolves whole browser data sources (`data-query:value`,
 * `data-cookie:value`, `data-session-storage:value`,
 * `data-local-storage:value` — see `dataBinderValue`, D-3) and binds them to
 * objects using the shared `DataBinder` pipeline (the
 * `AbstractDataBindingArgumentResolver` base): source data → prefix filter
 * → `DataBinder` → conversion → Zod hook.
 */
export class BrowserDataBindingMethodArgumentResolver extends AbstractDataBindingArgumentResolver {
    protected readonly bindableSources = BROWSER_BINDABLE_SOURCES;

    get [Symbol.toStringTag](): string {
        return 'BrowserDataBindingMethodArgumentResolver';
    }

    /** Retrieves the browser data source identified by the source name. */
    protected getSourceData(source: string, route: Route): Record<string, unknown> | undefined {
        switch (source) {
            case 'query':
                return route.data;
            case 'cookie': {
                const jar: unknown = Cookies.get('');
                return typeof jar === 'object' && jar !== null ? (jar as Record<string, unknown>) : {};
            }
            case 'session-storage':
                return dumpStorage(globalThis.sessionStorage);
            case 'local-storage':
                return dumpStorage(globalThis.localStorage);
            default:
                return {};
        }
    }
}
