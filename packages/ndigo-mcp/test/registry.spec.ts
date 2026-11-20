/**
 * Registry policy and invocation: read-only gating, feature gates, argument
 * routing, and result normalization.
 */
import { REDACTED_VALUE } from '@ndigo/context';
import {
    MethodParameter,
    MethodParameterType,
    ModelAndView,
    PathValueMethodArgumentResolver,
    RouteHandlerMethod,
    toolMapping,
} from '@ndigo/dispatcher';
import { whenFeature } from '@ndigo/flags';
import { SpanStatusCode, trace } from '@opentelemetry/api';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import type { Route } from '@ndigo/router';
import { describe, expect, it } from 'vitest';
import { McpToolDeniedError } from '../src/errors';
import { McpToolRegistry, type McpToolCall } from '../src/registry';
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
        await expect(closed.call('export_orders')).rejects.toThrow(/unknown or unavailable/u);

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
            await registry.call('get_order', { id: '7' }, { callId: 'call-1', source: 'http' });

            const spans = exporter.getFinishedSpans();
            expect(spans.map((span) => span.name)).toEqual(['execute_tool get_order']);
            expect(spans[0]?.attributes['gen_ai.tool.name']).toBe('get_order');
            expect(spans[0]?.attributes['gen_ai.tool.call.id']).toBe('call-1');
            expect(spans[0]?.attributes['gen_ai.tool.call.source']).toBe('http');
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

    it('refuses a call when the authorize policy denies it, without invoking the handler', async () => {
        let invoked = false;
        class Controller {
            @toolMapping({ name: 'delete_order' })
            deleteOrder(): unknown {
                return null;
            }
        }
        const registry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/orders/:id', 'DELETE'),
                    handlerMethod: handlerMethod(new Controller(), 'deleteOrder', PARAMETERS, () => {
                        invoked = true;
                        return { ok: true };
                    }),
                },
            ]),
            { authorize: (call) => call.tool.name !== 'delete_order' }
        );

        await expect(registry.call('delete_order', { id: '1' })).rejects.toThrow(
            "MCP tool 'delete_order' denied by policy"
        );
        expect(invoked).toBe(false);
    });

    it('passes the call to authorize and awaits async policies', async () => {
        const seen: McpToolCall[] = [];
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
            ]),
            {
                authorize: async (call) => {
                    seen.push(call);
                    return true;
                },
            }
        );

        await registry.call('get_order', { id: '7' }, { callId: 'call-9' });
        expect(seen).toHaveLength(1);
        expect(seen[0]?.tool.name).toBe('get_order');
        expect(seen[0]?.args).toEqual({ id: '7' });
        expect(seen[0]?.callId).toBe('call-9');
        expect(seen[0]?.confirm).toBeUndefined();
    });

    it('withholds a confirmed call unless an authorize policy accepts it', async () => {
        class Controller {
            @toolMapping({ name: 'buy_credits' })
            buyCredits(): unknown {
                return null;
            }
        }
        const source = table([
            {
                mapping: mapping('/credits', 'POST'),
                handlerMethod: handlerMethod(new Controller(), 'buyCredits', [], () => ({ bought: true })),
            },
        ]);
        const confirm = (call: McpToolCall): string | undefined =>
            call.args['amount'] === undefined ? undefined : 'Charges the card for 1,000 credits';

        const withholding = McpToolRegistry.from(source, { confirm });
        const denial = await withholding.call('buy_credits', { amount: 20 }).catch((error: unknown) => error);
        expect(denial).toBeInstanceOf(McpToolDeniedError);
        expect((denial as McpToolDeniedError).confirm).toBe('Charges the card for 1,000 credits');
        expect((denial as Error).message).toContain('Needs a person: Charges the card for 1,000 credits');

        const accepting = McpToolRegistry.from(source, {
            confirm,
            authorize: (call) => call.confirm === 'Charges the card for 1,000 credits',
        });
        expect(await accepting.call('buy_credits', { amount: 20 })).toEqual({ bought: true });
        expect(await withholding.call('buy_credits', {})).toEqual({ bought: true });
    });

    it('redacts declared secret result fields with the shared sentinel', async () => {
        class Controller {
            @toolMapping({ name: 'login', readOnly: true, secret: ['accessToken', 'profile.number'] })
            login(): unknown {
                return null;
            }
        }
        const registry = McpToolRegistry.from(
            table([
                {
                    mapping: mapping('/login'),
                    handlerMethod: handlerMethod(new Controller(), 'login', [], () => ({
                        accessToken: 'tok_123',
                        user: 'ada',
                        profile: { number: '4111', name: 'Ada' },
                        sessions: [{ token: 'tok_abc' }],
                    })),
                },
            ])
        );

        expect(await registry.call('login')).toEqual({
            accessToken: REDACTED_VALUE,
            user: 'ada',
            profile: { number: REDACTED_VALUE, name: 'Ada' },
            sessions: [{ token: 'tok_abc' }],
        });
    });

    it('marks a policy refusal on the call span', async () => {
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
                ]),
                { authorize: () => false }
            );
            await expect(registry.call('get_order', { id: '7' })).rejects.toThrow(McpToolDeniedError);

            const spans = exporter.getFinishedSpans();
            expect(spans[0]?.attributes['gen_ai.tool.call.denied']).toBe(true);
            expect(spans[0]?.status.code).toBe(SpanStatusCode.UNSET);
        } finally {
            trace.disable();
            await provider.shutdown();
        }
    });
});
