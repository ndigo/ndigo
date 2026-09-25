/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    MethodParameter,
    MethodParameterType,
    AbstractPlatformArgumentResolver,
    readDottedValue,
} from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';
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
