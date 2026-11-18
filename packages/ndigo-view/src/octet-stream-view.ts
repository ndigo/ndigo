/**
 * Binary (`application/octet-stream`) response view.
 */
import { IllegalStateError, MediaTypes } from '@ndigo/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';

/**
 * A view that encodes its model as raw bytes (`application/octet-stream`)
 * for downloads and binary payloads.
 *
 * Accepts a `Uint8Array` (passed through), an `ArrayBuffer`, or a string
 * (UTF-8 encoded).
 */
export class OctetStreamView extends AbstractSerializingView {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "OctetStreamView".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object OctetStreamView]"
     */
    get [Symbol.toStringTag](): string {
        return 'OctetStreamView';
    }

    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_OCTET_STREAM ?? null;
    }

    /**
     * Serializes the model to bytes (`Uint8Array`, `ArrayBuffer`, or a UTF-8
     * string).
     *
     * @param model - The data model to serialize.
     * @returns The binary body.
     */
    protected serialize(model: unknown): Uint8Array {
        if (model instanceof Uint8Array) {
            return model;
        }
        if (model instanceof ArrayBuffer) {
            return new Uint8Array(model);
        }
        if (typeof model === 'string') {
            return new TextEncoder().encode(model);
        }
        throw new IllegalStateError('OctetStreamView requires a Uint8Array, ArrayBuffer, or string model.');
    }
}
