/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Transform, TransformContext } from '../transformers/http-transformer';
import { MediaType } from '@blue/core';
import { RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';
import * as HTTPHeaders from '../http-headers';

/**
 * Applies request and response body transforms at the interceptor boundary.
 *
 * It runs after header setup so transforms can rely on the declared content
 * type and other request context.
 */
export class TransformInterceptor implements RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor {
    constructor(
        private readonly requestTransforms: Transform[] = [],
        private readonly responseTransforms: Transform[] = []
    ) {}

    /**
     * Applies request body transformations.
     *
     * @param request - The request to transform.
     * @returns A replacement request when a transform changes the body.
     */
    async preRequest(request: Request): Promise<Request> {
        if (this.requestTransforms.length === 0) {
            return request;
        }

        // Extract body
        let body: unknown = await this.extractBody(request);
        if (body === null) {
            return request; // No body to transform
        }

        // Build context
        const context = this.createContext(request, 'request');

        // Apply transforms
        for (const transform of this.requestTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                // Transform order matters and each transform consumes the previous body.
                // oxlint-disable-next-line no-await-in-loop
                body = await this.applyTransform(transform, body, context);
            }
        }

        // Create new request from the original Request so signal,
        // credentials, mode, redirect, cache and integrity survive the
        // transform — only the body is replaced. A concrete body is always
        // supplied for body-bearing methods so the rebuild never copies the
        // original (possibly streaming) body. GET/HEAD carry no body (and
        // fetch rejects one).
        const replacedBody =
            request.method === 'GET' || request.method === 'HEAD'
                ? null
                : (this.serializeBody(body, HTTPHeaders.CONTENT_TYPE.get(request.headers) || '') ?? '');
        return new Request(request, replacedBody === null ? {} : { body: replacedBody });
    }

    /**
     * Applies response body transformations.
     *
     * @param response - The response to transform.
     * @returns A replacement response when a transform changes the body.
     */
    async postResponse(response: Response): Promise<Response | void> {
        if (this.responseTransforms.length === 0) {
            return response;
        }

        // The payload is read through an internal clone, leaving the
        // original response's body readable for the caller.
        let body: unknown = await this.extractBody(response);
        if (body === null) {
            return response;
        }

        const context = this.createContext(response, 'response');

        for (const transform of this.responseTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                // Transform order matters and each transform consumes the previous body.
                // oxlint-disable-next-line no-await-in-loop
                body = await this.applyTransform(transform, body, context);
            }
        }

        const contentType = HTTPHeaders.CONTENT_TYPE.get(response.headers) || '';
        const transformedBody = this.serializeBody(body, contentType);

        return new Response(transformedBody, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

    /**
     * Extracts body from Request or Response.
     *
     * Returns `null` when there is nothing to parse: bodyless requests
     * (GET/HEAD), null-body responses (204/304), or a zero-length payload.
     * Parsing those would throw before any transform could run. The payload is
     * read through a clone so a `null` result leaves the caller's body intact
     * for the actual request.
     */
    private async extractBody(source: Request | Response): Promise<unknown> {
        if (source.body === null) {
            return null;
        }

        const readable = source.clone(),
            contentType = HTTPHeaders.CONTENT_TYPE.get(readable.headers) || '',
            mediaType = mediaTypeOf(contentType);

        if (mediaType?.isJSON === true) {
            const text = await readable.text();
            return text.trim() === '' ? null : JSON.parse(text);
        }
        if (mediaType?.type === 'text') {
            const text = await readable.text();
            return text === '' ? null : text;
        }
        if (mediaType?.baseType === 'application/x-www-form-urlencoded') {
            const text = await readable.text();
            return text === '' ? null : new URLSearchParams(text);
        }
        if (mediaType?.baseType === 'multipart/form-data') {
            return await readable.formData();
        }

        // Unknown/unsupported content type
        return null;
    }

    /**
     * Creates TransformContext from Request or Response.
     */
    private createContext(source: Request | Response, direction: 'request' | 'response'): TransformContext {
        const url = source instanceof Request ? source.url : ''; // Response doesn't have URL
        const contentType = HTTPHeaders.CONTENT_TYPE.get(source.headers) || '';

        return {
            url,
            headers: source.headers,
            mediaType: contentType ? MediaType.for(contentType) : undefined,
            direction,
            metadata: {},
        };
    }

    /**
     * Determines if transform should be applied.
     */
    private shouldApplyTransform(transform: Transform, body: unknown, context: TransformContext): boolean {
        // Function transform - always apply
        if (typeof transform === 'function') {
            return true;
        }

        // Object transform - check canTransform
        return transform.canTransform(body, context);
    }

    /**
     * Applies transform to body.
     */
    private async applyTransform(transform: Transform, body: unknown, context: TransformContext): Promise<unknown> {
        if (typeof transform === 'function') {
            return await transform(body, context);
        }
        return await transform.transform(body, context);
    }

    private serializeBody(body: unknown, contentType: string): BodyInit | null {
        if (body == null) {
            return null;
        }

        if (typeof body === 'string') {
            return body;
        }

        if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
            return body;
        }

        if (mediaTypeOf(contentType)?.isJSON === true) {
            return JSON.stringify(body);
        }

        if (
            mediaTypeOf(contentType)?.baseType === 'application/x-www-form-urlencoded' &&
            body instanceof URLSearchParams
        ) {
            return body;
        }

        if (mediaTypeOf(contentType)?.baseType === 'multipart/form-data' && body instanceof FormData) {
            return body;
        }

        return typeof body === 'object' ? JSON.stringify(body) : String(body);
    }
}

/**
 * The parsed media type of a Content-Type header value, or `null` when
 * blank/unparseable — the single MediaType gate for the body-sniffing
 * decisions (Wave 6): case folded by the registry, parameters tolerated.
 */
function mediaTypeOf(contentType: string): MediaType | null {
    return contentType === '' ? null : MediaType.for(contentType);
}
