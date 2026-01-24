/**
 * @author Jeff Rose
 */
import { likeFactory } from '@blue/factory';
import { type } from '@blue/util';
import { getRouteMapping } from './route-mapping';
/**
 * @interface module:dispatcher.Invocable
 */
/**
 * Encapsulates information about a handler method consisting of a `method` and `handler`.
 * @interface module:dispatcher.HandlerMethod
 * @extends module:dispatcher.Invocable
 */
/**
 * A strategy for assigning a name to a route handler method's mapping.
 *
 * The strategy can be configured on {@linkcode module:dispatcher.AbstractHandlerMethodMapping|AbstractHandlerMethodMapping}.
 * It is used to assign a name to the mapping of every registered handler method.
 * @interface module:dispatcher.RouteHandlerMethodMappingNamingStrategy
 */
/**
 * @function module:dispatcher.RouteHandlerMethodMappingNamingStrategy#getName
 * @param {*} handlerMethod
 * @param {*} mapping
 * @returns {external:string} The name
 */
const { defineProperty } = Reflect;
/**
 * @class module:router.RouteHandlerMethod
 * @implements module:dispatcher.HandlerMethod
 * @implements module:core.Serializable
 */
export class RouteHandlerMethod {
    factory;
    name;
    handler;
    method;
    parameters;
    argumentResolvers;
    constructor(factoryOrHandler, nameOrMethod, ...args) {
        /**
         * @member {module:factory.Factory} module:router.RouteHandlerMethod#factory
         */
        /**
         * @member {external:string} module:router.RouteHandlerMethod#name
         */
        /**
         * @member {*} module:router.RouteHandlerMethod#handler
         */
        /**
         * @member {external:string} module:router.RouteHandlerMethod#method
         */
        /**
         * @member {external:Array<*>} module:router.RouteHandlerMethod#parameters
         */
        if (likeFactory(factoryOrHandler)) {
            defineProperty(this, 'factory', {
                value: factoryOrHandler,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: nameOrMethod,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'handler', {
                value: this.factory.getInstance(this.name),
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'method', {
                value: args.shift(),
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        else {
            defineProperty(this, 'factory', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'name', {
                value: null,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'handler', {
                value: factoryOrHandler,
                configurable: true,
                enumerable: false,
                writable: false,
            });
            defineProperty(this, 'method', {
                value: nameOrMethod,
                configurable: true,
                enumerable: false,
                writable: false,
            });
        }
        defineProperty(this, 'parameters', {
            value: args.length ? args : [],
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    /**
     * @function module:router.RouteHandlerMethod#invoke
     * @param {module:router.Request} route
     * @returns {module:dispatcher.ModelAndView}
     */
    invoke(route, ...foo) {
        /**
         * * Hardcoding route as a parameter is a bit of a cop-out. It would be better to allow them to pick parameters, etc. as arguments. -JBR
         */
        const { argumentResolvers, parameters } = this, parametersLength = parameters.length, args = new Array(parametersLength), mapping = getRouteMapping(this.handler, this.method);
        console.log('RouteHandlerMethod::invoke', this.method, getRouteMapping(this.handler, this.method), parametersLength, parameters, argumentResolvers);
        if (parametersLength) {
            for (let index = 0; index < parametersLength; index++) {
                const parameter = parameters[index], resolver = argumentResolvers.find((resolver) => resolver.supportsParameter(parameter));
                args[index] = resolver ? resolver.resolveArgument(parameter, route, mapping) : void 0;
                console.log('RouteHandlerMethod::invoke::parameter', index, parameter.type, argumentResolvers.find((resolver) => resolver.supportsParameter(parameter)));
            }
        }
        return this.handler[this.method](...args);
    }
    /**
     * @function module:router.RouteHandlerMethod#toString
     * @returns {external:string}
     */
    toString() {
        return `${type(this.handler)}#${this.method}( ${JSON.stringify(this.parameters)} )`;
    }
}
/**
 * @class module:dispatcher.ErrorHandlerMethod
 * @extends module:router.RouteHandlerMethod
 */
export class ErrorHandlerMethod extends RouteHandlerMethod {
    invoke(route, error, handlerMethod) {
        return super.invoke(route, error, handlerMethod);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tZXRob2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtaGFuZGxlci1tZXRob2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQVcsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFHbEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBY2xEOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7OztHQUtHO0FBRUgsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQzs7OztHQUlHO0FBQ0gsTUFBTSxPQUFPLGtCQUFrQjtJQUNsQixPQUFPLENBQVU7SUFDakIsSUFBSSxDQUFTO0lBQ2IsT0FBTyxDQUFTO0lBQ2hCLE1BQU0sQ0FBUztJQUV4QixVQUFVLENBQW9CO0lBQzlCLGlCQUFpQixDQUFrQztJQUluRCxZQUFZLGdCQUFrQyxFQUFFLFlBQW9CLEVBQUUsR0FBRyxJQUFXO1FBQ2hGOztXQUVHO1FBRUg7O1dBRUc7UUFFSDs7V0FFRztRQUVIOztXQUVHO1FBRUg7O1dBRUc7UUFFSCxJQUFJLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLENBQUM7WUFDaEMsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7Z0JBQzVCLEtBQUssRUFBRSxnQkFBZ0I7Z0JBQ3ZCLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDbEIsQ0FBQyxDQUFDO1lBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7Z0JBQ3pCLEtBQUssRUFBRSxZQUFZO2dCQUNuQixZQUFZLEVBQUUsSUFBSTtnQkFDbEIsVUFBVSxFQUFFLEtBQUs7Z0JBQ2pCLFFBQVEsRUFBRSxLQUFL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