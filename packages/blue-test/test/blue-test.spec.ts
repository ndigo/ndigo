// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { requestMapping, getMapping } from '@blue/dispatcher';
import { bootApp, cachedBootApp, releaseCachedApp, MockHTTP } from '../src/index';

/**
 * Canonical usage: a real app context is booted once per suite (beforeAll) and
 * shared across tests. This is exactly how an app developer tests their
 * controllers through the real dispatcher, without a socket.
 */

@requestMapping('/math')
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

describe('bootApp + MockHTTP (canonical app test)', () => {
    let mockMVC: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        const app = bootApp([MathController]);
        mockMVC = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /math/double dispatches through the real handler mapping', async () => {
        const res = await mockMVC.get('/math/double').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ doubled: 4 });
    });

    test('a second route on the same shared context is served', async () => {
        const res = await mockMVC.get('/math/hello').exec();
        expect(res.response.headers['Content-Type']).toContain('application/json');
        expect(res.json()).toEqual({ message: 'hello' });
    });
});

describe('cachedBootApp', () => {
    test('returns the same app for the same sources', () => {
        const a = cachedBootApp([MathController]);
        const b = cachedBootApp([MathController]);
        try {
            expect(b).toBe(a);
            expect(b.context).toBe(a.context);
        } finally {
            releaseCachedApp([MathController]);
            releaseCachedApp([MathController]);
        }
    });

    test('releasing all references removes the cached app', () => {
        const a = cachedBootApp([MathController]);
        const b = cachedBootApp([MathController]);
        expect(b).toBe(a);

        releaseCachedApp([MathController]);
        releaseCachedApp([MathController]);

        // Cache is cleared; a fresh boot creates a new app instance.
        const c = cachedBootApp([MathController]);
        try {
            expect(c).not.toBe(a);
        } finally {
            releaseCachedApp([MathController]);
        }
    });

    test('different sources do not collide', () => {
        @requestMapping('/other')
        class OtherController {
            @getMapping('/')
            index() {
                return { ok: true };
            }
        }

        const a = cachedBootApp([MathController]);
        const b = cachedBootApp([OtherController]);
        try {
            expect(b).not.toBe(a);
        } finally {
            releaseCachedApp([MathController]);
            releaseCachedApp([OtherController]);
        }
    });
});
