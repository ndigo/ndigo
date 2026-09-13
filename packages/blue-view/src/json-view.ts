/**
 * @blue/view — JSON view.
 *
 * @module
 * @since 1.0.0
 */

import { MediaTypes } from '@blue/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';

/**
 * A platform-agnostic view that encodes its model as a JSON document.
 *
 * Its `mediaType` is `application/json`, so it slots into content negotiation:
 * the same logical view name resolves to this view when the request accepts
 * JSON (a `.json` path extension or `Accept: application/json`). Encoding
 * serializes the model with `JSON.stringify` — no platform I/O, so it serves
 * Node HTTP responses and browser SSR from the same class.
 */
export class JSONView extends AbstractSerializingView {
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JSON?.withCharset('UTF-8') ?? null;
    }

    /** @inheritdoc */
    protected serialize(model: unknown): string {
        return JSON.stringify(model ?? null);
    }
}
