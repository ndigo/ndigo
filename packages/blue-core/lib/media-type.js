/**
 * @author Jeff Rose
 */
import { stringComparator, numberComparator } from './comparable';
import { Null } from './null';
import { always, identity, pipe, T } from '@blue/util/function';
import { fromPairs, map, reduce } from '@blue/util/list';
import { complement, cond, ifElse, isEmpty } from '@blue/util/logic';
import { toPairs } from '@blue/util/object';
import { split } from '@blue/util/string';
import { isNumber, isString } from '@blue/util/types';
const { freeze, keys } = Object, { parseFloat } = Number, typeRegistry = new Map(), alwaysEmptyString = always(''), alwaysOne = always(1.0), splitOnEquals = split('='), WILDCARD = '*', QUALITY_FACTOR_PARAM = 'q';
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
const stringifyParameters = ifElse(complement(isEmpty), pipe(toPairs, reduce((result, [key, value]) => `${result};${key}=${value}`, '')), alwaysEmptyString);
/**
 * Comparator to sort `MediaType` in order of specificity.
 * @implements module:core.Comparator
 */
class SpecificityComparator {
    compare(mediaType1, mediaType2) {
        // */* < audio/*
        if (mediaType1.isWildcardType && !mediaType2.isWildcardType) {
            return 1;
            // audio/* > */*
        }
        else if (!mediaType1.isWildcardType && mediaType2.isWildcardType) {
            return -1;
            // audio/basic == text/html
        }
        else if (mediaType1.type !== mediaType2.type) {
            return 0;
            // mediaType1.type === mediaType2.type
        }
        else {
            // audio/* < audio/basic
            if (mediaType1.isWildcardSubtype && !mediaType2.isWildcardSubtype) {
                return 1;
                // audio/basic > audio/*
            }
            else if (!mediaType1.isWildcardSubtype && mediaType2.isWildcardSubtype) {
                return -1;
                // audio/basic == audio/wave
            }
            else if (mediaType1.subtype !== mediaType2.subtype) {
                return 0;
                // mediaType1.subtype === mediaType2.subtype
            }
            else {
                // audio/basic;level=1 < audio/basic
                return this.compareParameters(mediaType1, mediaType2);
            }
        }
    }
    compareParameters(mediaType1, mediaType2) {
        const paramsSize1 = keys(mediaType1.parameters).length, paramsSize2 = keys(mediaType2.parameters).length;
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
class QualityFactorComparator {
    compare(mediaType1, mediaType2) {
        const quality1 = mediaType1.qualityFactor, quality2 = mediaType2.qualityFactor, qualityComparison = numberComparator.compare(quality2, quality1);
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
export default class MediaType extends Null {
    experimental;
    facets;
    parameters;
    personal;
    suffix;
    subtype;
    type;
    vendor;
    get [Symbol.toStringTag]() {
        return `MediaType:${this.toString()}`;
    }
    get isWildcardType() {
        return this.type === WILDCARD;
    }
    get isWildcardSubtype() {
        return this.subtype === WILDCARD;
    }
    get qualityFactor() {
        return cond([
            [isString, parseFloat],
            [isNumber, identity],
            [T, alwaysOne],
        ])(this.parameters[QUALITY_FACTOR_PARAM]);
    }
    static for(typeOrExpression, subtype = null, parameters = {}) {
        const isParsed = isString(subtype), mediaTypeExpression = isParsed
            ? `${typeOrExpression}/${subtype}${stringifyParameters(parameters)}`
            : typeOrExpression;
        if (mediaTypeExpression?.length) {
            if (!typeRegistry.has(mediaTypeExpression)) {
                if (isParsed) {
                    const mediaType = new MediaType(typeOrExpression, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                }
                else {
                    const [type, subtype] = mediaTypeExpression.split('/'), parts = subtype.split(';');
                    // Remove the subtype
                    parts.shift();
                    const // @ts-ignore: Cannot make the types for fromPairs happy -JBR
                    parameters = parts.length ? pipe(map(splitOnEquals, parts), fromPairs) : {}, mediaType = new MediaType(type, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                }
            }
            return typeRegistry.get(mediaTypeExpression);
        }
        return null;
    }
    static qualityFactorComparator = qualityFactorComparator;
    static specificityComparator = specificityComparator;
    constructor(type = WILDCARD, subtype = WILDCARD, parameters = {}) {
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
        }
        else {
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
    compareTo(mediaType) {
        let comparison;
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
        const p1 = keys(this.parameters), p2 = keys(mediaType.parameters), l1 = p1.length, l2 = p2.length;
        comparison = l1 - l2;
        if (comparison !== 0) {
            return comparison;
        }
        // Compare individual parameters
        let index = 0, k1, v1, k2, v2;
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
    compareToIgnoreCase(mediaType) {
        let comparison;
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
        const p1 = keys(this.parameters), p2 = keys(mediaType.parameters), l1 = p1.length, l2 = p2.length;
        comparison = l1 - l2;
        if (comparison !== 0) {
            return comparison;
        }
        // Compare individual parameters
        let index = 0, k1, v1, k2, v2;
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
    equals(mediaType) {
        return this.compareTo(mediaType) === 0;
    }
    /**
     * Creates a new blob of the media type with the given parameters
     * @param {BufferSource | externsl:Blob | external:string } data
     * @param {string} endings
     * @returns {Blob} A new blob of the media type
     */
    createBlob(data, endings = 'transparent') {
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
    includes(value = null) {
        if (!value) {
            return false;
        }
        if (this.isWildcardType) {
            // */* includes anything
            return true;
        }
        else if (this.type === value.type) {
            if (this.subtype === value.subtype) {
                return true;
            }
            if (this.isWildcardSubtype) {
                // Wildcard with suffix, e.g. application/*+xml
                const thisPlusIndex = this.subtype.lastIndexOf('+');
                if (thisPlusIndex === -1) {
                    return true;
                }
                else {
                    // application/*+xml includes application/soap+xml
                    const valuePlusIndex = value.subtype.lastIndexOf('+');
                    if (valuePlusIndex !== -1) {
                        const thisSubtypeNoSuffix = this.subtype.substring(0, thisPlusIndex), thisSubtypeSuffix = this.subtype.substring(thisPlusIndex + 1), valueSubtypeSuffix = value.subtype.substring(valuePlusIndex + 1);
                        if (thisSubtypeSuffix === valueSubtypeSuffix && WILDCARD === thisSubtypeNoSuffix) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
    matches(mediaType) {
        if (this.type === WILDCARD || mediaType.type === WILDCARD) {
            return true;
        }
        else if (this.type === mediaType.type && (this.subtype === WILDCARD || mediaType.subtype === WILDCARD)) {
            return true;
        }
        else {
            return this.type === mediaType.type && this.subtype === mediaType.subtype;
        }
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        const mediaTypeString = this.suffix === null ? `${this.type}/${this.subtype}` : `${this.type}/${this.subtype}+${this.suffix}`, parameterString = stringifyParameters(this.parameters), result = `${mediaTypeString}${parameterString}`;
        return result;
    }
    withCharset(charset) {
        return new MediaType(this.type, this.subtype, { charset: charset });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZWRpYS10eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFnQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUNoRyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNoRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDckUsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUMxQyxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBZ0J0RCxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLE1BQU0sRUFDM0IsRUFBRSxVQUFVLEVBQUUsR0FBRyxNQUFNLEVBQ3ZCLFlBQVksR0FBRyxJQUFJLEdBQUcsRUFBcUIsRUFDM0MsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUM5QixTQUFTLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUN2QixhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBdUQsRUFDaEYsUUFBUSxHQUF1QixHQUFHLEVBQ2xDLG9CQUFvQixHQUFHLEdBQUcsQ0FBQztBQU8vQjs7O0dBR0c7QUFFSDs7R0FFRztBQUVIOzs7R0FHRztBQUVILE1BQU0sbUJBQW1CLEdBQUcsTUFBTSxD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