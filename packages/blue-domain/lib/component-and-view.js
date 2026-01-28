/**
 * @author Jeff Rose
 */
import { ModelAndView } from '@blue/dispatcher';
/**
 * @extends module:dispatcher.ModelAndView
 */
export class ComponentAndView extends ModelAndView {
    get [Symbol.toStringTag]() {
        return `ComponentAndView:${this.viewName}`;
    }
    component;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9uZW50LWFuZC12aWV3LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbXBvbmVudC1hbmQtdmlldy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUdoRDs7R0FFRztBQUNILE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxZQUFZO0lBQzlDLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8sb0JBQW9CLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRUQsU0FBUyxDQUFrQjtDQUM5QiJ9