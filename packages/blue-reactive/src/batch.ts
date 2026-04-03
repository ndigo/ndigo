/**
 * @author Jeff Rose
 */

let batchDepth = 0;
const pendingFlushes: Set<() => void> = new Set();

/**
 * Returns whether a batch operation is currently in progress.
 */
export function isBatching(): boolean {
    return batchDepth > 0;
}

/**
 * Schedules a flush callback to run when the current batch completes.
 * If no batch is active, the callback is invoked immediately.
 *
 * @param flush - A function that delivers pending notifications.
 */
export function scheduleBatchFlush(flush: () => void): void {
    if (batchDepth > 0) {
        pendingFlushes.add(flush);
    } else {
        flush();
    }
}

/**
 * Groups multiple model updates so that subscribers are notified only once,
 * after all updates in the batch have been applied. Nested batch calls are
 * collapsed — notifications are flushed at the outermost boundary.
 *
 * @param fn - A function that performs one or more model updates.
 *
 * @example
 * ```ts
 * const name = mutableModel('Alice');
 * const age = mutableModel(30);
 *
 * batch(() => {
 *     name.set('Bob');
 *     age.set(25);
 *     // subscribers are not called yet
 * });
 * // subscribers are called once here
 * ```
 */
export function batch(fn: () => void): void {
    batchDepth++;

    try {
        fn();
    } finally {
        batchDepth--;
        if (batchDepth === 0) {
            const flushes = [...pendingFlushes];
            pendingFlushes.clear();
            for (const flush of flushes) {
                flush();
            }
        }
    }
}
