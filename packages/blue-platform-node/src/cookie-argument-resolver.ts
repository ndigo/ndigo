/**
 * @author Jeff Rose
 */

import { AbstractNamedValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { defaultTo } from '@blue/util/logic';
import { isNil } from '@blue/util/types';
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
 * Node.js cookie argument resolver.
 *
 * Reads pre-parsed cookie values from the Node request context.
 * Supports converter configuration identical to the browser platform resolvers.
 */
export class NodeCookieValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a cookie resolver.
     *
     * @param converter - Default converter to apply to resolved values.
     * @param converterRegistry - Named converter registry used for lookups.
     * @param converterResolutionOptions - Resolution behaviour overrides.
     */
    constructor(
        converter: ArgumentValueConverter = identityArgumentValueConverter,
        converterRegistry: ArgumentValueConverterRegistry = argumentValueConverters,
        converterResolutionOptions: ConverterResolutionOptions = {}
    ) {
        super();
        this.#converter = converter;
        this.#converterRegistry = converterRegistry;
        this.#converterResolutionOptions = converterResolutionOptions;
    }

    get [Symbol.toStringTag](): string {
        return 'NodeCookieValueMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const resolveValue = defaultTo(parameter.defaultValue),
            value = resolveValue(this.resolveName(parameter.name, parameter, route, mapping)),
            converter = parameter.convert ?? this.#converter,
            convertedValue = convertArgumentValue(
                converter,
                value,
                parameter,
                route,
                mapping,
                this.#converterRegistry,
                this.#converterResolutionOptions
            );

        isNil(convertedValue) && parameter.required && this.handleMissingValue(parameter.name);

        return convertedValue;
    }

    protected resolveName(name: string, _parameter: MethodParameter, route: Route, _mapping: any): any {
        return getNodeRequest(route)?.cookies?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.COOKIE.equals(parameter.type);
    }
}