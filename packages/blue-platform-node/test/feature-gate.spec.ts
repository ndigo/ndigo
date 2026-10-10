/**
 * `@whenFeature` metadata + `FeatureGateInterceptor` contracts (AD-82):
 * the metadata gate, the 404 problem-document denial, method-over-class
 * precedence, untouched un-gated routes, and the live-refresh flip through
 * the real `NodeAutoConfiguration` wiring.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, afterAll, expect } from 'vitest';
import type { ServerResponse } from 'node:http';
import type { Route } from '@blue/router';
import { MetadataConfigApplicationContext, StandardEnvironment } from '@blue/context';
import { getMapping, requestMapping } from '@blue/dispatcher';
import {
    FLAG_EVALUATOR,
    PropertyFlagProvider,
    whenFeature,
    type FlagEvaluation,
    type FlagEvaluationContext,
    type FlagEvaluator,
    type FlagValue,
} from '@blue/flags';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { FeatureGateInterceptor } from '../src/feature-gate-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, type NodeRequest } from '../src/node-request';

/** A route with a response sink (`writeProblem` target). */
function routeWithResponse(): { route: Route; res: ServerResponse; body: () => string } {
    let body = '';
    const flags = { writableEnded: false };
    const res = {
        get writableEnded() {
            return flags.writableEnded;
        },
        writeHead(_status: number, _headers: Record<string, string>) {
            // no-op sink
        },
        end(chunk: string) {
            body = chunk;
            flags.writableEnded = true;
        },
    } as unknown as ServerResponse;
    return {
        route: { attributes: { [NODE_RESPONSE_ATTRIBUTE]: res } } as unknown as Route,
        res,
        body: () => body,
    };
}

/** A controller instance carrying method-level `@whenFeature` metadata. */
function gatedHandler(flag: string): object {
    class TodoController {
        @whenFeature(flag)
        @requestMapping('/todo/due')
        due() {
            return 'due';
        }
    }
    return new TodoController();
}

describe('FeatureGateInterceptor', () => {
    test('un-gated handlers pass through untouched', async () => {
        const interceptor = new FeatureGateInterceptor(new PropertyFlagProvider({ getProperty: () => undefined }));
        const result = await interceptor.preHandle(routeWithResponse().route, { handler: {}, method: 'a' });
        expect(result).toBe(true);
    });

    test('gated handler with an on flag passes', async () => {
        const interceptor = new FeatureGateInterceptor(
            new PropertyFlagProvider({ getProperty: (key: string) => (key === 'feature.pay' ? true : undefined) })
        );
        const result = await interceptor.preHandle(routeWithResponse().route, {
            handler: gatedHandler('pay'),
            method: 'due',
        });
        expect(result).toBe(true);
    });

    test('gated handler with an off flag is denied 404 with a problem doc', async () => {
        const interceptor = new FeatureGateInterceptor(
            new PropertyFlagProvider({ getProperty: (key: string) => (key === 'feature.pay' ? false : undefined) })
        );
        const { route, res, body } = routeWithResponse();
        const denial = await interceptor.preHandle(route, { handler: gatedHandler('pay'), method: 'due' });
        expect(denial).toMatchObject({ statusCode: 404 });
        expect(res.writableEnded).toBe(true);
        expect(body()).toContain('urn:blue:not-found');
        expect(body()).toContain("Feature 'pay' is not enabled");
    });

    test('a missing flag evaluates DEFAULT → the gate is closed (404)', async () => {
        const interceptor = new FeatureGateInterceptor(new PropertyFlagProvider({ getProperty: () => undefined }));
        const { route, res } = routeWithResponse();
        const denial = await interceptor.preHandle(route, { handler: gatedHandler('absent'), method: 'due' });
        expect(denial).toMatchObject({ statusCode: 404 });
        expect(res.writableEnded).toBe(true);
    });

    test('method-level gate wins over a class-level gate', async () => {
        const interceptor = new FeatureGateInterceptor(
            new PropertyFlagProvider({ getProperty: (key: string) => key === 'feature.on' })
        );
        @whenFeature('off')
        class Controller {
            @whenFeature('on')
            @requestMapping('/x')
            method() {
                return 'ok';
            }
        }
        const result = await interceptor.preHandle(routeWithResponse().route, {
            handler: new Controller(),
            method: 'method',
        });
        expect(result).toBe(true);
    });
});

