/**
 * @author Jeff Rose
 */
import { Transform, TransformContext } from '../transformers/http-transformer';
import { MediaType } from '@blue/core';
import { RequestAwareHTTPInterceptor, ResponseAwareHTTPInterceptor } from '../http';

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
        let body: any = await this.extractBody(request);
        if (body === null) {
            return request; // No body to transform
        }

        // Build context
        const context = this.createContext(request, 'request');

        // Apply transforms
        for (const transform of this.requestTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                body = await this.applyTransform(transform, body, context);
            }
        }

        // Create new request with transformed body
        return new Request(request.url, {
            method: request.method,
            headers: request.headers,
            body: this.serializeBody(body, request.headers.get('content-type') || ''),
            // ... copy other request properties
        });
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

        // Clone for safe body reads
        let body: unknown = await this.extractBody(response.clone());
        if (body === null) {
            return response;
        }

        const context = this.createContext(response, 'response');

        for (const transform of this.responseTransforms) {
            if (this.shouldApplyTransform(transform, body, context)) {
                body = await this.applyTransform(transform, body, context);
            }
        }

        const contentType = response.headers.get('content-type') || '';
        const transformedBody = this.serializeBody(body, contentType);

        return new Response(transformedBody, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

    /**
     * Extracts body from Request or Response.
     */
    private async extractBody(source: Request | Response): Promise<unknown> {
        const contentType = source.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            return await source.json();
        }
        if (contentType.includes('text/')) {
            return await source.text();
        }
        if (contentType.includes('application/x-www-form-urlencoded')) {
            const text = await source.text();
            return new URLSearchParams(text);
        }
        if (contentType.includes('multipart/form-data')) {
            return await source.formData();
        }

        // Unknown/unsupported content type
        return null;
    }

    /**
     * Creates TransformContext from Request or Response.
     */
    private createContext(source: Request | Response, direction: 'request' | 'response'): TransformContext {
        const url = source instanceof Request ? source.url : ''; // Response doesn't have URL
        const contentType = source.headers.get('content-type') || '';

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

        if (contentType.includes('application/json')) {
            return JSON.stringify(body);
        }

        if (contentType.includes('application/x-www-form-urlencoded') && body instanceof URLSearchParams) {
            return body;
        }

        if (contentType.includes('multipart/form-data') && body instanceof FormData) {
            return body;
        }

        return typeof body === 'object' ? JSON.stringify(body) : String(body);
    }
}
