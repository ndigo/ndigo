/**
 * Timing helpers for specs.
 *
 * `delay` is re-exported from `@ndigo/util` (the implementation lives in the
 * leaf so the harness's own dependency graph stays acyclic). The animation-
 * frame shim is harness-local — it installs a global and needs no util
 * dependency.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
export { delay } from '@ndigo/util';

/**
 * The synchronous `requestAnimationFrame` shape the shim installs: the
 * callback runs immediately with the given timestamp, and the call returns a
 * request id.
 */
type SynchronousAnimationFrame = (callback: (timestamp: number) => void) => number;

/**
 * Installs a synchronous `requestAnimationFrame` mock: each callback runs
 * immediately (timestamp `0`) instead of on the next frame. jsdom never
 * fires animation frames, so view engines that attach rendered elements on a
 * frame tick hang in specs without it.
 *
 * @returns A restore function that reinstates the previous implementation
 *   (or removes the global entirely when none was present).
 *
 * @example
 * ```ts
 * const restore = installSynchronousAnimationFrames();
 * // …run specs…
 * restore();
 * ```
 */
export function installSynchronousAnimationFrames(): () => void {
    const scope = globalThis as typeof globalThis & {
        requestAnimationFrame?: SynchronousAnimationFrame;
    };
    const previous = scope.requestAnimationFrame;
    scope.requestAnimationFrame = (callback) => {
        callback(0);
        return 0;
    };
    return () => {
        if (previous === undefined) Reflect.deleteProperty(scope, 'requestAnimationFrame');
        else scope.requestAnimationFrame = previous;
    };
}
