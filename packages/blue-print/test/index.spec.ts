import { describe, test, expect, beforeAll } from 'vitest';
import fingerprint from '../src';

describe('fingerprint', () => {
    beforeAll(() => {
        if (typeof window !== 'undefined' && !window.requestIdleCallback) {
            (window as any).requestIdleCallback = (cb: any) => setTimeout(() => cb({ didTimeout: false }), 0);
        }
    });

    test('it should provide a unique signature', async () => {
        const result = await fingerprint;
        expect(result).toBeInstanceOf(Array);
    });
});
