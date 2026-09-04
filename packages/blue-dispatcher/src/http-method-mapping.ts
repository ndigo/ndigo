/**
 * HTTP verb route mapping decorators — sugar over `@requestMapping` with the
 * HTTP method fixed.
 *
 * @module
 * @since 1.0.0
 */

import { isString } from '@blue/util/types';
import { requestMapping, RequestMappingConfiguration } from './request-mapping';

/**
 * A request mapping with the HTTP method fixed to `'GET'`.
 *
 * @param route - The route path or mapping configuration (method is overridden).
 * @returns A decorator function for the target.
 */
export function getMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'GET', private: false } : { ...route, method: 'GET' }
    );
}

/**
 * A request mapping with the HTTP method fixed to `'POST'`.
 */
export function postMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'POST', private: false } : { ...route, method: 'POST' }
    );
}

/**
 * A request mapping with the HTTP method fixed to `'PUT'`.
 */
export function putMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'PUT', private: false } : { ...route, method: 'PUT' }
    );
}

/**
 * A request mapping with the HTTP method fixed to `'DELETE'`.
 */
export function deleteMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'DELETE', private: false } : { ...route, method: 'DELETE' }
    );
}

/**
 * A request mapping with the HTTP method fixed to `'PATCH'`.
 */
export function patchMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'PATCH', private: false } : { ...route, method: 'PATCH' }
    );
}

/**
 * A request mapping with the HTTP method fixed to `'QUERY'` (RFC 9889 —
 * safe method with a body, used for resource queries).
 */
export function queryMapping(route: string | Omit<RequestMappingConfiguration, 'method'>) {
    return requestMapping(
        isString(route) ? { value: route, method: 'QUERY', private: false } : { ...route, method: 'QUERY' }
    );
}