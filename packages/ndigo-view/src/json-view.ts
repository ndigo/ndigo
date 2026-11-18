/**
 * JSON response view.
 */
import { MediaTypes } from '@ndigo/core';
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
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "JSONView".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object JSONView]"
     */
    get [Symbol.toStringTag](): string {
        return 'JSONView';
    }

    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_JSON?.withCharset('UTF-8') ?? null;
    }

    /**
     * Serializes the model as JSON.
     *
     * @param model - The data model to serialize.
     * @returns The JSON body.
     */
    protected serialize(model: unknown): string {
        return JSON.stringify(model ?? null);
    }
}
