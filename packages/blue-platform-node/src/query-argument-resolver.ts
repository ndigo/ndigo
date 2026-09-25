/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';

/**
 * Node.js query parameter argument resolver.
 */
export class NodeQueryValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeQueryValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        // `queryValue()` (no name) binds the entire query object.
        return name === '' ? route.data : route.data?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.QUERY.equals(parameter.type);
    }
}
