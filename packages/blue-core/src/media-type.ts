import { Serializable, JSONValue } from './serializable.js';
import { Comparator, StringComparable, stringComparator, numberComparator } from './comparable.js';
import { Null } from './null.js';
import { isString } from '@blue/util/types';
import { Matchable } from './matchable.js';
import { IllegalStateError } from './error.js';

/**
 * Represents a quality factor parameter for media types, typically used in HTTP Accept headers.
 * It's a number between 0.0 and 1.0, indicating preference.
 */
export type QualityFactor = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;
/**
 * Defines the set of supported top-level media types (e.g., 'application', 'audio', 'text').
 * The wildcard '*' is also supported.
 */
export type SupportedMediaType =
    | '*'
    | 'application'
    | 'audio'
    | 'font'
    | 'image'
    | 'message'
    | 'model'
    | 'multipart'
    | 'text'
    | 'video';

const { freeze, keys } = Object,
    { parseFloat } = Number,
    typeRegistry = new Map<string, MediaType>(),
    splitOnEquals = (value: `${string}=${string}`) => value.split('=') as [string, string],
    WILDCARD: SupportedMediaType = '*',
    QUALITY_FACTOR_PARAM = 'q';

/**
 * Represents the parameters associated with a media type, such as `charset` or `q` (quality factor).
 * Keys are parameter names, and values can be strings, numbers, or booleans.
 */
export type MediaTypeParameters = {
    [name: string]: string | number | boolean | undefined;
    [QUALITY_FACTOR_PARAM]?: string | number | boolean;
};

/**
 * Converts a `MediaTypeParameters` object into a formatted string suitable for a media type header.
 * Parameters are joined with semicolons, e.g., ";charset=utf-8;level=1".
 * @param value - The `MediaTypeParameters` object to stringify.
 * @returns A string representation of the parameters, or an empty string if no parameters are present.
 */
const stringifyParameters = (value: MediaTypeParameters): string => {
    const pairs = Object.entries(value);
    if (!pairs.length) return '';
    return pairs.reduce((result, [key, val]) => `${result};${key}=${val}`, '');
};

/**
 * Comparator to sort `MediaType` in order of specificity.
 */
class SpecificityComparator<T extends MediaType> implements Comparator<T> {
    compare(mediaType1: T, mediaType2: T): number {
        // */* < audio/*
        if (mediaType1.isWildcardType && !mediaType2.isWildcardType) {
            return 1;
            // audio/* > */*
        } else if (!mediaType1.isWildcardType && mediaType2.isWildcardType) {
            return -1;
            // audio/basic == text/html
        } else if (mediaType1.type !== mediaType2.type) {
            return 0;
            // mediaType1.type === mediaType2.type
        } else {
            // audio/* < audio/basic
            if (mediaType1.isWildcardSubtype && !mediaType2.isWildcardSubtype) {
                return 1;
                // audio/basic > audio/*
            } else if (!mediaType1.isWildcardSubtype && mediaType2.isWildcardSubtype) {
                return -1;
                // audio/basic == audio/wave
            } else if (mediaType1.subtype !== mediaType2.subtype) {
                return 0;
                // mediaType1.subtype === mediaType2.subtype
            } else {
                // audio/basic;level=1 < audio/basic
                return this.compareParameters(mediaType1, mediaType2);
            }
        }
    }

    compareParameters(mediaType1: T, mediaType2: T): number {
        const paramsSize1 = keys(mediaType1.parameters).length,
            paramsSize2 = keys(mediaType2.parameters).length;
        // audio/basic;level=1 < audio/basic
        return numberComparator.compare(paramsSize2, paramsSize1);
    }
}

const specificityComparator = new SpecificityComparator();

class QualityFactorComparator implements Comparator<MediaType> {
    compare(mediaType1: MediaType, mediaType2: MediaType): number {
        const quality1 = mediaType1.qualityFactor,
            quality2 = mediaType2.qualityFactor,
            qualityComparison = numberComparator.compare(quality2, quality1);
        return qualityComparison !== 0
            ? // audio/*;q=0.7 < audio/*;q=0.3
              qualityComparison
            : specificityComparator.compare(mediaType1, mediaType2);
    }
}

/**
 */
const qualityFactorComparator = new QualityFactorComparator();

export default class MediaType extends Null implements Serializable, StringComparable<MediaType>, Matchable<MediaType> {
    readonly experimental: boolean;
    readonly facets: string[];
    readonly parameters: MediaTypeParameters;
    readonly personal: boolean;
    readonly suffix: string | null;
    readonly subtype: string;
    readonly type: SupportedMediaType;
    readonly vendor: boolean;

    get [Symbol.toStringTag](): string {
        return `MediaType:${this.toString()}`;
    }

    get isWildcardType(): boolean {
        return this.type === WILDCARD;
    }

    get isWildcardSubtype(): boolean {
        return this.subtype === WILDCARD;
    }

