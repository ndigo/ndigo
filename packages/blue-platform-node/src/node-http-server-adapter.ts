/**
 * Node.js HTTP server adapter wrapping `node:http.createServer()`.
 *
 * Parses the incoming `IncomingMessage` into a `NodeRequest`, creates a `Route`,
 * and dispatches through the `NodeDispatcher`. The dispatcher's render output
 * is written to the `ServerResponse`.
 *
 * @module
 * @since 1.0.0
 */

import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Route, RouteSegment } from '@blue/router';
import { NodeRequest, NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from './node-request';
import type { NodeDispatcher } from './node-dispatcher';
import type { HTTPServerAdapter } from './http-server';

/**
 * Default HTTP server adapter using raw `node:http`.
 *
 * @example
 * ```ts
 * const adapter = new NodeHTTPServerAdapter(dispatcher);
 * await adapter.listen(3000);
 * ```
 */
export class NodeHTTPServerAdapter implements HTTPServerAdapter {
    readonly #dispatcher: NodeDispatcher;
    #server: ReturnType<typeof createServer> | null;

    get server(): unknown {
        return this.#server;
    }

    /**
     * @param dispatcher - The dispatcher to invoke for each incoming request.
     */
    constructor(dispatcher: NodeDispatcher) {
        this.#dispatcher = dispatcher;
        this.#server = null;
    }

    async listen(port: number, host: string): Promise<void> {
        return new Promise((resolve) => {
            this.#server = createServer((req: IncomingMessage, res: ServerResponse) => {
                void this.handleRequest(req, res);
            });
            this.#server.listen(port, host, resolve);
        });
    }

    async close(): Promise<void> {
        return new Promise((resolve) => {
            this.#server?.close(() => resolve());
            this.#server = null;
        });
    }

    async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
        const urlObj = new URL(req.url ?? '/', `http://${req.headers['host'] ?? 'localhost'}`);
        const body = await this.#readBody(req);

        // Build NodeRequest
        const nodeRequest: NodeRequest = {
            headers: req.headers as Record<string, string | string[] | undefined>,
            body,
            cookies: {},
            session: {},
        };

        // Parse matrix params (`/products/42;color=red`) into per-segment data.
        const { segments, cleanedPath } = this.#parseMatrixParams(urlObj.pathname);

        // Build Route — keep the leading slash so handler-mapping patterns
        // (`/hello`) match. PathRoute strips it; the mapping needs it.
        const data: Record<string, string> = {};
        urlObj.searchParams.forEach((value, key) => (data[key] = value));

        const route: Route = {
            length: segments.length,
            id: Date.now(),
            path: cleanedPath,
            raw: req.url ?? '/',
            data,
            params: null,
            method: req.method as Route['method'],
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: nodeRequest,
                [NODE_RESPONSE_ATTRIBUTE]: res,
            },
        };

        // Attach per-segment matrix data so matrix-param conditions can match.
        for (let index = 0; index < segments.length; index++) {
            route[index] = segments[index];
        }

        // Dispatch and render
        try {
            const chain = this.#dispatcher.getHandler(route);
            // The mapping strategy returns an empty execution chain (`handler: {}`)
            // when nothing matches — detect a real handler by its own keys.
            const noHandler = !chain?.handler || Object.keys(chain.handler).length === 0;
            if (noHandler) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not Found', path: urlObj.pathname }));
                return;
            }
            await this.#dispatcher.dispatch(route);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (!res.headersSent) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: message }));
            }
        }
    }

    async #readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
            buffers.push(chunk as Buffer);
        }
        const raw = Buffer.concat(buffers).toString('utf-8');
        if (!raw) return {};
        try {
            return JSON.parse(raw) as Record<string, unknown>;
        } catch {
            return { '*' : raw };
        }
    }

    /**
     * Parse matrix parameters (e.g. `/products/42;color=red`) from a pathname.
     * Returns a cleaned path (matrix params stripped) and per-segment data maps.
     */
    #parseMatrixParams(pathname: string): {
        cleanedPath: string;
        segments: RouteSegment[];
    } {
        const segments: RouteSegment[] = [];
        const pathParts = pathname.split('/').filter((part) => part !== '');

        let cleanedPath = '';

        for (let index = 0; index < pathParts.length; index++) {
            const part = pathParts[index];
            const [segmentValue, ...matrixParams] = part.split(';');

            cleanedPath = index === 0 ? segmentValue : `${cleanedPath}/${segmentValue}`;

            const data: Record<string, string> = {};
            for (const param of matrixParams) {
                const [key, value] = param.split('=');
                data[key] = value ?? '';
            }

            segments.push({ name: segmentValue, raw: part, data });
        }

        return { cleanedPath: cleanedPath ? `/${cleanedPath}` : '/', segments };
    }
}