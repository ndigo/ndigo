/**
 * The lab's agent surfaces: one tool set for stdio, HTTP, and the agent; an
 * MCP App linked from `list_orders`; and an A2UI report negotiated by media
 * type. The generic OpenAPI ↔ `tools/list` parity proof lives in
 * `@ndigo/mcp/test/parity.spec.ts`; this spec asserts the demo's own wiring.
 */
import { ApplicationBuilder } from '@ndigo/boot';
import type { ApplicationContext } from '@ndigo/context';
import { ARGUMENT_RESOLVERS, DISPATCHER } from '@ndigo/dispatcher';
import { McpToolRegistry } from '@ndigo/mcp';
import { OpenAPISpecGenerator, type RouteMappingTable } from '@ndigo/openapi';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import type { Route } from '@ndigo/router';
import { A2UIView } from '@ndigo/view';
import { afterAll, describe, expect, it } from 'vitest';
import { AgentLabConfig } from '../src/agent-lab-config';
import { AgentLabConfiguration } from '../src/agent-lab-configuration';
import { ordersUi } from '../src/orders-ui';
import { orderSurfaceMessages } from '../src/report-controller';

const context: ApplicationContext = await new ApplicationBuilder([
    NodeAutoConfiguration,
    AgentLabConfiguration,
    AgentLabConfig,
])
    .properties({ 'feature.ai.chat': true })
    .run();

afterAll(() => {
    context.close();
});

const registry = McpToolRegistry.from(context.getValue(DISPATCHER), {
    readOnly: true,
    argumentResolvers: context.getValue(ARGUMENT_RESOLVERS),
});

describe('agent lab surfaces', () => {
    it('lists the same tools the agent and stdio server receive', async () => {
        const tools = await registry.listTools();
        expect(tools.map((tool) => tool.name).sort()).toEqual(['list_orders', 'lookup_order']);
    });

    it('links list_orders to the ui://orders MCP App', async () => {
        const tools = await registry.listTools();
        const listOrders = tools.find((tool) => tool.name === 'list_orders');
        expect(listOrders?._meta?.ui?.resourceUri).toBe('ui://orders');
    });

    it('publishes the same lookup_order input schema as the OpenAPI operation', async () => {
        const dispatcher = context.getValue(DISPATCHER);
        const tables = dispatcher.handlerMappings.filter((mapping) => 'getHandlerMethods' in mapping) as
            | RouteMappingTable[]
            | [];
        const document = new OpenAPISpecGenerator().generate(tables);
        const operation = document.paths['/tools/orders/{id}']?.get;
        const tools = await registry.listTools();
        const lookup = tools.find((tool) => tool.name === 'lookup_order');
        const schema = lookup?.inputSchema as { properties: Record<string, unknown> } | undefined;

        const id = operation?.parameters?.find((parameter) => parameter.name === 'id');
        expect(id).toBeDefined();
        expect(schema?.properties['id']).toEqual(id?.schema);
    });

    it('serves the order report as an A2UI surface', async () => {
        const rendered = await new A2UIView().renderTo(orderSurfaceMessages(), {} as Route);

        expect(rendered.mediaType?.toString()).toContain('application/a2ui+json');
        expect(JSON.parse(rendered.body)).toEqual(orderSurfaceMessages());
    });

    it('ships the order catalogue document for the MCP App host', () => {
        expect(ordersUi.html).toContain('<table>');
        expect(ordersUi.html).toContain('Ada');
    });
});
