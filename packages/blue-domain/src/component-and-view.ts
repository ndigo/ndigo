/**
 * @author Jeff Rose
 */

import { ModelAndView } from '@blue/dispatcher';
import { DomainComponent } from './component';

/**
 * @extends module:dispatcher.ModelAndView
 */
export class ComponentAndView extends ModelAndView {
    declare viewName: string;
    get [Symbol.toStringTag](): string {
        return `ComponentAndView:${this.viewName}`;
    }

    component: DomainComponent;
}
