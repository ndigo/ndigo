/**
 * The model-and-view result type.
 */

import { View, ViewTarget } from '@ndigo/view';

/**
 * A view model: a keyed object, a map, or a bare array. The array form exists
 * for views whose model is the document itself (A2UI serializes its message
 * array), so handlers do not need a cast.
 */
type Model<T = unknown> = { [key: string]: T } | Map<string, T> | readonly unknown[];

/**
 * Optional, additive settings for a {@link ModelAndView}.
 */
export interface ModelAndViewOptions {
    /**
     * Destination for this result, bypassing the dispatcher's targeter chain.
     *
     * Supplying a target here is the decentralized placement path: the handler
     * (or the view it returns) decides where the output lands. It must be a
     * {@link ViewTarget} instance — never a selector — so request-derived
     * values cannot reach a DOM lookup.
     */
    viewTarget?: ViewTarget;
}

/**
 * Holds a view plus its optional model data.
 */
export class ModelAndView {
    /**
     * Model data supplied to the view.
     */
    model!: Model | null;

    /**
     * Resolved view name, when known.
     */
    viewName: string | null = null;

    /**
     * Resolved view instance, when known.
     */
    view: View | null;

    /**
     * Explicit destination for this result, when the handler supplied one.
     */
    viewTarget?: ViewTarget;

    /**
     * Whether this instance has either a view name or view object.
     */
    get hasView(): boolean {
        // `typeof null === 'object'`, so a null view must be compared, not
        // probed — and an empty name is no name.
        return (typeof this.viewName === 'string' && this.viewName.length > 0) || this.view != null;
    }

    get [Symbol.toStringTag](): string {
        return `ModelAndView:${this.viewName}`;
    }

    /**
     * Create a model and view pair.
     *
     * @param view - The view name or view instance.
     * @param model - Optional model data to expose to the view.
     * @param options - Optional placement settings ({@link ModelAndViewOptions.viewTarget}).
     */
    constructor(view: View | string, model: Model | null = null, options: ModelAndViewOptions = {}) {
        if (typeof view === 'string') {
            this.viewName = view;
            this.view = null;
        } else {
            // A realized view is authoritative: no shipped view sets
            // `AbstractView.name`, and populating `viewName` from it would let
            // the resolver chain replace the instance the handler built.
            this.view = view;
        }

        if (model) {
            this.model = model;
        }

        if (options.viewTarget) {
            this.viewTarget = options.viewTarget;
        }
    }
}
