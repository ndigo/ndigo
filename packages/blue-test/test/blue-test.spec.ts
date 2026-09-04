// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { getMapping } from '@blue/dispatcher';
import { bootApp, MockMvc } from '../src/index';

/**
 * Canonical usage: a real app context is booted once per suite (beforeAll) and
 * shared across tests. This is exactly how an app developer tests their
 * controllers through the real dispatcher, without a socket.
 */

@getMapping('/math')
class MathController {
    @getMapping('/double')
    double(value = 2) {
        return { doubled: value * 2 };
    }

    @getMapping('/hello')
    hello() {
        return { message: 'hello' };
    }
}

describe('bootApp + MockMvc (canonical app test)', () => {
    let mockMvc: MockMvc;
    let close: () => void;

    beforeAll(() => {
        const app = bootApp([MathController]);
        mockMvc = new MockMvc(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /math/double dispatches through the real handler mapping', async () => {
        const res = await mockMvc.get('/math/double').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ doubled: 4 });
    });

    test('a second route on the same shared context is served', async () => {
        const res = await mockMvc.get('/math/hello').exec();
        expect(res.response.headers['Content-Type']).toContain('application/json');
        expect(res.json()).toEqual({ message: 'hello' });
    });
});