/**
 * TOON response view: serializes a model as `text/toon` (spec v4.4) — an
 * opt-in agent-facing representation beside `application/a2ui+json` and
 * `text/csv`.
 *
 * The dependency shape (AD-102): `@toon-format/toon` is a *regular* dep of
 * this dedicated package, statically imported, so `serialize` stays
 * synchronous and a wire surface fails at install time — never as a
 * request-time missing-module error. Consumers who do not want TOON install
 * `@ndigo/view` and never see this package.
 */
import { MediaTypes } from '@ndigo/core';
import { AbstractSerializingView } from '@ndigo/view';
import { encodeToon } from './toon-encode';
import type { ToonEncodeOptions } from './toon-encode';

/**
 * Serializes a model as `text/toon;charset=utf-8` — the provisional media
 * type's text/* default charset, matching spec §17.
 */
export class ToonView extends AbstractSerializingView {
    readonly #options: ToonEncodeOptions;

    /**
     * Creates the view; per-route options tune indentation and delimiter.
     *
     * @param options - TOON encoding options.
     */
    constructor(options: ToonEncodeOptions = {}) {
        super();
        this.mediaType = MediaTypes.TEXT_TOON?.withCharset('UTF-8') ?? null;
        this.#options = { ...options };
    }

    /**
     * Encodes the model into a TOON document.
     *
     * @param model - The JSON-model data to encode.
     * @returns The rendered document.
     * @throws When the model is not encodable (functions, `undefined`, BigInt,
     *   circular references) — the encoder's diagnostic contract.
     */
    protected serialize(model: unknown): string {
        return encodeToon(model, this.#options);
    }
}
