/**
 * A view that renders a custom element into a view target.
 */
import { AbstractView, ViewTarget } from '@ndigo/view';
import { IllegalStateError } from '@ndigo/core';
import type { Route } from '@ndigo/router';

/**
 * An HTMLElement that carries the view model used to render it.
 */
export interface ModelAwareElement extends HTMLElement {
    /** The view model used to render the element. */
    model: unknown;
}

/**
 * A view that renders a custom element into a view target.
 *
 * Rendering creates an element for {@link WebComponentView.tagName | `tagName`},
 * binds the view model to it, and commits it to the target — the element's own
 * custom-element lifecycle performs the actual rendering. Placement and reuse
 * of the rendered subtree belong to the target.
 *
 * Components MUST render from the `model` setter, not `connectedCallback`
 * alone: `MemoryViewTarget` retains the element without attaching it to the
 * DOM, so `connectedCallback` never fires under test harnesses (and
 * `requestAnimationFrame`-gated targets defer attach). Treat
 * `connectedCallback` as a real-DOM fallback only.
 */
export class WebComponentView extends AbstractView {
    /**
     * The custom element tag name rendered by this view.
     */
    tagName: string;

    /**
     * Creates a view bound to a specific custom element tag name.
     *
     * @param tagName - The custom element tag name to render.
     */
    constructor(tagName: string) {
        super();
        this.tagName = tagName;
    }

    /**
     * Creates the element for `tagName`, binds the model, and commits it.
     *
     * @param viewModel - The model assigned to the element before commit.
     * @param request - The current request/route.
     * @param target - The view target that receives the element.
     * @returns A promise that resolves once the target commits the element.
     */
    protected async _renderView(viewModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('WebComponentView requires a ViewTarget to render.');
        }

        const element = document.createElement(this.tagName) as ModelAwareElement;
        element.model = viewModel;
        await target.commit(element, viewModel, request as Route);
    }
}
