/**
 * @author Jeff Rose
 */

import { AbstractNamedValueMethodArgumentResolver, MethodParameter, MethodParameterType } from '@blue/dispatcher';
import { Route } from '@blue/router';
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
 * Node.js HTTP request-header argument resolver.
 *
 * Reads values from the Node request context stored in {@link NODE_REQUEST_ATTRIBUTE}.
 * Supports converter configuration identical to the browser platform resolvers.
 */
export class NodeHeaderValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a header resolver.
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
        return 'NodeHeaderValueMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any {
        const resolveValue = (v: any) => v ?? parameter.defaultValue,
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
        const request = getNodeRequest(route);
        if (!request) { return undefined; }
        const value = request.headers[name.toLowerCase()];
        // Node may return string[] for multi-value headers; join with ', ' per HTTP spec
        return Array.isArray(value) ? value.join(', ') : value;
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.HEADER.equals(parameter.type);
    }
}