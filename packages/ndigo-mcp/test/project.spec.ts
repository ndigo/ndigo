/**
 * Tool projection: names, descriptions, JSON Schemas, read-only, and flags.
 */
import {
    MethodParameter,
    MethodParameterType,
    parameters,
    pathValue,
    queryValue,
    toolMapping,
} from '@ndigo/dispatcher';
import { whenFeature } from '@ndigo/flags';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { projectTools } from '../src/project';
import { handlerMethod, mapping, table } from './_fixtures';

describe('projectTools', () => {
    it('projects @toolMapping handlers from dispatch metadata', () => {
        class OrdersController {
            @toolMapping({ name: 'get_order', description: 'Read one order', readOnly: true })
            @parameters({ id: pathValue(), verbose: queryValue('verbose') })
            getOrder(_args: unknown): unknown {
                return { ok: true };
            }
        }

        const method = handlerMethod(new OrdersController(), 'getOrder', [
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
        ]);
        const tools = projectTools(table([{ mapping: mapping('/orders/:id'), handlerMethod: method }]));

        expect(tools).toHaveLength(1);
        expect(tools[0]?.descriptor.name).toBe('get_order');
        expect(tools[0]?.descriptor.description).toBe('Read one order');
        expect(tools[0]?.descriptor.inputSchema).toEqual({
            type: 'object',
            properties: {
                id: { type: 'string' },
                verbose: { type: 'boolean' },
            },
            required: ['id'],
        });
        expect(tools[0]?.readOnly).toBe(true);
    });

    it('derives a snake_case name and a route description by default', () => {
        class OrdersController {
            @toolMapping()
            listOrders(): unknown {
                return [];
            }
        }

        const tools = projectTools(
            table([
                { mapping: mapping('/orders'), handlerMethod: handlerMethod(new OrdersController(), 'listOrders', []) },
            ])
        );
        expect(tools[0]?.descriptor).toEqual({
            name: 'list_orders',
            description: 'GET /orders',
            inputSchema: { type: 'object', properties: {} },
            annotations: { readOnlyHint: false },
        });
        expect(tools[0]?.readOnly).toBe(false);
    });

    it('carries the zod schema from validatedBy', () => {
        class OrdersController {
            @toolMapping({ name: 'create_order' })
            create(): unknown {
                return {};
            }
        }

        const schema = z.object({ note: z.string() });
        const body = new MethodParameter(
            MethodParameterType.BODY,
            'body',
            true,
            null,
            undefined,
            null,
            undefined,
            'body',
            undefined,
            schema
        );
        const tools = projectTools(
            table([
                {
                    mapping: mapping('/orders', 'POST'),
                    handlerMethod: handlerMethod(new OrdersController(), 'create', [body]),
                },
            ])
        );
        expect(tools[0]?.descriptor.inputSchema).toEqual({
            type: 'object',
            properties: {
                body: {
                    type: 'object',
                    properties: { note: { type: 'string' } },
                    required: ['note'],
                    additionalProperties: false,
                },
            },
            required: ['body'],
        });
    });

    it('records the @whenFeature gate', () => {
        class OrdersController {
            @toolMapping({ name: 'export_orders' })
            @whenFeature('orders.export')
            export(): unknown {
                return null;
            }
        }

        const tools = projectTools(
            table([
                {
                    mapping: mapping('/orders/export'),
                    handlerMethod: handlerMethod(new OrdersController(), 'export', []),
                },
            ])
        );
        expect(tools[0]?.feature).toBe('orders.export');
    });

    it('rejects duplicate tool names', () => {
        class First {
            @toolMapping({ name: 'search' })
            run(): unknown {
                return null;
            }
        }
        class Second {
            @toolMapping({ name: 'search' })
            run(): unknown {
                return null;
            }
        }
        expect(() =>
            projectTools(
                table([
                    { mapping: mapping('/a'), handlerMethod: handlerMethod(new First(), 'run', []) },
                    { mapping: mapping('/b'), handlerMethod: handlerMethod(new Second(), 'run', []) },
                ])
            )
        ).toThrow(/duplicate MCP tool name 'search'/u);
    });
});
