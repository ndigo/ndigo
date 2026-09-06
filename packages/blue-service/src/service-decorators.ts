/**
 * Declarative service-client decorators (AD-8).
 *
 * Mirrors the `@getMapping`/`@postMapping`/… family from `@blue/dispatcher`
 * on the client side: `@service` declares a named service (base URL + shared
 * HTTP config); `@getCall`/`@postCall`/… declare a single typed service call.
 * `serviceClient()` reads the `Symbol.metadata` written by these decorators
 * and builds a runtime proxy that delegates to `@blue/http`.
 *
 * @module
 */

import { HTTPMethod } from '@blue/http';
import { z } from 'zod';

/** Metadata key under which `@service` writes its config. */
export const SERVICE_METADATA_KEY = 'service:client';

/** Metadata key (prefix) under which `@*Call` writes per-method call config. */
export const SERVICE_CALL_METADATA_KEY = 'service:call';

/**
 * Configuration for a `@service`-decorated client.
 */
export interface ServiceClientConfig {
    /** The service name — the registry token / correlation tag. */
    name: string;
    /** Base URL all calls resolve against. */
    baseUrl: string;
    /** Optional timeout in ms applied to every call. */
    timeoutMs?: number;
    /** Optional default headers applied to every call. */
    headers?: Record<string, string>;
}

/**
 * Configuration for a `@*Call`-decorated method.
 */
export interface ServiceCallConfig {
    /** HTTP method for the call. */
    method: HTTPMethod;
    /** Path template relative to the service base URL; `:param` slots are filled from method args. */
    path: string;
    /**
     * Optional Zod schema validating the JSON response body. When set, the
     * parsed body is validated and the typed data is returned; the raw
     * `Response` is returned when omitted.
     */
    responseSchema?: z.ZodType;
}

/**
 * Reads the service config recorded by `@service`.
 *
 * @param target - The decorated class/interface constructor.
 * @returns The service configuration, or `undefined` when not decorated.
 */
export function getServiceConfig(target: object): ServiceClientConfig | undefined {
    const metadata = (target as any)[Symbol.metadata] as DecoratorMetadata | undefined;
    return metadata?.[SERVICE_METADATA_KEY] as ServiceClientConfig | undefined;
}

/**
 * Reads the call configs recorded by `@*Call`.
 *
 * @param target - The decorated class/interface constructor.
 * @returns A map of method name → call config, or an empty record.
 */
export function getServiceCalls(target: object): Record<string, ServiceCallConfig> {
    const metadata = (target as any)[Symbol.metadata] as DecoratorMetadata | undefined;
    return (metadata?.[SERVICE_CALL_METADATA_KEY] as Record<string, ServiceCallConfig> | undefined) ?? {};
}

/** Minimal structural type for `Symbol.metadata` (keyed by string/symbol). */
type DecoratorMetadata = { [key: string | symbol]: unknown };

/**
 * `@service(name, config)` — class decorator declaring a named service client.
 *
 * @example
 * ```ts
 * @service('accounts', { baseUrl: 'https://api.example.com' })
 * class AccountsAPI {
 *     @getCall('/{id}') getById(id: number) { return undefined as unknown; }
 * }
 * ```
 *
 * @param name - The service name (registry token / correlation tag).
 * @param config - Service configuration (base URL, timeouts, headers).
 * @returns A class decorator.
 */
export function service(name: string, config: Omit<ServiceClientConfig, 'name'>) {
    return function <T extends new (...args: unknown[]) => unknown>(target: T, context: ClassDecoratorContext<T>): T {
        if (context.kind !== 'class') {
            throw new TypeError(
                `@service('${name}') can only be applied to a class — received '${context.kind}'. ` +
                    `Use @service on the client class and @getCall/@postCall (etc.) on its methods.`
            );
        }
        context.metadata[SERVICE_METADATA_KEY] = { name, ...config };
        return target;
    };
}

/**
 * Factory for the `@*Call` method decorators.
 *
 * @param method - The HTTP method this call uses.
 * @returns A method decorator factory.
 */
function callDecorator(method: HTTPMethod) {
    return function (path: string, config?: Omit<ServiceCallConfig, 'method' | 'path'>) {
        return function (_target: unknown, context: ClassMethodDecoratorContext): void {
            if (context.kind !== 'method') {
                throw new TypeError(
                    `@${method.toLowerCase()}Call('${path}') can only be applied to a method — received '${context.kind}'. ` +
                        `Use @service on the class and @getCall/@postCall (etc.) on its methods.`
                );
            }
            const calls: Record<string, ServiceCallConfig> =
                (context.metadata[SERVICE_CALL_METADATA_KEY] as Record<string, ServiceCallConfig> | undefined) ?? {};
            calls[String(context.name)] = { method, path, ...config };
            context.metadata[SERVICE_CALL_METADATA_KEY] = calls;
        };
    };
}

/**
 * Declares a GET service call.
 *
 * @param path - Path template relative to the service base URL (`:id` slots filled from args).
 * @param config - Optional call config (response Zod schema).
 */
export const getCall = callDecorator('GET');

/**
 * Declares a POST service call.
 *
 * @param path - Path template relative to the service base URL.
 * @param config - Optional call config (response Zod schema).
 */
export const postCall = callDecorator('POST');

/**
 * Declares a PUT service call.
 */
export const putCall = callDecorator('PUT');

/**
 * Declares a DELETE service call.
 */
export const deleteCall = callDecorator('DELETE');

/**
 * Declares a PATCH service call.
 */
export const patchCall = callDecorator('PATCH');

/**
 * Declares a QUERY service call (RFC 9889 — safe method with a body).
 */
export const queryCall = callDecorator('QUERY');

export type { HTTPMethod } from '@blue/http';
