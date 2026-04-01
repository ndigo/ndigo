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

/**
 * Abstract base class for resolving session-backed method arguments.
 */
export abstract class AbstractSessionValueMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a session-backed resolver.
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

    /** Resolves and converts a session-backed argument value. */
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

    /** Resolves the raw value from `sessionStorage`. */
    protected resolveName(name: string, parameter: MethodParameter, route: Route, mapping): any {
        void parameter;
        void route;
        void mapping;

        return this.getSessionValue(name);
    }

    /** Retrieves a session value by name. */
    protected abstract getSessionValue(name: string): string | null;

    /** Returns whether this resolver supports session parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.SESSION.equals(parameter.type);
    }
}

/**
 * Browser session argument resolver using `sessionStorage`.
 */
export class BrowserSessionValueMethodArgumentResolver extends AbstractSessionValueMethodArgumentResolver {
    /**
     * Creates a browser session resolver.
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
        return 'BrowserSessionValueMethodArgumentResolver';
    }

    /** Retrieves a value from `sessionStorage` if available. */
    protected getSessionValue(name: string): string | null {
        const storage = globalThis.sessionStorage;

        return storage ? storage.getItem(name) : null;
    }
}
