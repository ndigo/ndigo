/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { convertArgumentValue } from './_resolver-util';

/**
 * Node.js path parameter argument resolver.
 */
export class NodePathValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodePathValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: unknown): unknown {
        // `pathVariable()` (no name) binds the whole params record.
        return name === '' ? route.params : route.params?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.PATH.equals(parameter.type);
    }
}
