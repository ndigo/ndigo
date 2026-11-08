/**
 * Plain-text response view.
 */
import { MediaTypes } from '@ndigo/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';

/**
 * A view that encodes its model as plain text (`text/plain`).
 *
 * Nullish models render an empty document; other values are coerced with
 * `String`.
 */
export class TextView extends AbstractSerializingView {
    constructor() {
        super();
        this.mediaType = MediaTypes.TEXT_PLAIN?.withCharset('UTF-8') ?? null;
    }

    /**
     * Serializes the model as plain text.
     *
     * @param model - The data model to serialize.
     * @returns The text body.
     */
    protected serialize(model: unknown): string {
        return model == null ? '' : String(model);
    }
}
