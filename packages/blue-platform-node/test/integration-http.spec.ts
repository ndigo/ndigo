// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, routeParams, queryValue, RadixMetadataHandlerMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';

/**
 * End-to-end integration test for the Node SSR pipeline:
 * context → NodeAutoConfiguration → NodeDispatcher → HTTPServer → HTTP response.
 *
 * Boots a real `node:http` server on an ephemeral port and asserts on live
 * HTTP responses for JSON, parameterized, and unknown routes.
 */

@getMapping('/')
class GreetingController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Node!' };
    }

    @getMapping('/hello')
    @routeParams({ name: queryValue('name') })
    greetByName(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }
}

describe('Node SSR pipeline', () => {
    let context: MetadataConfigApplicationContext;
    let server: HTTPServer;
    let base: string;

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('integration');
        context.register(NodeAutoConfiguration);
        // Controller instance is a context value the mapping can resolve.
        context.setValue(GreetingController.name, new GreetingController());
        context.refresh();

        // Mirror the demo wiring: the handler mapping must be context-bound
        // and re-initialized after refresh so it discovers controller methods.
        const handlerMapping = context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
        handlerMapping.setApplicationContext(context);
        handlerMapping.init();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        dispatcher.initStrategies(context);
        dispatcher.applicationContext = context;

        // Adapter on port 0 → OS-assigned ephemeral port.
        const adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const boundPort = (
            adapter.server as unknown as {
                address: () => { port: number } | null;
            }
        ).address()?.port;
        base = `http://127.0.0.1:${boundPort}`;

        server = new HTTPServer(dispatcher, { adapter });
    });

    afterAll(async () => {
        await server?.close();
    });

    test('GET / returns JSON greeting', async () => {
        const res = await fetch(`${base}/`);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: 'Hello, Node!' });
    });

    test('GET /hello?name=... is bound from the query', async () => {
        const res = await fetch(`${base}/hello?name=Jeff`);
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ message: 'Hello, Jeff!' });
    });

    test('unknown route returns 404', async () => {
        const res = await fetch(`${base}/does-not-exist`);
        expect(res.status).toBe(404);
    });
});
