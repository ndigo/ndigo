/**
 * View that renders a `ResponseEntity` to the HTTP response.
 *
 * @module
 * @since 1.0.0
 */

import type { ServerResponse } from 'node:http';
import { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { ResponseEntity } from './response-entity';

/**
 * A view that writes a `ResponseEntity` (status, headers, body) to the
 * `ServerResponse` stored in the route's attributes.
 */
export class ResponseEntityView {
    /**
     * Render an `ResponseEntity` to the HTTP response.
     *
     * @param entity - The response entity.
     * @param route - The current route.
     */
    async render(entity: ResponseEntity<unknown>, route: Route): Promise<void> {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as unknown as ServerResponse | undefined;

        if (!res || res.headersSent) {
            return;
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...entity.headers,
        };

        if (entity.body === undefined || entity.body === null) {
            res.writeHead(entity.status.code, headers);
            res.end();
        } else if (typeof entity.body === 'string' && !headers['Content-Type']?.includes('application/json')) {
            // Raw string body for non-JSON content types (e.g. HTML, CSS, images).
            res.writeHead(entity.status.code, headers);
            res.end(entity.body);
        } else {
            res.writeHead(entity.status.code, headers);
            res.end(JSON.stringify(entity.body));
        }
    }
}
