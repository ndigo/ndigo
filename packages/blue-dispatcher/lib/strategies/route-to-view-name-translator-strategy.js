/**
 * @author Jeff Rose
 */
import { DefaultRouteToViewNameTranslator } from '../route-to-view-name-translator';
/**
 * @interface module:dispatcher.RequestToViewNameTranslatorStrategy
 */
const { defineProperty } = Reflect, ROUTE_TO_VIEW_NAME_TRANSLATOR = 'routeToViewNameTranslator', defaultRouteToViewNameTranslator = new DefaultRouteToViewNameTranslator();
export const AsRouteToViewNameTranslatorStrategy = (superclass) => class extends superclass {
    routeToViewNameTranslatorKey;
    routeToViewNameTranslator;
    constructor(...args) {
        super(...args);
        defineProperty(this, 'routeToViewNameTranslatorKey', {
            get: () => ROUTE_TO_VIEW_NAME_TRANSLATOR,
            configurable: true,
            enumerable: true,
        });
        this.addStrategy(ROUTE_TO_VIEW_NAME_TRANSLATOR);
    }
    initRouteToViewNameTranslator(context) {
        const { routeToViewNameTranslatorKey } = this;
        this.initStrategy(context, routeToViewNameTranslatorKey, ROUTE_TO_VIEW_NAME_TRANSLATOR, defaultRouteToViewNameTranslator);
        console.log('Dispatcher::initRouteToViewNameTranslator', this.routeToViewNameTranslator);
    }
    /**
     * Translate the supplied route into a default view name.
     * @function module:dispatcher.RouteToViewNameTranslatorStrategy#getDefaultViewName
     * @param {module:router.Route} route The current route
     * @returns {external:string} The view name or `null` if no default found.
     */
    getDefaultViewName(route) {
        return this.routeToViewNameTranslator ? this.routeToViewNameTranslator.getViewName(route) : null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3Itc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9yb3V0ZS10by12aWV3LW5hbWUtdHJhbnNsYXRvci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxnQ0FBZ0MsRUFBNkIsTUFBTSxrQ0FBa0MsQ0FBQztBQVUvRzs7R0FFRztBQUVILE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzlCLDZCQUE2QixHQUFHLDJCQUEyQixFQUMzRCxnQ0FBZ0MsR0FBOEIsSUFBSSxnQ0FBZ0MsRUFBRSxDQUFDO0FBRXpHLE1BQU0sQ0FBQyxNQUFNLG1DQUFtQyxHQUFHLENBQy9DLFVBQWEsRUFDdUMsRUFBRSxDQUN0RCxLQUFNLFNBQVEsVUFBVTtJQUNYLDRCQUE0QixDQUFTO0lBRTlDLHlCQUF5QixDQUE0QjtJQUVyRCxZQUFZLEdBQUcsSUFBVztRQUN0QixLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQztRQUNmLGNBQWMsQ0FBQyxJQUFJLEVBQUUsOEJBQThCLEVBQUU7WUFDakQsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLDZCQUE2QjtZQUN4QyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtTQUNuQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsV0FBVyxDQUFDLDZCQUE2QixDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVELDZCQUE2QixDQUFDLE9BQTJCO1FBQ3JELE1BQU0sRUFBRSw0QkFBNEIsRUFBRSxHQUFHLElBQUksQ0FBQztRQUU5QyxJQUFJLENBQUMsWUFBWSxDQUNiLE9BQU8sRUFDUCw0QkFBNEIsRUFDNUIsNkJBQTZCLEVBQzdCLGdDQUFnQyxDQUNuQyxDQUFDO1FBRUYsT0FBTyxDQUFDLEdBQUcsQ0FBQywyQ0FBMkMsRUFBRSxJQUFJLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUM3RixDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSCxrQkFBa0IsQ0FBQyxLQUFZO1FBQzNCLE9BQU8sSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDckcsQ0FBQztDQUNKLENBQUMifQ==