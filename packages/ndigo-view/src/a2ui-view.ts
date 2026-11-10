/**
 * A2UI response view: an `application/a2ui+json` envelope over an array of
 * A2UI messages. Isomorphic and dependency-free — the format is just JSON, so
 * the representation is reversible in one diff if A2UI stalls.
 */
import { IllegalStateError, MediaTypes } from '@ndigo/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';
import type { ViewResolver } from './view-resolver.js';

/**
 * Serializes an array of A2UI messages (for example `createSurface` and
 * `updateComponents`) as `application/a2ui+json`.
 */
export class A2UIView extends AbstractSerializingView {
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_A2UI_JSON?.withCharset('UTF-8') ?? null;
    }

    /**
     * Validates and serializes the A2UI message array.
     *
     * @param model - The A2UI messages.
     * @returns The JSON envelope.
     * @throws When the model is not an array of messages.
     */
    protected serialize(model: unknown): string {
        if (!Array.isArray(model)) {
            throw new IllegalStateError('A2UIView requires an array of A2UI messages.');
        }
        return JSON.stringify(model);
    }
}

/**
 * Builds a resolver that serves {@link A2UIView} for one logical view name,
 * so content negotiation can pick A2UI against other representations.
 *
 * @param viewName - The logical view name (default `a2ui`).
 * @returns A resolver for that name.
 *
 * @example
 * ```ts
 * resolver.viewResolvers = [a2uiViewResolver(), staticResolver(new JSONView())];
 * ```
 */
export function a2uiViewResolver(viewName = 'a2ui'): ViewResolver {
    return {
        resolveViewName: async (name: string) => (name === viewName ? new A2UIView() : null),
    };
}
