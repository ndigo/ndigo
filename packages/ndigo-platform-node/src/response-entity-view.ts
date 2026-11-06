/**
 * View that renders a `ResponseEntity` to a response document.
 */
import { Route } from '@ndigo/router';
import { MediaTypes } from '@ndigo/core';
import { type ProducerView, type RenderResult } from '@ndigo/view';
import { ResponseEntity } from './response-entity';
import { isProblemDetails, toProblemDetails, type ProblemDetails } from './problem-details';

/**
 * A view that produces a `ResponseEntity` (status, headers, body) as a
 * complete response document.
 */
export class ResponseEntityView implements ProducerView {
    /** @inheritdoc */
    async renderTo(entity: ResponseEntity<unknown>, route: Route): Promise<RenderResult> {
        // AD-10: every 4xx/5xx response is a problem+json document.
        if (entity.status.code >= 400) {
            const details = isProblemDetails(entity.body)
                ? (entity.body as unknown as ProblemDetails)
                : toProblemDetails(entity.body, entity.status.code, entity.status.text, route.path);
            return {
                status: entity.status.code,
                headers: { 'Content-Type': 'application/problem+json', ...entity.headers },
                body: JSON.stringify(details),
            };
        }

        const headers: Record<string, string> = {
            'Content-Type': String(MediaTypes.APPLICATION_JSON),
            ...entity.headers,
        };

        if (entity.body === undefined || entity.body === null) {
            return { status: entity.status.code, headers, body: '' };
        }
        if (typeof entity.body === 'string' && !headers['Content-Type']?.includes('application/json')) {
            // Raw string body for non-JSON content types (e.g. HTML, CSS).
            return { status: entity.status.code, headers, body: entity.body };
        }
        if (Buffer.isBuffer(entity.body)) {
            // Raw binary body (e.g. static file bytes) — never JSON-encode.
            return { status: entity.status.code, headers, body: entity.body };
        }
        return { status: entity.status.code, headers, body: JSON.stringify(entity.body) };
    }
}
