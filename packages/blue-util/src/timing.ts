/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */

/**
 * Resolves after `ms` milliseconds.
 *
 * The single shared timing helper for async specs: waits on the ambient timer
 * queue, so under `vi.useFakeTimers()` the wait settles only when the spec
 * advances time (`vi.advanceTimersByTimeAsync`). Re-exported by `@blue/test`
 * for harness consumers; packages the harness itself depends on (e.g.
 * `@blue/platform-node`) import it here directly so the workspace stays
 * acyclic.
 *
 * @param ms - Milliseconds to wait.
 * @returns A promise resolving once the delay has elapsed.
 */
export function delay(ms: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
}
