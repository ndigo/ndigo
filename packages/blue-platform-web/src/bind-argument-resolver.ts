/**
 * @author Jeff Rose
 */

import { DataBinder, MutablePropertyValues } from '@blue/core';
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
import Cookies from './cookies';

/**
 * Abstract base class for binding entire data sources to objects.
 */
export abstract class AbstractBindMethodArgumentResolver extends AbstractNamedValueMethodArgumentResolver {
    #converter: ArgumentValueConverter;
    #converterRegistry: ArgumentValueConverterRegistry;
    #converterResolutionOptions: ConverterResolutionOptions;

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

    resolveArgument(parameter: MethodParameter, route: Route, mapping): any {
        const rawData = this.getSourceData(parameter.name, route);
        const filteredData = this.filterByPrefix(rawData, parameter.prefix);

        const binder = new DataBinder({}, parameter.name);
        const mpv = new MutablePropertyValues();

        for (const [key, value] of Object.entries(filteredData)) {
            mpv.addPropertyValue(key, value);
        }

        binder.bind(mpv);
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

        const resolveValue = defaultTo(parameter.defaultValue);
        const finalValue = resolveValue(convertedValue);

        isNil(finalValue) && parameter.required && this.handleMissingValue(parameter.name);

        return finalValue;
    }

    protected abstract getSourceData(source: string, route: Route): Record<string, any>;

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

    supportsParameter(parameter: MethodParameter): boolean {
        return MethodParameterType.BIND.equals(parameter.type);
    }

    protected resolveName(): any {
        return null;
    }
}

/**
 * Browser-specific bind resolver.
 */
export class BrowserBindMethodArgumentResolver extends AbstractBindMethodArgumentResolver {
    get [Symbol.toStringTag](): string {
        return 'BrowserBindMethodArgumentResolver';
    }

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
