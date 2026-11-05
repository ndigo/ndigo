/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Factory, likeFactory } from '@ndigo/factory';
import { Route } from '@ndigo/router';
import { Serializable } from '@ndigo/core';
import { HandlerMethodArgumentResolver } from './argument-resolver';
import { ParameterBindingError } from './error';
import { MethodParameter } from './parameters';
import { getRouteMapping } from './route-mapping';

const { toString } = Object.prototype;

/**
 * Single-word native type name used in debug output (`Null`, `Undefined`, `Object`, ...).
 */
const typeName = (value: unknown): string =>
    value == null ? (value === null ? 'Null' : 'Undefined') : toString.call(value).slice(8, -1);

/**
 * Anything that can be invoked with positional arguments — the minimal shape a
 * handler method must satisfy, kept separate so interceptors and mocks can
 * implement it without the route plumbing below.
 */
export interface Invocable {
    invoke<T = unknown>(...args: unknown[]): T;
}

/**
 * A handler bound to a route: `invoke` receives the `Route` as its first
 * argument and returns the handler's result (`ModelAndView`, a view name, a
 * value).
 */
export interface HandlerMethod extends Invocable {
    invoke<ModelAndView>(route: Route, ...args: unknown[]): ModelAndView;
}

/**
 * Assigns the name a handler method's mapping is registered and inspectable
 * under — the mapping's own name when it declares one, otherwise a name the
 * strategy derives from the handler and mapping metadata.
 */
export interface RouteHandlerMethodMappingNamingStrategy<T = unknown> {
    getName(handlerMethod: RouteHandlerMethod, mapping: T): string;
}

/**
 */

/**
 * Encapsulates information about a handler method consisting of a `method` and `handler`.
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

export class RouteHandlerMethod implements HandlerMethod, Serializable {
    readonly factory!: Factory | null;
    readonly name!: string | null;
    readonly handler!: object;
    readonly method!: string;

    parameters!: MethodParameter[];
    argumentResolvers!: HandlerMethodArgumentResolver[];

    /**
     * Cached resolver selection per {@link MethodParameter}, keyed to the
     * `argumentResolvers` array it was derived from. Resolvers are chosen for
     * a parameter at most once: every resolver's `supportsParameter` is a
     * pure type check, so the first verdict never changes for the method's
     * lifetime. Rebuilt transparently if the resolvers array is replaced.
     */
    #resolverSelection: {
        resolvers: HandlerMethodArgumentResolver[];
        byParameter: Map<MethodParameter, HandlerMethodArgumentResolver | null>;
    } | null = null;

    constructor(handler: object, method: string, ...args: unknown[]);
    constructor(factory: Factory, name: string, method: string, ...args: unknown[]);
    constructor(factoryOrHandler: Factory | object, nameOrMethod: string, ...args: unknown[]) {
        if (likeFactory(factoryOrHandler)) {
            this.factory = factoryOrHandler;
            this.name = nameOrMethod;
            this.handler = this.factory.getInstance(this.name);
            const method = args.shift();
            // Factory path stores the method name as the first variadic arg.
            this.method = typeof method === 'string' ? method : '';
        } else {
            this.factory = null;
            this.name = null;
            this.handler = factoryOrHandler;
            this.method = nameOrMethod;
        }

        this.parameters = args.filter((arg) => arg instanceof MethodParameter);
    }

    /**
     * @param {module:router.Request} route
     * @returns {module:dispatcher.ModelAndView}
     */
    invoke<ModelAndView>(route: Route, ...foo: unknown[]): ModelAndView {
        /**
         * * Hardcoding route as a parameter is a bit of a cop-out. It would be better to allow them to pick parameters, etc. as arguments.
         */
        const { argumentResolvers, parameters } = this,
            parametersLength = parameters.length,
            args = new Array(parametersLength),
            mapping = getRouteMapping(this.handler, this.method);
        if (parametersLength) {
            let selection = this.#resolverSelection;
            if (selection === null || selection.resolvers !== argumentResolvers) {
                selection = this.#resolverSelection = {
                    resolvers: argumentResolvers,
                    byParameter: new Map(),
                };
            }
            for (let index = 0; index < parametersLength; index++) {
                const parameter = parameters[index];
                let resolver = selection.byParameter.get(parameter);
                if (resolver === undefined) {
                    resolver = argumentResolvers.find((candidate) => candidate.supportsParameter(parameter)) ?? null;
                    selection.byParameter.set(parameter, resolver);
                }
                if (resolver === null) {
                    // No registered resolver serves this parameter type — the
                    // mapping uses a source the platform's resolver chain
                    // cannot provide (e.g. dataBinderValue('body') on the
                    // browser). Fail fast instead of silently binding
                    // undefined, even for required extractors (the required
                    // check lives inside resolvers).
                    const argumentLabel =
                        parameter.parameterName === parameter.name
                            ? `'${parameter.name}'`
                            : `'${parameter.name}' (argument '${parameter.parameterName}')`;
                    throw new ParameterBindingError(
                        `No argument resolver supports ${parameter.type} parameter ${argumentLabel}. ` +
                            'Register an argument resolver for this type, or use a source the platform can serve.',
                        parameter.name,
                        this.method
                    );
                }
                args[index] = resolver.resolveArgument(parameter, route, mapping);
            }
        } else {
            // No @parameters metadata — no implicit injection. Handlers that
            // want request-scoped data declare it explicitly via @parameters
            // (e.g. pathVariable for a segment, pathValue for the full path);
            // the Route object itself is not auto-injected.
        }

        return (this.handler as Record<string, Function>)[this.method](...args);
    }

    /**
     * @returns {string}
     */
    toString(): string {
        return `${typeName(this.handler)}#${this.method}( ${JSON.stringify(this.parameters)} )`;
    }
}

/**
 * Handler for the error path: `invoke` receives the `Route` and the thrown
 * error and returns the value the error resolver chain produced, mirroring
 * `RouteHandlerMethod`'s invocation contract.
 */
export class ErrorHandlerMethod extends RouteHandlerMethod {
    invoke<ModelAndView>(route: Route, error: Error, handlerMethod: RouteHandlerMethod): ModelAndView {
        return super.invoke(route, error, handlerMethod);
    }
}
