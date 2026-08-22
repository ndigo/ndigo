/**
 * @author Jeff Rose
 */
import { Serializable, JSONValue } from './serializable.js';
import { Comparator, StringComparable } from './comparable.js';
import { Null } from './null.js';
import { Matchable } from './matchable.js';
/**
 * Represents a quality factor parameter for media types, typically used in HTTP Accept headers.
 * It's a number between 0.0 and 1.0, indicating preference.
 */
export type QualityFactor = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;
/**
 * Defines the set of supported top-level media types (e.g., 'application', 'audio', 'text').
 * The wildcard '*' is also supported.
 */
export type SupportedMediaType = '*' | 'application' | 'audio' | 'font' | 'image' | 'message' | 'model' | 'multipart' | 'text' | 'video';
declare const QUALITY_FACTOR_PARAM = "q";
/**
 * Represents the parameters associated with a media type, such as `charset` or `q` (quality factor).
 * Keys are parameter names, and values can be strings, numbers, or booleans.
 */
export type MediaTypeParameters = {
    [name: string]: string | number | boolean | undefined;
    [QUALITY_FACTOR_PARAM]?: string | number | boolean;
};
/**
 * Comparator to sort `MediaType` in order of specificity.
 */
declare class SpecificityComparator<T extends MediaType> implements Comparator<T> {
    compare(mediaType1: T, mediaType2: T): number;
    compareParameters(mediaType1: T, mediaType2: T): number;
}
declare class QualityFactorComparator implements Comparator<MediaType> {
    compare(mediaType1: MediaType, mediaType2: MediaType): number;
}
export default class MediaType extends Null implements Serializable, StringComparable<MediaType>, Matchable<MediaType> {
    readonly experimental: boolean;
    readonly facets: string[];
    readonly parameters: MediaTypeParameters;
    readonly personal: boolean;
    readonly suffix: string | null;
    readonly subtype: string;
    readonly type: SupportedMediaType;
    readonly vendor: boolean;
    get [Symbol.toStringTag](): string;
    get isWildcardType(): boolean;
    get isWildcardSubtype(): boolean;
    get qualityFactor(): number;
    /**
     * Returns the base media type without parameters or suffix.
     *
     * Provides simple string format for matching (e.g., "text/html", "application/json").
     *
     * @returns Base type as "type/subtype" string
     *
     * @example
     * ```typescript
     * const mt = MediaType.for('text/html;charset=UTF-8');
     * mt.baseType; // "text/html"
     *
     * const mt2 = MediaType.for('application/atom+xml');
     * mt2.baseType; // "application/atom" (excludes suffix)
     * ```
     */
    get baseType(): string;
    static for(mediaType: string): MediaType | null;
    static for(type: SupportedMediaType, subtype: string, parameters?: MediaTypeParameters): MediaType | null;
    static qualityFactorComparator: QualityFactorComparator;
    static specificityComparator: SpecificityComparator<MediaType>;
    constructor(type?: SupportedMediaType, subtype?: string, parameters?: MediaTypeParameters);
    /**
     * @param {module:core.MediaType} mediaType
     * @returns {number}
     */
    compareTo(mediaType: MediaType): number;
    /**
     * @param {module:core.MediaType} mediaType
     * @returns {number}
     */
    compareToIgnoreCase(mediaType: MediaType): number;
    equals(mediaType: MediaType): boolean;
    /**
     * Creates a new blob of the media type with the given parameters
     * @param {BufferSource | externsl:Blob | external:string } data
     * @param {string} endings
     * @returns {Blob} A new blob of the media type
     */
    createBlob(data?: BlobPart[], endings?: EndingType): Blob;
    /**
     * Indicates whether the `MediaType` includes the given `MediaType`.
     *
     * For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.
     * @param {module:core.MediaType} value
     * @returns {boolean} If this `MediaType` includes the given `MediaType`.
     */
    includes(value?: MediaType): boolean;
    matches(mediaType: MediaType): boolean;
    toJSON(): JSONValue;
    toString(): string;
    /**
     * Returns the default charset for this media type, if known.
     *
     * Currently returns 'utf-8' for all text/* and application/json media types.
     *
     * @returns {string | null} The default charset or null if unknown
     */
    getDefaultCharset(): string | null;
    /**
     * Formats the media type for use in an HTTP Content-Type header.
     *
     * Optionally adds a default charset if none is present and the media type supports it.
     *
     * @param {Object} [options] Formatting options
     * @param {boolean} [options.autoCharset=true] Whether to automatically add a default charset
     * @returns {string} The formatted Content-Type string
     */
    toContentType(options?: {
        autoCharset?: boolean;
    }): string;
    withCharset(charset: string): MediaType;
}
/**
 * Parses a media type string into a MediaType instance.
 *
 * Standalone function for functional programming style and Transform Pipeline usage.
 *
 * @param {string} value - Media type string (e.g., "text/html;charset=UTF-8")
 * @returns {MediaType} MediaType instance from registry
 * @throws {IllegalStateError} If value is invalid or cannot be parsed
 */
export declare function parseMediaType(value: string): MediaType;
export {};
