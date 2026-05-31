/**
 * @author Jeff Rose
 */

import 'node:process';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { MetadataConfigApplicationContext } from '@blue/context';
import { MetadataHandlerAdapter, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration, NodeRequest, NODE_REQUEST_ATTRIBUTE } from '@blue/platform-node';
import { NodeAppConfiguration } from './node-app-configuration';

// ── Bootstrap ──────────────────────────────────────────────────────────────
const context = new MetadataConfigApplicationContext('demo-node');
context.register(NodeAutoConfiguration);
context.register(NodeAppConfiguration);
context.refresh();

const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
// Belt-and-suspenders: re-run init so all controllers registered in NodeAppConfiguration
// are definitely detected (factory may have already done this during refresh).
handlerMapping.init();

const handlerAdapter = new MetadataHandlerAdapter();
handlerAdapter.setApplicationContext(context);
handlerAdapter.init();

// ── HTTP server ────────────────────────────────────────────────────────────
async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
        let raw = '';
        req.on('data', (chunk: Buffer) => (raw += chunk.toString()));
        req.on('end', () => {
            try {
                resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
            } catch {
                resolve({});
            }
        });
    });
}

const PORT = parseInt(process.env['PORT'] ?? '3000', 10);

/**
 * Parse matrix parameters from a URL pathname.
 *
 * Matrix parameters are semicolon-delimited key=value pairs embedded in path
 * segments: `/products/42;color=red;size=L`.  This function:
 * - Splits the pathname into segments on `/`.
 * - For each segment strips the `;`-delimited matrix params, accumulating them
 *   into a `data` object.
 * - Returns the cleaned path (segments without matrix params, leading `/`
 *   preserved) and an array of segment objects whose `data` maps contain the
 *   parsed matrix parameters.
 *
 * @param pathname - The raw URL pathname (e.g. `/products/42;color=red`).
 * @returns `{ cleanedPath, segments }` where `cleanedPath` is the path with
 *   matrix params removed, and `segments[i].data` holds the matrix params for
 *   segment `i`.
 */
function parseMatrixParams(pathname: string): { cleanedPath: string; segments: Array<{ data: Record<string, string> }> } {
    const segments: Array<{ data: Record<string, string> }> = [];
    const pathParts = pathname.split('/').filter(part => part !== '');

    let cleanedPath = '';

    for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const [segmentValue, ...matrixParams] = part.split(';');

        // Build cleaned path by joining segment values without matrix params
        if (i === 0) {
            cleanedPath = segmentValue;
        } else {
            cleanedPath += '/' + segmentValue;
        }

        // Parse matrix parameters for this segment
        const data: Record<string, string> = {};
        for (const param of matrixParams) {
            const [key, value] = param.split('=');
            data[key] = value ?? '';
        }

        segments.push({ data });
    }

    return { cleanedPath: cleanedPath ? `/${cleanedPath}` : '/', segments };
}

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const urlObj = new URL(req.url ?? '/', `http://${req.headers['host'] ?? 'localhost'}`);
    const body = await readBody(req);

    // Query params → route.data
    const data: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => (data[key] = value));

    // NodeRequest in route attributes
    const nodeRequest: NodeRequest = {
        headers: req.headers as Record<string, string | string[] | undefined>,
        body,
        cookies: {},
        session: {},
    };

    // Parse matrix parameters from URL path
    const { cleanedPath, segments } = parseMatrixParams(urlObj.pathname);

    // Minimal Route object
    const route: any = {
        length: segments.length,
        id: Date.now(),
        path: cleanedPath,
        raw: req.url ?? '/',
        data,
        params: null,
        pattern: null,
        attributes: { [NODE_REQUEST_ATTRIBUTE]: nodeRequest },
        toJSON() {
            return { path: urlObj.pathname };
        },
    };

    // Assign segments to route object
    for (let i = 0; i < segments.length; i++) {
        route[i] = segments[i];
    }

    try {
        const chain = handlerMapping.getHandler(route);

        if (!chain) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not Found', path: urlObj.pathname }));
            return;
        }

        // After getHandler, the mapping populates route.params from the pattern match.
        // The path resolver reads from route.params so no extra work is needed.
        const result = await handlerAdapter.handle(route, chain.handler);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result ?? {}));
    } catch (err: unknown) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
    }
});

server.listen(PORT, () => {
    console.log(`[blue-demo-node] listening on http://localhost:${PORT}`);
    console.log('');
    console.log('Available routes:');
    console.log(`  GET  http://localhost:${PORT}/api/hello?name=Alice`);
    console.log(`  GET  http://localhost:${PORT}/api/greet/Alice`);
    console.log(`  POST http://localhost:${PORT}/api/echo   (JSON body)`);
    console.log(`  GET  http://localhost:${PORT}/api/products/42;color=red`);
});
