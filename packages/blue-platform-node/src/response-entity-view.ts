/**
 * View that renders a `ResponseEntity` to the HTTP response.
 *
 * 4xx/5xx entities are rendered as RFC 9457 `application/problem+json`
 * documents (AD-10): a body that is already a `ProblemDetails` (framework
 * resolvers) is written verbatim; any other 4xx/5xx body is wrapped with a
 * problem envelope (`type` omitted → `about:blank`, `title` = reason phrase,
 * `detail` = the string body / the `error` member / the JSON body, `instance`
 * = request path). Success responses are unchanged.
 *
 * @module
 * @since 1.0.0
 */

import type { ServerResponse } from 'node:http';
import { Route } from '@blue/router';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';
import { ResponseEntity } from './response-entity';
import { isProblemDetails, toProblemDetails, writeProblem, type ProblemDetails } from './problem-details';

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

        // AD-10: every 4xx/5xx response is a problem+json document.
        if (entity.status.code >= 400) {
            if (isProblemDetails(entity.body)) {
                writeProblem(res, entity.body as unknown as ProblemDetails);
            } else {
                const details = toProblemDetails(entity.body, entity.status.code, entity.status.text, route.path);
                writeProblem(res, details);
            }
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
        } else if (Buffer.isBuffer(entity.body)) {
            // Raw binary body (e.g. static file bytes) — never JSON-encode.
            res.writeHead(entity.status.code, headers);
            res.end(entity.body);
        } else {
            res.writeHead(entity.status.code, headers);
            res.end(JSON.stringify(entity.body));
        }
    }
}