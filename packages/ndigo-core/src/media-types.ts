/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import MediaType from './media-type.js';

/**
 */

/**
 */
export const APPLICATION_FORM_URLENCODED = MediaType.registered('application', 'x-www-form-urlencoded');
/**
 */
export const APPLICATION_OCTET_STREAM = MediaType.registered('application', 'octet-stream');
/**
 */
export const APPLICATION_JAVASCRIPT = MediaType.registered('application', 'javascript');
/**
 */
export const APPLICATION_JSON = MediaType.registered('application', 'json');
/**
 */
export const APPLICATION_PDF = MediaType.registered('application', 'pdf');
/**
 */
export const APPLICATION_PROBLEM_JSON = MediaType.registered('application', 'problem+json');
/**
 */
export const APPLICATION_SSML_XML = MediaType.registered('application', 'ssml+xml');
/**
 */
export const APPLICATION_SVG_XML = MediaType.registered('application', 'svg+xml');
/**
 */
export const APPLICATION_WASM = MediaType.registered('application', 'wasm');
/**
 */
export const APPLICATION_XHTML = MediaType.registered('application', 'xhtml');
/**
 */
export const APPLICATION_XHTML_XML = MediaType.registered('application', 'xhtml+xml');
/**
 */
export const APPLICATION_XML = MediaType.registered('application', 'xml');
/**
 */
export const APPLICATION_ZIP = MediaType.registered('application', 'zip');
/**
 */
export const FONT_TTF = MediaType.registered('font', 'ttf');
/**
 */
export const FONT_WOFF = MediaType.registered('font', 'woff');
/**
 */
export const FONT_WOFF2 = MediaType.registered('font', 'woff2');
/**
 */
export const IMAGE_BMP = MediaType.registered('image', 'bmp');
/**
 */
export const IMAGE_GIF = MediaType.registered('image', 'gif');
/**
 */
export const IMAGE_JPEG = MediaType.registered('image', 'jpeg');
/**
 */
export const IMAGE_PNG = MediaType.registered('image', 'png');
/**
 */
export const IMAGE_SVG_XML = MediaType.registered('image', 'svg+xml');
/**
 */
export const IMAGE_TIFF = MediaType.registered('image', 'tiff');
/**
 */
export const IMAGE_WEBP = MediaType.registered('image', 'webp');
/**
 */
export const IMAGE_X_ICON = MediaType.registered('image', 'x-icon');
/**
 */
export const MULTIPART_FORM_DATA = MediaType.registered('multipart', 'form-data');
/**
 */
export const TEXT_CSS = MediaType.registered('text', 'css');
/**
 */
export const TEXT_CSV = MediaType.registered('text', 'csv');
/**
 */
export const TEXT_EVENT_STREAM = MediaType.registered('text', 'event-stream');
/**
 */
export const TEXT_HTML = MediaType.registered('text', 'html');
/**
 */
export const TEXT_JAVASCRIPT = MediaType.registered('text', 'javascript');
/**
 */
export const TEXT_JSON = MediaType.registered('text', 'json');
/**
 */
export const TEXT_XML = MediaType.registered('text', 'xml');
/**
 */
export const TEXT_PLAIN = MediaType.registered('text', 'plain');
/**
 * Provisional media type per the TOON specification §17
 * (https://github.com/toon-format/spec) — `text/toon`, always UTF-8. Not yet
 * registered with IANA; kept as an inert token so user views/interceptors can
 * compose with it until the format settles (Ndigo pre-1.0).
 */
export const TEXT_TOON = MediaType.registered('text', 'toon');
/**
 */
export const WILDCARD = MediaType.registered('*', '*');
