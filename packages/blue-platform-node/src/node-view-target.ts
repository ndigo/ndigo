/**
 * View target that writes rendered output to a Node.js `ServerResponse`.
 *
 * @module
 * @since 1.0.0
 */

import type { ServerResponse } from 'node:http';
import { Route } from '@blue/router';
import { ViewTarget } from '@blue/view';
import { isResponseEntity } from './response-entity';

/**
 * A `ViewTarget` implementation that writes rendered view output to an HTTP
 * `ServerResponse`. Supports content negotiation via the `Accept` header.
 */
export class HTTPResponseViewTarget implements ViewTarget {
    readonly #response: ServerResponse | undefined;

    /**
     * @param response - The Node.js `ServerResponse` to write to.
     */
    constructor(response: ServerResponse | undefined) {
        this.#response = response;
    }

    /** @inheritdoc */
    async prepare(route: Route): Promise<void> {
        // Content type and headers are set by the view or response entity
    }

    /** @inheritdoc */
    async commit(output: unknown, model: unknown, route: Route): Promise<void> {
        if (!this.#response || this.#response.headersSent) {
            return;
        }

        // Check if the model contains a ResponseEntity for status/headers
        if (isResponseEntity(model)) {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
                ...(model.headers ?? {}),
            };
            this.#response.writeHead(model.status.code, headers);
            if (model.body === undefined || model.body === null) {
                this.#response.end();
            } else if (
                typeof model.body === 'string' &&
                !headers['Content-Type']?.includes('application/json')
            ) {
                this.#response.end(model.body);
            } else {
                this.#response.end(JSON.stringify(model.body));
            }
            return;
        }

        if (typeof output === 'string') {
            if (!this.#response.headersSent) {
                this.#response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            }
            this.#response.end(output);
        } else {
            if (!this.#response.headersSent) {
                this.#response.writeHead(200, { 'Content-Type': 'application/json' });
            }
            this.#response.end(JSON.stringify(output));
        }
    }

    /** @inheritdoc */
    async clear(): Promise<void> {
        // No-op — the response is finalized after commit
    }
}