/**
 * Memory view target — a DOM-free `ViewTarget` that captures rendered output
 * so browser controllers can be asserted on without a real DOM container.
 *
 * The web-component engine falls into the `!likeDOMViewTarget` branch when the
 * target is a plain `ViewTarget`, creating the element and committing it here.
 *
 * @module
 * @since 1.0.0
 */

import { Route } from '@blue/router';
import { ViewTarget } from '@blue/view';

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

    /** @inheritdoc */
    async prepare(route: Route): Promise<void> {
        // No DOM container to clear.
        void route;
    }

    /** @inheritdoc */
    async commit(output: unknown, model: unknown, route: Route): Promise<void> {
        this.#lastRender = { output, model, route };
    }

    /** @inheritdoc */
    async clear(): Promise<void> {
        this.#lastRender = null;
    }
}