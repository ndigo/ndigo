/**
 * @module blue-view
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError, MediaTypes } from '@blue/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';

/**
 * A view that encodes its model as raw bytes (`application/octet-stream`)
 * for downloads and binary payloads.
 *
 * Accepts a `Uint8Array` (passed through), an `ArrayBuffer`, or a string
 * (UTF-8 encoded).
 */
export class OctetStreamView extends AbstractSerializingView {
    constructor() {
        super();
        this.mediaType = MediaTypes.APPLICATION_OCTET_STREAM ?? null;
    }

    /** @inheritdoc */
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
