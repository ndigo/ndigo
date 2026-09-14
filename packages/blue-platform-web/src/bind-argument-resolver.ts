/**
 * @module blue-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { DataBinder, MutablePropertyValues, PropertyValues } from '@blue/core';
import { MethodParameter, MethodParameterType, AbstractPlatformArgumentResolver } from '@blue/dispatcher';
import { Route } from '@blue/router';
import { isNil } from '@blue/util/types';
import { convertArgumentValue } from './_resolver-util';
import Cookies from './cookies';

/**
 * Browser-specific bind resolver.
 *
 * Resolves values from browser data sources (query, state, session, cookie)
 * and binds them to objects using `DataBinder`.
 *
 * Overrides `resolveArgument()` because the bind pipeline (source data →
 * filter by prefix → bind to object → convert) differs from the standard
 * name-resolution pipeline used by other resolvers.
 */
export class BrowserBindMethodArgumentResolver extends AbstractPlatformArgumentResolver {
    constructor() {
        super(convertArgumentValue);
    }

    get [Symbol.toStringTag](): string {
        return 'BrowserBindMethodArgumentResolver';
    }

    resolveArgument(parameter: MethodParameter, route: Route, mapping: unknown): unknown {
        const rawData = this.getSourceData(parameter.name, route);
        const filteredData = this.filterByPrefix(rawData, parameter.prefix);

        const binder = new DataBinder({}, parameter.name);
        const mpv = new MutablePropertyValues();

        for (const [key, value] of Object.entries(filteredData)) {
            mpv.addPropertyValue(key, value);
        }

        binder.bind(mpv as PropertyValues);
        const unflattened = binder.result;

        const convertedValue = convertArgumentValue(parameter.convertType, unflattened, parameter, route, mapping);

        // Post-bind validation/conversion (e.g. Zod via validatedBy, AD-7).
        const validatedValue = parameter.convert ? parameter.convert(convertedValue) : convertedValue;

        const finalValue = validatedValue ?? parameter.defaultValue;

        if (isNil(finalValue) && parameter.required) {
            this.handleMissingValue(parameter.name);
        }

        return finalValue;
    }

    /** Retrieves the browser data source identified by the source name. */
    private getSourceData(source: string, route: Route): Record<string, unknown> {
        switch (source) {
            case 'query':
                return route.data || {};
            case 'state':
                return globalThis.history?.state || {};
            case 'session': {
                const session: Record<string, unknown> = {};
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
            case 'cookie': {
                const jar: unknown = Cookies.get('');
                return typeof jar === 'object' && jar !== null ? (jar as Record<string, unknown>) : {};
            }
            default:
                return {};
        }
    }

    /** Removes a prefix from keys before binding nested values. */
    private filterByPrefix(data: Record<string, unknown>, prefix: string | null): Record<string, unknown> {
        if (!prefix) {
            return data;
        }

        const filtered: Record<string, unknown> = {};
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

    protected resolveName(): null {
        return null;
    }
}
