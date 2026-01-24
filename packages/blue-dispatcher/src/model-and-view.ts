/**
 * @author Jeff Rose
 */

import { View, AbstractView } from '@blue/view';

type Model<T = any> = { [key: string]: T } | Map<string, T>;

/**
 * @class module:dispatcher.ModelAndView
 */
export class ModelAndView {
    model: Model;
    viewName: string;
    view: View;

    get hasView(): boolean {
        return typeof this.viewName === 'string' || typeof this.view !== 'undefined';
    }

    get [Symbol.toStringTag](): string {
        return `ModelAndView:${this.viewName}`;
    }

    constructor(view: View | string, model: Model = null) {
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
        /**
         * @member {external:boolean} module:dispatcher.ModelAndView#hasView
         */

        /**
         * @member {*} module:dispatcher.ModelAndView#model
         */

        /**
         * @member {external:string} module:dispatcher.ModelAndView#viewName
         */

        /**
         * @member {module:view.View} module:dispatcher.ModelAndView#view
         */
    }
}
