/**
 * End-to-end MCP protocol over an in-memory transport.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { MethodParameter, MethodParameterType, toolMapping } from '@ndigo/dispatcher';
import { afterEach, describe, expect, it } from 'vitest';
import { McpToolRegistry } from '../src/registry';
import { createMcpServer } from '../src/server';
import { handlerMethod, mapping, table } from './_fixtures';

let close: (() => Promise<void>) | undefined;

afterEach(async () => {
    await close?.();
    close = undefined;
});

class Controller {
    @toolMapping({ name: 'get_order', description: 'Read an order', readOnly: true })
    getOrder(): unknown {
        return null;
    }

    @toolMapping({ name: 'list_orders', readOnly: true })
    listOrders(): unknown {
        return null;
    }

    @toolMapping({ name: 'create_order' })
    createOrder(): unknown {
        return null;
    }
}

function registry(): McpToolRegistry {
    const parameters = [
        new MethodParameter(MethodParameterType.PATH, 'id', true, null, undefined, null, undefined, 'id'),
        new MethodParameter(
            MethodParameterType.QUERY,
            'verbose',
            false,
            null,
            { source: String, target: Boolean },
            null,
            undefined,
            'verbose'
        ),
    ];
    return McpToolRegistry.from(
        table([
            {
                mapping: mapping('/orders/:id'),
                handlerMethod: handlerMethod(new Controller(), 'getOrder', parameters, (route) => ({
                    id: route.params?.['id'],
                    verbose: route.data['verbose'] === true,
                })),
            },
            {
                mapping: mapping('/orders'),
                handlerMethod: handlerMethod(new Controller(), 'listOrders', [], () => []),
            },
            {
                mapping: mapping('/orders', 'POST'),
                handlerMethod: handlerMethod(new Controller(), 'createOrder', [], () => ({ created: true })),
            },
        ])
    );
}

async function connect(): Promise<Client> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createMcpServer(registry());
    const client = new Client({ name: 'ndigo-mcp-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    close = async () => {
        await client.close();
        await server.close();
    };
    return client;
}

describe('createMcpServer', () => {
    it('lists tools with their JSON Schema', async () => {
        const client = await connect();
        const { tools } = await client.listTools();
        expect(tools.map((tool) => tool.name)).toEqual(['get_order', 'list_orders', 'create_order']);
        expect(tools.find((tool) => tool.name === 'get_order')).toEqual({
            name: 'get_order',
            description: 'Read an order',
            inputSchema: {
                type: 'object',
                properties: {
                    id: { type: 'string' },
                    verbose: { type: 'boolean' },
                },
                required: ['id'],
            },
            annotations: { readOnlyHint: true },
        });
        expect(tools.find((tool) => tool.name === 'list_orders')?.annotations).toEqual({ readOnlyHint: true });
        expect(tools.find((tool) => tool.name === 'create_order')?.annotations).toEqual({ readOnlyHint: false });
    });

    it('calls a tool and serializes the result', async () => {
        const client = await connect();
        const result = CallToolResultSchema.parse(
            await client.callTool({ name: 'get_order', arguments: { id: '42', verbose: true } }, CallToolResultSchema)
        );
        const block = result.content.find((entry) => entry.type === 'text');
        const text = block?.type === 'text' ? block.text : '';
        expect(JSON.parse(text)).toEqual({ id: '42', verbose: true });
    });

    it('reports tool failures as isError results', async () => {
        const client = await connect();
        const result = CallToolResultSchema.parse(
            await client.callTool({ name: 'missing', arguments: {} }, CallToolResultSchema)
        );
        expect(result.isError).toBe(true);
        const block = result.content.find((entry) => entry.type === 'text');
        expect(block?.type === 'text' ? block.text : '').toContain("unknown or unavailable MCP tool 'missing'");
    });
});
