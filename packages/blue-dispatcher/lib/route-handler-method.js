/**
 * @author Jeff Rose
 */
import { likeFactory } from '@blue/factory';
import { type } from '@blue/util';
import { getRouteMapping } from './route-mapping';
/**
 */
/**
 * Encapsulates information about a handler method consisting of a `method` and `handler`.
 * @extends module:dispatcher.Invocable
 */
/**
 * A strategy for assigning a name to a route handler method's mapping.
 *
 * The strategy can be configured on {@link AbstractHandlerMethodMapping|AbstractHandlerMethodMapping}.
 * It is used to assign a name to the mapping of every registered handler method.
 */
/**
 * @param {*} handlerMethod
 * @param {*} mapping
 * @returns {string} The name
 */
const { defineProperty } = Reflect;
/**
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
         */
        /**
         */
        /**
         */
        /**
         */
        /**
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
     * @returns {string}
     */
    toString() {
        return `${type(this.handler)}#${this.method}( ${JSON.stringify(this.parameters)} )`;
    }
}
/**
 * @extends module:router.RouteHandlerMethod
 */
export class ErrorHandlerMethod extends RouteHandlerMethod {
    invoke(route, error, handlerMethod) {
        return super.invoke(route, error, handlerMethod);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGUtaGFuZGxlci1tZXRob2QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvcm91dGUtaGFuZGxlci1tZXRob2QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQVcsV0FBVyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBR3JELE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFHbEMsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBY2xEO0dBQ0c7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DOzs7R0FHRztBQUNILE1BQU0sT0FBTyxrQkFBa0I7SUFDbEIsT0FBTyxDQUFVO0lBQ2pCLElBQUksQ0FBUztJQUNiLE9BQU8sQ0FBUztJQUNoQixNQUFNLENBQVM7SUFFeEIsVUFBVSxDQUFvQjtJQUM5QixpQkFBaUIsQ0FBa0M7SUFJbkQsWUFBWSxnQkFBa0MsRUFBRSxZQUFvQixFQUFFLEdBQUcsSUFBVztRQUNoRjtXQUNHO1FBRUg7V0FDRztRQUVIO1dBQ0c7UUFFSDtXQUNHO1FBRUg7V0FDRztRQUVILElBQUksV0FBVyxDQUFDLGdCQUFnQixDQUFDLEVBQUUsQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBRTtnQkFDNUIsS0FBSyxFQUFFLGdCQUFnQjtnQkFDdkIsWUFBWSxFQUFFLElBQUk7Z0JBQ2xCLFVBQVUsRUFBRSxLQUFLO2dCQUNqQixRQUFRLEVBQUUsS0FBSzthQUNsQixDQUFDLENBQUM7WUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtnQkFDekIsS0FBSyxFQUFFLFlBQVk7Z0JBQ25CLFlBQVksRUFBRSxJQUFJO2dCQUNsQixVQUFVLEVBQUUsS0FBSztnQkFDakIsUUFBUSxFQUFFLEtBQUs7YUFDbEIsQ0FB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