/**
 * @since 1.0.0
 * @author Jeff Rose
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

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        // Nested-capable (D-2): `bodyValue('address.city')` walks the JSON
        // body; `bodyValue()` (no name) binds the whole parsed body.
        return name === '' ? request.body : readDottedValue(request.body, name);
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BODY.equals(parameter.type);
    }
}
