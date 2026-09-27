/**
 * Content-Type specific {@link HTTPHeader} category (Wave 5, 2026-09-27).
 *
 * The parsing is owned by `@blue/core`'s {@link MediaType} (Wave 6,
 * 2026-09-27): `for()` folds type/subtype and parameter-name case,
 * unquotes quoted parameter values, and interns — so raw header values
 * parse safely and case variants converge on one instance. The module
 * keeps the functional surface the request pipeline and the mock harness
 * share; new code can use the `HTTPHeaders.CONTENT_TYPE` constant's
 * typed methods or `MediaType` directly.
 *
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { MediaType, MediaTypes } from '@blue/core';
import { HTTPHeader } from './http-header';

/** The recognized multipart media type (canonical base-type string; single
 * source is `@blue/core`'s `MediaTypes.MULTIPART_FORM_DATA`). */
export const MULTIPART_FORM_DATA = String(MediaTypes.MULTIPART_FORM_DATA);

/**
 * Extracts the bare media type from a `Content-Type` header value: the part
 * before the first `;`, trimmed and lower-cased. `null` when the header is
 * absent or blank — callers that need a string fall back to `''`.
 *
 * @param contentType - The raw `Content-Type` header value.
 * @returns The lower-cased media type without parameters, or `null`.
 */
export function contentTypeBase(contentType: string | undefined | null): string | null {
    if (!contentType) {
        return null;
    }
    return MediaType.for(contentType)?.baseType ?? null;
}

/**
 * Extracts the multipart boundary from a `Content-Type` value, or `null`.
 * The media type must be `multipart/form-data`; the `boundary` parameter
 * name is matched case-insensitively (RFC 2045 §5.1) and quoted values are
 * unquoted by the MediaType parser. A pre-check only — the parser (busboy)
 * remains the authority on boundary syntax and validity.
 *
 * @param contentType - The raw `Content-Type` header value.
 * @returns The boundary value, or `null` when absent or no multipart type.
 */
export function multipartBoundary(contentType: string | undefined | null): string | null {
    const mediaType = MediaType.for(contentType ?? '');
    if (mediaType === null || mediaType.baseType !== MULTIPART_FORM_DATA) {
        return null;
    }
    const boundary = mediaType.parameters['boundary'];
    return typeof boundary === 'string' && boundary !== '' ? boundary : null;
}

/**
 * Content-Type header category: value parsing on the constant itself.
 *
 * ```ts
 * HTTPHeaders.CONTENT_TYPE.baseValue('multipart/form-data; boundary=abc'); // 'multipart/form-data'
 * HTTPHeaders.CONTENT_TYPE.boundary('multipart/form-data; BOUNDARY="x"');  // 'x'
 * ```
 */
export class ContentTypeHeader extends HTTPHeader {
    /**
     * The bare media type of a `Content-Type` value (see
     * {@link contentTypeBase}).
     */
    baseValue(contentType: string | undefined | null): string | null {
        return contentTypeBase(contentType);
    }

    /**
     * The multipart boundary of a `Content-Type` value (see
     * {@link multipartBoundary}).
     */
    boundary(contentType: string | undefined | null): string | null {
        return multipartBoundary(contentType);
    }
}
