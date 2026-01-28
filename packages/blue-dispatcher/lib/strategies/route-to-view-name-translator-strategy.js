/**
 * @author Jeff Rose
 */
import { DefaultRouteToViewNameTranslator } from '../route-to-view-name-translator';
/**
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
     * @param {module:router.Route} route The current route
     * @returns {string} The view name or `null` if no default found.
     */
    getDefaultViewName(route) {
        return this.routeToViewNameTranslator ? this.routeToViewNameTranslator.getViewName(route) : null;
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtdG8tdmlldy1uYW1lLXRyYW5zbGF0b3Itc3RyYXRlZ3kuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyYXRlZ2llcy9yb3V0ZS10by12aWV3LW5hbWUtdHJhbnNsYXRvci1zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUlILE9BQU8sRUFBRSxnQ0FBZ0MsRUFBNkIsTUFBTSxrQ0FBa0MsQ0FBQztBQVUvRztHQUNHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sRUFDOUIsNkJBQTZCLEdBQUcsMkJBQTJCLEVBQzNELGdDQUFnQyxHQUE4QixJQUFJLGdDQUFnQyxFQUFFLENBQUM7QUFFekcsTUFBTSxDQUFDLE1BQU0sbUNBQW1DLEdBQUcsQ0FDL0MsVUFBYSxFQUN1QyxFQUFFLENBQ3RELEtBQU0sU0FBUSxVQUFVO0lBQ1gsNEJBQTRCLENBQVM7SUFFOUMseUJBQXlCLENBQTRCO0lBRXJELFlBQVksR0FBRyxJQUFXO1FBQ3RCLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQ2YsY0FBYyxDQUFDLElBQUksRUFBRSw4QkFBOEIsRUFBRTtZQUNqRCxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsNkJBQTZCO1lBQ3hDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1NBQ25CLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxXQUFXLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUNwRCxDQUFDO0lBRUQsNkJBQTZCLENBQUMsT0FBMkI7UUFDckQsTUFBTSxFQUFFLDRCQUE0QixFQUFFLEdBQUcsSUFBSSxDQUFDO1FBRTlDLElBQUksQ0FBQyxZQUFZLENBQ2IsT0FBTyxFQUNQLDRCQUE0QixFQUM1Qiw2QkFBNkIsRUFDN0IsZ0NBQWdDLENBQ25DLENBQUM7UUFFRixPQUFPLENBQUMsR0FBRyxDQUFDLDJDQUEyQyxFQUFFLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0lBQzdGLENBQUM7SUFFRDs7OztPQUlHO0lBQ0gsa0JBQWtCLENBQUMsS0FBWTtRQUMzQixPQUFPLElBQUksQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQ3JHLENBQUM7Q0FDSixDQUFDIn0=