/**
 * @author Jeff Rose
 */

import { Route } from '@blue/router';

/**
 * A ViewTarget is the destination where a View renders its output.
 * It abstracts the underlying rendering surface (e.g., a DOM element, an Iframe).
 */
export interface ViewTarget {
    /**
     * Prepares the target for rendering (e.g., clearing previous content).
     */
    prepare(route: Route): void | Promise<void>;

    /**
     * Commits the rendered output to the target.
     * The type of `output` depends on the View engine (e.g., HTMLElement, string).
     */
    commit(output: any, model: any, route: Route): void | Promise<void>;

    /**
     * Cleans up the ViewTarget.
     */
    clear(): void | Promise<void>;
}

/**
 * A ViewTarget that also bridges user interaction events from the rendering
 * surface back to the application layer.
 */
export interface EventBridgeViewTarget extends ViewTarget {
    /**
     * Configures the mapping of surface event names to application event names.
     * Only mapped events are forwarded.
     */
    setEventMap(eventMap: Record<string, string>): void;
}
