/**
 * Parity: the tool input schema is the same JSON Schema the OpenAPI document
 * publishes for the operation's parameters and body.
 */
import { MethodParameter, MethodParameterType, toolMapping } from '@ndigo/dispatcher';
import { OpenAPISpecGenerator, type RouteMappingTable } from '@ndigo/openapi';
import type { RouteHandlerMethod, RouteMappingInfo } from '@ndigo/dispatcher';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { projectTools } from '../src/project';
import { handlerMethod, mapping, table } from './_fixtures';

class OrdersController {
    @toolMapping({ name: 'update_order' })
    update(): unknown {
        return null;
    }
}

const INFO = mapping('/orders/:id', 'POST');
const PARAMETERS = [
    new MethodParameter(
        MethodParameterType.PATH,
        'id',
        true,
        null,
        undefined,
        null,
        undefined,
        'id',
        undefined,
        z.string()
    ),
    new MethodParameter(
        MethodParameterType.QUERY,
        'dryRun',
        false,
        null,
        undefined,
        null,
        undefined,
        'dryRun',
        undefined,
        z.boolean()
    ),
    new MethodParameter(
        MethodParameterType.BODY,
        'body',
        true,
        null,
        undefined,
        null,
        undefined,
        'body',
        undefined,
        z.object({ note: z.string(), quantity: z.number() })
    ),
];
const HANDLER = handlerMethod(new OrdersController(), 'update', PARAMETERS);

describe('OpenAPI ↔ tools/list parity', () => {
    it('publishes identical parameter and body schemas', () => {
        const openApiTable: RouteMappingTable = {
            getHandlerMethods: () => new Map<RouteMappingInfo, RouteHandlerMethod>([[INFO, HANDLER]]),
        };
        const document = new OpenAPISpecGenerator().generate([openApiTable]);
        const operation = document.paths['/orders/{id}']?.post;
        expect(operation).toBeDefined();

        const tool = projectTools(table([{ mapping: INFO, handlerMethod: HANDLER }]))[0];
        expect(tool).toBeDefined();
        const inputSchema = tool?.descriptor.inputSchema as {
            properties: Record<string, unknown>;
            required: string[];
        };

        const id = operation?.parameters?.find((parameter) => parameter.name === 'id');
        const dryRun = operation?.parameters?.find((parameter) => parameter.name === 'dryRun');
        expect(inputSchema.properties['id']).toEqual(id?.schema);
        expect(inputSchema.properties['dryRun']).toEqual(dryRun?.schema);
        expect(inputSchema.properties['body']).toEqual(operation?.requestBody?.content['application/json']?.schema);
        expect(inputSchema.required.sort()).toEqual(['body', 'id']);
        expect(operation?.requestBody?.required).toBe(true);
    });
});
