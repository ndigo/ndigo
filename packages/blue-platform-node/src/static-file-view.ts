/**
 * View that serves static files from the filesystem.
 *
 * @module
 * @since 1.0.0
 */

import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import type { ServerResponse } from 'node:http';
import { Route } from '@blue/router';
import { ViewTarget } from '@blue/view';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * Serve a static file from a base directory for a matching request path.
 *
 * Guards against path traversal by normalizing the resolved path and rejecting
 * anything that escapes the base directory.
 */
export class StaticFileView {
    readonly #basePath: string;

    /**
     * @param basePath - The directory to serve files from.
     */
    constructor(basePath: string) {
        this.#basePath = basePath;
    }

    /**
     * Render a file to the response.
     *
     * @param _model - Unused.
     * @param route - The current route; `route.path` selects the file.
     * @param target - The view target to commit output to.
     */
    async render(_model: unknown, route: Route, target: ViewTarget): Promise<void> {
        const filePath = normalize(join(this.#basePath, route.path));

        // Path traversal guard
        if (!filePath.startsWith(this.#basePath)) {
            const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
            if (res && !res.headersSent) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Forbidden' }));
            }
            return;
        }

        try {
            const content = await readFile(filePath, 'utf-8');
            await target.commit(content, _model, route);
        } catch {
            const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;
            if (res && !res.headersSent) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found' }));
            }
        }
    }
}