/**
 * Static file serving controller.
 */
import '@tsmetadata/polyfill';
import { getEnv } from '@ndigo/context';
import { getMapping, parameters, pathVariable, requestMapping, routeValue } from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { StaticResourceHandler, type StaticHandlerOptions } from './static-resource-handler';

/**
 * Static file serving controller: serves files under /static.
 *
 * The catch-all route binds nested paths (`/static/assets/logo.png`
 * to `assets/logo.png`), and every HTTP concern — conditional GET, Range,
 * cache headers, precompressed variants, directory index/listing, SPA
 * fallback — is delegated to {@link StaticResourceHandler}.
 *
 * @example
 * ```ts
 * class AppConfig {
 *   @entry()
 *   staticController() {
 *     return new StaticController(resolve('dist'), { spaFallback: true });
 *   }
 * }
 * ```
 */
@requestMapping('/static')
export class StaticController {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "StaticController".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object StaticController]"
     */
    get [Symbol.toStringTag](): string {
        return 'StaticController';
    }

    readonly #handler: StaticResourceHandler;

    /**
     * Creates the static controller.
     *
     * @param baseDir - Static root. Defaults to `STATIC_DIR` env or `./public`.
     * @param options - Static handler options.
     */
    constructor(baseDir?: string, options: StaticHandlerOptions = {}) {
        const base = baseDir ?? getEnv('STATIC_DIR') ?? `${process.cwd()}/public`;
        this.#handler = new StaticResourceHandler(base, options);
    }

    /**
     * GET/HEAD /static/`{*file}` — serves the file with full HTTP semantics.
     *
     * @param file - The requested file path.
     * @param route - The current route.
     */
    @getMapping('/{*file}')
    @parameters({ file: pathVariable('file'), route: routeValue() })
    async serve(file?: string, route?: Route) {
        // The handler writes the response directly (206/304/416 need
        // status+header control `ResponseEntityView` cannot express).
        await this.#handler.handle(route as Route, file ?? '');
    }
}
