/**
 * @author Jeff Rose
 */

import { DataBinder, MutablePropertyValues, PropertyValues } from '@blue/core';
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
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
 * Browser-specific bind resolver.
 *
 * Resolves values from browser data sources (query, state, session, cookie)
 * and binds them to objects using {@link DataBinder}.
 *
 * Overrides `resolveArgument()` because the bind pipeline (source data →
 * filter by prefix → bind to object → convert) differs from the standard
 * name-resolution pipeline used by other resolvers.
 */
export class BrowserBindMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

    constructor(
        converter: ArgumentValueConverter = identityArgumentValueConverter,
        converterRegistry: ArgumentValueConverterRegistry = argumentValueConverters,
        converterResolutionOptions: ConverterResolutionOptions = {}
    ) {
        super(converter, converterRegistry, converterResolutionOptions, convertArgumentValue);
        this.#converter = converter;
        this.#converterRegistry = converterRegistry;
        this.#converterResolutionOptions = converterResolutionOptions;
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserBindMethodArgumentResolver';
    }

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

        const finalValue = convertedValue ?? parameter.defaultValue;

        isNil(finalValue) && parameter.required && this.handleMissingValue(parameter.name);

        return finalValue;
    }

    /** Retrieves the browser data source identified by the source name. */
    private getSourceData(source: string, route: Route): Record<string, any> {
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

    /** Removes a prefix from keys before binding nested values. */
    private filterByPrefix(data: Record<string, any>, prefix: string | null): Record<string, any> {
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

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BIND.equals(parameter.type);
    }

    protected resolveName(): any {
        return null;
    }
}
