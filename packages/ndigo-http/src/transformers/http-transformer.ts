/**
 * The HTTP transformer contract.
 */
import { MediaType } from '@ndigo/core';

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
    readonly mediaType: MediaType | null | undefined;

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
 * Contract for request/response body transformers.
 *
 * Inspired by the `HttpMessageConverter` pattern.
 */
export interface HTTPTransformer<TInput = unknown, TOutput = unknown> {
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
export type Transform<TInput = unknown, TOutput = unknown> =
    | HTTPTransformer<TInput, TOutput>
    | ((body: TInput, context: TransformContext) => TOutput | Promise<TOutput>);
