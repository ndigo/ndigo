// @vitest-environment node
/**
 * Streamable HTTP end to end over a real Node server, plus protected-resource
 * metadata.
 */
import { createServer, type Server } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { MethodParameter, MethodParameterType, toolMapping } from '@ndigo/dispatcher';
import { NODE_INCOMING_ATTRIBUTE, NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { afterEach, describe, expect, it } from 'vitest';
import { McpHTTPEndpoint, type McpHTTPEndpointOptions, protectedResourceMetadata } from '../src/http';
import { McpToolRegistry } from '../src/registry';
import { createUiResource, MCP_APP_MIME_TYPE } from '../src/ui-resource';
import { handlerMethod, mapping, table } from './_fixtures';

class Controller {
    @toolMapping({ name: 'get_order', readOnly: true })
    getOrder(): unknown {
        return null;
    }
}

function registry(): McpToolRegistry {
    const parameters = [
        new MethodParameter(MethodParameterType.PATH, 'id', true, null, undefined, null, undefined, 'id'),
    ];
    return McpToolRegistry.from(
        table([
            {
                mapping: mapping('/orders/:id'),
                handlerMethod: handlerMethod(new Controller(), 'getOrder', parameters, (route) => ({
                    id: route.params?.['id'],
                })),
            },
        ])
    );
}

let httpServer: Server | undefined;
let client: Client | undefined;

afterEach(async () => {
    await client?.close();
    client = undefined;
    if (httpServer !== undefined) {
        await new Promise<void>((resolve) => httpServer?.close(() => resolve()));
        httpServer = undefined;
    }
});

async function start(options: McpHTTPEndpointOptions = {}): Promise<Client> {
    const endpoint = new McpHTTPEndpoint(registry(), options);
    const server = createServer((req, res) => {
        void (async () => {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const raw = Buffer.concat(chunks).toString('utf8');
            const body = raw === '' ? {} : (JSON.parse(raw) as Record<string, unknown>);
            const route = {
                length: 0,
                id: 'http-test',
                path: req.url ?? '/mcp',
                raw: req.url ?? '/mcp',
                params: null,
                method: req.method,
                data: {},
                attributes: {
                    [NODE_INCOMING_ATTRIBUTE]: req,
                    [NODE_RESPONSE_ATTRIBUTE]: res,
                    [NODE_REQUEST_ATTRIBUTE]: {
                        headers: req.headers,
                        body,
                        cookies: {},
                        session: {},
                    },
                },
            } as unknown as Route;
            await endpoint.handle(route);
        })().catch((error: unknown) => {
            res.statusCode = 500;
            res.end(error instanceof Error ? error.message : String(error));
        });
    });
    httpServer = server;
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
    const address = server.address();
    if (address === null || typeof address === 'string') throw new Error('expected a TCP address');
    const transport = new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${address.port}/mcp`));
    const mcp = new Client({ name: 'ndigo-http-client', version: '1.0.0' });
    client = mcp;
    await mcp.connect(transport);
    return mcp;
}

describe('McpHTTPEndpoint', () => {
    it('serves tools/list and tools/call over Streamable HTTP', async () => {
        const mcp = await start();
        const { tools } = await mcp.listTools();
        expect(tools.map((tool) => tool.name)).toEqual(['get_order']);

        const result = CallToolResultSchema.parse(
            await mcp.callTool({ name: 'get_order', arguments: { id: '42' } }, CallToolResultSchema)
        );
        const block = result.content.find((entry) => entry.type === 'text');
        expect(block?.type === 'text' ? JSON.parse(block.text) : null).toEqual({ id: '42' });
    });

    it('serves MCP Apps UI resources over Streamable HTTP', async () => {
        const orders = createUiResource({
            uri: 'ui://orders',
            name: 'Orders',
            body: '<main>Orders</main>',
        });
        const mcp = await start({ uiResources: [orders] });

        expect(mcp.getServerCapabilities()?.extensions?.['io.modelcontextprotocol/ui']).toEqual({});

        const { resources } = await mcp.listResources();
        expect(resources.map((resource) => resource.uri)).toContain('ui://orders');

        const read = await mcp.readResource({ uri: 'ui://orders' });
        expect(read.contents[0]).toMatchObject({ uri: 'ui://orders', mimeType: MCP_APP_MIME_TYPE });
        const content = read.contents[0];
        expect(content !== undefined && 'text' in content ? content.text : '').toContain('<main>Orders</main>');
    });
});

describe('protectedResourceMetadata', () => {
    it('describes the resource and authorization servers', () => {
        expect(
            protectedResourceMetadata({
                resource: 'https://example.test/mcp',
                authorizationServers: ['https://auth.example.test'],
                scopesSupported: ['tools.read'],
            })
        ).toEqual({
            resource: 'https://example.test/mcp',
            authorization_servers: ['https://auth.example.test'],
            scopes_supported: ['tools.read'],
            bearer_methods_supported: ['header'],
        });
    });
});
