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
 * precompressed variants, directory modes) to {@link StaticResourceHandler}
 * (AD-28).
 */
export class StaticFileView {
    readonly #handler: StaticResourceHandler;

    /**
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
     */
    async render(_model: unknown, route: Route, _target: ViewTarget): Promise<void> {
        await this.#handler.handle(route, route.path ?? '/');
    }
}
