/**
 * @author Jeff Rose
 */

/**
 * A behavior that can be attached to a WicketComponent to modify
 * its attributes, event handling, or rendering.
 *
 * Behaviors follow the Strategy pattern — they encapsulate reusable
 * cross-cutting concerns that can be attached to any component.
 */
export interface Behavior {
    /**
     * Called when the behavior is bound to a component.
     *
     * @param component - The host component.
     */
    bind?(component: unknown): void;

    /**
     * Called when the behavior is unbound from a component.
     *
     * @param component - The host component.
     */
    unbind?(component: unknown): void;

    /**
     * Called before the component renders.
     *
     * @param component - The host component.
     */
    beforeRender?(component: unknown): void;

    /**
     * Called after the component has rendered.
     *
     * @param component - The host component.
     */
    afterRender?(component: unknown): void;

    /**
     * Called when the component detaches at the end of a request cycle.
     *
     * @param component - The host component.
     */
    detach?(component: unknown): void;
}
