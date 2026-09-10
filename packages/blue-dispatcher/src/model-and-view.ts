import { View, AbstractView } from '@blue/view';

type Model<T = unknown> = { [key: string]: T } | Map<string, T>;

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
    viewName!: string | null;

    /**
     * Resolved view instance, when known.
     */
    view: View | null;

    /**
     * Whether this instance has either a view name or view object.
     */
    get hasView(): boolean {
        return typeof this.viewName === 'string' || typeof this.view !== 'undefined';
    }

    get [Symbol.toStringTag](): string {
        return `ModelAndView:${this.viewName}`;
    }

    /**
     * Create a model and view pair.
     *
     * @param view - The view name or view instance.
     * @param model - Optional model data to expose to the view.
     */
    constructor(view: View | string, model: Model | null = null) {
        if (typeof view === 'string') {
            this.viewName = view;
            this.view = null;
        } else {
            this.view = view;
            if (view instanceof AbstractView) {
                this.viewName = view.name;
            }
        }

        if (model) {
            this.model = model;
        }
    }
}
