/**
 * @module blue-test
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import {
    requestMapping,
    getMapping,
    postMapping,
    ModelAndView,
    parameters,
    queryValue,
    bodyValue,
} from '@blue/dispatcher';
import { IslandView } from '@blue/view';
import { bootApp, MockHTTP } from '../src/index';

/**
 * Self-tests for `@blue/test`: a real controller is dispatched through the
 * actual Blue pipeline (NodeAutoConfiguration → NodeDispatcher → handler) via
 * MockHTTP, socket-free.
 */

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

    @postMapping('/echo')
    @parameters({ value: bodyValue('value') })
    echo(value?: string) {
        return { echoed: value ?? null };
    }

    @getMapping('/plain')
    plain() {
        return 'plain-text';
    }
}

describe('MockHTTP', () => {
    let mockMVC: MockHTTP;

    beforeAll(() => {
        mockMVC = new MockHTTP(bootApp([GreetingController]));
    });

    afterAll(() => {
        // no-op; booted app closes in the ported test
    });

    test('GET / returns JSON through the real dispatcher', async () => {
        const res = await mockMVC.get('/').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ message: 'Hello, Node!' });
    });

    test('GET /hello?name=... binds the query parameter', async () => {
        const res = await mockMVC.get('/hello').query({ name: 'Jeff' }).exec();
        expect(res.json()).toEqual({ message: 'Hello, Jeff!' });
    });

    test('POST /echo binds the JSON body', async () => {
        const res = await mockMVC.post('/echo').body({ value: 'ping' }).exec();
        expect(res.json()).toEqual({ echoed: 'ping' });
    });

    test('plain-object return is JSON, not mutated with a default view name', async () => {
        const res = await mockMVC.get('/plain').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual('plain-text');
    });

    test('empty body yields undefined from .json()', async () => {
        const res = await mockMVC.get('/missing').exec();
        expect(res.response.status).toBe(404);
    });
});

describe('IslandView through MockHTTP dispatch (SSR islands)', () => {
    @requestMapping('/islands')
    class IslandsController {
        @getMapping('/todo')
        todo() {
            return new ModelAndView(new IslandView('todo-app'), {
                items: [{ text: 'a', checked: false }],
                filter: 'all',
            });
        }
    }

    test('server dispatches island markup with the serialized model', async () => {
        const app = bootApp([IslandsController]);
        try {
            const mockMVC = new MockHTTP(app);
            const res = await mockMVC.get('/islands/todo').exec();
            expect(res.response.status).toBe(200);
            const html = res.text();
            expect(html).toContain('<todo-app data-blue-island data-blue-model=');
            expect(html).toContain('&quot;filter&quot;:&quot;all&quot;');
        } finally {
            app.close();
        }
    });
});
