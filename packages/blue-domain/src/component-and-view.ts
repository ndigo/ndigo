/**
 * @author Jeff Rose
 */

import { ModelAndView } from '@blue/dispatcher';
import { DomainComponent } from './component';

/**
 * @class module:component.ComponentAndView
 * @extends module:dispatcher.ModelAndView
 */
export class ComponentAndView extends ModelAndView {
    get [ Symbol.toStringTag ](): string {
        return `ComponentAndView:${ this.viewName }`;
    }

    component: DomainComponent;
}
