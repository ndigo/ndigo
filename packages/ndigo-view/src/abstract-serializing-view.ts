/**
 * Base view that serializes a model into a rendered body.
 */
import { IllegalStateError } from '@ndigo/core';
import type { Route } from '@ndigo/router';
import { AbstractView } from './view.js';
import type { ProducerView, RenderResult } from './producer-view.js';
import type { ViewTarget } from './view-target.js';

/**
 * Abstract base for views that encode their model into a document body — the
 * representation family served by content negotiation (JSON, CSV, text,
 * bytes, …).
 *
 * Dual-mode like the EJS view (see `@ndigo/view-ejs`): renders into a {@link ViewTarget} (fragment
 * mode) and produces a complete {@link RenderResult} (document mode), both
 * from the same {@link AbstractSerializingView.serialize | `serialize`} encoding.
 * Subclasses declare their `mediaType` in the constructor and implement
 * `serialize`.
 */
export abstract class AbstractSerializingView extends AbstractView implements ProducerView {
    /**
     * Produces the serialized document for document mode.
     *
     * @param model - The data model to encode.
     * @param _route - The current route (unused).
     * @returns The encoded body and its media type.
     */
    async renderTo(model: unknown, _route: Route): Promise<RenderResult> {
        void _route;
        return {
            mediaType: this.mediaType ?? undefined,
            body: this.serialize(model),
        };
    }

    /**
     * Renders the serialized body into a view target.
     *
     * @param viewModel - The view model to encode.
     * @param request - The current request.
     * @param target - The view target that receives the body.
     * @returns A promise that resolves once the target commits the body.
     */
    protected async _renderView(viewModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('AbstractSerializingView requires a ViewTarget to render.');
        }

        await target.commit(this.serialize(viewModel), viewModel, request as Route);
    }

    /**
     * Encode the given model into the document body for this view's media type.
     *
     * @param model - The data model to encode.
     * @returns The encoded body.
     */
    protected abstract serialize(model: unknown): string | Uint8Array;
}
