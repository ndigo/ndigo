/**
 * View that serves static files from the filesystem.
 */
import { Route } from '@ndigo/router';
import { ViewTarget } from '@ndigo/view';
import { StaticResourceHandler, type StaticHandlerOptions } from './static-resource-handler';

/**
 * Serve a static file from a base directory for a matching request path.
 *
 * Delegates every HTTP concern (conditional GET, Range, cache headers,
 * precompressed variants, directory modes) to {@link StaticResourceHandler}.
 *
 * @example
 * ```ts
 * const instance = new StaticFileView();
 * ```
 */
export class StaticFileView {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "StaticFileView".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object StaticFileView]"
     */
    get [Symbol.toStringTag](): string {
        return 'StaticFileView';
    }

    readonly #handler: StaticResourceHandler;

    /**
     * Creates the static file view.
     *
     * @param basePath - The directory to serve files from.
     * @param options - Static handler options (D-6).
     */
    constructor(basePath: string, options: StaticHandlerOptions = {}) {
        this.#handler = new StaticResourceHandler(basePath, options);
    }

    /**
     * Render a file to the response.
     *
     * @param _model - Unused.
     * @param route - The current route; `route.path` selects the file.
     * @param _target - Unused — the handler writes the response directly.
     * @returns A promise that resolves once written.
     */
    async render(_model: unknown, route: Route, _target: ViewTarget): Promise<void> {
        await this.#handler.handle(route, route.path ?? '/');
    }
}
