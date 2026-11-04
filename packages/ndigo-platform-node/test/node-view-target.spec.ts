/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import type { ServerResponse } from 'node:http';
import { Route } from '@ndigo/router';
import { ResponseStatuses } from '@ndigo/http';
import { ResponseEntity } from '../src/response-entity';
import { HTTPResponseViewTarget } from '../src/node-view-target';

/** Minimal `ServerResponse` capture for the view target's `commit()`. */
function memorySink() {
    const captured: { status: number; headers: Record<string, string>; body: unknown } = {
        status: 200,
        headers: {},
        body: undefined,
    };
    const sink = {
        get headersSent() {
            return false;
        },
        writeHead(status: number, headers?: Record<string, string>): void {
            captured.status = status;
            if (headers) {
                Object.assign(captured.headers, headers);
            }
        },
        end(body?: unknown): void {
            captured.body = body;
        },
    };
    return { captured, sink };
}

const route = {
    path: '/widgets/42',
    attributes: {},
    data: {},
    params: {},
    raw: '/widgets/42',
    id: 'fragment-route',
    length: 0,
} as unknown as Route;

/**
 * The fragment path renders through `HTTPResponseViewTarget`; its entity-model
 * branch must share `ResponseEntityView`'s serialization — in particular the
 * RFC 9457 `application/problem+json` shape for 4xx responses (PL-11).
 */
describe('HTTPResponseViewTarget entity models (fragment path)', () => {
    test('renders a 4xx entity as an RFC 9457 problem+json document', async () => {
        const { captured, sink } = memorySink();
        const target = new HTTPResponseViewTarget(sink as unknown as ServerResponse);

        await target.commit(undefined, new ResponseEntity({ error: 'missing' }, ResponseStatuses.NOT_FOUND), route);

        expect(captured.status).toBe(404);
        expect(captured.headers['Content-Type']).toBe('application/problem+json');
        expect(JSON.parse(captured.body as string)).toEqual({
            status: 404,
            title: 'Not Found',
            detail: 'missing',
            instance: '/widgets/42',
        });
    });

    test('renders a 2xx entity as JSON with its headers', async () => {
        const { captured, sink } = memorySink();
        const target = new HTTPResponseViewTarget(sink as unknown as ServerResponse);

        await target.commit(undefined, new ResponseEntity({ id: 1 }, ResponseStatuses.OK, { 'X-Widget': '42' }), route);

        expect(captured.status).toBe(200);
        expect(captured.headers['Content-Type']).toBe('application/json');
        expect(captured.headers['X-Widget']).toBe('42');
        expect(captured.body).toBe('{"id":1}');
    });

    test('preserves handler-set headers on a 4xx problem+json response', async () => {
        const { captured, sink } = memorySink();
        const target = new HTTPResponseViewTarget(sink as unknown as ServerResponse);

        await target.commit(
            undefined,
            new ResponseEntity({ error: 'unauthorized' }, ResponseStatuses.UNAUTHORIZED, {
                'WWW-Authenticate': 'Bearer realm="api"',
            }),
            route
        );

        expect(captured.status).toBe(401);
        expect(captured.headers['Content-Type']).toBe('application/problem+json');
        // Regression: a 4xx must carry handler-set headers (e.g. WWW-Authenticate),
        // not just the problem+json Content-Type.
        expect(captured.headers['WWW-Authenticate']).toBe('Bearer realm="api"');
    });
});
