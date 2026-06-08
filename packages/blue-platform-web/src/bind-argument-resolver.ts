/**
 * @author Jeff Rose
 */

import { DataBinder, MutablePropertyValues, PropertyValues } from '@blue/core';
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
import Cookies from './cookies';

/**
 * Abstract base class for binding entire data sources to objects.
 */
export abstract class AbstractBindMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    /**
     * Creates a bind-backed resolver.
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

    /** Resolves and converts a bind-backed argument value. */
    resolveArgument(parameter: MethodParameter, route: Route, mapping: any): any {
        const rawData = this.getSourceData(parameter.name, route);
        const filteredData = this.filterByPrefix(rawData, parameter.prefix);

        const binder = new DataBinder({}, parameter.name);
        const mpv = new MutablePropertyValues();

        for (const [key, value] of Object.entries(filteredData)) {
            mpv.addPropertyValue(key, value);
        }

        binder.bind(mpv as PropertyValues);
        const unflattened = binder.result;

        const converter = parameter.convert ?? this.#converter;
        const convertedValue = convertArgumentValue(
            converter,
            unflattened,
            parameter,
            route,
            mapping,
            this.#converterRegistry,
            this.#converterResolutionOptions
        );

        const resolveValue = (v: any) => v ?? parameter.defaultValue;
        const finalValue = resolveValue(convertedValue);

        isNil(finalValue) && parameter.required && this.handleMissingValue(parameter.name);

        return finalValue;
    }

    /** Retrieves the source data map for the named binding source. */
    protected abstract getSourceData(source: string, route: Route): Record<string, any>;

    /** Removes a prefix from keys before binding nested values. */
    protected filterByPrefix(data: Record<string, any>, prefix: string | null): Record<string, any> {
        if (!prefix) {
            return data;
        }

        const filtered: Record<string, any> = {};
        const prefixLength = prefix.length;

        for (const [key, value] of Object.entries(data)) {
            if (key.startsWith(prefix)) {
                filtered[key.slice(prefixLength)] = value;
            }
        }

        return filtered;
    }

    /** Returns whether this resolver supports bind parameters. */
    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BIND.equals(parameter.type);
    }

    /** Resolves the source name from the parameter metadata. */
    protected resolveName(): any {
        return null;
    }
}

/**
 * Browser-specific bind resolver.
 */
export class BrowserBindMethodArgumentResolver extends AbstractBindMethodArgumentResolver {
    /**
     * Resolves browser-backed bind data from the current route, state, session, or cookies.
     *
     * @param source - Bind source name such as `query`, `state`, `session`, or `cookie`.
     * @param route - Current route containing route data.
     * @returns The resolved source data map.
     */
    get [Symbol.toStringTag](): string {
        return 'BrowserBindMethodArgumentResolver';
    }

    /** Retrieves the browser data source identified by {@link source}. */
    protected getSourceData(source: string, route: Route): Record<string, any> {
        switch (source) {
            case 'query':
                return route.data || {};
            case 'state':
                return globalThis.history?.state || {};
            case 'session': {
                const session: Record<string, any> = {};
                if (globalThis.sessionStorage) {
                    for (let i = 0; i < globalThis.sessionStorage.length; i++) {
                        const key = globalThis.sessionStorage.key(i);
                        if (key) {
                            session[key] = globalThis.sessionStorage.getItem(key);
                        }
                    }
                }
                return session;
            }
            case 'cookie':
                return (Cookies.get('') as Record<string, any>) || {};
            default:
                return {};
        }
    }
}
