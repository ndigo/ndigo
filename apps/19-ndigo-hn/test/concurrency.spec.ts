/**
 * `mapConcurrent` — the scheduler the feed hydration relies on: bounded
 * in-flight calls, input-order results, no lost work.
 *
 * @module ndigo-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { delay } from '@ndigo/util';
import { mapConcurrent } from '../src/api/concurrency';

describe('mapConcurrent', () => {
    test('never exceeds the concurrency limit and preserves input order', async () => {
        const values = [0, 1, 2, 3, 4, 5, 6];
        const issued: number[] = [];
        let inFlight = 0;
        let peak = 0;

        const results = await mapConcurrent(values, 2, async (value) => {
            issued.push(value);
            inFlight += 1;
            peak = Math.max(peak, inFlight);
            await delay(5);
            inFlight -= 1;
            return value * 2;
        });

        expect(peak).toBeLessThanOrEqual(2);
        expect([...issued].sort((a, b) => a - b)).toEqual(values);
        expect(results).toEqual(values.map((value) => value * 2));
    });

    test('handles a limit larger than the input and an empty input', async () => {
        await expect(mapConcurrent([1, 2], 8, async (value) => value + 1)).resolves.toEqual([2, 3]);
        await expect(mapConcurrent([], 4, async (value: number) => value)).resolves.toEqual([]);
    });
});
