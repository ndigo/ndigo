/**
 * Media types, encoding negotiation, validators, and path/HTML helpers for
 * static-resource resolution.
 */
import { MediaType, MediaTypes } from '@ndigo/core';
import type { StaticEncoding } from './static-resource-resolver-types.js';

/**
 * MIME allowlist — extensions outside this map are not served. Values are
 * `@ndigo/core` `MediaType` instances: text-ish
 * entries carry an explicit `utf-8` charset via `withCharset`, serialized
 * canonically (parameter lists without the RFC-permitted optional space —
 * `text/html;charset=utf-8`).
 */
export const utf8 = (mediaType: MediaType): MediaType => mediaType.withCharset('utf-8');

export const MIME_BY_EXTENSION: Record<string, MediaType> = {
    '.html': utf8(MediaTypes.TEXT_HTML),
    '.htm': utf8(MediaTypes.TEXT_HTML),
    '.css': utf8(MediaTypes.TEXT_CSS),
    '.js': utf8(MediaTypes.TEXT_JAVASCRIPT),
    '.mjs': utf8(MediaTypes.TEXT_JAVASCRIPT),
    '.json': MediaTypes.APPLICATION_JSON,
    '.png': MediaTypes.IMAGE_PNG,
    '.jpg': MediaTypes.IMAGE_JPEG,
    '.jpeg': MediaTypes.IMAGE_JPEG,
    '.gif': MediaTypes.IMAGE_GIF,
    '.svg': MediaTypes.IMAGE_SVG_XML,
    '.ico': MediaTypes.IMAGE_X_ICON,
    '.webp': MediaTypes.IMAGE_WEBP,
    '.woff': MediaTypes.FONT_WOFF,
    '.woff2': MediaTypes.FONT_WOFF2,
    '.ttf': MediaTypes.FONT_TTF,
    '.txt': utf8(MediaTypes.TEXT_PLAIN),
    '.xml': MediaTypes.APPLICATION_XML,
    '.pdf': MediaTypes.APPLICATION_PDF,
    '.wasm': MediaTypes.APPLICATION_WASM,
};

/**
 * Extensions eligible for precompressed variants. Only text-ish payloads
 * compress meaningfully; image/font/binary types are served as-is even when a
 * `.br`/`.gz` twin exists.
 */
export const COMPRESSIBLE_EXTENSIONS: ReadonlySet<string> = new Set([
    '.html',
    '.htm',
    '.css',
    '.js',
    '.mjs',
    '.json',
    '.svg',
    '.xml',
    '.txt',
]);

/**
 * Parses an `Accept-Encoding` header into the preferred supported encoding.
 *
 * q-values respected; ties prefer `br` (smaller payloads). `*` accepts any
 * encoding but only wins when it beats every explicit codec's q (explicit
 * beats wildcard on ties). `identity`, and q=0 exclusions fall through
 * correctly. Returns `null` when no supported encoding is acceptable (serve
 * the original).
 *
 * @param header - The `Accept-Encoding` header.
 * @returns The chosen encoding, or `null`.
 *
 * @example
 * ```ts
 * negotiateEncoding();
 * ```
 */
/** Builds the strong ETag for a payload; variant encoding disambiguates. */
export function buildEtag(size: number, mtimeMs: number, encoding?: StaticEncoding): string {
    const base = `${size.toString(16)}-${Math.round(mtimeMs).toString(16)}`;
    return `"${encoding ? `${base}-${encoding}` : base}"`;
}

/**
 * True when a request-relative path addresses a dotfile: any path
 * segment that begins with `.`. The standard `.well-known` namespace is the
 * built-in opt-in exception (a leading `.well-known` segment is not a
 * dotfile), and the `.`/`..` navigation segments are left to path resolution.
 *
 * @param relative - The request path with any leading `/` stripped.
 * @returns `true` when the path must be refused unless `serveDotfiles` is set.
 */
export function isDotfilePath(relative: string): boolean {
    if (relative === '') {
        return false;
    }
    const segments = relative.split('/');
    // The exemption is a leading, literal `.well-known` namespace. A `..`
    // segment anywhere means the path is not a straight well-known URI (path
    // algebra could otherwise launder `.well-known/../.env.json` back to a
    // dotfile), so it falls through to the normal dotfile rules.
    if (segments[0] === '.well-known' && !segments.includes('..')) {
        return false;
    }
    return segments.some((segment) => segment.startsWith('.') && segment !== '.' && segment !== '..');
}

/** HTML-escapes a directory entry name (D-7; listing must never trust names). */
export function escapeHtml(value: string): string {
    return value.replace(/[&<>"']/g, (char) => {
        switch (char) {
            case '&':
                return '&amp;';
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            default:
                return '&#39;';
        }
    });
}
