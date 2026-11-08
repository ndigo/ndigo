/**
 * Argument resolver that reads the request body.
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    readDottedValue,
    convertArgumentValue,
} from '@ndigo/dispatcher';
import { Route } from '@ndigo/router';
import { getNodeRequest } from './node-request';

/**
 * Node.js request body argument resolver.
 *
 * Use `name: '*'` to bind the entire parsed body object.
 */
export class NodeBodyValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeBodyValueMethodArgumentResolver';
    }

    /**
     * Reads the parsed request body (or a dotted field).
     *
     * @param name - The field path, or `''` for the whole body.
     * @param _parameter - The method parameter (unused).
     * @param route - The current route.
     * @param _mapping - The route mapping (unused).
     * @returns The body value.
     */
    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        // Nested-capable (D-2): `bodyValue('address.city')` walks the JSON
        // body; `bodyValue()` (no name) binds the whole parsed body.
        return name === '' ? request.body : readDottedValue(request.body, name);
    }

    /**
     * Whether this resolver supports body parameters.
     *
     * @param parameter - The method parameter to test.
     * @returns Whether the parameter type matches.
     */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BODY.equals(parameter.type);
    }
}
