/**
 * @module ndigo-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MediaType } from '@ndigo/core';
import type { Route } from '@ndigo/router';

/**
 * A complete response document produced by a {@link ProducerView}.
 */
export interface RenderResult {
    /**
     * HTTP status code. Defaults to `200` when omitted.
     */
    status?: number;

    /**
     * Response headers. A `Content-Type` derived from {@link RenderResult.mediaType | `mediaType`}
     * is added when absent.
     */
    headers?: Record<string, string>;

    /**
     * The media type of the produced body.
     */
    mediaType?: MediaType;

    /**
     * The produced body: a complete document string, raw bytes, or a stream.
     */
    body: string | Uint8Array | AsyncIterable<unknown>;
}

/**
 * A view that produces a complete response document rather than rendering
 * into a {@link ViewTarget}.
 *
 * This is the server-side (document) rendering mode — the servlet/JSP-style
 * whole-page equivalent: an EJS page, a JSON API body, or a streamed
 * response. A producing view renders to any consumer (an HTTP response, a
 * capture target in tests) through the returned {@link RenderResult} and
 * never owns a destination.
 */
export interface ProducerView {
    /**
     * Renders the view to a complete response document.
     *
     * @param model - The data model supplied to the view.
     * @param route - The current route.
     * @returns The response document.
     */
    renderTo(model: unknown, route: Route): Promise<RenderResult>;
}

/**
 * Returns whether a value behaves like a {@link ProducerView}.
 */
export const likeProducerView = (value: unknown): value is ProducerView & object =>
    typeof value === 'object' && value !== null && 'renderTo' in value;
