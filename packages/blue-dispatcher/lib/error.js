/**
 * @author Jeff Rose
 */
import { FrameworkError } from '@blue/core';
import { isString } from '@blue/util';
const { defineProperty } = Reflect;
/**
 * @extends module:core.FrameworkError
 */
export class NoHandlerFoundError extends FrameworkError {
    route;
    get [Symbol.toStringTag]() {
        return 'NoHandlerFoundError';
    }
    constructor(route) {
        super(`No handler found for route "${route.path}"`);
        defineProperty(this, 'route', {
            value: route,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * @extends module:core.FrameworkError
 */
export class NoViewFoundError extends FrameworkError {
    route;
    viewName;
    get [Symbol.toStringTag]() {
        return 'NoViewFoundError';
    }
    constructor(viewName, route) {
        super(`Could not resolve view with name "${viewName}" for route "${route.path}"`);
        defineProperty(this, 'route', {
            value: route,
            configurable: false,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'viewName', {
            value: viewName,
            configurable: false,
            enumerable: false,
            writable: false,
        });
    }
}
/**
 * An error that represents a failure to retrieve a required {@link Route|Route} property.
 * @extends module:core.FrameworkError
 */
export class RouteBindingError extends FrameworkError {
    route;
    name;
    get [Symbol.toStringTag]() {
        return 'RouteBindingError';
    }
    constructor(routeOrMessage, name) {
        if (isString(routeOrMessage)) {
            super(routeOrMessage);
            defineProperty(this, 'route', {
                value: null,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: null,
                configurable: false,
                enumerable: false,
                writable: false,
            });
        }
        else {
            super(`Unable to bind "${name}" for route "${routeOrMessage.path}"`);
            defineProperty(this, 'route', {
                value: routeOrMessage,
                configurable: false,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: name,
                configurable: false,
                enumerable: false,
                writable: false,
            });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRTVDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdEMsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQzs7R0FFRztBQUNILE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxjQUFjO0lBQ25ELEtBQUssQ0FBUTtJQUViLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDO1FBQ3BCLE9BQU8scUJBQXFCLENBQUM7SUFDakMsQ0FBQztJQUVELFlBQVksS0FBWTtRQUNwQixLQUFLLENBQUMsK0JBQStCLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ3BELGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzFCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLEtBQUs7WUFDbkIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBRUQ7O0dBRUc7QUFDSCxNQUFNLE9BQU8sZ0JBQWlCLFNBQVEsY0FBYztJQUN2QyxLQUFLLENBQVE7SUFDYixRQUFRLENBQVM7SUFFMUIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBWSxRQUFnQixFQUFFLEtBQVk7UUFDdEMsS0FBSyxDQUFDLHFDQUFxQyxRQUFRLGdCQUFnQixLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQztRQUNsRixjQUFjLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRTtZQUMxQixLQUFLLEVBQUUsS0FBSztZQUNaLFlBQVksRUFBRSxLQUFLO1lBQ25CLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFO1lBQzdCLEtBQUssRUFBRSxRQUFRO1lBQ2YsWUFBWSxFQUFFLEtBQUs7WUFDbkIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGNBQWM7SUFDakQsS0FBSyxDQUFRO0lBQ2IsSUFBSSxDQUFTO0lBRWIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0lBSUQsWUFBWSxjQUE4QixFQUFFLElBQWE7UUFDckQsSUFBSSxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQztZQUMzQixLQUFLLENBQUMsY0FBYyxDQUFDLENBQUM7WUFDdEIsY0FBYyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUU7Z0JBQzFCLEtBQUssRUFBRSxJQUFJO2dCQUNYLFlBQVksRUFBRSxLQUFLO2dCQUNuQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDbEIsQ0FBQyxDQUFDO1lBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxJQUFJO2dCQUNYLFlBQVksRUFBRSxLQUFLO2dCQUNuQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDbEIsQ0FBQyxDQUFDO1FBQ1AsQ0FBQzthQUFNLENBQUM7WUFDSixLQUFLLENBQUMsbUJBQW1CLElBQUksZ0JBQWdCLGNBQWMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ3JFLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUMxQixLQUFLLEVBQUUsY0FBYztnQkFDckIsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDekIsS0FBSyxFQUFFLElBQUk7Z0JBQ1gsWUFBWSxFQUFFLEtBQUs7Z0JBQ25CLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7UUFDUCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=