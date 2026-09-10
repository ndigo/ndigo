/**
 * HTTP verb route mapping decorators — sugar over `requestMapping` with the
 * HTTP method fixed.
 *
 * Verbs are **method-only** decorators: they set the HTTP method for a single
 * handler method. A class-level path prefix carries no HTTP verb — use
 * `@requestMapping` on classes (path + conditions are the class-level
 * context; a verb there is either dead config or an accidental default for
 * method-less methods, never an access rule).
 *
 * @module
 * @since 1.0.0
 */

import { FrameworkError } from '@blue/core';
import { isString } from '@blue/util/types';
import { requestMapping, RequestMappingConfiguration } from './request-mapping';
import type { HTTPMethod } from '@blue/http';

/**
 * Build a verb decorator: fixes the HTTP method and rejects class-level use.
 *
 * @param method - The HTTP method the decorator fixes.
 * @param label - The decorator name (for the error message).
 * @returns A method-only verb decorator.
 */
const verbDecorator =
    (method: HTTPMethod, label: string) => (route: string | Omit<RequestMappingConfiguration, 'method'>) => {
        const config: RequestMappingConfiguration = isString(route)
            ? { value: route, method, private: false }
            : { ...route, method };
        const routeDecorator = requestMapping(config);
        return (target: unknown, context: ClassDecoratorContext | ClassMethodDecoratorContext): void => {
            if (context.kind !== 'method') {
                throw new FrameworkError(
                    `@${label} is method-only — annotate the class with @requestMapping for the path context.`
                );
            }
            routeDecorator(target, context);
        };
    };

/**
 * A request mapping with the HTTP method fixed to `'GET'`.
 *
 * @param route - The route path or mapping configuration (method is overridden).
 * @returns A method-only decorator.
 */
export const getMapping = verbDecorator('GET', 'getMapping');

/**
 * A request mapping with the HTTP method fixed to `'POST'`.
 */
export const postMapping = verbDecorator('POST', 'postMapping');

/**
 * A request mapping with the HTTP method fixed to `'PUT'`.
 */
export const putMapping = verbDecorator('PUT', 'putMapping');

/**
 * A request mapping with the HTTP method fixed to `'DELETE'`.
 */
export const deleteMapping = verbDecorator('DELETE', 'deleteMapping');

/**
 * A request mapping with the HTTP method fixed to `'PATCH'`.
 */
export const patchMapping = verbDecorator('PATCH', 'patchMapping');

/**
 * A request mapping with the HTTP method fixed to `'QUERY'` (RFC 9889 —
 * safe method with a body, used for resource queries).
 */
export const queryMapping = verbDecorator('QUERY', 'queryMapping');
