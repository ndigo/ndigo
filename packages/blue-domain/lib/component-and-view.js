/**
 * @author Jeff Rose
 */
import { ModelAndView } from '@blue/dispatcher';
/**
 * @class module:component.ComponentAndView
 * @extends module:dispatcher.ModelAndView
 */
export class ComponentAndView extends ModelAndView {
    get [Symbol.toStringTag]() {
        return `ComponentAndView:${this.viewName}`;
    }
    component;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWFuZC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC1hbmQtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdoRDs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsWUFBWTtJQUM5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQztRQUNwQixPQUFPLG9CQUFvQixJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7SUFDL0MsQ0FBQztJQUVELFNBQVMsQ0FBa0I7Q0FDOUIifQ==