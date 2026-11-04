/**
 * @module ndigo-util
 * @since 1.0.0
 * @author Jeff Rose
 */
import { afterEach, describe, expect, test, vi } from 'vitest';

import { delay } from '@ndigo/util';

describe('delay', function () {
    afterEach(function () {
        vi.useRealTimers();
    });

    test('resolves only after the requested time elapses', async function () {
        vi.useFakeTimers();
        let resolved = false;
        const pending = delay(100).then(() => {
            resolved = true;
        });

        await vi.advanceTimersByTimeAsync(99);
        expect(resolved).toBe(false);

        await vi.advanceTimersByTimeAsync(1);
        await pending;
        expect(resolved).toBe(true);
    });

    test('resolves on the real timer queue', async function () {
        const start = Date.now();
        await delay(10);
        expect(Date.now() - start).toBeGreaterThanOrEqual(5);
    });
});
