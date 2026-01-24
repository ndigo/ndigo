/**
 * @author Jeff Rose
 */
import { stringComparator, numberComparator } from './comparable';
import { Null } from './null';
import { always, complement, cond, fromPairs, identity, ifElse, isEmpty, isNumber, isString, map, pipe, reduce, split, T, toPairs, } from '@blue/util';
const { freeze, keys } = Object, { parseFloat } = Number, typeRegistry = new Map(), alwaysEmptyString = always(''), alwaysOne = always(1.0), splitOnEquals = split('='), WILDCARD = '*', QUALITY_FACTOR_PARAM = 'q';
/**
 * "*" or "application" or "audio" or "font" or "image" or "message" or "model" or "multipart" or "text" or "video"
 * @typedef {external:string} module:core.SupportedMediaType
 */
/**
 * @typedef {external:Object} module:core.MediaTypeParameters
 */
/**
 * @typedef {external:string} module:core.QualityFactor
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Quality_values}
 */
const stringifyParameters = ifElse(complement(isEmpty), pipe(toPairs, reduce((result, [key, value]) => `${result};${key}=${value}`, '')), alwaysEmptyString);
/**
 * Comparator to sort `MediaType` in order of specificity.
 * @class module:core~SpecificityComparator
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
 * @const {module:core~SpecificityComparator} module:core.specificityComparator
 */
const specificityComparator = new SpecificityComparator();
/**
 * @class module:core~QualityFactorComparator
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
 * @const {module:core~QualityFactorComparator} module:core.qualityFactorComparator
 */
const qualityFactorComparator = new QualityFactorComparator();
/**
 * @class module:core.MediaType
 * @param {module:core.SupportedMediaType} type='*'
 * @param {external:string} subtype='*'
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
     * @function module:core.MediaType#compareTo
     * @param {module:core.MediaType} mediaType
     * @returns {external:number}
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
     * @function module:core.MediaType#compareToIgnoreCase
     * @param {module:core.MediaType} mediaType
     * @returns {external:number}
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
     * @function module:core.MediaType#createBlob
     * @param {external:BufferSource | externsl:Blob | external:string } data
     * @param {external:string} endings
     * @returns {external:Blob} A new blob of the media type
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
     * @function module:core.MediaType#includes
     * @param {module:core.MediaType} value
     * @returns {external:boolean} If this `MediaType` includes the given `MediaType`.
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