    get qualityFactor(): number {
        const value = this.parameters[QUALITY_FACTOR_PARAM];
        if (isString(value)) {
            return parseFloat(value) as number;
        }
        if (typeof value === 'number') {
            return value as number;
        }
        return 1;
    }

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
    get baseType(): string {
        return `${this.type}/${this.subtype}`;
    }

    static for(mediaType: string): MediaType | null;
    static for(type: SupportedMediaType, subtype: string, parameters?: MediaTypeParameters): MediaType | null;
    static for(
        typeOrExpression: SupportedMediaType | string,
        subtype: string = WILDCARD,
        parameters: MediaTypeParameters = {}
    ): MediaType | null {
        const isParsed = isString(subtype) && subtype !== WILDCARD,
            mediaTypeExpression = isParsed
                ? `${typeOrExpression as SupportedMediaType}/${subtype}${stringifyParameters(parameters)}`
                : typeOrExpression;

        if (mediaTypeExpression?.length) {
            if (!typeRegistry.has(mediaTypeExpression)) {
                if (isParsed) {
                    const mediaType = new MediaType(typeOrExpression as SupportedMediaType, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                } else {
                    const slashIndex = mediaTypeExpression.indexOf('/');
                    if (slashIndex === -1) {
                        // No slash found - treat as type only with wildcard subtype
                        const mediaType = new MediaType(typeOrExpression as SupportedMediaType, WILDCARD, parameters);
                        typeRegistry.set(mediaTypeExpression, mediaType);
                    } else {
                        const type = mediaTypeExpression.substring(0, slashIndex) as SupportedMediaType,
                            fullSubtype = mediaTypeExpression.substring(slashIndex + 1),
                            parts: string[] = fullSubtype.split(';'),
                            sub = parts[0] || WILDCARD;

                        // Remove the subtype
                        parts.shift();

                        const parsedParameters: MediaTypeParameters = parts.length
                            ? (Object.fromEntries(
                                  parts.map(splitOnEquals as (value: string) => [string, string])
                              ) as MediaTypeParameters)
                            : {};
                        const mediaType = new MediaType(type, sub, parsedParameters);

                        typeRegistry.set(mediaTypeExpression, mediaType);
                    }
                }
            }
            return typeRegistry.get(mediaTypeExpression) as MediaType;
        }

        return null;
    }

    static qualityFactorComparator = qualityFactorComparator;

    static specificityComparator = specificityComparator;

    constructor(type: SupportedMediaType = WILDCARD, subtype: string = WILDCARD, parameters: MediaTypeParameters = {}) {
        super();

        this.type = type;
        this.parameters = parameters;

        this.vendor = false;
        this.personal = false;
        this.experimental = false;

        if (subtype.indexOf('+') !== -1 && subtype.slice(-1) !== '+') {
            const fixes = subtype.split('+', 2);
            this.subtype = fixes[0];
            this.facets = fixes[0].split('.');
            this.suffix = fixes[1];
        } else {
            this.subtype = subtype;
            this.facets = subtype.split('.');
            this.suffix = null;
        }

        if (this.facets.length > 0) {
            const first = this.facets[0];
            this.vendor = first === 'vnd';
            this.personal = first === 'prs';
            this.experimental = first === 'x' && this.subtype.substring(0, 2).toLowerCase() === 'x-';
        }

        freeze(this);
    }

    /**
     * @param {module:core.MediaType} mediaType
     * @returns {number}
     */
    compareTo(mediaType: MediaType): number {
        let comparison: number;

        // Compare type
        comparison = stringComparator.compare(this.type, mediaType.type);
        if (comparison !== 0) {
            return comparison;
        }

        // Compare subtype
        comparison = stringComparator.compare(this.subtype, mediaType.subtype);
        if (comparison !== 0) {
            return comparison;
        }

        // Compare parameter lengths
        const p1 = keys(this.parameters),
            p2 = keys(mediaType.parameters),
            l1 = p1.length,
            l2 = p2.length;
        comparison = l1 - l2;
        if (comparison !== 0) {
            return comparison;
        }

        // Compare individual parameters
        let index = 0,
            k1: string,
            v1: string,
            k2: string,
            v2: string;
        for (; index < l1; index++) {
            // Compare parameter keys
            k1 = p1[index];
            k2 = p2[index];
            comparison = stringComparator.compare(k1, k2);
            if (comparison !== 0) {
                return comparison;
            }
            // Compare parameter values
            v1 = String(this.parameters[k1]);
            v2 = String(mediaType.parameters[k2]);
            comparison = stringComparator.compare(v1, v2);
            if (comparison !== 0) {
                return comparison;
            }
        }

        return 0;
    }

    /**
     * @param {module:core.MediaType} mediaType
     * @returns {number}
     */
    compareToIgnoreCase(mediaType: MediaType): number {
        let comparison: number;

        // Compare type
        comparison = stringComparator.compareIgnoreCase(this.type, mediaType.type);
        if (comparison !== 0) {
            return comparison;
        }

        // Compare subtype
        comparison = stringComparator.compareIgnoreCase(this.subtype, mediaType.subtype);
        if (comparison !== 0) {
            return comparison;
        }

        // Compare parameter lengths
        const p1 = keys(this.parameters),
            p2 = keys(mediaType.parameters),
            l1 = p1.length,
            l2 = p2.length;
        comparison = l1 - l2;
        if (comparison !== 0) {
            return comparison;
        }

        // Compare individual parameters
        let index = 0,
            k1: string,
            v1: string,
            k2: string,
            v2: string;
        for (; index < l1; index++) {
            // Compare parameter keys
            k1 = p1[index];
            k2 = p2[index];
            comparison = stringComparator.compareIgnoreCase(k1, k2);
            if (comparison !== 0) {
                return comparison;
            }
            // Compare parameter values
            v1 = String(this.parameters[k1]);
            v2 = String(mediaType.parameters[k2]);
            comparison = stringComparator.compareIgnoreCase(v1, v2);
            if (comparison !== 0) {
                return comparison;
            }
        }

        return 0;
    }

    equals(mediaType: MediaType): boolean {
        return this.compareTo(mediaType) === 0;
    }

    /**
     * Creates a new blob of the media type with the given parameters
     * @param {BufferSource | externsl:Blob | external:string } data
     * @param {string} endings
     * @returns {Blob} A new blob of the media type
     */
    createBlob(data?: BlobPart[], endings: EndingType = 'transparent'): Blob {
        return new Blob(data, {
            type: this.toString(),
            endings: endings,
        });
    }

    /**
     * Indicates whether the `MediaType` includes the given `MediaType`.
     *
     * For example, `text/*` includes `text/plain` and `text/html`, `application/*+xml` includes `application/soap+xml`, etc.
     * @param {module:core.MediaType} value
     * @returns {boolean} If this `MediaType` includes the given `MediaType`.
     */
    includes(value?: MediaType): boolean {
        if (!value) {
            return false;
        }
        if (this.isWildcardType) {
            // */* includes anything
            return true;
        } else if (this.type === value.type) {
            if (this.subtype === value.subtype) {
                return true;
            }
            if (this.isWildcardSubtype) {
                // Wildcard with suffix, e.g. application/*+xml
                const thisPlusIndex = this.subtype.lastIndexOf('+');
                if (thisPlusIndex === -1) {
                    return true;
                } else {
                    // application/*+xml includes application/soap+xml
                    const valuePlusIndex = value.subtype.lastIndexOf('+');
                    if (valuePlusIndex !== -1) {
                        const thisSubtypeNoSuffix = this.subtype.substring(0, thisPlusIndex),
                            thisSubtypeSuffix = this.subtype.substring(thisPlusIndex + 1),
                            valueSubtypeSuffix = value.subtype.substring(valuePlusIndex + 1);
                        if (thisSubtypeSuffix === valueSubtypeSuffix && WILDCARD === thisSubtypeNoSuffix) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    matches(mediaType: MediaType): boolean {
        if (this.type === WILDCARD || mediaType.type === WILDCARD) {
            return true;
        } else if (this.type === mediaType.type && (this.subtype === WILDCARD || mediaType.subtype === WILDCARD)) {
            return true;
        } else {
            return this.type === mediaType.type && this.subtype === mediaType.subtype;
        }
    }

    toJSON(): JSONValue {
        return this.toString();
    }

    toString(): string {
        const mediaTypeString =
                this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`,
            parameterString = stringifyParameters(this.parameters),
            result = `${mediaTypeString}${parameterString}`;
        return result;
    }

    /**
     * Returns the default charset for this media type, if known.
     *
     * Currently returns 'utf-8' for all text/* and application/json media types.
     *
     * @returns {string | null} The default charset or null if unknown
     */
    getDefaultCharset(): string | null {
        return this.type === 'text' || (this.type === 'application' && this.subtype === 'json') ? 'utf-8' : null;
    }

    /**
     * Formats the media type for use in an HTTP Content-Type header.
     *
     * Optionally adds a default charset if none is present and the media type supports it.
     *
     * @param {Object} [options] Formatting options
     * @param {boolean} [options.autoCharset=true] Whether to automatically add a default charset
     * @returns {string} The formatted Content-Type string
     */
    toContentType(options?: { autoCharset?: boolean }): string {
        const base = this.toString();
        const autoCharset = options?.autoCharset ?? true;

        if (autoCharset && !this.parameters.charset) {
            const charset = this.getDefaultCharset();
            return charset ? `${base};charset=${charset}` : base;
        }

        return base;
    }

    withCharset(charset: string): MediaType {
        return new MediaType(this.type, this.subtype, { ...this.parameters, charset });
    }
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
export function parseMediaType(value: string): MediaType {
    if (!value || typeof value !== 'string') {
        throw new IllegalStateError(`Invalid media type: expected non-empty string, got ${typeof value}`);
    }

    const trimmed = value.trim();
    if (!trimmed) {
        throw new IllegalStateError('Invalid media type: empty string');
    }

    const result = MediaType.for(trimmed);
    if (!result) {
        throw new IllegalStateError(`Invalid media type: could not parse "${value}"`);
    }

    return result;
}
