/**
 * @author Jeff Rose
 */

import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import {
    ArgumentValueConverter,
    ArgumentValueConverterRegistry,
    ConverterResolutionOptions,
    argumentValueConverters,
    identityArgumentValueConverter,
} from './argument-value-converter';
import { convertArgumentValue } from './_resolver-util';
import { getNodeRequest } from './node-request';

/**
 * Node.js session argument resolver.
 */
export class NodeSessionValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodeSessionValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        return getNodeRequest(route)?.session?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.SESSION.equals(parameter.type);
    }
}
