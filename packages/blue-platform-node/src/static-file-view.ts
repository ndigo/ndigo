/**
 * View that serves static files from the filesystem.
 *
 * Path safety is delegated to {@link StaticResourceResolver}: canonical-base
 * containment (prefix + separator), symlink resolution, and a MIME allowlist
 * with `nosniff`. Binary files are served byte-for-byte.
 *
 * @module
 * @since 1.0.0
 */

import type { ServerResponse } from 'node:http';
import { Route } from '@blue/router';
import { ViewTarget } from '@blue/view';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { StaticResourceResolver, statusForKind } from './static-resource-resolver';

/**
 * Serve a static file from a base directory for a matching request path.
 */
export class StaticFileView {
    readonly #resolver: StaticResourceResolver;

    /**
     * @param basePath - The directory to serve files from.
     */
    constructor(basePath: string) {
        this.#resolver = new StaticResourceResolver(basePath);
    }

    /**
     * Render a file to the response.
     *
     * @param _model - Unused.
     * @param route - The current route; `route.path` selects the file.
     * @param target - The view target to commit output to.
     */
    async render(_model: unknown, route: Route, target: ViewTarget): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
        const result = await this.#resolver.resolve(route.path ?? '/');

        if (result.kind !== 'ok') {
            if (res && !res.headersSent) {
                res.writeHead(statusForKind(result.kind), { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: result.kind === 'forbidden' ? 'Forbidden' : 'Not Found' }));
            }
            return;
        }

        await target.commit(result.data as unknown as string, _model, route);
    }
}
