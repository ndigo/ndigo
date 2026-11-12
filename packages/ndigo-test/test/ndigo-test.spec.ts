/**
 */
// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { requestMapping, getMapping } from '@ndigo/dispatcher';
import { bootNodeApp, cachedBootNodeApp, installSynchronousAnimationFrames, releaseCachedNodeApp, MockHTTP } from '../src/index';

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

describe('bootNodeApp + MockHTTP (canonical app test)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        const app = bootNodeApp([MathController]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    test('GET /math/double dispatches through the real handler mapping', async () => {
        const res = await mockHTTP.get('/math/double').exec();
        expect(res.response.status).toBe(200);
        expect(res.json()).toEqual({ doubled: 4 });
    });

    test('a second route on the same shared context is served', async () => {
        const res = await mockHTTP.get('/math/hello').exec();
        expect(res.response.headers['content-type']).toContain('application/json');
        expect(res.json()).toEqual({ message: 'hello' });
    });
});

describe('cachedBootNodeApp', () => {
    test('returns the same app for the same sources', () => {
        const a = cachedBootNodeApp([MathController]);
        const b = cachedBootNodeApp([MathController]);
        try {
            expect(b).toBe(a);
            expect(b.context).toBe(a.context);
        } finally {
            releaseCachedNodeApp([MathController]);
            releaseCachedNodeApp([MathController]);
        }
    });

    test('releasing all references removes the cached app', () => {
        const a = cachedBootNodeApp([MathController]);
        const b = cachedBootNodeApp([MathController]);
        expect(b).toBe(a);

        releaseCachedNodeApp([MathController]);
        releaseCachedNodeApp([MathController]);

        // Cache is cleared; a fresh boot creates a new app instance.
        const c = cachedBootNodeApp([MathController]);
        try {
            expect(c).not.toBe(a);
        } finally {
            releaseCachedNodeApp([MathController]);
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

        const a = cachedBootNodeApp([MathController]);
        const b = cachedBootNodeApp([OtherController]);
        try {
            expect(b).not.toBe(a);
        } finally {
            releaseCachedNodeApp([MathController]);
            releaseCachedNodeApp([OtherController]);
        }
    });
});

describe('installSynchronousAnimationFrames', () => {
    test('runs the callback synchronously with timestamp 0 and restores the prior global', () => {
        const scope = globalThis as {
            requestAnimationFrame?: (callback: (timestamp: number) => void) => number;
        };
        const before = scope.requestAnimationFrame;

        const restore = installSynchronousAnimationFrames();
        const seen: number[] = [];
        const id = scope.requestAnimationFrame?.((timestamp) => seen.push(timestamp));
        expect(seen).toEqual([0]);
        expect(id).toBe(0);

        restore();
        expect(scope.requestAnimationFrame).toBe(before);
    });
});
