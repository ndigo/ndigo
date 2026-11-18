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
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "TextView".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object TextView]"
     */
    get [Symbol.toStringTag](): string {
        return 'TextView';
    }

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
