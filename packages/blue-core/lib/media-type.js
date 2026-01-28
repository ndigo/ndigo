/**
 * @author Jeff Rose
 */
import { stringComparator, numberComparator } from './comparable';
import { Null } from './null';
import { always, complement, cond, fromPairs, identity, ifElse, isEmpty, isNumber, isString, map, pipe, reduce, split, T, toPairs, } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZWRpYS10eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBR0gsT0FBTyxFQUFnQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUNoRyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQzlCLE9BQU8sRUFDSCxNQUFNLEVBQ04sVUFBVSxFQUNWLElBQUksRUFDSixTQUFTLEVBQ1QsUUFBUSxFQUNSLE1BQU0sRUFDTixPQUFPLEVBQ1AsUUFBUSxFQUNSLFFBQVEsRUFDUixHQUFHLEVBQ0gsSUFBSSxFQUNKLE1BQU0sRUFDTixLQUFLLEVBQ0wsQ0FBQyxFQUNELE9BQU8sR0FDVixNQUFNLFlBQVksQ0FBQztBQWdCcEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQzNCLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxFQUN2QixZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXFCLEVBQzNDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFDOUIsU0FBUyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFDdkIsYUFBYSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQXVELEVBQ2hGLFFBQVEsR0FBdUIsR0FBRyxFQUNsQyxvQkFBb0IsR0FBRyxHQUFHLENBQUM7QUFPL0I7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FDOUIsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUNuQixJQUFJLENBQ0EsT0FBTyxFQUNQLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQW1CLEVBQUUsRUFBRSxDQUFDLEdBQUcsTUFBTSxJQUFJLEdBQUcsSUFBSSxLQUFLLEVBQUUsRUFBRSxFQUFFLENBQUMs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