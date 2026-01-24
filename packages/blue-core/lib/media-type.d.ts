/**
 * @author Jeff Rose
 */
import { Serializable, JSONValue } from './serializable';
import { Comparator, StringComparable } from './comparable';
import { Null } from './null';
import { Matchable } from './matchable';
export type QualityFactor = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;
export type SupportedMediaType = '*' | 'application' | 'audio' | 'font' | 'image' | 'message' | 'model' | 'multipart' | 'text' | 'video';
declare const QUALITY_FACTOR_PARAM = "q";
export type MediaTypeParameters = {
    [name: string]: string | number | boolean;
    [QUALITY_FACTOR_PARAM]?: string | number;
};
/**
 * Comparator to sort `MediaType` in order of specificity.
 * @class module:core~SpecificityComparator
 * @implements module:core.Comparator
 */
declare class SpecificityComparator<T extends MediaType> implements Comparator<T> {
    compare(mediaType1: T, mediaType2: T): number;
    compareParameters(mediaType1: T, mediaType2: T): number;
}
/**
 * @class module:core~QualityFactorComparator
 * @implements module:core.Comparator
 */
declare class QualityFactorComparator implements Comparator<MediaType> {
    compare(mediaType1: MediaType, mediaType2: MediaType): number;
}
/**
 * @class module:core.MediaType
 * @param {module:core.SupportedMediaType} type='*'
 * @param {external:string} subtype='*'
 * @param {module:core.MediaTypeParameters} parameters={}
 * @extends module:core.Null
 * @implements module:core.Serializable
 * @implements module:core.StringComparable
 */
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
    static for(mediaType: string): MediaType;
    static for(type: SupportedMediaType, subtype: string, parameters?: MediaTypeParameters): MediaType;
    static qualityFactorComparator: QualityFactorComparator;
    static specificityComparator: SpecificityComparator<MediaType>;
    constructor(type?: SupportedMediaType, subtype?: string, parameters?: MediaTypeParameters);
    /**
     * @function module:core.MediaType#compareTo
     * @param {module:core.MediaType} mediaType
     * @returns {external:number}
     */
    compareTo(mediaType: MediaType): number;
    /**
     * @function module:core.MediaType#compareToIgnoreCase
     * @param {module:core.MediaType} mediaType
     * @returns {external:number}
     */
    compareToIgnoreCase(mediaType: MediaType): number;
    equals(mediaType: MediaType): boolean;
    /**
     * Creates a new blob of the media type with the given parameters
     * @function module:core.MediaType#createBlob
     * @param {external:BufferSource | externsl:Blob | external:string } data
     * @param {external:string} endings
     * @returns {external:Blob} A new blob of the media type
     */
    createBlob(data?: BlobPart[], endings?: EndingType): Blob;
    /**
     * Indicates whether the `MediaType` includes the given `MediaType`.
     *
     * For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.
     * @function module:core.MediaType#includes
     * @param {module:core.MediaType} value
     * @returns {external:boolean} If this `MediaType` includes the given `MediaType`.
     */
    includes(value?: MediaType): boolean;
    matches(mediaType: MediaType): boolean;
    toJSON(): JSONValue;
    toString(): string;
    withCharset(charset: string): MediaType;
}
export {};
//# sourceMappingURL=media-type.d.ts.map