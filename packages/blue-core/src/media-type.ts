/**
 * @author Jeff Rose
 */

import { Serializable, JSONValue } from './serializable';
import { Comparator, StringComparable, stringComparator, numberComparator } from './comparable';
import { Null } from './null';
import {
    always,
    complement,
    cond,
    fromPairs,
    identity,
    ifElse,
    isEmpty,
    isNumber,
    isString,
    map,
    pipe,
    reduce,
    split,
    T,
    toPairs,
} from '@blue/util';
import { Matchable } from './matchable';

export type QualityFactor = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;
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
    alwaysEmptyString = always(''),
    alwaysOne = always(1.0),
    splitOnEquals = split('=') as (value: `${string}=${string}`) => [string, string],
    WILDCARD: SupportedMediaType = '*',
    QUALITY_FACTOR_PARAM = 'q';

export type MediaTypeParameters = {
    [name: string]: string | number | boolean;
    [QUALITY_FACTOR_PARAM]?: string | number;
};

/**
 * "*" or "application" or "audio" or "font" or "image" or "message" or "model" or "multipart" or "text" or "video"
 * @typedef {string} module:core.SupportedMediaType
 */

/**
 * @typedef {Object} module:core.MediaTypeParameters
 */

/**
 * @typedef {string} module:core.QualityFactor
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Quality_values}
 */

const stringifyParameters = ifElse(
    complement(isEmpty),
    pipe(
        toPairs,
        reduce((result, [key, value]: [string, string]) => `${result};${key}=${value}`, '')
    ),
    alwaysEmptyString
) as (value: MediaTypeParameters) => string;

/**
 * Comparator to sort `MediaType` in order of specificity.
 * @implements module:core.Comparator
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

/**
 */
const specificityComparator = new SpecificityComparator();

/**
 * @implements module:core.Comparator
 */
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

/**
 * @param {module:core.SupportedMediaType} type='*'
 * @param {string} subtype='*'
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
        return cond([
            [isString, parseFloat],
            [isNumber, identity],
            [T, alwaysOne],
        ])(this.parameters[QUALITY_FACTOR_PARAM]) as number;
    }

    static for(mediaType: string): MediaType;
    static for(type: SupportedMediaType, subtype: string, parameters?: MediaTypeParameters): MediaType;
    static for(
        typeOrExpression: SupportedMediaType | string,
        subtype: string = null,
        parameters: MediaTypeParameters = {}
    ): MediaType {
        const isParsed = isString(subtype),
            mediaTypeExpression = isParsed
                ? `${typeOrExpression as SupportedMediaType}/${subtype}${stringifyParameters(parameters)}`
                : typeOrExpression;

        if (mediaTypeExpression?.length) {
            if (!typeRegistry.has(mediaTypeExpression)) {
                if (isParsed) {
                    const mediaType = new MediaType(typeOrExpression as SupportedMediaType, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                } else {
                    const [type, subtype] = mediaTypeExpression.split('/') as [SupportedMediaType, string],
                        parts: string[] = subtype.split(';');

                    // Remove the subtype
                    parts.shift();

                    const // @ts-ignore: Cannot make the types for fromPairs happy -JBR
                        parameters = parts.length ? pipe(map(splitOnEquals, parts), fromPairs) : {},
                        mediaType = new MediaType(type, subtype, parameters);

                    typeRegistry.set(mediaTypeExpression, mediaType);
                }
            }
            return typeRegistry.get(mediaTypeExpression);
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

        if (subtype.indexOf('+') !== -1 && subtype.substr(-1) !== '+') {
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
    includes(value: MediaType = null): boolean {
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

    withCharset(charset: string): MediaType {
        return new MediaType(this.type, this.subtype, { charset: charset });
    }
}
