/**
 * @author Jeff Rose
 */

import { MethodParameter, MethodParameterType, AbstractNamedValueMethodArgumentResolver } from '@blue/dispatcher';
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

/**
 * Abstract base class for resolving history-state-backed method arguments.
 */
export abstract class AbstractStateValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a history-state-backed resolver.
     *
     * @param converter - Default converter to apply to resolved values.
     * @param converterRegistry - Named converter registry used for lookups.
     * @param converterResolutionOptions - Resolution behavior overrides.
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

    /** Resolves and converts a history-state-backed argument value. */
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

    /** Resolves the raw value from `history.state`. */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        void parameter;
        void route;
        void mapping;

        return this.getStateValue(name);
    }

    /** Retrieves a state value by name. */
    protected abstract getStateValue(name: string): any;

    /** Returns whether this resolver supports history-state parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.STATE.equals(parameter.type);
    }
}

/**
 * Browser history state argument resolver.
 */
export class BrowserStateValueMethodArgumentResolver extends AbstractStateValueMethodArgumentResolver {
    /**
     * Creates a browser state resolver.
     *
     * @param converter - Default converter to apply to resolved values.
     * @param converterRegistry - Named converter registry used for lookups.
     * @param converterResolutionOptions - Resolution behavior overrides.
     */
    constructor(
        converter: ArgumentValueConverter = identityArgumentValueConverter,
        converterRegistry: ArgumentValueConverterRegistry = argumentValueConverters,
        converterResolutionOptions: ConverterResolutionOptions = {}
    ) {
        super(converter, converterRegistry, converterResolutionOptions);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserStateValueMethodArgumentResolver';
    }

    /** Retrieves a value from `history.state` if it exists. */
    protected getStateValue(name: string): any {
        const state = globalThis.history?.state;

        return state && Object.prototype.hasOwnProperty.call(state, name) ? state[name] : undefined;
    }
}
