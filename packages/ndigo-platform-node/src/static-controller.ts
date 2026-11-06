/**
 * Static file serving controller.
 */
import '@tsmetadata/polyfill';
import { getEnv } from '@ndigo/context';
import { getMapping, parameters, pathVariable, requestMapping, routeValue } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { StaticResourceHandler, type StaticHandlerOptions } from './static-resource-handler';

/**
 * Static file serving controller (AD-28): `/static/{*file}`.
 *
 * The catch-all `{*file}` route binds nested paths (`/static/assets/logo.png`
 * → `assets/logo.png`), and every HTTP concern — conditional GET, Range,
 * cache headers, precompressed variants, directory index/listing, SPA
 * fallback — is delegated to {@link StaticResourceHandler}.
 *
 * @example
 * ```ts
 * @entry()
 * staticController() {
 *     return new StaticController(resolve('dist'), { spaFallback: true });
 * }
 * ```
 */
@requestMapping('/static')
export class StaticController {
    readonly #handler: StaticResourceHandler;

    /**
     * @param baseDir - Static root. Defaults to `STATIC_DIR` env or `./public`.
     * @param options - Static handler options (D-6).
     */
    constructor(baseDir?: string, options: StaticHandlerOptions = {}) {
        const base = baseDir ?? getEnv('STATIC_DIR') ?? `${process.cwd()}/public`;
        this.#handler = new StaticResourceHandler(base, options);
    }

    /**
     * GET/HEAD /static/{*file} — serves the file with full HTTP semantics.
     */
    @getMapping('/{*file}')
    @parameters({ file: pathVariable('file'), route: routeValue() })
    async serve(file?: string, route?: Route) {
        // The handler writes the response directly (206/304/416 need
        // status+header control `ResponseEntityView` cannot express).
        await this.#handler.handle(route as Route, file ?? '');
    }
}
