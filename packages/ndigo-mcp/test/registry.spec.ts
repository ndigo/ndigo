/**
 * Registry policy and invocation: read-only gating, feature gates, argument
 * routing, and result normalization.
 */
import {
    MethodParameter,
    MethodParameterType,
    ModelAndView,
    PathValueMethodArgumentResolver,
    RouteHandlerMethod,
    toolMapping,
} from '@ndigo/dispatcher';
import { whenFeature } from '@ndigo/flags';
import { trace } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import type { Route } from '@ndigo/router';
import { describe, expect, it } from 'vitest';
import { McpToolRegistry } from '../src/registry';
import { handlerMethod, mapping, table } from './_fixtures';

const PARAMETERS = [
    new MethodParameter(MethodParameterType.PATH, 'id', true, null, undefined, null, undefined, 'id'),
    new MethodParameter(MethodParameterType.QUERY, 'verbose', false, null, undefined, null, undefined, 'verbose'),
];

describe('McpToolRegistry', () => {
    it('omits mutating tools in read-only mode from list and call', async () => {
        class Controller {
            @toolMapping({ name: 'get_order', readOnly: true })
            getOrder(): unknown {
                return null;
            }

            @toolMapping({ name: 'delete_order' })
            deleteOrder(): unknown {
                return null;
            }
        }
        const registry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/orders/:id'),
                    handlerMethod: handlerMethod(new Controller(), 'getOrder', PARAMETERS),
                },
                {
                    mapping: mapping('/orders/:id', 'DELETE'),
                    handlerMethod: handlerMethod(new Controller(), 'deleteOrder', PARAMETERS),
                },
            ]),
            { readOnly: true }
        );

        expect((await registry.listTools()).map((tool) => tool.name)).toEqual(['get_order']);
        await expect(registry.call('delete_order', { id: '1' })).rejects.toThrow(/unknown or unavailable/u);
    });

    it('hides feature-gated tools unless the evaluator enables them', async () => {
        class Controller {
            @toolMapping({ name: 'export_orders', readOnly: true })
            @whenFeature('orders.export')
            exportOrders(): unknown {
                return null;
            }
        }
        const source = table([
            { mapping: mapping('/orders/export'), handlerMethod: handlerMethod(new Controller(), 'exportOrders', []) },
        ]);

        const closed = McpToolRegistry.from(source);
        expect(await closed.listTools()).toEqual([]);

        const off = McpToolRegistry.from(source, { isFeatureEnabled: () => false });
        expect(await off.listTools()).toEqual([]);

        const on = McpToolRegistry.from(source, { isFeatureEnabled: () => true });
        expect((await on.listTools()).map((tool) => tool.name)).toEqual(['export_orders']);
    });

    it('routes arguments through a synthetic Route', async () => {
        class Controller {
            @toolMapping({ name: 'get_order', readOnly: true })
            getOrder(): unknown {
                return null;
            }
        }
        let captured: Route | undefined;
        const registry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/orders/:id'),
                    handlerMethod: handlerMethod(new Controller(), 'getOrder', PARAMETERS, (route) => {
                        captured = route;
                        return { ok: true };
                    }),
                },
            ])
        );

        expect(await registry.call('get_order', { id: '42', verbose: true })).toEqual({ ok: true });
        expect(captured?.path).toBe('/orders/42');
        expect(captured?.params).toEqual({ id: '42' });
        expect(captured?.method).toBe('GET');
        expect(captured?.data).toEqual({ id: '42', verbose: true });
    });

    it('binds parameterized tools through the supplied argument resolvers', async () => {
        class Controller {
            @toolMapping({ name: 'get_order', readOnly: true })
            getOrder(id: string): unknown {
                return { id };
            }
        }
        function entries() {
            const method = new RouteHandlerMethod(new Controller(), 'getOrder');
            method.parameters = [PARAMETERS[0] as MethodParameter];
            return [{ mapping: mapping('/orders/:id'), handlerMethod: method }];
        }

        const registry = McpToolRegistry.from(table(entries()), {
            argumentResolvers: [new PathValueMethodArgumentResolver()],
        });
        expect(await registry.call('get_order', { id: '42' })).toEqual({ id: '42' });

        const unbound = McpToolRegistry.from(table(entries()));
        await expect(unbound.call('get_order', { id: '42' })).rejects.toThrow(/argument resolvers/u);
    });

    it('normalizes ModelAndView and response-entity results', async () => {
        class Controller {
            @toolMapping({ name: 'model', readOnly: true })
            model(): unknown {
                return null;
            }

            @toolMapping({ name: 'entity', readOnly: true })
            entity(): unknown {
                return null;
            }
        }
        const modelRegistry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/model'),
                    handlerMethod: handlerMethod(
                        new Controller(),
                        'model',
                        [],
                        () => new ModelAndView('v', { value: 1 })
                    ),
                },
            ])
        );
        expect(await modelRegistry.call('model')).toEqual({ value: 1 });

        const entityRegistry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/entity'),
                    handlerMethod: handlerMethod(new Controller(), 'entity', [], () => ({
                        status: 201,
                        body: { id: 'x' },
                    })),
                },
            ])
        );
        expect(await entityRegistry.call('entity')).toEqual({ id: 'x' });
    });

    it('emits one GenAI span per call', async () => {
        const exporter = new InMemorySpanExporter();
        const provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);
        try {
            class Controller {
                @toolMapping({ name: 'get_order', readOnly: true })
                getOrder(): unknown {
                    return null;
                }
            }
            const registry = McpToolRegistry.from(
                table([
                    {
                        mapping: mapping('/orders/:id'),
                        handlerMethod: handlerMethod(new Controller(), 'getOrder', PARAMETERS, () => ({ ok: true })),
                    },
                ])
            );
            await registry.call('get_order', { id: '7' }, { callId: 'call-1' });

            const spans = exporter.getFinishedSpans();
            expect(spans.map((span) => span.name)).toEqual(['execute_tool get_order']);
            expect(spans[0]?.attributes['gen_ai.tool.name']).toBe('get_order');
            expect(spans[0]?.attributes['gen_ai.tool.call.id']).toBe('call-1');
        } finally {
            trace.disable();
            await provider.shutdown();
        }
    });

    it('carries an A2UI model through tool results', async () => {
        const messages = [{ version: '1.0', createSurface: { surfaceId: 'orders', catalogId: 'ndigo-ui' } }];
        class Controller {
            @toolMapping({ name: 'render_surface', readOnly: true })
            renderSurface(): unknown {
                return null;
            }
        }
        const registry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/surface'),
                    handlerMethod: handlerMethod(
                        new Controller(),
                        'renderSurface',
                        [],
                        () => new ModelAndView('a2ui', { messages })
                    ),
                },
            ])
        );
        expect(await registry.call('render_surface')).toEqual({ messages });
    });

    it('reports an unknown tool', async () => {
        const registry = McpToolRegistry.from(table([]));
        await expect(registry.call('missing')).rejects.toThrow("unknown or unavailable MCP tool 'missing'");
    });
});
