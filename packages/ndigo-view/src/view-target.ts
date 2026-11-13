/**
 * The view-target contract that receives rendered output.
 */
import { Route } from '@ndigo/router';
import { like } from '@ndigo/util/types';

/**
 * Destination that receives rendered view output.
 *
 * Targets abstract the rendering surface so engines can write to DOM nodes,
 * iframes, streams, or other host-specific outputs.
 */
export interface ViewTarget {
    /**
     * Prepares the target for rendering (e.g., clearing previous content).
     *
     * @param route - The route being rendered.
     * @returns A promise that resolves when preparation completes.
     */
    prepare(route: Route): void | Promise<void>;

    /**
     * Commits the rendered output to the target.
     * The type of `output` depends on the View engine (e.g., HTMLElement, string).
     *
     * @param output - The rendered output.
     * @param model - The model used to produce the output.
     * @param route - The route being rendered.
     * @returns A promise that resolves when the output has been committed.
     */
    commit(output: unknown, model: unknown, route: Route): void | Promise<void>;

    /**
     * Cleans up the ViewTarget.
     *
     * @returns A promise that resolves when cleanup completes.
     */
    clear(): void | Promise<void>;
}

/**
 * View target that forwards surface events back into the application layer.
 */
export interface EventBridgeViewTarget extends ViewTarget {
    /**
     * Configures the mapping of surface event names to application event names.
     * Only mapped events are forwarded.
     *
     * @param eventMap - A map of surface event names to application event names.
     */
    setEventMap(eventMap: Record<string, string>): void;
}

/**
 * Tests whether a value behaves like a {@link ViewTarget}.
 *
 * Runtime-supplied targets (a result's explicit target, a route attribute set
 * by an interceptor) cross a boundary the type system does not police, so the
 * dispatcher validates them before a view writes into them. A string is the
 * dangerous near-miss: it would otherwise reach a selector lookup.
 *
 * @param value - The value to inspect.
 * @returns `true` when the value is target-shaped.
 */
export const likeViewTarget = (value: unknown): value is ViewTarget =>
    value !== null &&
    value !== undefined &&
    typeof value === 'object' &&
    like({ prepare: Function, commit: Function, clear: Function })(value);
