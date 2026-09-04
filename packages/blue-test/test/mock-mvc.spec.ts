// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { getMapping, postMapping, routeParams, queryValue, bodyValue } from '@blue/dispatcher';
import { bootApp, MockMVC } from '../src/index';

/**
 * Self-tests for `@blue/test`: a real controller is dispatched through the
 * actual Blue pipeline (NodeAutoConfiguration → NodeDispatcher → handler) via
 * MockMVC, socket-free.
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

    @postMapping('/echo')
    @routeParams({ value: bodyValue('value') })
    echo(value?: string) {
        return { echoed: value ?? null };
    }

    @getMapping('/plain')
    plain() {
        return 'plain-text';
    }
}

describe('MockMVC', () => {
    let mockMVC: MockMVC;

    beforeAll(() => {
        mockMVC = new MockMVC(bootApp([GreetingController]));
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