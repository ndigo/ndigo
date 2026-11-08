/**
 * HTTP request/response types and initializer contracts.
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import { Aware } from '@ndigo/factory';
import type { Transform } from './transformers/http-transformer';
import type { HTTP } from './http-client';
import type ResponseError from './response-error';

/**
 * The HTTP request methods the framework routes and dispatches, including
 * `QUERY` — the safe, idempotent body-carrying method.
 */
export type HTTPMethod =
    | 'CONNECT'
    | 'DELETE'
    | 'GET'
    | 'HEAD'
    | 'OPTIONS'
    | 'PATCH'
    | 'POST'
    | 'PUT'
    | 'QUERY'
    | 'TRACE';
/**
 * Base request settings shared by HTTP client methods and interceptor hooks.
 *
 * This extends `RequestInit` with Ndigo-specific options such as `baseURL`
 * and query parameter merging.
 */
export type HTTPInit = RequestInit & {
    method?: HTTPMethod;
    baseURL?: string; // ← ADDED
    headers?: HeadersInit;
    params?: URLSearchParams | string[][] | Record<string, string> | string;
};

/**
 * Configuration options for creating an HTTP client instance via {@link HTTP.create}.
 *
 * This extends {@link HTTPInit} with factory-specific options that are only
 * relevant when constructing a client through the convenience API.
 */
export interface HTTPConfig extends HTTPInit {
    /**
     * Optional HTTP interceptors to apply to all requests.
     */
    interceptors?: HTTPInterceptor[];

    /**
     * Optional request body transforms applied in interceptor pipeline.
     */
    requestTransforms?: Transform[];

    /**
     * Optional response body transforms applied in interceptor pipeline.
     */
    responseTransforms?: Transform[];

    /**
     * Optional custom fetch implementation.
     * Defaults to globalThis.fetch if not provided.
     */
    fetch?: Fetch;
}

/**
 * Fetch implementation signature used by {@link HTTP}.
 */
export type Fetch = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

/**
 * Runs after a request finishes, whether it succeeded or failed.
 */
export interface CompletionAwareHTTPInterceptor {
    /**
     * Observes the final request/response pair after all other hooks complete.
     *
     * @param request - The original request.
     * @param response - The final response or error wrapper.
     * @param settings - The request settings the request was prepared from.
     * The execution chain always supplies it; callers that invoke the hook
     * directly may omit it.
     */
    postComplete(request: Request, response: Response | ResponseError, settings?: HTTPInit): void;
}

/**
 * Handles failures that occur while executing a request.
 */
export interface ErrorAwareHTTPInterceptor {
    /**
     * Recovers from a transport or interceptor error.
     *
     * @param error - The failure that interrupted request execution.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @param settings - The per-request settings object. It is created once per
     * `HTTP.request` call and survives the `Request` replacements performed by
     * other interceptors, so error-aware state (retry clones, timers) can be
     * keyed on an identity that outlives `new Request(...)`.
     * @returns A replacement response, or `undefined` to keep the failure.
     */
    postError(error: Error, request: Request, http: HTTP, settings?: HTTPInit): Promise<Response | undefined>;
}

/**
 * Allows a request to be rejected before it is initialized.
 */
export interface InitializationAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    /**
     * Decides whether the request should continue after URL and settings resolution.
     *
     * @param url - The resolved request URL.
     * @param settings - The request settings being prepared.
     * @returns `false` to stop the request before it is created.
     */
    preInit(url: URL, settings: T): boolean;
}

/**
 * Allows a request object to be replaced before fetch executes.
 */
export interface RequestAwareHTTPInterceptor {
    /**
     * Transforms the request before it is passed to fetch.
     *
     * @param request - The request to inspect or replace.
     * @param http - The HTTP client executing the request.
     * @param settings - The per-request settings object. Unlike the `Request`,
     * it is not replaced by later interceptors, so state that must survive a
     * request rebuild (e.g. an undisturbed body clone for retries) is keyed on
     * it.
     * @returns A replacement request, a cached response, or `void` to keep the original.
     */
    preRequest(request: Request, http: HTTP, settings?: HTTPInit): Promise<Request | Response | void>;
}

/**
 * Allows a response to be replaced after fetch completes.
 */
export interface ResponseAwareHTTPInterceptor<T extends HTTPInit = HTTPInit> {
    /**
     * Transforms the response after fetch succeeds and before completion hooks run.
     *
     * @param response - The response returned by fetch.
     * @param settings - The request settings used for the call.
     * @param request - The final request that was sent, after request-aware
     * interceptors ran. The execution chain always supplies it; callers that
     * invoke the hook directly may omit it.
     * @returns A replacement response, or `void` to keep the original.
     */
    postResponse(response: Response, settings: T, request?: Request): Promise<Response | void>;
}

/**
 * Supported HTTP interceptors recognized by {@link HTTP}.
 */
export type HTTPInterceptor =
    | CompletionAwareHTTPInterceptor
    | ErrorAwareHTTPInterceptor
    | InitializationAwareHTTPInterceptor
    | RequestAwareHTTPInterceptor
    | ResponseAwareHTTPInterceptor;

/**
 * Describes objects that can receive an {@link HTTP} instance.
 */
export interface HTTPAware extends Aware {
    /**
     * Injects the HTTP client used by the receiver.
     *
     * @param http - The HTTP client to store.
     */
    setHTTP(http: HTTP): void;
}
