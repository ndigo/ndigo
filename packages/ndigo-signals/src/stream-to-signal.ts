/**
 * Bridges an async event stream into a reactive signal (AD-09).
 */
import { Signal } from '@preact/signals-core';
import { getLogger } from '@ndigo/log';

const logger = getLogger('ndigo-signals:stream-to-signal');

/**
 * Bridges an async iterable into a `Signal`, updating it as values arrive.
 *
 * @param source - The event stream to consume (e.g. a `stream: true`
 *   service call from `@ndigo/service`).
 * @param target - The signal written with each yielded value.
 * @returns A stop function: cancels consumption and closes the source.
 *
 * @example
 * ```ts
 * const model = signal(initial);
 * const stop = streamToSignal(service.models(), model);
 * // views subscribed to `model` re-render on each pushed update
 * stop(); // tear down
 * ```
 */
export function streamToSignal<T>(source: AsyncIterable<T>, target: Signal<T>): () => void {
    let cancelled = false;
    const iterator: AsyncIterator<T> = source[Symbol.asyncIterator]();

    const run = async (): Promise<void> => {
        try {
            for (;;) {
                // oxlint-disable-next-line no-await-in-loop -- stream consumption is inherently sequential
                const { done, value } = await iterator.next();
                if (done || cancelled) {
                    return;
                }
                target.value = value;
            }
        } catch (error: unknown) {
            if (!cancelled) {
                logger.error('[ndigo-signals] streamToSignal failed:', error instanceof Error ? error : String(error));
            }
        } finally {
            if (!cancelled) {
                try {
                    await iterator.return?.();
                } catch {
                    // The source's cleanup failed; nothing left to release.
                }
            }
        }
    };

    void run();

    return () => {
        cancelled = true;
        try {
            void iterator.return?.().catch(() => undefined);
        } catch {
            // Synchronous throw from return() — nothing more to release.
        }
    };
}
