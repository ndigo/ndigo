/**
 * Runtime proxy generator for declarative service clients (AD-8).
 *
 * `serviceClient()` reads the `@service`/`@*Call` metadata from
 * `Symbol.metadata` and returns a Proxy whose methods perform the declared
 * HTTP call through `@blue/http`:
 *
 * - `:param` path templates are filled positionally from the method args,
 * - the first object arg becomes the JSON body for methods that carry one,
 * - a `responseSchema` (Zod) validates the JSON body and returns typed data,
 * - otherwise the raw `Response` is returned,
 * - the service name rides along as a correlation tag header.
 *
 * Works with either an `@service`-decorated class (prototype metadata) or a
 * plain object/interface shape carrying the same metadata.
 *
 * @module
 */

import { HTTP, HTTPInit } from '@blue/http';
import { getServiceCalls, getServiceConfig, SERVICE_METADATA_KEY, type ServiceCallConfig } from './service-decorators';
import { IllegalStateError } from '@blue/core';

/** Header carrying the service name for correlation/tracing. */
export const SERVICE_NAME_HEADER = 'X-Blue-Service';

/**
 * Fills `:name` path-template slots from argument values in order.
 *
 * @param template - The path template (e.g. `'/users/:id'`).
 * @param args - The method call arguments.
 * @returns The concrete path.
 */
export function fillPathTemplate(template: string, args: unknown[]): string {
    let argIndex = 0;
    return template.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, () => {
        const value = args[argIndex++];
        if (value === undefined || value === null) {
            throw new IllegalStateError(`Service call path '${template}' is missing argument #${argIndex}`);
        }
        return encodeURIComponent(String(value));
    });
}

/**
 * Builds the body for a call: the first object (non-`Request`/`Response`)
 * argument becomes JSON; otherwise no body is sent.
 *
 * @param method - The HTTP method.
 * @param args - The method call arguments.
 * @returns The body payload, or `undefined` for no body.
 */
export function resolveCallBody(method: string, args: unknown[]): unknown {
    const handled = args.findIndex(
        (arg) => arg !== undefined && typeof arg === 'object' && !(arg instanceof Request) && !(arg instanceof Response)
    );
    return handled === -1 ? undefined : args[handled];
}

/**
 * Builds a runtime service client from `@service`/`@*Call` metadata.
 *
 * @param target - The `@service`-decorated class/interface constructor or object.
 * @param http - The `@blue/http` client to delegate calls through.
 * @returns A proxy implementing the declared service methods.
 *
 * @example
 * ```ts
 * const accounts = serviceClient(AccountsAPI, http);
 * const account = await accounts.getById(42);
 * ```
 */
export function serviceClient<T extends object>(target: T, http: HTTP): T {
    const config = getServiceConfig(target as object);
    if (!config) {
        throw new IllegalStateError(
            `serviceClient: target is not @service-decorated (missing ${SERVICE_METADATA_KEY} metadata).`
        );
    }
    const calls = getServiceCalls(target as object);

    return new Proxy(target as object, {
        get(_t, prop: string | symbol) {
            if (typeof prop !== 'string') {
                return Reflect.get(target as object, prop);
            }
            const call: ServiceCallConfig | undefined = calls[prop];
            if (!call) {
                return Reflect.get(target as object, prop);
            }

            return async (...args: unknown[]): Promise<unknown> => {
                const path = fillPathTemplate(call.path, args);
                const body = resolveCallBody(call.method, args);

                const init: HTTPInit = {
                    method: call.method,
                    headers: {
                        ...config.headers,
                        [SERVICE_NAME_HEADER]: config.name,
                    },
                    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
                };

                const response = await http.request(`${config.baseUrl.replace(/\/$/, '')}${path}`, init);

                if (call.responseSchema) {
                    const data: unknown = await response.json().catch(() => undefined);
                    const result = call.responseSchema.safeParse(data);
                    if (!result.success) {
                        const message = result.error?.issues
                            ?.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
                            .join(', ');
                        throw new IllegalStateError(`Service '${config.name}' response validation failed: ${message}`);
                    }
                    return result.data;
                }

                return response;
            };
        },
    }) as T;
}
