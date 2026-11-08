/**
 * View target that writes rendered output to a Node.js `ServerResponse`.
 */
import type { ServerResponse } from 'node:http';
import { Route } from '@ndigo/router';
import { MediaTypes } from '@ndigo/core';
import { HTTPHeaders } from '@ndigo/http';
import { ViewTarget } from '@ndigo/view';
import { isResponseEntity } from './response-entity';
import { ResponseEntityView } from './response-entity-view';
import { writeRenderResult } from './producer-writer';

/**
 * A `ViewTarget` implementation that writes rendered view output to an HTTP
 * `ServerResponse`. Supports content negotiation via the `Accept` header.
 */
export class HTTPResponseViewTarget implements ViewTarget {
    readonly #response: ServerResponse | undefined;

    /**
     * Creates a view target over a Node response.
     *
     * @param response - The Node.js `ServerResponse` to write to.
     */
    constructor(response: ServerResponse | undefined) {
        this.#response = response;
    }

    /**
     * Prepares the target for a render (no-op).
     *
     * @param route - The route being rendered.
     * @returns A promise that resolves immediately.
     */
    async prepare(route: Route): Promise<void> {
        // Content type and headers are set by the view or response entity
    }

    /**
     * Writes the rendered output to the response.
     *
     * @param output - The rendered output.
     * @param model - The data model.
     * @param route - The current route.
     * @returns A promise that resolves once written.
     */
    async commit(output: unknown, model: unknown, route: Route): Promise<void> {
        if (!this.#response || this.#response.headersSent) {
            return;
        }

        // Check if the model contains a ResponseEntity for status/headers.
        // Delegates to ResponseEntityView so entity serialization (notably
        // the 4xx/5xx problem+json shape) has a single implementation.
        if (isResponseEntity(model)) {
            await writeRenderResult(this.#response, await new ResponseEntityView().renderTo(model, route));
            return;
        }

        if (typeof output === 'string') {
            if (!this.#response.headersSent) {
                this.#response.writeHead(200, { [HTTPHeaders.CONTENT_TYPE.name]: 'text/html; charset=utf-8' });
            }
            this.#response.end(output);
        } else {
            if (!this.#response.headersSent) {
                this.#response.writeHead(200, { [HTTPHeaders.CONTENT_TYPE.name]: String(MediaTypes.APPLICATION_JSON) });
            }
            this.#response.end(JSON.stringify(output));
        }
    }

    /** {@inheritDoc} */
    async clear(): Promise<void> {
        // No-op — the response is finalized after commit
    }
}
