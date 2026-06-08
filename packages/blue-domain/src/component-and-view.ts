/**
 * @author Jeff Rose
 */

import { ModelAndView } from '@blue/dispatcher';
import { DomainComponent } from './component';

/**
 * Couples a domain component with a dispatcher model-and-view instance.
 *
 * @extends module:dispatcher.ModelAndView
 */
export class ComponentAndView extends ModelAndView {
    declare viewName: string;

    get [Symbol.toStringTag](): string {
        return `ComponentAndView:${this.viewName}`;
    }

    /**
     * Domain component associated with the current view model.
     */
    component!: DomainComponent;
}
