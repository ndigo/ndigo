/**
 * The TOON encoder: `encodeToon` wraps the reference encoder's `encode` with
 * this package's diagnostic contract, so every failure surfaces as an
 * `IllegalStateError` with a bounded, control-stripped message (documents
 * routinely carry user data) and the cause attached.
 */
import { IllegalStateError } from '@ndigo/core';
import type { EncodeOptions } from '@toon-format/toon';
import { encode as encodeReference } from '@toon-format/toon';

/**
 * TOON encoding options, mirroring the reference encoder's supported surface
 * (spec §9): indentation width for nested lines, and the row/inline-array
 * delimiter — `\t` or `|` are the tabular-friendly choices for LLM
 * consumers.
 */
export interface ToonEncodeOptions {
    /**
     * Spaces per indentation level. Defaults to `2`.
     */
    indentSize?: number;
    /**
     * Delimiter for tabular array rows and inline primitive arrays.
     * Defaults to `','`.
     */
    delimiter?: ',' | '\t' | '|';
}

/** Maps package options onto the SDK surface (without leaking its type). */
const toEncodeOptions = (options: ToonEncodeOptions): EncodeOptions => {
    const result: EncodeOptions = {};
    if (options.indentSize !== undefined) result.indentSize = options.indentSize;
    if (options.delimiter !== undefined) result.delimiter = options.delimiter;
    return result;
};

/**
 * Encoder diagnostics quote the offending input slice, and TOON documents
 * routinely carry user data — bound the message and strip control characters
 * before it enters an error/log (the same diagnostic discipline as the
 * framework's config-side decoder).
 */
const MAX_DIAGNOSTIC_MESSAGE_CHARS = 200;
const sanitizeDiagnosticMessage = (message: string): string => {
    // oxlint-disable-next-line no-control-regex -- stripping control characters from diagnostics is the purpose of this sanitizer.
    const printable = message.replace(/[\u0000-\u001f\u007f]/g, ' ');
    return printable.length > MAX_DIAGNOSTIC_MESSAGE_CHARS
        ? `${printable.slice(0, MAX_DIAGNOSTIC_MESSAGE_CHARS - 3)}...`
        : printable;
};

/**
 * Encodes a JSON-model value as a TOON document (spec v4.4).
 *
 * @param value - The value to encode — plain objects, arrays, and JSON
 *   primitives; the type system cannot prove that, so runtime failures map
 *   to `IllegalStateError` here rather than surfacing from deep inside the
 *   encoder.
 * @param options - Indentation and delimiter tuning.
 * @returns The rendered document.
 * @throws `IllegalStateError` when the value is not encodable (functions,
 *   `undefined`, BigInt, circular references) or the options are invalid.
 *
 * @example
 * ```ts
 * encodeToon([{ id: 'a', qty: 2 }, { id: 'b', qty: 5 }]);
 * // rows[2]{id,qty}: a,2 / b,5 — the tabular form TOON exists for
 * ```
 */
export function encodeToon(value: unknown, options: ToonEncodeOptions = {}): string {
    try {
        return encodeReference(value, toEncodeOptions(options));
    } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause);
        throw new IllegalStateError(`TOON encoding failed: ${sanitizeDiagnosticMessage(message)}`, { cause });
    }
}
