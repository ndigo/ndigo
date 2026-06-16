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

/**
 * Node.js path parameter argument resolver.
 */
export class NodePathValueMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor(
        converter: ArgumentValueConverter = identityArgumentValueConverter,
        converterRegistry: ArgumentValueConverterRegistry = argumentValueConverters,
        converterResolutionOptions: ConverterResolutionOptions = {}
    ) {
        super(converter, converterRegistry, converterResolutionOptions, convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'NodePathValueMethodArgumentResolver';
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        return route.params?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.PATH.equals(parameter.type);
    }
}
