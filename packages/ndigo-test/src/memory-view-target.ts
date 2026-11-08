/**
 * Memory view target — a DOM-free `ViewTarget` that captures rendered output.
 */
import { Route } from '@ndigo/router';
import { ViewTarget } from '@ndigo/view';

/**
 * A captured render: the output element, the model it was rendered with, and
 * the route that produced it.
 */
export interface CapturedRender {
    /** The rendered output (typically an `HTMLElement` created by the engine). */
    output: unknown;
    /** The model the view was rendered with. */
    model: unknown;
    /** The route that triggered the render. */
    route: Route;
}

/**
 * Captures rendered view output instead of mounting it into a DOM container.
 */
export class MemoryViewTarget implements ViewTarget {
    #lastRender: CapturedRender | null = null;

    /**
     * The last captured render, or `null` if none yet.
     */
    get lastRender(): CapturedRender | null {
        return this.#lastRender;
    }

    /**
     * Prepares the target for a render (there is no DOM container to clear).
     *
     * @param route - The route being rendered.
     * @returns A promise that resolves immediately.
     */
    async prepare(route: Route): Promise<void> {
        // No DOM container to clear.
        void route;
    }

    /**
     * Captures a rendered output for assertions.
     *
     * @param output - The rendered output.
     * @param model - The data model used for the render.
     * @param route - The route that was rendered.
     * @returns A promise that resolves once the render is captured.
     */
    async commit(output: unknown, model: unknown, route: Route): Promise<void> {
        this.#lastRender = { output, model, route };
    }

    /**
     * Clears the captured render.
     *
     * @returns A promise that resolves once the capture is cleared.
     */
    async clear(): Promise<void> {
        this.#lastRender = null;
    }
}
