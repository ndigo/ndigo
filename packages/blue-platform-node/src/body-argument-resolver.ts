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

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        const request = getNodeRequest(route);
        if (!request) {
            return undefined;
        }
        return name === '*' ? request.body : request.body?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BODY.equals(parameter.type);
    }
}
