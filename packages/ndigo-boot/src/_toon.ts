/**
 * The optional `@toon-format/toon` peer seam (AD-66): exact pin, runtime
 * shape check, lazy dynamic import, TOON document parsing, and bounded
 * decoder diagnostics — shared by the config-file loader and
 * `ApplicationBuilder.fromConfig`.
 */
import { IllegalStateError, JSONObject } from '@ndigo/core';
import { getErrorMessage } from '@ndigo/util';

/**
 * Exact version of the optional `@toon-format/toon` peer (AD-66 D-4) — keep
 * in sync with the `peerDependencies`/`devDependencies` pin in
 * `packages/ndigo-boot/package.json`; the install hint in
 * {@link loadToonDecoder} references it.
 */
export const TOON_PEER_VERSION = '4.4.0';

/**
 * Runtime shape of the optional `@toon-format/toon` peer. Declared locally
 * instead of `import type`-ed so that building `@ndigo/boot` from source never
 * requires the optional peer to resolve (AD-66): the lazy dynamic import in
 * {@link loadToonDecoder} is the only load site.
 */
interface ToonDecoderModule {
    decode(content: string): unknown;
}

/**
 * Lazy loader for the optional `@toon-format/toon` peer. DELIBERATE dynamic
 * import (exception to the static-import rule): consumers without the
 * optional peer keep zero install/build cost — a static import would fail
 * their builds. The literal specifier plus `@vite-ignore` keeps the module a
 * *declared, scannable* runtime dependency while bundlers skip it.
 * `toon-spec: 4.4` (https://github.com/toon-format/spec).
 */
export const loadToonDecoder = async (): Promise<(content: string) => JSONObject> => {
    let peer: ToonDecoderModule;
    try {
        peer = (await import(/* @vite-ignore */ '@toon-format/toon')) as ToonDecoderModule;
    } catch (cause) {
        // Every resolution failure maps to "not installed": the peer is
        // optional, so a missing/corrupt install is the expected case. A
        // version whose exports changed surfaces through the shape check
        // below instead of a misleading "not valid TOON" at parse time.
        throw new IllegalStateError(
            'A .toon config file was found, but the optional "@toon-format/toon" dependency is not installed. ' +
                `Install it (e.g. \`npm i @toon-format/toon@${TOON_PEER_VERSION}\`) to use TOON config files.`,
            { cause }
        );
    }
    if (typeof peer.decode !== 'function') {
        throw new IllegalStateError(
            `The installed "@toon-format/toon" does not expose the expected decode() export — expected v${TOON_PEER_VERSION}. ` +
                `Reinstall it (e.g. \`npm i @toon-format/toon@${TOON_PEER_VERSION}\`).`
        );
    }
    // NOTE: type assertion required at this boundary.
    return peer.decode as unknown as (content: string) => JSONObject;
};

/**
 * Decoder diagnostics quote input slices, and config files routinely hold
 * credentials — bound the message and strip control characters before it
 * enters an error/log (AD-66, SEC parity with the JSON path's bounded
 * `JSON.parse` message).
 */
const MAX_DECODER_MESSAGE_CHARS = 200;
const sanitizeDecoderMessage = (message: string): string => {
    // oxlint-disable-next-line no-control-regex -- stripping control characters from diagnostics is the purpose of this sanitizer.
    const printable = message.replace(/[\u0000-\u001f\u007f]/g, ' ');
    return printable.length > MAX_DECODER_MESSAGE_CHARS
        ? `${printable.slice(0, MAX_DECODER_MESSAGE_CHARS - 3)}...`
        : printable;
};

/**
 * Decodes a TOON config document (spec v4.4) into the JSON object the
 * property-source layer consumes. `label` names the document for diagnostics
 * (a file path for the config-file loader, a URL for `fromConfig`).
 *
 * Strict mode is the reference decoder's default, so duplicate sibling keys
 * and count/width mismatches error (§14) — cross-file profile merging is
 * unaffected: it happens after decode, with the usual object-merge /
 * array-replace semantics. A JSON document pasted or renamed into a `.toon`
 * file is the format's most plausible authoring slip (TOON would decode
 * `{"a": 1}` as an ordinary key: value line, a silent garbage object), so
 * `{`/`[`-leading documents error up front — with a rename hint when the
 * label itself carries the `.toon` extension, and a decode advisory when the
 * address was neutral (an explicit `format: 'toon'` over a non-`.toon`
 * address).
 *
 * @param content - The raw document text.
 * @param label - The document's file path or URL, for diagnostics.
 * @param decodeToon - Optional decoder seam; defaults to the lazy optional
 *   peer. Injectable for specs and alternative validators.
 * @returns The decoded plain JSON object.
 * @throws `IllegalStateError` when the document is JSON-shaped, undecodable,
 *   or does not decode to an object.
 */
export const parseToonDocument = async (
    content: string,
    label: string,
    decodeToon?: (content: string) => JSONObject | Promise<JSONObject>
): Promise<JSONObject> => {
    const first = content.trimStart()[0];
    if (first === '{' || first === '[') {
        const advisory = label.endsWith('.toon')
            ? 'TOON is line/indentation-based: rename the file to .json or convert its contents.'
            : 'TOON is line/indentation-based: convert the document to TOON or drop the format option.';
        throw new IllegalStateError(
            `Config file "${label}" starts like a JSON document but is decoded as TOON. ${advisory}`
        );
    }
    const decode = decodeToon ?? (await loadToonDecoder());
    let parsed: unknown;
    try {
        parsed = await decode(content);
    } catch (cause) {
        throw new IllegalStateError(
            `Config file "${label}" is not valid TOON: ${sanitizeDecoderMessage(getErrorMessage(cause))}`,
            { cause }
        );
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new IllegalStateError(
            `Config file "${label}" must decode to a TOON object (got ${Array.isArray(parsed) ? 'an array' : typeof parsed})`
        );
    }
    return parsed as JSONObject;
};
