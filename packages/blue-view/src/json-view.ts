/**
 * @blue/view — JSON view.
 *
 * @module
 * @since 1.0.0
 */

import { IllegalStateError, MediaTypes } from '@blue/core';
import type { Route } from '@blue/router';
import { AbstractView } from './view.js';
import type { ViewTarget } from './view-target.js';

/**
 * A platform-agnostic view that renders its model as a JSON document.
 *
 * Its `mediaType` is `application/json`, so it slots into content negotiation:
 * the same logical view name resolves to this view when the request accepts
 * JSON (a `.json` path extension or `Accept: application/json`). Rendering
 * serializes the model with `JSON.stringify` and commits the string to the
 * target — no platform I/O, so it serves Node HTTP responses and browser SSR
 * from the same class.
 */
export class JSONView extends AbstractView {
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JSON?.withCharset('UTF-8') ?? null;
    }

    /** @inheritdoc */
    protected async _renderView(viewModel: unknown, request: unknown, target?: ViewTarget): Promise<void> {
        if (!target) {
            throw new IllegalStateError('JSONView requires a ViewTarget to render.');
        }

        const body = JSON.stringify(viewModel ?? null);
        await target.commit(body, viewModel, request as Route);
    }
}
