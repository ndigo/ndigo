/**
 * `AsyncReader` unit tests — bounded queue, watermark overflow episodes
 * (drop while full, resume once drained), and byte-budget accounting.
 * @module ndigo-socket
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, test } from 'vitest';
import { AsyncReader } from '../src/index';

/** Yield enough microtask turns for async-generator resumption. */
const drain = async (): Promise<void> => {
    for (let index = 0; index < 16; index++) {
        // oxlint-disable-next-line no-await-in-loop -- each turn must complete before the next: the point is to advance the microtask queue step by step.
        await Promise.resolve();
    }
};

describe('AsyncReader bounds', () => {
    test('drops while a count bound is exceeded, fires overflow once per episode, and resumes', async () => {
        let overflows = 0;
        const reader = new AsyncReader<number>(2, () => {
            overflows += 1;
        });
        reader.push(1);
        reader.push(2);
        reader.push(3); // full → dropped, first overflow episode
        expect(overflows).toBe(1);

        const seen: number[] = [];
        void (async () => {
            for await (const value of reader.iterable()) {
                seen.push(value);
            }
        })();
        await drain();
        expect(seen).toEqual([1, 2]);

        // Drained below the cap — the overflow episode clears and pushes
        // resume (a permanent latch would drop every later frame forever).
        reader.push(4);
        reader.push(5);
        reader.push(6); // full again → second episode
        reader.push(7); // still full → same episode, no second fire
        expect(overflows).toBe(2);
        await drain();
        expect(seen).toEqual([1, 2, 4, 5]);
        reader.push(8);
        await drain();
        expect(seen).toEqual([1, 2, 4, 5, 8]);
        reader.complete();
        await drain();
    });

    test('byte budget drops pushes past maxBytes and re-arms after drain', async () => {
        let overflows = 0;
        const reader = new AsyncReader<number>(
            100,
            () => {
                overflows += 1;
            },
            {
                maxBytes: 6,
                sizeOf: (value) => value,
            }
        );
        reader.push(3);
        reader.push(3);
        reader.push(3); // 6 + 3 > 6 → dropped
        expect(overflows).toBe(1);
        const seen: number[] = [];
        void (async () => {
            for await (const value of reader.iterable()) {
                seen.push(value);
            }
        })();
        await drain();
        expect(seen).toEqual([3, 3]);
        reader.push(2); // re-armed
        reader.push(5); // 2 + 5 = 7 > 6 → dropped
        expect(overflows).toBe(2);
        await drain();
        expect(seen).toEqual([3, 3, 2]);
        reader.complete();
        await drain();
    });
});
