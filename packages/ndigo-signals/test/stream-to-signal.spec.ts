/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, it, expect, vi } from 'vitest';
import { signal, streamToSignal } from '../src/index';

/** An async iterable yielding on demand, so tests control arrival timing. */
function gatedStream<T>(values: T[]): { stream: AsyncIterable<T>; release: () => void; returned: () => void } {
    let releaseNext: (() => void) | undefined;
    let returned = false;
    const release = (): void => {
        releaseNext?.();
        releaseNext = undefined;
    };
    const stream: AsyncIterable<T> = {
        async *[Symbol.asyncIterator]() {
            try {
                for (const value of values) {
                    // oxlint-disable-next-line no-await-in-loop -- each value gates on its own release() call; the test drives arrival timing sequentially.
                    await new Promise<void>((resolve) => {
                        releaseNext = resolve;
                    });
                    yield value;
                }
            } finally {
                returned = true;
                releaseNext = undefined;
            }
        },
    };
    return { stream, release, returned: () => returned };
}

/** Flushes all pending microtasks and the current macrotask. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

describe('streamToSignal (AD-09)', () => {
    it('writes each streamed value into the signal as it arrives', async () => {
        const target = signal(0);
        const { stream, release } = gatedStream([1, 2, 3]);
        streamToSignal(stream, target);
        await settle();

        expect(target.value).toBe(0);
        release();
        await settle();
        expect(target.value).toBe(1);
        release();
        await settle();
        expect(target.value).toBe(2);
        release();
        await settle();
        expect(target.value).toBe(3);
    });

    it('stop() halts updates and closes the source once its pending read settles', async () => {
        const target = signal(0);
        const { stream, release, returned } = gatedStream([1, 2, 3]);
        const stop = streamToSignal(stream, target);
        await settle();

        release();
        await settle();
        expect(target.value).toBe(1);

        stop();
        await settle();
        // No further values are applied after stop().
        expect(target.value).toBe(1);

        // The loop is blocked on the source's next value; once that pending
        // read settles (here: the next gate), the queued close is processed
        // and the source's cleanup runs.
        release();
        await settle();
        expect(target.value).toBe(1);
        expect(returned()).toBe(true);
    });

    it('contains source errors without an unhandled rejection', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        try {
            const target = signal(0);
            const stream: AsyncIterable<number> = {
                async *[Symbol.asyncIterator]() {
                    yield 1;
                    throw new Error('boom');
                },
            };
            streamToSignal(stream, target);

            // Give the error path time to run; the rejection must be contained.
            await new Promise((resolve) => setTimeout(resolve, 10));
            expect(target.value).toBe(1);
            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining('[ndigo-signals] streamToSignal failed:'),
                expect.any(Object),
                expect.any(Error)
            );
        } finally {
            errorSpy.mockRestore();
        }
    });
});
