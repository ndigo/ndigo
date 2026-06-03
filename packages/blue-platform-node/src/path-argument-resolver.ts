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

/**
 * Node.js path-variable argument resolver.
 *
 * Reads values from {@link Route.params}, which the router populates with URL path parameters.
 * Supports converter configuration identical to the browser platform resolvers.
 */
export class NodePathValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a path-variable resolver.
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
        return 'NodePathValueMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
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
        return route.params?.[name];
    }

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.PATH.equals(parameter.type);
    }
}