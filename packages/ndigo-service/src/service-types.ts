/**
 * Service call and interceptor types.
 */
import type {
    CompletionAwareHTTPInterceptor,
    ContentTypeInit,
    DataParameterInit,
    ErrorAwareHTTPInterceptor,
    HTTPInit,
    IfModifiedInit,
    InitializationAwareHTTPInterceptor,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
    ResponseTypeInit,
    TimeoutInit,
} from '@ndigo/http';
import { like } from '@ndigo/util';

export type ServiceInit = HTTPInit &
    ContentTypeInit &
    DataParameterInit &
    ResponseTypeInit &
    IfModifiedInit &
    TimeoutInit & {};

/**
 * Service-level completion interceptor.
 *
 * Reuses the {@link CompletionAwareHTTPInterceptor} interface; `postRequest`
 * is the service-level "request completed" hook (HTTP's `postComplete`).
 *
 * @example
 * ```ts
 * const interceptor: CompletionAwareServiceInterceptor = { onComplete: async () => {} };
 * ```
 */
export interface CompletionAwareServiceInterceptor extends CompletionAwareHTTPInterceptor {
    /**
     * Runs after the request has completed successfully.
     *
     * @param request - The request that just completed.
     */
    postRequest(request: Request): void;
}

/**
 * Service-level failure interceptor.
 *
 * Reuses the {@link ErrorAwareHTTPInterceptor} interface; `postFailure` is the
 * service-level "request failed" hook.
 *
 * @example
 * ```ts
 * const interceptor: ErrorAwareServiceInterceptor = { onError: async () => {} };
 * ```
 */
export interface ErrorAwareServiceInterceptor extends ErrorAwareHTTPInterceptor {
    /**
     * Runs after a request fails.
     *
     * @param error - The error that was raised.
     * @param request - The request associated with the failure.
     */
    postFailure(error: Error, request: Request): void;
}

/**
 * Service-level pre-initialization interceptor.
 *
 * Reuses the {@link InitializationAwareHTTPInterceptor} contract (settings are
 * `ServiceInit`, which extends `HTTPInit`).
 *
 * @example
 * ```ts
 * const interceptor: InitializationAwareServiceInterceptor = { onInit: async () => true };
 * ```
 */
export interface InitializationAwareServiceInterceptor<
    T extends ServiceInit = ServiceInit,
> extends InitializationAwareHTTPInterceptor<T> {
    /**
     * Decides whether the interceptor should participate in the request.
     *
     * @param url - The request URL being initialized.
     * @param settings - The resolved service settings.
     * @returns `true` when the interceptor should run.
     */
    preInit(url: URL, settings: T): boolean;
}

/**
 * Service-level request interceptor.
 *
 * Reuses the {@link RequestAwareHTTPInterceptor} contract.
 *
 * @example
 * ```ts
 * const interceptor: RequestAwareServiceInterceptor = { onRequest: async (req) => req };
 * ```
 */
export interface RequestAwareServiceInterceptor extends RequestAwareHTTPInterceptor {
    /**
     * Runs before the request is sent.
     *
     * @param request - The request to inspect or replace.
     * @returns A replacement request, or void to keep the original.
     */
    preRequest(request: Request): Promise<Request | void>;
}

/**
 * Service-level response interceptor.
 *
 * Reuses the {@link ResponseAwareHTTPInterceptor} contract; `postSuccess` is the
 * service-level success hook (HTTP's `postResponse`).
 *
 * @example
 * ```ts
 * const interceptor: ResponseAwareServiceInterceptor = { onResponse: async (res) => res };
 * ```
 */
export interface ResponseAwareServiceInterceptor<
    T extends ServiceInit = ServiceInit,
> extends ResponseAwareHTTPInterceptor<T> {
    /**
     * Runs after the request succeeds.
     *
     * @param response - The response returned by the service.
     * @param settings - The resolved service settings.
     * @returns A promise that resolves when post-processing completes.
     */
    postSuccess(response: Response, settings: T): Promise<void>;
}

/**
 * Union of all supported service interceptor shapes.
 *
 * @example
 * ```ts
 * const interceptor: ServiceInterceptor = { postRequest: () => {} };
 * ```
 */
export type ServiceInterceptor =
    | CompletionAwareServiceInterceptor
    | ErrorAwareServiceInterceptor
    | InitializationAwareServiceInterceptor
    | RequestAwareServiceInterceptor
    | ResponseAwareServiceInterceptor;

/**
 * Tests whether a value provides completion-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements completion handling.
 */
export const likeCompletionAwareServiceInterceptor = like({
    postRequest: Function,
}) as (value: unknown) => value is CompletionAwareServiceInterceptor;

/**
 * Tests whether a value provides failure-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements failure handling.
 */
export const likeErrorAwareServiceInterceptor = like({
    postFailure: Function,
}) as (value: unknown) => value is ErrorAwareServiceInterceptor;

/**
 * Tests whether a value provides initialization-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements initialization handling.
 */
export const likeInitializationAwareServiceInterceptor = like({
    preInit: Function,
}) as (value: unknown) => value is InitializationAwareServiceInterceptor;

/**
 * Tests whether a value provides request-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements request handling.
 */
export const likeRequestAwareServiceInterceptor = like({
    preRequest: Function,
}) as (value: unknown) => value is RequestAwareServiceInterceptor;

/**
 * Tests whether a value provides response-aware interceptor behavior.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value implements response handling.
 */
export const likeResponseAwareServiceInterceptor = like({
    postSuccess: Function,
}) as (value: unknown) => value is ResponseAwareServiceInterceptor;

/**
 * Tests whether a value behaves like any supported service interceptor.
 *
 * @param value - Candidate value to inspect.
 * @returns `true` when the value matches one interceptor shape.
 */
export const likeServiceInterceptor = (value: unknown): value is ServiceInterceptor => {
    return (
        likeCompletionAwareServiceInterceptor(value) ||
        likeErrorAwareServiceInterceptor(value) ||
        likeInitializationAwareServiceInterceptor(value) ||
        likeRequestAwareServiceInterceptor(value) ||
        likeResponseAwareServiceInterceptor(value)
    );
};