describe('FeatureGateInterceptor targeting context + rollouts (AD-82 addendum)', () => {
    /** A route carrying a client address (the targeting key source). */
    function routeFrom(address: string): Route {
        return {
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: { remoteAddress: address } as NodeRequest,
                [NODE_RESPONSE_ATTRIBUTE]: routeWithResponse().res,
            },
        } as unknown as Route;
    }

    test('the client IP is passed as the evaluation targeting key', async () => {
        let received: string | undefined;
        const spy: FlagEvaluator = {
            kind: 'spy',
            async evaluate<T extends FlagValue>(
                _flag: string,
                defaultValue: T,
                ctx?: FlagEvaluationContext
            ): Promise<FlagEvaluation<T>> {
                received = ctx?.targetingKey;
                return { value: false as T, reason: 'DEFAULT' };
            },
        };
        const interceptor = new FeatureGateInterceptor(spy);
        await interceptor.preHandle(routeFrom('198.51.100.2'), { handler: gatedHandler('pay'), method: 'due' });
        expect(received).toBe('198.51.100.2');
    });

    test('a 0% rollout gates everyone out; a 100% rollout admits the same requester', async () => {
        const closed = new FeatureGateInterceptor(
            new PropertyFlagProvider({
                getProperty: (key: string) =>
                    key === 'feature.pay' ? true : key === 'feature.rollout.pay' ? 0 : undefined,
            })
        );
        expect(
            await closed.preHandle(routeFrom('198.51.100.2'), { handler: gatedHandler('pay'), method: 'due' })
        ).toMatchObject({ statusCode: 404 });

        const open = new FeatureGateInterceptor(
            new PropertyFlagProvider({
                getProperty: (key: string) =>
                    key === 'feature.pay' ? true : key === 'feature.rollout.pay' ? 1 : undefined,
            })
        );
        expect(await open.preHandle(routeFrom('198.51.100.2'), { handler: gatedHandler('pay'), method: 'due' })).toBe(
            true
        );
    });
});

describe('@whenFeature through the real NodeAutoConfiguration wiring (AD-82 D-5)', () => {
    let adapter: NodeHTTPServerAdapter;
    let context: MetadataConfigApplicationContext;
    let base: string;

    afterAll(async () => {
        await adapter?.close();
        context?.close();
    });

    test('boots the FLAG_EVALUATOR bean and flips a gated route live on refresh', async () => {
        const environment = new StandardEnvironment([{ 'feature.noteFlags': false }]);
        context = new MetadataConfigApplicationContext('feature-gate');
        context.setEnvironment(environment);
        @requestMapping('/')
        class GatedController {
            @whenFeature('noteFlags')
            @requestMapping('/notes')
            flagged() {
                return { gated: true };
            }
        }
        context.register(NodeAutoConfiguration);
        context.setValue('gatedController', new GatedController());
        context.refresh();

        expect(context.getValue(FLAG_EVALUATOR)).toBeDefined();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        base = `http://127.0.0.1:${(adapter.server as { address(): { port: number } }).address().port}`;

        // Flag off → gate closed: 404 problem doc.
        const off = await fetch(`${base}/notes`);
        expect(off.status).toBe(404);
        expect(await off.json()).toMatchObject({ type: 'urn:blue:not-found', status: 404 });

        // AD-29 refresh: a higher-precedence source flips the flag; the
        // read-through provider serves the new state without a restart.
        environment.getPropertySources().addFirst('runtime', { 'feature.noteFlags': true });
        environment.refresh();

        const on = await fetch(`${base}/notes`);
        expect(on.status).toBe(200);
        expect(await on.json()).toEqual({ gated: true });
    });

    test('a config-seeded flag is served by the default bean from the start', async () => {
        const seeded = new MetadataConfigApplicationContext('feature-seeded');
        seeded.setEnvironment(new StandardEnvironment([{ 'feature.greeting.flag': true }]));
        @requestMapping('/')
        class SeededController {
            @whenFeature('greeting.flag')
            @requestMapping('/greeting')
            greeting() {
                return 'hello';
            }
        }
        seeded.register(NodeAutoConfiguration);
        seeded.setValue('seededController', new SeededController());
        seeded.refresh();

        const dispatcher = seeded.getValue<NodeDispatcher>('dispatcher');
        const seededAdapter = new NodeHTTPServerAdapter(dispatcher);
        await seededAdapter.listen(0, '127.0.0.1');
        const seededBase = `http://127.0.0.1:${(seededAdapter.server as { address(): { port: number } }).address().port}`;
        try {
            const res = await fetch(`${seededBase}/greeting`);
            expect(res.status).toBe(200);
            // The handler returns a string → the JSON pipeline wraps it in quotes.
            expect(await res.text()).toBe('"hello"');
        } finally {
            await seededAdapter.close();
            seeded.close();
        }
    });

    test('an un-gated route in the same app is untouched', async () => {
        context = new MetadataConfigApplicationContext('feature-mixed');
        @requestMapping('/')
        class MixedController {
            @getMapping('/open')
            open() {
                return 'open';
            }
        }
        context.register(NodeAutoConfiguration);
        context.setValue('mixedController', new MixedController());
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        const mixedAdapter = new NodeHTTPServerAdapter(dispatcher);
        await mixedAdapter.listen(0, '127.0.0.1');
        const mixedBase = `http://127.0.0.1:${(mixedAdapter.server as { address(): { port: number } }).address().port}`;
        try {
            const res = await fetch(`${mixedBase}/open`);
            expect(res.status).toBe(200);
        } finally {
            await mixedAdapter.close();
            context.close();
        }
    });
});
