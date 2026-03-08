/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';

/**
 * Context information for conditional transformation logic.
 */
export interface TransformContext {
    /**
     * Request URL for URL-based conditional transforms.
     */
    readonly url: string;

    /**
     * Request/response headers for header-based conditional logic.
     */
    readonly headers: Headers;

    /**
     * Media type for content-type-based conditional transforms.
     *
     */
    readonly mediaType?: MediaType;

    /**
     * Transform direction: 'request' or 'response'
     */
    readonly direction: 'request' | 'response';

    /**
     * Additional metadata for custom conditional logic.
     */
    readonly metadata?: Record<string, unknown>;
}

/**
 * HTTP body transformer for request/response transformation pipeline.
 *
 * Inspired by Spring Framework's HttpMessageConverter pattern.
 *
 * @template TInput - Input body type
 * @template TOutput - Output body type (defaults to TInput if not specified)
 *
 * @example
 * ```typescript
 * // JSON sanitizer (same type)
 * const sanitizer: HTTPTransformer<JSONObject> = {
 *     canTransform: (body, context) =>
 *         context.direction === 'response' &&
 *         context.mediaType?.is('application/json'),
 *     transform: (body) => sanitizeJSON(body)
 * };
 *
 * // Parser (type change)
 * const parser: HTTPTransformer<string, JSONObject> = {
 *     canTransform: (body) => typeof body === 'string',
 *     transform: (body) => JSON.parse(body)
 * };
 * ```
 */
export interface HTTPTransformer<TInput = any, TOutput = any> {
    /**
     * Determines if this transformer can handle the given body and context.
     *
     * @param body - Request/response body to potentially transform
     * @param context - Context information for conditional logic
     * @returns true if this transformer should be applied
     */
    canTransform(body: TInput, context: TransformContext): boolean;

    /**
     * Transforms the request/response body.
     *
     * @param body - Request/response body to transform
     * @param context - Context information for transformation logic
     * @returns Transformed body (sync or async)
     */
    transform(body: TInput, context: TransformContext): TOutput | Promise<TOutput>;
}

/**
 * User-provided transform function or transformer object.
 */
export type Transform<TInput = any, TOutput = any> =
    | HTTPTransformer<TInput, TOutput>
    | ((body: TInput, context: TransformContext) => TOutput | Promise<TOutput>);
