/**
 * @since 1.0.0
 * @author Jeff Rose
 */
/// <reference lib="dom" />
// TypeScript 6.0 declaration generation fix
import { like } from '@ndigo/util/types';
import type {
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
    InitializationAwareHTTPInterceptor,
    RequestAwareHTTPInterceptor,
    ResponseAwareHTTPInterceptor,
} from './http-types';

/**
 * Tests whether a value exposes \`postComplete()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is completion-aware.
 */
export const likeCompletionAwareHTTPInterceptor = like({ postComplete: Function }) as (
    value: unknown
) => value is CompletionAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`postError()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is error-aware.
 */
export const likeErrorAwareHTTPInterceptor = like({ postError: Function }) as (
    value: unknown
) => value is ErrorAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`preInit()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is initialization-aware.
 */
export const likeInitializationAwareHTTPInterceptor = like({ preInit: Function }) as (
    value: unknown
) => value is InitializationAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`preRequest()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is request-aware.
 */
export const likeRequestAwareHTTPInterceptor = like({ preRequest: Function }) as (
    value: unknown
) => value is RequestAwareHTTPInterceptor;

/**
 * Tests whether a value exposes \`postResponse()\`.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value is response-aware.
 */
export const likeResponseAwareHTTPInterceptor = like({ postResponse: Function }) as (
    value: unknown
) => value is ResponseAwareHTTPInterceptor;

/**
 * Tests whether a value behaves like any supported HTTP interceptor.
 *
 * @param value - The value to be tested.
 * @returns \`true\` when the value matches at least one interceptor role.
 */
export const likeHTTPInterceptor = (value: unknown): value is ResponseAwareHTTPInterceptor =>
    likeCompletionAwareHTTPInterceptor(value) ||
    likeErrorAwareHTTPInterceptor(value) ||
    likeInitializationAwareHTTPInterceptor(value) ||
    likeRequestAwareHTTPInterceptor(value) ||
    likeResponseAwareHTTPInterceptor(value);

/**
 * Pattern matcher that uses wildcard expressions and caches compiled patterns.
 */
