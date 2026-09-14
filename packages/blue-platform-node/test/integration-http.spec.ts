/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, parameters, queryValue, requestMapping, ModelAndView } from '@blue/dispatcher';
import { View, ViewTarget } from '@blue/view';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { HTTPServer } from '../src/http-server';

/**
 * End-to-end integration test for the Node SSR pipeline:
 * context → NodeAutoConfiguration → NodeDispatcher → HTTPServer → HTTP response.
 *
 * Boots a real `node:http` server on an ephemeral port and asserts on live
 * HTTP responses for JSON, parameterized, locale negotiation, and unknown routes.
 */

/** Renders the language the dispatcher resolved for the request. */
class LanguageProbeView implements View {
    #language: string;

    constructor(language: string) {
        this.#language = language;
    }

    async render(model: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        await target?.commit(JSON.stringify({ language: this.#language }), model, request);
    }
}

/** Records the language passed to view-name resolution. */
class RecordingViewResolver {
    lastLanguage: string | undefined = undefined;

    async resolveViewName(name: string, language?: unknown): Promise<View | null> {
        if (name !== 'probe') {
            return null;
        }
        this.lastLanguage = language as string;
        return new LanguageProbeView(String(language));
    }
}

@requestMapping('/')
class GreetingController {
    @getMapping('/')
    greet() {
        return { message: 'Hello, Node!' };
    }

    @getMapping('/hello')
    @parameters({ name: queryValue('name') })
    greetByName(name?: string) {
        return { message: `Hello, ${name ?? 'World'}!` };
    }
}

@requestMapping('/probe')
class LocaleProbeController {
    @getMapping('/locale')
    locale() {
        return new ModelAndView('probe', {});
    }
}

describe('Node SSR pipeline', () => {
    let context: MetadataConfigApplicationContext;
    let server: HTTPServer;
    let base: string;
    const recorder = new RecordingViewResolver();

    beforeAll(async () => {
        context = new MetadataConfigApplicationContext('integration');
        context.register(NodeAutoConfiguration);
        // Controller instance is a context value the mapping can resolve.
        context.setValue(GreetingController.name, new GreetingController());
        context.setValue(LocaleProbeController.name, new LocaleProbeController());
        // Replace the island view resolver with the probe recorder so the
        // resolved request language is observable end-to-end.
        context.setValue('viewResolver', recorder);
        // refresh() auto-initializes the handler mapping + dispatcher.
        context.refresh();

        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');

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

    test('GET /probe/locale negotiates the Accept-Language header', async () => {
        const res = await fetch(`${base}/probe/locale`, {
            headers: { 'Accept-Language': 'fr-CH, fr;q=0.9, en;q=0.8' },
        });
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ language: 'fr-CH' });
        expect(recorder.lastLanguage).toBe('fr-CH');
    });

    test('GET /probe/locale falls back to the default language without a header', async () => {
        const res = await fetch(`${base}/probe/locale`);
        expect(await res.json()).toEqual({ language: 'en-US' });
    });
});
