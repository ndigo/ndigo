/**
 * @author Jeff Rose
 */
import { ModelAndView } from '@blue/dispatcher';
import { DomainComponent } from './component';
/**
 * @extends module:dispatcher.ModelAndView
 */
export declare class ComponentAndView extends ModelAndView {
    get [Symbol.toStringTag](): string;
    component: DomainComponent;
}
//# sourceMappingURL=component-and-view.d.ts.map