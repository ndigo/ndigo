/**
 * Content-Type header helpers shared by the request pipeline and the mock
 * harness. Node lower-cases incoming header names but not values, so every
 * consumer of a `Content-Type` value needs the same normalization: strip
 * parameters (the part after `;`), trim, and case-fold the media type.
 * `multipart/form-data` additionally carries a `boundary` parameter whose
 * parameter NAME is case-insensitive per RFC 2045 §5.1 (`BOUNDARY=x` is
 * legal); the extraction here case-folds the parameter name and strips
 * optional quotes.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */

/** The recognized multipart media type. */
export const MULTIPART_FORM_DATA = 'multipart/form-data';

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
    const base = contentType.split(';')[0]?.trim().toLowerCase() ?? '';
    return base === '' ? null : base;
}

/**
 * Extracts the multipart boundary from a `Content-Type` value, or `null`.
 * The media type must be `multipart/form-data`; the `boundary` parameter
 * name is matched case-insensitively (RFC 2045 §5.1) and quoted values are
 * accepted. A pre-check only — the parser (busboy) remains the authority on
 * boundary syntax and validity.
 *
 * @param contentType - The raw `Content-Type` header value.
 * @returns The boundary value, or `null` when absent or no multipart type.
 */
export function multipartBoundary(contentType: string | undefined | null): string | null {
    if (contentTypeBase(contentType) !== MULTIPART_FORM_DATA) {
        return null;
    }
    const match = /boundary=(?:"([^"]+)"|([^\s;]+))/i.exec(contentType ?? '');
    return match ? (match[1] ?? match[2]) : null;
}
