/**
 * Well-known, interned `MediaType` constants for common media types.
 */
import { MediaType } from './media-type.js';

/** Well-known `application/x-www-form-urlencoded` media type. */
export const APPLICATION_FORM_URLENCODED = MediaType.registered('application', 'x-www-form-urlencoded');
/** Well-known `application/octet-stream` media type. */
export const APPLICATION_OCTET_STREAM = MediaType.registered('application', 'octet-stream');
/** Well-known `application/javascript` media type. */
export const APPLICATION_JAVASCRIPT = MediaType.registered('application', 'javascript');
/** Well-known `application/json` media type. */
export const APPLICATION_JSON = MediaType.registered('application', 'json');
/**
 * Well-known `application/a2ui+json` media type — the A2UI 1.0 message
 * envelope (a JSON array of surface messages). Provisional until the format
 * is final; the representation is reversible in one diff.
 */
export const APPLICATION_A2UI_JSON = MediaType.registered('application', 'a2ui+json');
/** Well-known `application/pdf` media type. */
export const APPLICATION_PDF = MediaType.registered('application', 'pdf');
/** Well-known `application/problem+json` media type. */
export const APPLICATION_PROBLEM_JSON = MediaType.registered('application', 'problem+json');
/** Well-known `application/ssml+xml` media type. */
export const APPLICATION_SSML_XML = MediaType.registered('application', 'ssml+xml');
/** Well-known `application/svg+xml` media type. */
export const APPLICATION_SVG_XML = MediaType.registered('application', 'svg+xml');
/** Well-known `application/wasm` media type. */
export const APPLICATION_WASM = MediaType.registered('application', 'wasm');
/** Well-known `application/xhtml` media type. */
export const APPLICATION_XHTML = MediaType.registered('application', 'xhtml');
/** Well-known `application/xhtml+xml` media type. */
export const APPLICATION_XHTML_XML = MediaType.registered('application', 'xhtml+xml');
/** Well-known `application/xml` media type. */
export const APPLICATION_XML = MediaType.registered('application', 'xml');
/** Well-known `application/zip` media type. */
export const APPLICATION_ZIP = MediaType.registered('application', 'zip');
/** Well-known `font/ttf` media type. */
export const FONT_TTF = MediaType.registered('font', 'ttf');
/** Well-known `font/woff` media type. */
export const FONT_WOFF = MediaType.registered('font', 'woff');
/** Well-known `font/woff2` media type. */
export const FONT_WOFF2 = MediaType.registered('font', 'woff2');
/** Well-known `image/bmp` media type. */
export const IMAGE_BMP = MediaType.registered('image', 'bmp');
/** Well-known `image/gif` media type. */
export const IMAGE_GIF = MediaType.registered('image', 'gif');
/** Well-known `image/jpeg` media type. */
export const IMAGE_JPEG = MediaType.registered('image', 'jpeg');
/** Well-known `image/png` media type. */
export const IMAGE_PNG = MediaType.registered('image', 'png');
/** Well-known `image/svg+xml` media type. */
export const IMAGE_SVG_XML = MediaType.registered('image', 'svg+xml');
/** Well-known `image/tiff` media type. */
export const IMAGE_TIFF = MediaType.registered('image', 'tiff');
/** Well-known `image/webp` media type. */
export const IMAGE_WEBP = MediaType.registered('image', 'webp');
/** Well-known `image/x-icon` media type. */
export const IMAGE_X_ICON = MediaType.registered('image', 'x-icon');
/** Well-known `multipart/form-data` media type. */
export const MULTIPART_FORM_DATA = MediaType.registered('multipart', 'form-data');
/** Well-known `text/css` media type. */
export const TEXT_CSS = MediaType.registered('text', 'css');
/** Well-known `text/csv` media type. */
export const TEXT_CSV = MediaType.registered('text', 'csv');
/**
 * Well-known `text/event-stream` media type.
 *
 * @example
 * ```ts
 * res.setHeader('Content-Type', MediaTypes.TEXT_EVENT_STREAM.toString());
 * ```
 */
export const TEXT_EVENT_STREAM = MediaType.registered('text', 'event-stream');
/** Well-known `text/html` media type. */
export const TEXT_HTML = MediaType.registered('text', 'html');
/** Well-known `text/javascript` media type. */
export const TEXT_JAVASCRIPT = MediaType.registered('text', 'javascript');
/** Well-known `text/json` media type. */
export const TEXT_JSON = MediaType.registered('text', 'json');
/** Well-known `text/xml` media type. */
export const TEXT_XML = MediaType.registered('text', 'xml');
/** Well-known `text/plain` media type. */
export const TEXT_PLAIN = MediaType.registered('text', 'plain');
/**
 * Provisional media type per the TOON specification §17
 * (https://github.com/toon-format/spec) — `text/toon`, always UTF-8. Not yet
 * registered with IANA; kept as an inert token so user views/interceptors can
 * compose with it until the format settles (Ndigo pre-1.0).
 */
export const TEXT_TOON = MediaType.registered('text', 'toon');
/** Well-known wildcard media type. */
export const WILDCARD = MediaType.registered('*', '*');
