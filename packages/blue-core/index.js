(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("@blue/util"), require("@blue/parser"));
	else if(typeof define === 'function' && define.amd)
		define(["@blue/util", "@blue/parser"], factory);
	else if(typeof exports === 'object')
		exports["blue-core"] = factory(require("@blue/util"), require("@blue/parser"));
	else
		root["blue-core"] = factory(root["@blue/util"], root["@blue/parser"]);
})(globalThis, (__WEBPACK_EXTERNAL_MODULE__3__, __WEBPACK_EXTERNAL_MODULE__16__) => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "APPLICATION_FORM_URLENCODED": () => (/* binding */ APPLICATION_FORM_URLENCODED),
/* harmony export */   "APPLICATION_JAVASCRIPT": () => (/* binding */ APPLICATION_JAVASCRIPT),
/* harmony export */   "APPLICATION_JSON": () => (/* binding */ APPLICATION_JSON),
/* harmony export */   "APPLICATION_OCTET_STREAM": () => (/* binding */ APPLICATION_OCTET_STREAM),
/* harmony export */   "APPLICATION_PDF": () => (/* binding */ APPLICATION_PDF),
/* harmony export */   "APPLICATION_SSML_XML": () => (/* binding */ APPLICATION_SSML_XML),
/* harmony export */   "APPLICATION_SVG_XML": () => (/* binding */ APPLICATION_SVG_XML),
/* harmony export */   "APPLICATION_XHTML": () => (/* binding */ APPLICATION_XHTML),
/* harmony export */   "APPLICATION_XHTML_XML": () => (/* binding */ APPLICATION_XHTML_XML),
/* harmony export */   "APPLICATION_XML": () => (/* binding */ APPLICATION_XML),
/* harmony export */   "APPLICATION_ZIP": () => (/* binding */ APPLICATION_ZIP),
/* harmony export */   "FONT_TTF": () => (/* binding */ FONT_TTF),
/* harmony export */   "FONT_WOFF": () => (/* binding */ FONT_WOFF),
/* harmony export */   "IMAGE_BMP": () => (/* binding */ IMAGE_BMP),
/* harmony export */   "IMAGE_GIF": () => (/* binding */ IMAGE_GIF),
/* harmony export */   "IMAGE_JPEG": () => (/* binding */ IMAGE_JPEG),
/* harmony export */   "IMAGE_PNG": () => (/* binding */ IMAGE_PNG),
/* harmony export */   "IMAGE_SVG_XML": () => (/* binding */ IMAGE_SVG_XML),
/* harmony export */   "IMAGE_TIFF": () => (/* binding */ IMAGE_TIFF),
/* harmony export */   "IMAGE_WEBP": () => (/* binding */ IMAGE_WEBP),
/* harmony export */   "IMAGE_X_ICON": () => (/* binding */ IMAGE_X_ICON),
/* harmony export */   "MULTIPART_FORM_DATA": () => (/* binding */ MULTIPART_FORM_DATA),
/* harmony export */   "TEXT_CSS": () => (/* binding */ TEXT_CSS),
/* harmony export */   "TEXT_CSV": () => (/* binding */ TEXT_CSV),
/* harmony export */   "TEXT_HTML": () => (/* binding */ TEXT_HTML),
/* harmony export */   "TEXT_JSON": () => (/* binding */ TEXT_JSON),
/* harmony export */   "TEXT_PLAIN": () => (/* binding */ TEXT_PLAIN),
/* harmony export */   "TEXT_XML": () => (/* binding */ TEXT_XML),
/* harmony export */   "WILDCARD": () => (/* binding */ WILDCARD)
/* harmony export */ });
/* harmony import */ var _media_type__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(2);
/**
 * @author Jeff Rose
 */

/**
 * @namespace module:core.MediaTypes
 */
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_FORM_URLENCODED
 */
const APPLICATION_FORM_URLENCODED = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'x-www-form-urlencoded');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_OCTET_STREAM
 */
const APPLICATION_OCTET_STREAM = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'octet-stream');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_JAVASCRIPT
 */
const APPLICATION_JAVASCRIPT = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'javascript');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_JSON
 */
const APPLICATION_JSON = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'json');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_PDF
 */
const APPLICATION_PDF = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'pdf');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_SSML_XML
 */
const APPLICATION_SSML_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'ssml+xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_SVG_XML
 */
const APPLICATION_SVG_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'svg+xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_XHTML
 */
const APPLICATION_XHTML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'xhtml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_XHTML_XML
 */
const APPLICATION_XHTML_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'xhtml+xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_XML
 */
const APPLICATION_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.APPLICATION_ZIP
 */
const APPLICATION_ZIP = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('application', 'zip');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.FONT_TTF
 */
const FONT_TTF = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('font', 'ttf');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.FONT_WOFF
 */
const FONT_WOFF = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('font', 'woff');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_BMP
 */
const IMAGE_BMP = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'bmp');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_GIF
 */
const IMAGE_GIF = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'gif');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_JPEG
 */
const IMAGE_JPEG = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'jpeg');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_PNG
 */
const IMAGE_PNG = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'png');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_SVG_XML
 */
const IMAGE_SVG_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'svg+xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_TIFF
 */
const IMAGE_TIFF = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'tiff');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_WEBP
 */
const IMAGE_WEBP = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'webp');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.IMAGE_X_ICON
 */
const IMAGE_X_ICON = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('image', 'x-icon');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.MULTIPART_FORM_DATA
 */
const MULTIPART_FORM_DATA = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('multipart', 'form-data');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_CSS
 */
const TEXT_CSS = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'css');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_CSV
 */
const TEXT_CSV = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'csv');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_HTML
 */
const TEXT_HTML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'html');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_JSON
 */
const TEXT_JSON = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'json');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_XML
 */
const TEXT_XML = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'xml');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.TEXT_PLAIN
 */
const TEXT_PLAIN = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('text', 'plain');
/**
 * @const {module:core.MediaType} module:core.MediaTypes.WILDCARD
 */
const WILDCARD = _media_type__WEBPACK_IMPORTED_MODULE_0__["default"]["for"]('*', '*');
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtdHlwZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbWVkaWEtdHlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBRUgsT0FBTyxTQUFTLE1BQU0sY0FBYyxDQUFDO0FBRXJDOztHQUVHO0FBRUg7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFFLGFBQWEsRUFBRSx1QkFBdUIsQ0FBRSxDQUFDO0FBQ25HOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sd0JBQXdCLEdBQU0sU0FBUyxDQUFDLEdBQUcsQ0FBRSxhQUFhLEVBQUUsY0FBYyxDQUFFLENBQUM7QUFDMUY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxzQkFBc0IsR0FBUSxTQUFTLENBQUMsR0FBRyxDQUFFLGFBQWEsRUFBRSxZQUFZLENBQUUsQ0FBQztBQUN4Rjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGdCQUFnQixHQUFjLFNBQVMsQ0FBQyxHQUFHLENBQUUsYUFBYSxFQUFFLE1BQU0sQ0FBRSxDQUFDO0FBQ2xGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFlLFNBQVMsQ0FBQyxHQUFHLENBQUUsYUFBYSxFQUFFLEtBQUssQ0FBRSxDQUFDO0FBQ2pGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQVUsU0FBUyxDQUFDLEdBQUcsQ0FBRSxhQUFhLEVBQUUsVUFBVSxDQUFFLENBQUM7QUFDdEY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxtQkFBbUIsR0FBVyxTQUFTLENBQUMsR0FBRyxDQUFFLGFBQWEsRUFBRSxTQUFTLENBQUUsQ0FBQztBQUNyRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFhLFNBQVMsQ0FBQyxHQUFHLENBQUUsYUFBYSxFQUFFLE9BQU8sQ0FBRSxDQUFDO0FBQ25GOztHQUVHO0FBQ0gsTUFBTSxD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

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ MediaType)
/* harmony export */ });
/* harmony import */ var _comparable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(4);
/* harmony import */ var _null__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */



const { freeze, keys } = Object, { parseFloat } = Number, typeRegistry = new Map(), alwaysEmptyString = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.always)(''), alwaysOne = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.always)(1.0), splitOnEquals = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.split)('='), WILDCARD = '*', QUALITY_FACTOR_PARAM = 'q';
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
const stringifyParameters = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.ifElse)((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isEmpty), (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.toPairs, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.reduce)((result, [key, value]) => `${result};${key}=${value}`, '')), alwaysEmptyString);
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
        return _comparable__WEBPACK_IMPORTED_MODULE_1__.numberComparator.compare(paramsSize2, paramsSize1);
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
        const quality1 = mediaType1.qualityFactor, quality2 = mediaType2.qualityFactor, qualityComparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.numberComparator.compare(quality2, quality1);
        return qualityComparison !== 0 ?
            // audio/*;q=0.7 < audio/*;q=0.3
            qualityComparison :
            specificityComparator.compare(mediaType1, mediaType2);
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
class MediaType extends _null__WEBPACK_IMPORTED_MODULE_2__.Null {
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
        return (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.isString, parseFloat],
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.isNumber, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, alwaysOne]
        ])(this.parameters[QUALITY_FACTOR_PARAM]);
    }
    static for(typeOrExpression, subtype = null, parameters = {}) {
        const isParsed = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.isString)(subtype), mediaTypeExpression = isParsed ?
            `${typeOrExpression}/${subtype}${stringifyParameters(parameters)}` :
            typeOrExpression;
        if (mediaTypeExpression === null || mediaTypeExpression === void 0 ? void 0 : mediaTypeExpression.length) {
            if (!typeRegistry.has(mediaTypeExpression)) {
                if (isParsed) {
                    const mediaType = new MediaType(typeOrExpression, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                }
                else {
                    const [type, subtype] = mediaTypeExpression.split('/'), parts = subtype.split(';');
                    // Remove the subtype
                    parts.shift();
                    const
                    // @ts-ignore: Cannot make the types for fromPairs happy -JBR
                    parameters = parts.length ? (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.map)(splitOnEquals, parts), _blue_util__WEBPACK_IMPORTED_MODULE_0__.fromPairs) : {}, mediaType = new MediaType(type, subtype, parameters);
                    typeRegistry.set(mediaTypeExpression, mediaType);
                }
            }
            return typeRegistry.get(mediaTypeExpression);
        }
        return null;
    }
    /**
     * @function module:core.MediaType#compareTo
     * @param {module:core.MediaType} mediaType
     * @returns {external:number}
     */
    compareTo(mediaType) {
        let comparison;
        // Compare type
        comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compare(this.type, mediaType.type);
        if (comparison !== 0) {
            return comparison;
        }
        // Compare subtype
        comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compare(this.subtype, mediaType.subtype);
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
            comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compare(k1, k2);
            if (comparison !== 0) {
                return comparison;
            }
            // Compare parameter values
            v1 = String(this.parameters[k1]);
            v2 = String(mediaType.parameters[k2]);
            comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compare(v1, v2);
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
        comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compareIgnoreCase(this.type, mediaType.type);
        if (comparison !== 0) {
            return comparison;
        }
        // Compare subtype
        comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compareIgnoreCase(this.subtype, mediaType.subtype);
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
            comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compareIgnoreCase(k1, k2);
            if (comparison !== 0) {
                return comparison;
            }
            // Compare parameter values
            v1 = String(this.parameters[k1]);
            v2 = String(mediaType.parameters[k2]);
            comparison = _comparable__WEBPACK_IMPORTED_MODULE_1__.stringComparator.compareIgnoreCase(v1, v2);
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
            endings: endings
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
        const mediaTypeString = this.suffix === null ?
            `${this.type}/${this.subtype}` :
            `${this.type}/${this.subtype}+${this.suffix}`, parameterString = stringifyParameters(this.parameters), result = `${mediaTypeString}${parameterString}`;
        return result;
    }
    withCharset(charset) {
        return new MediaType(this.type, this.subtype, { charset: charset });
    }
}
MediaType.qualityFactorComparator = qualityFactorComparator;
MediaType.specificityComparator = specificityComparator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtdHlwZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tZWRpYS10eXBlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUdILE9BQU8sRUFBZ0MsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDaEcsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUM5QixPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFNdEosTUFDSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxNQUFNLEVBQ3pCLEVBQUUsVUFBVSxFQUFFLEdBQUcsTUFBTSxFQUV2QixZQUFZLEdBQUcsSUFBSSxHQUFHLEVBQXFCLEVBRTNDLGlCQUFpQixHQUFHLE1BQU0sQ0FBRSxFQUFFLENBQUUsRUFDaEMsU0FBUyxHQUFHLE1BQU0sQ0FBRSxHQUFHLENBQUUsRUFDekIsYUFBYSxHQUFHLEtBQUssQ0FBRSxHQUFHLENBQWdFLEVBRTFGLFFBQVEsR0FBdUIsR0FBRyxFQUNsQyxvQkFBb0IsR0FBRyxHQUFHLENBQUM7QUFPL0I7OztHQUdHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSCxNQUFNLG1CQUFtQixHQUFHLE1BQU0sQ0FBRSxVQUFVLENBQUUsT0FBTyxDQUFFLEVBQ3JELElBQUksQ0FBRSxPQUFPLEVBQUUsTUFBTSxDQUFFLENBQUUsTUFBTSxFQUFFLENBQUUsR0FBRyxFQUFFLEtBQUssQ0FBc0IsRUFBRyxFQUFFLENBQUMsR0FBSSxNQUFPLElBQUssR0FBSSxJQUFLLEtBQU0sRUFBRSxFQUFHLEVBQUUsQ0FBRSxD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

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__3__;

/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractValueComparator": () => (/* binding */ AbstractValueComparator),
/* harmony export */   "comparableComparator": () => (/* binding */ comparableComparator),
/* harmony export */   "dateComparator": () => (/* binding */ dateComparator),
/* harmony export */   "invertComparison": () => (/* binding */ invertComparison),
/* harmony export */   "likeComparable": () => (/* binding */ likeComparable),
/* harmony export */   "likeComparator": () => (/* binding */ likeComparator),
/* harmony export */   "naturalComparison": () => (/* binding */ naturalComparison),
/* harmony export */   "numberComparator": () => (/* binding */ numberComparator),
/* harmony export */   "stringComparator": () => (/* binding */ stringComparator)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

/**
 * Compares its two arguments for order. Returns a negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 * @template T
 * @callback module:core.comparison
 * @param {T} value1
 * @param {T} value2
 * @returns {external:number} A negative integer, zero, or a positive integer as the first argument is less than, equal to, or greater than the second.
 */
/**
 * @interface module:core.Comparable
 */
/**
 * Compares this object with the specified object for order. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @function module:core.Comparable#compareTo
 * @returns {external:number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
 * @interface module:core.StringComparable
 * @extends module:core.Comparable
 */
/**
 * Compares this string-based object with the specified string-based object for order, ignoring case. Returns a negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 * @function module:core.StringComparable#compareToIgnoreCase
 * @returns {external:number} A negative integer, zero, or a positive integer as this object is less than, equal to, or greater than the specified object.
 */
/**
 * @interface module:core.Comparator
 * @property {module:core.comparison} compare
 */
const { defineProperty } = Reflect, naturalPredicate = (value1, value2) => value1 < value2;
class AbstractValueComparator {
    constructor(value) {
        defineProperty(this, 'value', {
            value: value,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    get [Symbol.toStringTag]() {
        return 'ValueComparator';
    }
}
/**
 * @abstract
 * @class module:core.AbstractValueComparator
 * @implements module:core.Comparator<external:string>
 */
/**
 * @function module:core.likeComparable
 */
const likeComparable = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ compareTo: Function });
/**
 * @function module:core.likeComparator
 */
const likeComparator = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ compare: Function });
/**
 * @const {module:core.comparison} module:core.naturalComparison
 */
const naturalComparison = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.comparator)(naturalPredicate);
/**
 * @const {external:Function} module:core.invertComparison
 * @param {module:core.comparison} compare The comparison to invert
 * @returns {module:core.comparison} The inverted comparison
 */
const invertComparison = (compare) => (value1, value2) => -compare(value1, value2);
/**
 * @class module:core~PredicateComparator
 * @implements module:core.Comparator
 */
class PredicateComparator {
    constructor(pred) {
        defineProperty(this, 'compare', {
            value: (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.comparator)(pred),
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    get [Symbol.toStringTag]() {
        return 'PredicateComparator';
    }
}
/**
 * @class module:core~NaturalComparator
 * @extends module:core~PredicateComparator
 */
class NaturalComparator extends PredicateComparator {
    constructor() {
        super(naturalPredicate);
    }
}
/**
 * Comparator that adapts Comparables to the Comparator interface. Mainly for internal use in other Comparators, when supposed to work on Comparables.
 * @class module:core.ComparableComparator
 * @implements module:core.Comparator
 */
class ComparableComparator {
    compare(value1, value2) {
        return value1.compareTo(value2);
    }
}
/**
 * @class module:core~DateComparator
 * @extends module:core~PredicateComparator
 */
class DateComparator extends PredicateComparator {
    constructor() {
        super(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isBefore);
    }
}
/**
 * @class module:core~NumberComparator
 * @extends module:core~NaturalComparator
 */
class NumberComparator extends NaturalComparator {
}
/**
 * @class module:core~StringComparator
 * @extends module:core~NaturalComparator
 */
class StringComparator extends NaturalComparator {
    compareIgnoreCase(value1, value2) {
        return typeof value1 === 'string' && typeof value2 === 'string' && this.compare(value1.toLowerCase(), value2.toLowerCase());
    }
}
/**
 * @const {module:core~ComparableComparator} module:core.comparableComparator
 */
const comparableComparator = new ComparableComparator();
/**
 * @const {module:core~DateComparator} module:core.dateComparator
 */
const dateComparator = new DateComparator();
/**
 * @const {module:core~NumberComparator} module:core.numberComparator
 */
const numberComparator = new NumberComparator();
/**
 * @const {module:core~StringComparator} module:core.stringComparator
 */
const stringComparator = new StringComparator();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGFyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21wYXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLFlBQVksQ0FBQztBQWtCeEQ7Ozs7Ozs7R0FPRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSCxNQUNJLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM1QixnQkFBZ0IsR0FBRyxDQUFLLE1BQVMsRUFBRSxNQUFTLEVBQVksRUFBRSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFFL0UsTUFBTSxPQUFnQix1QkFBdUI7SUFPekMsWUFBYSxLQUFhO1FBQ3RCLGNBQWMsQ0FBRSxJQUFJLEVBQUUsT0FBTyxFQUFFO1lBQzNCLEtBQUssRUFBRSxLQUFLO1lBQ1osWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBRSxDQUFDO0lBQ1IsQ0FBQztJQVhELElBQUksQ0FBRSxNQUFNLENBQUMsV0FBVyxDQUFFO1FBQ3RCLE9BQU8saUJBQWlCLENBQUM7SUFDN0IsQ0FBQztDQVlKO0FBRUQ7Ozs7R0FJRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsQ0FBMkMsQ0FBQztBQUV2Rzs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLENBQUUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQTJDLENBQUM7QUFFckc7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxVQUFVLENBQUUsZ0JBQWdCLENBQUUsQ0FBQztBQUVoRTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBSyxPQUFzQixFQUFrQixFQUFFLENBQUMsQ0FBRSxNQUFTLEVBQUUsTUFBUyxFQUFHLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxNQUFNLEVBQUUsTUFBTSxDQUFFLENBQUM7QUFFdkk7OztHQUdHO0FBQ0gsTUFBTSxtQkFBbUI7SUFPckIsWUFBYSxJQUFrQjtRQUMzQixjQUFjLENBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtZQUM3QixLQUFLLEVBQUUsVUFBVSxDQUFLLElBQUksQ0FBRTtZQUM1QixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFFLENBQUM7SUFDUixDQUFDO0lBYkQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxxQkFBcUIsQ0FBQztJQUNqQyxDQUFDO0NBWUo7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLGlCQUFxQixTQUFRLG1CQUFzQjtJQUNyRDtRQUNJLEtBQUssQ0FBRSxnQkFBZ0IsQ0FBRSxDQUFDO0lBQzlCLENBQUM7Q0FDSjtBQUVEOzs7O0dBSUc7QUFDSCxNQUFNLG9CQUFvQjtJQUN0QixPQUFPLENBQUUsTUFBUyxFQUFFLE1BQVM7UUFDekIsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3RDLENBQUM7Q0FDSjtBQUVEOzs7R0FHRztBQUNILE1BQU0sY0FBZSxTQUFRLG1CQUF5QjtJQUNsRDtRQUNJLEtBQUssQ0FBRSxRQUFRLENBQUUsQ0FBQztJQUN0QixDQUFDO0NBQ0o7QUFFRDs7O0dBR0c7QUFDSCxNQUFNLGdCQUFpQixTQUFRLGlCQUF5QjtDQUFHO0FBRTNEOzs7R0FHRztBQUNILE1BQU0sZ0JBQWlCLFNBQVEsaUJBQXlCO0lBQ3BELGlCQUFpQixDQUFFLE1BQWMsRUFBRSxNQUFjO1FBQzdDLE9BQU8sT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFFLE1BQU0sQ0FBQyxXQUFXLEVBQUUsRUFBRSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUUsQ0FBQztJQUNsSSxDQUFDO0NBQ0o7QUFFRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUFHLElBQUksb0JBQW9CLEVBQUUsQ0FBQztBQUUvRDs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLGNBQWMsR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO0FBRW5EOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDO0FBRXZEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxnQkFBZ0IsRUFBRSxDQUFDIn0=

/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Null": () => (/* binding */ Null),
/* harmony export */   "createNull": () => (/* binding */ createNull)
/* harmony export */ });
/**
 * @author Jeff Rose
 */
/**
 * A "clean", empty container.
 * @class module:core.Null
 * @extends external:null
 */
class Null {
}
Reflect.setPrototypeOf(Null.prototype, null);
/**
 * @function module:core.createNull
 * @returns {external:Object} An empty object created from `null`.
 */
const createNull = Object.create.bind(Object, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9udWxsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFDSCxNQUFNLE9BQU8sSUFBSTtDQUFHO0FBQ3BCLE9BQU8sQ0FBQyxjQUFjLENBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUUsQ0FBQztBQUUvQzs7O0dBR0c7QUFDSCxNQUFNLENBQUMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUUsTUFBTSxFQUFFLElBQUksQ0FBRSxDQUFDIn0=

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsEnumerableRingBuffer": () => (/* binding */ AsEnumerableRingBuffer),
/* harmony export */   "MultiValueMap": () => (/* binding */ MultiValueMap),
/* harmony export */   "ResizableRingBuffer": () => (/* binding */ ResizableRingBuffer),
/* harmony export */   "RingBuffer": () => (/* binding */ RingBuffer)
/* harmony export */ });
/* harmony import */ var _iterable__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(7);
/* harmony import */ var _serializable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */



const { defineProperty } = Reflect, { max, min } = Math, FULL = 1 << 0, move = (src, srcIndex, dst, dstIndex, length) => {
    let index = 0;
    for (; index < length; index++) {
        dst[index + dstIndex] = src[index + srcIndex];
        src[index + srcIndex] = void 0;
    }
}, pow2AtLeast = (n) => {
    n = n >>> 0;
    n = n - 1;
    n = n | (n >> 1);
    n = n | (n >> 2);
    n = n | (n >> 4);
    n = n | (n >> 8);
    n = n | (n >> 16);
    return n + 1;
};
/**
 * @class module:core.RingBuffer
 * @implements external:ArrayLike
 * @implements external:Iterable
 * @implements module:core.Serializable
 */
class RingBuffer {
    constructor(capacityOrElements = RingBuffer.MIN_CAPACITY) {
        defineProperty(this, '_capacity', {
            value: RingBuffer.MIN_CAPACITY,
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, '_full', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, '_head', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true
        });
        defineProperty(this, '_tail', {
            value: 0,
            configurable: true,
            enumerable: false,
            writable: true
        });
        if (typeof capacityOrElements === 'number') {
            this.capacity = capacityOrElements;
        }
        else if ((0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.likeArray)(capacityOrElements)) {
            this.put.apply(this, capacityOrElements);
        }
    }
    get [Symbol.toStringTag]() {
        return 'RingBuffer';
    }
    get capacity() {
        return this._capacity;
    }
    set capacity(newCapacity) {
        if (typeof newCapacity !== 'number') {
            this._capacity = RingBuffer.MIN_CAPACITY;
        }
        else {
            this._capacity = pow2AtLeast(min(max(RingBuffer.MIN_CAPACITY, newCapacity), RingBuffer.MAX_CAPACITY));
        }
    }
    get isEmpty() {
        return !this.isFull && (this._head === this._tail);
    }
    get isFull() {
        return (this._full & FULL) !== 0;
    }
    get length() {
        let length;
        const capacity = this._capacity;
        if (this.isFull) {
            length = capacity;
        }
        else {
            const head = this._head, tail = this._tail;
            length = head >= tail ?
                head - tail :
                capacity + head - tail;
        }
        return length;
    }
    [Symbol.iterator]() {
        return new _iterable__WEBPACK_IMPORTED_MODULE_1__.IndexedIterator(this);
    }
    get() {
        let item;
        if (this.length) {
            const tail = this._tail;
            item = this[tail];
            this[tail] = void 0;
            this._tail = (tail + 1) & (this._capacity - 1);
            this._full = this._full & (~FULL);
        }
        return item;
    }
    put(...items) {
        const itemsLength = items.length;
        if (itemsLength) {
            const last = this._capacity - 1;
            let index = 0, head = this._head;
            for (; index < itemsLength; index++) {
                this[head] = items[index];
                head = (head + 1) & last;
                if (!this.isFull && head === this._tail) {
                    this._full = this._full | FULL;
                }
            }
            this._head = head;
            if (this.isFull) {
                this._tail = head;
            }
        }
        return this.length;
    }
    toJSON() {
        const { length } = this, list = new Array(length);
        let index = 0;
        while (index < length) {
            list[index] = (0,_serializable__WEBPACK_IMPORTED_MODULE_2__.serialize)(this[index++]);
        }
        return list;
    }
    toString() {
        return this.toJSON().join(',');
    }
}
defineProperty(RingBuffer, 'MAX_CAPACITY', {
    value: (1 << 30) | 0,
    configurable: true,
    enumerable: false,
    writable: false
});
defineProperty(RingBuffer, 'MIN_CAPACITY', {
    value: 16,
    configurable: true,
    enumerable: false,
    writable: false
});
/**
 * @class module:core.ResizableRingBuffer
 * @extends module:core.RingBuffer
 */
class ResizableRingBuffer extends RingBuffer {
    get [Symbol.toStringTag]() {
        return 'ResizableRingBuffer';
    }
    /**
     * @function module:core.ResizableRingBuffer#put
     * @param {external:Array} items
     * @returns {external:number} The number of items
     */
    put(...items) {
        const length = this.length, itemsLength = items.length, totalLength = itemsLength + length;
        if (totalLength > this._capacity) {
            this.resizeTo(totalLength);
        }
        return super.put.apply(this, items);
    }
    /**
     * @function module:core.ResizableRingBuffer#resizeTo
     * @param {external:number} newCapacity
     * @returns {external:number} The number of items
     */
    resizeTo(newCapacity) {
        const oldCapacity = this._capacity, head = this._head, tail = this._tail;
        this.capacity = newCapacity;
        if (tail < head) {
            const newHead = this.length;
            move(this, tail, this, 0, newHead);
            this._tail = 0;
            this._head = newHead;
        }
        else if (tail > head) {
            const newHead = oldCapacity - tail;
            move(this, tail, this, 0, newHead);
            move(this, 0, this, newHead, head);
            this._tail = 0;
            this._head = newHead;
        }
        else if (tail === head) {
            this._tail = 0;
            this._head = this.isFull ?
                oldCapacity :
                0;
        }
        this._full = this._full & (~FULL);
    }
}
/**
 * @mixin module:core.AsEnumerableRingBuffer
 * @implements module:core.Enumerable
 * @returns {module:core.Constructable<module:core.RingBuffer,module:core.Enumerable>}
 */
const AsEnumerableRingBuffer = (superclass) => class extends superclass {
    entries() {
        return new _iterable__WEBPACK_IMPORTED_MODULE_1__.EntriesIterator(this);
    }
    forEach(callback, context) {
        const length = this.length;
        if (length) {
            for (let index = 0; index < length; index++) {
                callback.call(context || this, this[index], index, this);
            }
        }
    }
    keys() {
        return new _iterable__WEBPACK_IMPORTED_MODULE_1__.KeysIterator(this);
    }
    values() {
        return new _iterable__WEBPACK_IMPORTED_MODULE_1__.ValuesIterator(this);
    }
};
/**
 * Extension of the {@linkcode external:Map|Map} interface that stores multiple values under a single key.
 * @class module:core.MultiValueMap
 * @extends external:Map
 */
class MultiValueMap extends Map {
    get [Symbol.toStringTag]() {
        return 'MultiValueMap';
    }
    /**
     * @function module:core.MultiValueMap#add
     * @param {*} key
     * @param {*} value
     * @returns {module:core.MultiValueMap} this
     */
    add(key, value) {
        const values = this.has(key) ? this.get(key) : [];
        values.push(value);
        return super.set(key, values);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29sbGVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxlQUFlLEVBQUUsZUFBZSxFQUFFLFlBQVksRUFBRSxjQUFjLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUYsT0FBTyxFQUEyQixTQUFTLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUdwRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRXZDLE1BQ0ksRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksRUFFbkIsSUFBSSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBRWIsSUFBSSxHQUFHLENBQVcsR0FBUSxFQUFFLFFBQWdCLEVBQUUsR0FBUSxFQUFFLFFBQWdCLEVBQUUsTUFBYyxFQUFTLEVBQUU7SUFDL0YsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ2QsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFO1FBQzVCLEdBQUcsQ0FBRSxLQUFLLEdBQUcsUUFBUSxDQUFFLEdBQUcsR0FBRyxDQUFFLEtBQUssR0FBRyxRQUFRLENBQUUsQ0FBQztRQUNsRCxHQUFHLENBQUUsS0FBSyxHQUFHLFFBQVEsQ0FBRSxHQUFHLEtBQUssQ0FBQyxDQUFDO0tBQ3BDO0FBQ0wsQ0FBQyxFQUVELFdBQVcsR0FBRyxDQUFFLENBQVMsRUFBVyxFQUFFO0lBQ2xDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ1osQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDO0lBQ25CLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBRSxDQUFDLElBQUksQ0FBQyxDQUFFLENB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

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "EntriesIterator": () => (/* binding */ EntriesIterator),
/* harmony export */   "IndexedIterator": () => (/* binding */ IndexedIterator),
/* harmony export */   "KeysIterator": () => (/* binding */ KeysIterator),
/* harmony export */   "RangeIterator": () => (/* binding */ RangeIterator),
/* harmony export */   "ValuesIterator": () => (/* binding */ ValuesIterator),
/* harmony export */   "entriesIterator": () => (/* binding */ entriesIterator),
/* harmony export */   "getIterator": () => (/* binding */ getIterator),
/* harmony export */   "indexedIterator": () => (/* binding */ indexedIterator),
/* harmony export */   "isEntries": () => (/* binding */ isEntries),
/* harmony export */   "isEntry": () => (/* binding */ isEntry),
/* harmony export */   "keysIterator": () => (/* binding */ keysIterator),
/* harmony export */   "likeIterable": () => (/* binding */ likeIterable),
/* harmony export */   "rangeIterator": () => (/* binding */ rangeIterator),
/* harmony export */   "valuesIterator": () => (/* binding */ valuesIterator)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _IndexedIterator_indexed, _IndexedIterator_index, _EntriesIterator_iterator, _KeysIterator_iterator, _ValuesIterator_iterator, _RangeIterator_end, _RangeIterator_step, _RangeIterator_index;

const { isArray } = Array, { entries, keys, values } = Object, hasFunction = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.propIs)(Function), hasEntries = hasFunction('entries'), hasKeys = hasFunction('keys'), hasValues = hasFunction('values'), invokeEntries = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.invoker)(0, 'entries'), invokeKeys = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.invoker)(0, 'keys'), invokeValues = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.invoker)(0, 'values');
/**
 * @function module:core.isEntry
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is an entry
 */
const isEntry = (value) => isArray(value) && value.length === 2;
/**
 * @function module:core.isEntries
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is a list of entries
 */
const isEntries = (value) => isArray(value) && (value.length ? isEntry(value[0]) : true);
/**
 * @function module:core.likeIterable
 * @param {*} value The value to be tested
 * @returns {boolean} Whether or not the value is iterable
 */
const likeIterable = (value) => (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(_blue_util__WEBPACK_IMPORTED_MODULE_0__.isNil)(value) && value[Symbol.iterator] !== undefined;
/**
 * @class module:core.IndexedIterator
 * @implements {external:IterableIterator}
 * @param {external:ArrayLike} indexed An indexed collection
 */
class IndexedIterator {
    constructor(indexed) {
        _IndexedIterator_indexed.set(this, void 0);
        _IndexedIterator_index.set(this, void 0);
        __classPrivateFieldSet(this, _IndexedIterator_indexed, indexed, "f");
        __classPrivateFieldSet(this, _IndexedIterator_index, 0, "f");
    }
    [(_IndexedIterator_indexed = new WeakMap(), _IndexedIterator_index = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    next() {
        var _a, _b;
        if (__classPrivateFieldGet(this, _IndexedIterator_index, "f") < __classPrivateFieldGet(this, _IndexedIterator_indexed, "f").length) {
            return { done: false, value: __classPrivateFieldGet(this, _IndexedIterator_indexed, "f")[__classPrivateFieldSet(this, _IndexedIterator_index, (_b = __classPrivateFieldGet(this, _IndexedIterator_index, "f"), _a = _b++, _b), "f"), _a] };
        }
        else {
            return { done: true };
        }
    }
}
/**
 * @function module:core.indexedIterator
 * @param {external:ArrayLike} indexed An indexed collection
 * @returns {external:IndexedIterator} An indexed iterator
 */
const indexedIterator = (indexed) => new IndexedIterator(indexed);
/**
 * @class module:core.EntriesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
class EntriesIterator {
    constructor(target) {
        _EntriesIterator_iterator.set(this, void 0);
        __classPrivateFieldSet(this, _EntriesIterator_iterator, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
            [hasEntries, invokeEntries],
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(entries, indexedIterator)]
        ])(target), "f");
    }
    [(_EntriesIterator_iterator = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    next() {
        return __classPrivateFieldGet(this, _EntriesIterator_iterator, "f").next();
    }
}
/**
 * @function module:core.entriesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.EntriesIterator} An entries iterator
 */
const entriesIterator = (target) => new EntriesIterator(target);
/**
 * @class module:core.KeysIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
class KeysIterator {
    constructor(target) {
        _KeysIterator_iterator.set(this, void 0);
        __classPrivateFieldSet(this, _KeysIterator_iterator, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
            [hasKeys, invokeKeys],
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(keys, indexedIterator)]
        ])(target), "f");
    }
    [(_KeysIterator_iterator = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    next() {
        return __classPrivateFieldGet(this, _KeysIterator_iterator, "f").next();
    }
}
/**
 * @function module:core.keysIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.KeysIterator} A keys iterator
 */
const keysIterator = (target) => new KeysIterator(target);
/**
 * @class module:core.ValuesIterator
 * @implements external:IterableIterator
 * @param {external:Object} target A non-primitive value
 */
class ValuesIterator {
    constructor(target) {
        _ValuesIterator_iterator.set(this, void 0);
        __classPrivateFieldSet(this, _ValuesIterator_iterator, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
            [hasValues, invokeValues],
            [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.pipe)(values, indexedIterator)]
        ])(target), "f");
    }
    [(_ValuesIterator_iterator = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    next() {
        return __classPrivateFieldGet(this, _ValuesIterator_iterator, "f").next();
    }
}
/**
 * @function module:core.valuesIterator
 * @param {external:Object} target A non-primitive value
 * @returns {module:core.ValuesIterator} A values iterator
 */
const valuesIterator = (target) => new ValuesIterator(target);
/**
 * @class module:core.RangeIterator
 * @implements {external:IterableIterator}
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 */
class RangeIterator {
    constructor(startOrEnd, end, step) {
        _RangeIterator_end.set(this, void 0);
        _RangeIterator_step.set(this, void 0);
        _RangeIterator_index.set(this, void 0);
        if (step === 0) {
            throw new RangeError('"step" cannot be 0');
        }
        else if (typeof end === 'undefined') {
            __classPrivateFieldSet(this, _RangeIterator_index, 0, "f");
            __classPrivateFieldSet(this, _RangeIterator_end, startOrEnd, "f");
            __classPrivateFieldSet(this, _RangeIterator_step, 1, "f");
        }
        else if (typeof step === 'undefined') {
            __classPrivateFieldSet(this, _RangeIterator_index, startOrEnd, "f");
            __classPrivateFieldSet(this, _RangeIterator_end, end, "f");
            __classPrivateFieldSet(this, _RangeIterator_step, 1, "f");
        }
        else {
            __classPrivateFieldSet(this, _RangeIterator_index, startOrEnd, "f");
            __classPrivateFieldSet(this, _RangeIterator_end, end, "f");
            __classPrivateFieldSet(this, _RangeIterator_step, step, "f");
        }
    }
    [(_RangeIterator_end = new WeakMap(), _RangeIterator_step = new WeakMap(), _RangeIterator_index = new WeakMap(), Symbol.iterator)]() {
        return this;
    }
    next() {
        const end = __classPrivateFieldGet(this, _RangeIterator_end, "f"), index = __classPrivateFieldGet(this, _RangeIterator_index, "f"), step = __classPrivateFieldGet(this, _RangeIterator_step, "f");
        if ((step > 0 && index < end) || (step < 0 && index > end)) {
            const result = { done: false, value: index };
            __classPrivateFieldSet(this, _RangeIterator_index, __classPrivateFieldGet(this, _RangeIterator_index, "f") + step, "f");
            return result;
        }
        else {
            return { done: true };
        }
    }
}
/**
 * @function module:core.rangeIterator
 * @param {external:number} startOrEnd The start or end of the range
 * @param {external:number} [end] The end of the range
 * @param {external:number} [step=1] The amount by which values are incremented
 * @returns {module:core.RangeIterator} An range iterator
 */
const rangeIterator = (startOrEnd, end, step) => new RangeIterator(startOrEnd, end, step);
/**
 * @function module:core.getIterator
 * @param {external:Iterable} collection An iterable collection
 * @returns {external:Iterator} An iterator created from the collection
 */
const getIterator = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
    [likeIterable, (iterable) => iterable[Symbol.iterator]()],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.likeArray, indexedIterator],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, () => { throw new TypeError('"collection" is not iterable.'); }]
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXRlcmFibGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaXRlcmFibGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOzs7Ozs7Ozs7Ozs7O0FBRUgsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFrQzFGLE1BQ0ksRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ25CLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsR0FBRyxNQUFNLEVBQ2xDLFdBQVcsR0FBRyxNQUFNLENBQUUsUUFBUSxDQUFFLEVBQ2hDLFVBQVUsR0FBRyxXQUFXLENBQUUsU0FBUyxDQUFFLEVBQ3JDLE9BQU8sR0FBRyxXQUFXLENBQUUsTUFBTSxDQUFFLEVBQy9CLFNBQVMsR0FBRyxXQUFXLENBQUUsUUFBUSxDQUFFLEVBQ25DLGFBQWEsR0FBRyxPQUFPLENBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBOEMsRUFDbkYsVUFBVSxHQUFHLE9BQU8sQ0FBRSxDQUFDLEVBQUcsTUFBTSxDQUFFLEVBQ2xDLFlBQVksR0FBRyxPQUFPLENBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBRSxDQUFDO0FBRTFDOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBRSxLQUFVLEVBQXdCLEVBQUUsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLElBQUksS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7QUFFckc7Ozs7R0FJRztBQUNGLE1BQU0sQ0FBQyxNQUFNLFNBQVMsR0FBRyxDQUFFLEtBQVUsRUFBd0IsRUFBRSxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsSUFBSSxDQUFFLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBRSxLQUFLLENBQUUsQ0FBQyxDQUFF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

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isJSONArray": () => (/* binding */ isJSONArray),
/* harmony export */   "isJSONObject": () => (/* binding */ isJSONObject),
/* harmony export */   "isJSONValue": () => (/* binding */ isJSONValue),
/* harmony export */   "likeSerializable": () => (/* binding */ likeSerializable),
/* harmony export */   "serialize": () => (/* binding */ serialize)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _null__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(5);
/* harmony import */ var _primitive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/**
 * @author Jeff Rose
 */



;
/**
 * @typedef {external:boolean | external:number | external:string | module:core.JSONObject | module:core.JSONArray} module:core.JSONValue
 */
/**
 * @typedef {external:Record<external:string, module:core.JSONValue>} module:core.JSONObject
 */
/**
 * @typedef {external:Array<module:core.JSONValue>} module:core.JSONArray
 */
/**
 * @interface module:core.Serializable
 */
/**
 * @function module:core.Serializable#toJSON
 * @returns {module:core.JSONValue}
 */
/**
 * @function module:core.Serializable#toString
 * @returns {external:string}
 */
/**
 * @typedef {module:core.JSONValue | module:core.Serializable} module:core.serializable
 */
const { isArray } = Array, { parse, stringify } = JSON, hasFunction = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.propIs)(Function), hasToJSON = hasFunction('toJSON'), hasToString = hasFunction('toString'), isNotArray = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(isArray), toJSON = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.invoker)(0, 'toJSON'), toString = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.invoker)(0, 'toString'), _isJSONValue = (value) => (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.equals)(parse(stringify(value)), value);
/**
 * @function module:core.isJSONArray
 * @param {*} value
 * @returns {external:boolean}
 */
const isJSONArray = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.both)(isArray, _isJSONValue);
/**
 * @function module:core.isJSONObject
 * @param {*} value
 * @returns {external:boolean}
 */
const isJSONObject = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.allPass)([_primitive__WEBPACK_IMPORTED_MODULE_1__.isNotPrimitive, isNotArray, _isJSONValue]);
/**
 * @function module:core.isJSONValue
 * @param {*} value
 * @returns {external:boolean}
 */
const isJSONValue = (value) => {
    switch (typeof value) {
        case 'boolean':
        case 'number':
        case 'string':
            return true;
        case 'object':
            return value === null || _isJSONValue(value);
        default:
            return false;
    }
};
/**
 * @function module:core.likeSerializable
 * @param {*} value
 * @returns {external:boolean}
 */
const likeSerializable = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.anyPass)([isJSONValue, hasToJSON, hasToString]);
/**
 * @function module:core.serialize
 * @param {*} value
 * @returns {module:core.JSONValue}
 */
const serialize = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.cond)([
    [hasToJSON, toJSON],
    [isJSONValue, _blue_util__WEBPACK_IMPORTED_MODULE_0__.identity],
    [hasToString, toString],
    [isArray, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.map)((value) => serialize(value))],
    [_blue_util__WEBPACK_IMPORTED_MODULE_0__.T, (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.mergeLeft)((0,_null__WEBPACK_IMPORTED_MODULE_2__.createNull)())]
]);
/**
 * * Developer Notes
 * ? As blue-parser continues to develop, should this move to that package?
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VyaWFsaXphYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3NlcmlhbGl6YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDNUgsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNwQyxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSW1CLENBQUM7QUFXakU7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7R0FFRztBQUVILE1BQ0ksRUFBRSxPQUFPLEVBQUUsR0FBRyxLQUFLLEVBQ25CLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxHQUFHLElBQUksRUFDM0IsV0FBVyxHQUFHLE1BQU0sQ0FBRSxRQUFRLENBQUUsRUFDaEMsU0FBUyxHQUFHLFdBQVcsQ0FBRSxRQUFRLENBQUUsRUFDbkMsV0FBVyxHQUFHLFdBQVcsQ0FBRSxVQUFVLENBQUUsRUFDdkMsVUFBVSxHQUFHLFVBQVUsQ0FBRSxPQUFPLENBQUUsRUFDbEMsTUFBTSxHQUFHLE9BQU8sQ0FBRSxDQUFDLEVBQUUsUUFBUSxDQUE0QixFQUN6RCxRQUFRLEdBQUcsT0FBTyxDQUFFLENBQUMsRUFBRSxVQUFVLENBQXlCLEVBRTFELFlBQVksR0FBRyxDQUFFLEtBQUssRUFBRyxFQUFFLENBQUMsTUFBTSxDQUFFLEtBQUssQ0FBRSxTQUFTLENBQUUsS0FBSyxDQUFFLENBQUUsRUFBRSxLQUFLLENBQUUsQ0FBQztBQUU3RTs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBRSxPQUFPLEVBQUUsWUFBWSxDQUFxQyxDQUFDO0FBRTVGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFFLENBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxZQUFZLENBQUUsQ0FBc0MsQ0FBQztBQUV4SDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLENBQUUsS0FBSyxFQUF1QixFQUFFO0lBQ3ZELFFBQVEsT0FBTyxLQUFLLEVBQUU7UUFDbEIsS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssUUFBUTtZQUNULE9BQU8sSUFBSSxDQUFDO1FBQ2hCLEtBQUssUUFBUTtZQUNULE9BQU8sS0FBSyxLQUFLLElBQUksSUFBSSxZQUFZLENBQUUsS0FBSyxDQUFFLENBQUM7UUFDbkQ7WUFDSSxPQUFPLEtBQUssQ0FBQztLQUNwQjtBQUNMLENBQUMsQ0FBQztBQUVGOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxPQUFPLENBQUUsQ0FBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFdBQVcsQ0FBRSxDQUF3QyxDQUFDO0FBRXpIOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFFO0lBQzNCLENBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBRTtJQUNyQixDQUFFLFdBQVcsRUFBRSxRQUFRLENBQUU7SUFDekIsQ0FBRSxXQUFXLEVBQUUsUUFBUSxDQUFFO0lBQ3pCLENBQUUsT0FBTyxFQUFFLEdBQUcsQ0FBRSxDQUFFLEtBQUssRUFBRyxFQUFFLENBQUMsU0FBUyxDQUFFLEtBQUssQ0FBRSxDQUFFLENBQUU7SUFDbkQsQ0FBRSxDQUFDLEVBQUUsU0FBUyxDQUFFLFVBQVUsRUFBRSxDQUFFLENBQUU7Q0FDbkMsQ0FBNEIsQ0FBQztBQUU5Qjs7O0dBR0cifQ==

/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "isNotPrimitive": () => (/* binding */ isNotPrimitive),
/* harmony export */   "isPrimitive": () => (/* binding */ isPrimitive)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

/**
 * A primitive is data that is not an object and has no methods.
 * @typedef {external:boolean | external:number | external:string | external:symbol | external:bigint | external:undefined} module:core.primitive
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @function module:core.isPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is primitive
 * @see {@link module:core.primitive}
 */
const isPrimitive = (value) => {
    switch (typeof value) {
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'symbol':
        case 'undefined':
            return true;
        case 'object':
            return value === null;
        default:
            return false;
    }
};
/**
 * @function module:core.isNotPrimitive
 * @param {*} value
 * @returns {external:boolean} Whether or not a value is non-primitive
 * @see {@link module:core.primitive}
 */
const isNotPrimitive = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.complement)(isPrimitive);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJpbWl0aXZlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3ByaW1pdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBSXhDOzs7O0dBSUc7QUFFSDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLFdBQVcsR0FBRyxDQUFFLEtBQUssRUFBdUIsRUFBRTtJQUN2RCxRQUFRLE9BQU8sS0FBSyxFQUFFO1FBQ2xCLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxTQUFTLENBQUM7UUFDZixLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssUUFBUSxDQUFDO1FBQ2QsS0FBSyxRQUFRLENBQUM7UUFDZCxLQUFLLFdBQVc7WUFDWixPQUFPLElBQUksQ0FBQztRQUNoQixLQUFLLFFBQVE7WUFDVCxPQUFPLEtBQUssS0FBSyxJQUFJLENBQUM7UUFDMUI7WUFDSSxPQUFPLEtBQUssQ0FBQztLQUNwQjtBQUNMLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLFVBQVUsQ0FBRSxXQUFXLENBQWtDLENBQUMifQ==

/***/ }),
/* 10 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "likeConstructable": () => (/* binding */ likeConstructable)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

/**
 * @interface module:core.Constructable
 * @property {T} [prototype]
 */
/**
 * @function module:core.likeConstructable
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Constructable|Constructable}.
 * @todo This is actually not a great test since prototype is optional - JBR
 */
const likeConstructable = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ prototype: Object });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0YWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25zdHJ1Y3RhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFJbEM7OztHQUdHO0FBRUg7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUUsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLENBQThDLENBQUMifQ==

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Deferred)
/* harmony export */ });
/**
 * @author Jeff Rose
 * @see {@link https://developer.mozilla.org/en-US/docs/Mozilla/JavaScript_code_modules/Promise.jsm/Deferred}
 */
/**
 * @class module:core.Deferred
 */
class Deferred {
    constructor() {
        this.resolve = null;
        this.reject = null;
        this.promise = new Promise((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
        Object.freeze(this);
    }
    get [Symbol.toStringTag]() {
        return 'Deferred';
    }
}
/**
 * @member {external:Promise} module:core.Deferred#promise
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmZXJyZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZGVmZXJyZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVIOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE9BQU8sT0FBTyxRQUFRO0lBcUJ6QjtRQUNJLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBRW5CLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUssQ0FBRSxPQUFPLEVBQUUsTUFBTSxFQUFTLEVBQUU7WUFDdkQsSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDekIsQ0FBQyxDQUFFLENBQUM7UUFFSixNQUFNLENBQUMsTUFBTSxDQUFFLElBQUksQ0FBRSxDQUFDO0lBQzFCLENBQUM7SUFkRCxJQUFJLENBQUUsTUFBTSxDQUFDLFdBQVcsQ0FBRTtRQUN0QixPQUFPLFVBQVUsQ0FBQztJQUN0QixDQUFDO0NBYUo7QUFFRDs7R0FFRyJ9

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "likeEnumerable": () => (/* binding */ likeEnumerable)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

/**
 * @interface module:core.Enumerable
 */
/**
 * @callback module:core.Enumerable~ForEachCallback
 * @param {*} value
 * @param {*} key
 * @param {Enumerable} list
 */
/**
 * @function module:core.Enumerable#entries
 * @returns {external:Iterator}
 */
/**
 * @function module:core.Enumerable#forEach
 * @param {module:core.Enumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @function module:core.Enumerable#keys
 * @returns {external:Iterator}
 */
/**
 * @function module:core.Enumerable#values
 * @returns {external:Iterator}
 */
/**
 * @interface module:core.AsyncEnumerable
 */
/**
* @callback module:core.AsyncEnumerable~ForEachCallback
* @param {*} value
* @param {*} key
* @param {EnumeraAsyncEnumerableble} list
*/
/**
 * @function module:core.AsyncEnumerable#entries
 * @returns {external:Iterator}
 */
/**
 * @function module:core.AsyncEnumerable#forEach
 * @param {module:core.AsyncEnumerable~ForEachCallback} callback
 * @param {*} [context]
 */
/**
 * @function module:core.AsyncEnumerable#keys
 * @returns {external:Iterator}
 */
/**
 * @function module:core.AsyncEnumerable#values
 * @returns {external:Iterator}
 */
/**
 * @function module:core.likeEnumerable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Enumerable|Enumerable} or {@linkcode module:core.AsyncEnumerable|AsyncEnumerable}.
 */
const likeEnumerable = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ entries: Function, forEach: Function, keys: Function, values: Function });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW51bWVyYWJsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtZXJhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFnQmxDOztHQUVHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBRUg7OztHQUdHO0FBRUg7OztHQUdHO0FBRUg7O0dBRUc7QUFFRjs7Ozs7RUFLRTtBQUVIOzs7R0FHRztBQUVIOzs7O0dBSUc7QUFFSDs7O0dBR0c7QUFFSDs7O0dBR0c7QUFFSDs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sY0FBYyxHQUFHLElBQUksQ0FBRSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsQ0FBZ0YsQ0FBQyJ9

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "equates": () => (/* binding */ equates),
/* harmony export */   "likeEquatable": () => (/* binding */ likeEquatable)
/* harmony export */ });
/* harmony import */ var _primitive__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(9);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */


/**
 * @interface module:core.Equatable
 */
/**
 * @function module.core.Equatable#equal
 * @param {*} value
 * @returns {external:boolean}
 */
/**
 * @typedef {module:core.Equatable | modeule:core.primitive} module:core.equatable
 */
/**
 * @function module:core.likeEquatable
 * @param {*} value The value to be tested
 * @returns {external:boolean} Whether or not the `value` is {@linkcode module:core.Equatable|Equatable}.
 */
const likeEquatable = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ equals: Function });
/**
 * @function module:core.equates
 * @param {*} value1 The first value to be tested
 * @param {*} value2 The second value to be tested
 * @returns {external:Boolean} Whether or not the values are equal.
 */
const equates = (value1, value2) => {
    if (likeEquatable(value1) && likeEquatable(value2)) {
        return value1.equals(value2);
    }
    else if ((0,_primitive__WEBPACK_IMPORTED_MODULE_1__.isPrimitive)(value1) && (0,_primitive__WEBPACK_IMPORTED_MODULE_1__.isPrimitive)(value2)) {
        return value1 === value2;
    }
    else {
        return (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.equals)(value1, value2);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXF1YXRhYmxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2VxdWF0YWJsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQWEsV0FBVyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3JELE9BQU8sRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBUTFDOztHQUVHO0FBRUg7Ozs7R0FJRztBQUVIOztHQUVHO0FBRUg7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUUsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLENBQXFDLENBQUM7QUFFN0Y7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBRSxNQUFpQixFQUFFLE1BQWlCLEVBQVksRUFBRTtJQUN2RSxJQUFJLGFBQWEsQ0FBRSxNQUFNLENBQUUsSUFBSSxhQUFhLENBQUUsTUFBTSxDQUFFLEVBQUU7UUFDcEQsT0FBTyxNQUFNLENBQUMsTUFBTSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0tBQ2xDO1NBQU0sSUFBSSxXQUFXLENBQUUsTUFBTSxDQUFFLElBQUksV0FBVyxDQUFFLE1BQU0sQ0FBRSxFQUFHO1FBQ3hELE9BQU8sTUFBTSxLQUFLLE1BQU0sQ0FBQztLQUM1QjtTQUFNO1FBQ0gsT0FBTyxNQUFNLENBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBRSxDQUFDO0tBQ25DO0FBQ0wsQ0FBQyxDQUFDIn0=

/***/ }),
/* 14 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ApplicationError": () => (/* binding */ ApplicationError),
/* harmony export */   "AsSerializableError": () => (/* binding */ AsSerializableError),
/* harmony export */   "FrameworkError": () => (/* binding */ FrameworkError),
/* harmony export */   "IllegalStateError": () => (/* binding */ IllegalStateError)
/* harmony export */ });
/* harmony import */ var _null__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(5);
/**
 * @author Jeff Rose
 */

const { setPrototypeOf } = Reflect;
const AsSerializableError = (superclass) => class extends superclass {
    toJSON() {
        const json = (0,_null__WEBPACK_IMPORTED_MODULE_0__.createNull)();
        json.name = this.name;
        json.message = this.message;
        json.stack = this.stack;
        return json;
    }
    toString() {
        return this.message;
    }
};
class ApplicationError extends AsSerializableError(Error) {
    get [Symbol.toStringTag]() {
        return 'ApplicationError';
    }
    constructor(message) {
        super(message);
        this.name = 'ApplicationError';
        setPrototypeOf(this, new.target.prototype);
    }
}
class FrameworkError extends AsSerializableError(Error) {
    get [Symbol.toStringTag]() {
        return 'FrameworkError';
    }
    constructor(message) {
        super(message);
        this.name = 'FrameworkError';
        setPrototypeOf(this, new.target.prototype);
    }
}
/**
 * @class module:core.IllegalStateError
 * @extends module:core.FrameworkError
 */
class IllegalStateError extends FrameworkError {
    get [Symbol.toStringTag]() {
        return 'IllegalStateError';
    }
    constructor(message = 'Unable to complete operation due to misconfiguration') {
        super(message);
    }
}
/**
 * * Developer Notes
 * This is the beginning of an error and exception strategy but I am not sure what error subclasses should exist yet. There should likely be a
 * DomainError subclass declared in the blue-domain package. Having these different classes could help provide ways of managing errors in the
 * ErrorHandler class in blue-dispatcher.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvZXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHO0FBR0gsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUdwQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxDQUFDO0FBRW5DLE1BQU0sQ0FBQyxNQUFNLG1CQUFtQixHQUFHLENBQWtDLFVBQWEsRUFBb0MsRUFBRSxDQUFDLEtBQU0sU0FBUSxVQUFVO0lBQzdJLE1BQU07UUFDRixNQUFNLElBQUksR0FBRyxVQUFVLEVBQUUsQ0FBQztRQUMxQixJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDdEIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzVCLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN4QixPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsUUFBUTtRQUNKLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN4QixDQUFDO0NBQ0osQ0FBQztBQUVGLE1BQU0sT0FBTyxnQkFBaUIsU0FBUSxtQkFBbUIsQ0FBRSxLQUFLLENBQUU7SUFFOUQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxrQkFBa0IsQ0FBQztJQUM5QixDQUFDO0lBRUQsWUFBYSxPQUFnQjtRQUN6QixLQUFLLENBQUUsT0FBTyxDQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxrQkFBa0IsQ0FBQztRQUMvQixjQUFjLENBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFFLENBQUM7SUFDakQsQ0FBQztDQUNKO0FBRUQsTUFBTSxPQUFPLGNBQWUsU0FBUSxtQkFBbUIsQ0FBRSxLQUFLLENBQUU7SUFFNUQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDO0lBRUQsWUFBYSxPQUFnQjtRQUN6QixLQUFLLENBQUUsT0FBTyxDQUFFLENBQUM7UUFDakIsSUFBSSxDQUFDLElBQUksR0FBRyxnQkFBZ0IsQ0FBQztRQUM3QixjQUFjLENBQUUsSUFBSSxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFFLENBQUM7SUFDakQsQ0FBQztDQUNKO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxPQUFPLGlCQUFrQixTQUFRLGNBQWM7SUFDakQsSUFBSSxDQUFFLE1BQU0sQ0FBQyxXQUFXLENBQUU7UUFDdEIsT0FBTyxtQkFBbUIsQ0FBQztJQUMvQixDQUFDO0lBRUQsWUFBYSxVQUFrQixzREFBc0Q7UUFDakYsS0FBSyxDQUFFLE9BQU8sQ0FBRSxDQUFDO0lBQ3JCLENBQUM7Q0FDSjtBQUVEOzs7OztHQUtHIn0=

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AsPathMatcherFilter": () => (/* binding */ AsPathMatcherFilter),
/* harmony export */   "EqualsPathMatcher": () => (/* binding */ EqualsPathMatcher),
/* harmony export */   "GlobPathMatcher": () => (/* binding */ GlobPathMatcher),
/* harmony export */   "GlobPatternInfo": () => (/* binding */ GlobPatternInfo),
/* harmony export */   "likePathMatcher": () => (/* binding */ likePathMatcher)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _comparable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(16);
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_blue_parser__WEBPACK_IMPORTED_MODULE_1__);
/**
 * @author Jeff Rose
 */
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _GlobPatternInfo_catchAllPattern;



/**
 * Combines two patterns into a new pattern.
 *
 * The approach used for combining the two pattern depends on the underlying implementation.
 * @function module:core.PathMatcher#merge
 * @param {external:string} pattern1 The first pattern
 * @param {external:string} pattern2 The second pattern
 * @returns {external:string} The combination of the two patterns
 */
/**
 * Given a full path, returns a {@linkcode module:core.Comparator|Comparator} suitable for sorting patterns in order of explicitness for that path.
 *
 * The approach used depends on the underlying implementation.
 * @function module:core.PathMatcher#getPatternComparator
 * @param {external:string} path The full path to use for comparison
 * @returns {module:core.Comparator} A comparator capable of sorting patterns in order of explicitness
 */
/**
 * Match the given `path` against the given `pattern`, according to this PathMatcher's matching strategy.
 * @function module:core.PathMatcher#match
 * @param {external:string} pattern The pattern to match against
 * @param {external:string} path The path to test
 * @returns {external:boolean} Whether or not the `path` matched.
 */
/**
 * @interface module:core.MappedPathMatcher
 */
const DOT = '.', SLASH = '/', STAR = '*', GLOBSTAR = `${STAR}${STAR}`, DOT_STAR = `${DOT}${STAR}`, SLASH_STAR = `${SLASH}${STAR}`, SLASH_GLOBSTAR = `${SLASH}${GLOBSTAR}`;
/**
 * @function module:core.likePathMatcher
 * @param {*} value
 * @returns {external:boolean} Whether or not the `value` is a {@linkcode module:core.PathMatcher|PathMatcher}.
 */
const likePathMatcher = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ getPatternComparator: Function, match: Function, merge: Function });
/**
 * @class module:core.EqualsPathComparator
 * @extends module:core.AbstractStringComparator
 */
class EqualsPathComparator extends _comparable__WEBPACK_IMPORTED_MODULE_2__.AbstractValueComparator {
    compare(pattern1, pattern2) {
        const { value } = this, pattern1EqualsPath = pattern1 === value, pattern2EqualsPath = pattern2 === value;
        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        }
        else if (pattern1EqualsPath) {
            return -1;
        }
        else if (pattern2EqualsPath) {
            return 1;
        }
        return 0;
    }
}
/**
 * @class module:core.GlobPatternComparator
 * @extends module:core.AbstractStringComparator
 */
class GlobPatternComparator extends _comparable__WEBPACK_IMPORTED_MODULE_2__.AbstractValueComparator {
    compare(pattern1, pattern2) {
        const info1 = new GlobPatternInfo(pattern1), info2 = new GlobPatternInfo(pattern2);
        if (info1.isLeastSpecific && info2.isLeastSpecific) {
            return 0;
        }
        else if (info1.isLeastSpecific) {
            return 1;
        }
        else if (info2.isLeastSpecific) {
            return -1;
        }
        const { value } = this, pattern1EqualsPath = pattern1 === value, pattern2EqualsPath = pattern2 === value;
        if (pattern1EqualsPath && pattern2EqualsPath) {
            return 0;
        }
        else if (pattern1EqualsPath) {
            return -1;
        }
        else if (pattern2EqualsPath) {
            return 1;
        }
        if (info1.isPrefixPattern && info2.isPrefixPattern) {
            return info2.length - info1.length;
        }
        else if (info1.isPrefixPattern && info2.doubleWildcards === 0) {
            return 1;
        }
        else if (info2.isPrefixPattern && info1.doubleWildcards === 0) {
            return -1;
        }
        if (info1.totalCount !== info2.totalCount) {
            return info1.totalCount - info2.totalCount;
        }
        if (info1.length !== info2.length) {
            return info2.length - info1.length;
        }
        if (info1.singleWildcards < info2.singleWildcards) {
            return -1;
        }
        else if (info2.singleWildcards < info1.singleWildcards) {
            return 1;
        }
        return 0;
    }
}
/**
 * @class module:core.EqualsPathMatcher
 * @extends module:core.PathMatcher
 */
class EqualsPathMatcher {
    merge(pattern1, pattern2) {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }
        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }
        const isEmpty1 = pattern1.length === 0, isEmpty2 = pattern2.length === 0, hasSlash1 = !isEmpty1 && pattern1.indexOf(SLASH) === 0, hasSlash2 = !isEmpty2 && pattern2.indexOf(SLASH) === 0;
        if (isEmpty1 && isEmpty2) {
            return '';
        }
        else if (isEmpty1) {
            return pattern2;
        }
        else if (isEmpty2) {
            return pattern1;
        }
        else {
            const hasPeriod1 = pattern1.indexOf(DOT) !== -1, hasPeriod2 = pattern2.indexOf(DOT) !== -1;
            if (hasPeriod1 && !hasPeriod2) {
                return `${pattern2}${SLASH}${hasSlash1 ? pattern1.substring(1) : pattern1}`;
            }
            else if (!hasPeriod1 && hasPeriod2) {
                return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
            }
            else if (hasPeriod1 && hasPeriod2) {
                throw new Error(`Cannot combine "${pattern1}" and "${pattern2}"`);
            }
        }
        return `${pattern1}${SLASH}${hasSlash2 ? pattern2.substring(1) : pattern2}`;
    }
    getPatternComparator(path) {
        return new EqualsPathComparator(path);
    }
    match(pattern, path) {
        return pattern === path;
    }
}
/**
 * @class module:core.GlobPathMatcher
 * @extends module:core.PathMatcher
 */
class GlobPathMatcher {
    getPatternComparator(path) {
        return new GlobPatternComparator(path);
    }
    match(pattern, path) {
        const regex = new RegExp(_blue_parser__WEBPACK_IMPORTED_MODULE_1__.glob.run(pattern).result);
        return regex.test(path);
    }
    merge(pattern1, pattern2) {
        if (typeof pattern1 !== 'string') {
            throw new TypeError('"pattern1" must be a string');
        }
        if (typeof pattern2 !== 'string') {
            throw new TypeError('"pattern2" must be a string');
        }
        if (pattern1.endsWith(SLASH_STAR)) {
            return `${pattern1.substring(0, pattern1.length - 2)}${pattern2}`;
        }
        if (pattern1.endsWith(SLASH_GLOBSTAR)) {
            return `${pattern1}${pattern2}`;
        }
        return `${pattern1}${pattern2}`;
    }
}
class GlobPatternInfo {
    constructor(pattern = null) {
        _GlobPatternInfo_catchAllPattern.set(this, void 0);
        this.pattern = pattern;
        this.doubleWildcards = 0;
        this.singleWildcards = 0;
        if (this.pattern) {
            this._initCounters();
            __classPrivateFieldSet(this, _GlobPatternInfo_catchAllPattern, this.pattern === SLASH_GLOBSTAR, "f");
        }
    }
    get isLeastSpecific() {
        return this.pattern === null || __classPrivateFieldGet(this, _GlobPatternInfo_catchAllPattern, "f");
    }
    get isPrefixPattern() {
        return !__classPrivateFieldGet(this, _GlobPatternInfo_catchAllPattern, "f") && this.pattern.endsWith(SLASH_GLOBSTAR);
    }
    get length() {
        return this.pattern ? this.pattern.length : 0;
    }
    get totalCount() {
        return this.singleWildcards + (2 * this.doubleWildcards);
    }
    _initCounters() {
        let index = 0;
        const pattern = this.pattern;
        if (pattern) {
            const length = pattern.length;
            while (index < length) {
                switch (pattern[index]) {
                    case STAR:
                        if (index + 1 < length && pattern[index + 1] === STAR) {
                            this.doubleWildcards++;
                            index++;
                        }
                        else if (index > 0 && pattern.substring(index - 1) === DOT_STAR) {
                            this.singleWildcards++;
                        }
                    default:
                        index++;
                        break;
                }
            }
        }
    }
}
_GlobPatternInfo_catchAllPattern = new WeakMap();
// ! Not sure I like this name. Should really come up with a better one. -JBR
const AsPathMatcherFilter = (superclass) => { var _excludePatterns, _includePatterns, _a; return _a = class extends superclass {
        constructor() {
            super(...arguments);
            _excludePatterns.set(this, void 0);
            _includePatterns.set(this, void 0);
        }
        matches(path, matcher) {
            var _a, _b;
            const pathMatcher = matcher || this.pathMatcher;
            if (pathMatcher) {
                const excludePatterns = (_a = __classPrivateFieldGet(this, _excludePatterns, "f")) !== null && _a !== void 0 ? _a : [], includePatterns = (_b = __classPrivateFieldGet(this, _includePatterns, "f")) !== null && _b !== void 0 ? _b : [];
                let index, length;
                if (excludePatterns.length) {
                    length = excludePatterns.length;
                    for (index = 0; index < length; index++) {
                        if (pathMatcher.match(excludePatterns[index], path)) {
                            return false;
                        }
                    }
                }
                if (!includePatterns.length) {
                    return true;
                }
                length = includePatterns.length;
                for (index = 0; index < length; index++) {
                    if (pathMatcher.match(includePatterns[index], path)) {
                        return true;
                    }
                }
            }
            return false;
        }
        setExcludePatterns(excludePatterns = []) {
            __classPrivateFieldSet(this, _excludePatterns, excludePatterns, "f");
        }
        setIncludePatterns(includePatterns = []) {
            __classPrivateFieldSet(this, _includePatterns, includePatterns, "f");
        }
    },
    _excludePatterns = new WeakMap(),
    _includePatterns = new WeakMap(),
    _a; };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aC1tYXRjaGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3BhdGgtbWF0Y2hlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7Ozs7Ozs7Ozs7Ozs7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSx1QkFBdUIsRUFBYyxNQUFNLGNBQWMsQ0FBQztBQUVuRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBaUJwQzs7Ozs7Ozs7R0FRRztBQUVIOzs7Ozs7O0dBT0c7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7R0FFRztBQUVILE1BQ0ksR0FBRyxHQUFHLEdBQUcsRUFDVCxLQUFLLEdBQUcsR0FBRyxFQUNYLElBQUksR0FBRyxHQUFHLEVBQ1YsUUFBUSxHQUFHLEdBQUksSUFBSyxHQUFJLElBQUssRUFBRSxFQUMvQixRQUFRLEdBQUcsR0FBSSxHQUFJLEdBQUksSUFBSyxFQUFFLEVBQzlCLFVBQVUsR0FBRyxHQUFJLEtBQU0sR0FBSSxJQUFLLEVBQUUsRUFDbEMsY0FBYyxHQUFHLEdBQUksS0FBTSxHQUFJLFFBQVMsRUFBRSxDQUFDO0FBRS9DOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFFLEVBQUUsb0JBQW9CLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUF1QyxDQUFDO0FBRWpKOzs7R0FHRztBQUNILE1BQU0sb0JBQXFCLFNBQVEsdUJBQXVCO0lBQ3RELE9BQU8sQ0FBRSxRQUFnQixFQUFFLFFBQWdCO1FBQ3ZDLE1BQ0ksRUFBRSxLQUFLLEVBQUUsR0FBRyxJQUFJLEVBQ2hCLGtCQUFrQixHQUFHLFFBQVEsS0FBSyxLQUFLLEVBQ3ZDLGtCQUFrQixHQUFHLFFBQVEsS0FBSyxLQUFLLENBQUM7UUFFNUMsSUFBSSxrQkFBa0IsSUFBSSxrQkFBa0Is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

/***/ }),
/* 16 */
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__16__;

/***/ }),
/* 17 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "DelegatingTransformer": () => (/* binding */ DelegatingTransformer),
/* harmony export */   "XCount": () => (/* binding */ XCount),
/* harmony export */   "XToArray": () => (/* binding */ XToArray),
/* harmony export */   "XToMap": () => (/* binding */ XToMap),
/* harmony export */   "XToMultiValueMap": () => (/* binding */ XToMultiValueMap),
/* harmony export */   "XToRecord": () => (/* binding */ XToRecord),
/* harmony export */   "XToSet": () => (/* binding */ XToSet),
/* harmony export */   "count": () => (/* binding */ count),
/* harmony export */   "dispatchable": () => (/* binding */ dispatchable),
/* harmony export */   "likeReduced": () => (/* binding */ likeReduced),
/* harmony export */   "likeTransformer": () => (/* binding */ likeTransformer),
/* harmony export */   "reduce": () => (/* binding */ reduce),
/* harmony export */   "toArray": () => (/* binding */ toArray),
/* harmony export */   "toMap": () => (/* binding */ toMap),
/* harmony export */   "toMultiValueMap": () => (/* binding */ toMultiValueMap),
/* harmony export */   "toRecord": () => (/* binding */ toRecord),
/* harmony export */   "toSet": () => (/* binding */ toSet),
/* harmony export */   "xCount": () => (/* binding */ xCount),
/* harmony export */   "xToArray": () => (/* binding */ xToArray)
/* harmony export */ });
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3);
/* harmony import */ var _blue_util__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_util__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _collection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/**
 * @author Jeff Rose
 * @see {@link https://github.com/cognitect-labs/transducers-js/issues/20}
 * @see {@link https://github.com/cognitect-labs/transducers-js#transformer-protocol}
 * @see {@link https://github.com/jlongster/transducers.js#the-transducer-protocol}
 * @see {@link https://github.com/dphilipson/transducist}
 */


const defineProperty = Reflect.defineProperty;
;
class DelegatingTransformer {
    constructor(xf) {
        defineProperty(this, 'xf', {
            value: xf,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    ['@@transducer/init']() {
        return this.xf['@@transducer/init']();
    }
    ['@@transducer/result'](result) {
        return this.xf['@@transducer/result'](result);
    }
    ['@@transducer/step'](result, input) {
        return this.xf['@@transducer/step'](result, input);
    }
}
/**
 * Determines whether an value is reduced. This is done using the transformer protocol; an object with the protocol-
 * specified `reduced` property is assumed to be reduced. If a result of a transformation is reduced, it means that the
 * transformation is complete and the channel should be closed.
 * @function module:core.likeReduced
 * @param {*} value The value being checked for reduction.
 * @return {boolean} Whether ot not the value has been reduced.
 */
const likeReduced = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ '@@transducer/reduced': true });
/**
 * Determines whether a value is a transformer.
 * @function module:core.likeTransformer
 * @param {*} value The value being checked.
 * @return {boolean} Whether or not the value is a transformer.
 */
const likeTransformer = (0,_blue_util__WEBPACK_IMPORTED_MODULE_0__.like)({ '@@transducer/step': Function });
/**
 * @param {*} value The value being reduced.
 */
function reduce(value) {
    return likeReduced(value) ?
        value :
        {
            ['@@transducer/reduced']: true,
            ['@@transducer/value']: value
        };
}
class XCount {
    ['@@transducer/init']() {
        return 0;
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result) {
        return result + 1;
    }
}
const xCount = () => new XCount();
const count = () => xCount;
class XToArray {
    ['@@transducer/init']() {
        return [];
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.push(input);
        return result;
    }
}
const xToArray = () => new XToArray();
const toArray = () => xToArray;
class XToMap {
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    ['@@transducer/init']() {
        return new Map();
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.set(this._getKey(input), this._getValue(input));
        return result;
    }
}
const toMap = (getKey, getValue) => () => new XToMap(getKey, getValue);
class XToMultiValueMap {
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    ['@@transducer/init']() {
        return new _collection__WEBPACK_IMPORTED_MODULE_1__.MultiValueMap();
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.add(this._getKey(input), this._getValue(input));
        return result;
    }
}
const toMultiValueMap = (getKey, getValue) => () => new XToMultiValueMap(getKey, getValue);
class XToRecord {
    constructor(getKey, getValue) {
        defineProperty(this, '_getKey', {
            value: getKey,
            configurable: true,
            enumerable: false,
            writable: false
        });
        defineProperty(this, '_getValue', {
            value: getValue,
            configurable: true,
            enumerable: false,
            writable: false
        });
    }
    ['@@transducer/init']() {
        return {};
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result[this._getKey(input)] = this._getValue(input);
        return result;
    }
}
const toRecord = (getKey, getValue) => () => new XToRecord(getKey, getValue);
class XToSet {
    constructor(set = new Set()) {
        this.set = set;
    }
    ['@@transducer/init']() {
        return this.set;
    }
    ['@@transducer/result'](result) {
        return result;
    }
    ['@@transducer/step'](result, input) {
        result.add(input);
        return result;
    }
}
const toSet = (set) => () => new XToSet(set);
const dispatchable = (methodNames, xf, fn) => (target, ...args) => {
    // @ts-ignore: ¯\_(ツ)_/¯
    // eslint-disable-next-line no-undef
    if (arguments.length === 0) {
        return fn();
    }
    if (!Array.isArray(target)) {
        let index = 0;
        const length = methodNames.length;
        while (index < length) {
            const methodName = methodNames[index], method = target[methodName];
            if (typeof method === 'function') {
                return method.apply(target, args);
            }
            index++;
        }
        if (likeTransformer(target)) {
            const transducer = xf.apply(null, args);
            return transducer(target);
        }
        // @ts-ignore: ¯\_(ツ)_/¯
        // eslint-disable-next-line no-undef
        return fn.apply(undefined, arguments);
    }
};
/**
 * * Developer Notes
 * ? Should this be in blue-util?
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNkdWNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90cmFuc2R1Y2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7O0dBT0c7QUFFSCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFN0MsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQU03QyxDQUFDO0FBZ0JGLE1BQU0sT0FBTyxxQkFBcUI7SUFHOUIsWUFBYSxFQUFxRDtRQUM5RCxjQUFjLENBQUUsSUFBSSxFQUFFLElBQUksRUFBRTtZQUN4QixLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUUsQ0FBQztJQUNSLENBQUM7SUFFRCxDQUFFLG1CQUFtQixDQUFFO1FBQ25CLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBRSxtQkFBbUIsQ0FBRSxFQUFFLENBQUM7SUFDNUMsQ0FBQztJQUVELENBQUUscUJBQXFCLENBQUUsQ0FBRyxNQUFlO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEVBQUUsQ0FBRSxxQkFBcUIsQ0FBRSxDQUFFLE1BQU0sQ0FBRSxDQUFDO0lBQ3RELENBQUM7SUFFRCxDQUFFLG1CQUFtQixDQUFFLENBQUUsTUFBZSxFQUFFLEtBQWE7UUFDbkQsT0FBTyxJQUFJLENBQUMsRUFBRSxDQUFFLG1CQUFtQixDQUFFLENBQUUsTUFBTSxFQUFFLEtBQUssQ0FBRSxDQUFDO0lBQzNELENBQUM7Q0FDSjtBQUVEOzs7Ozs7O0dBT0c7QUFDSCxNQUFNLENBQUMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFFLEVBQUUsc0JBQXNCLEVBQUUsSUFBSSxFQUFFLENBQXdDLENBQUM7QUFFMUc7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsTUFBTSxlQUFl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

/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "direct": () => (/* binding */ direct),
/* harmony export */   "escalate": () => (/* binding */ escalate),
/* harmony export */   "indexOf": () => (/* binding */ indexOf)
/* harmony export */ });
/**
 * @author Jeff Rose
 */
/**
 * @interface module:core.ChildNode
 */
/**
 * @member {T} module:core.ChildNode#parent
 */
/**
 * @interface module:core.ParentNode
 */
/**
 * @member {external:Array<T>} module:core.ParentNode#children
 */
/**
 * @interface module:core.TreeNode
 * @extends module:core.ChildNode
 * @extends module:core.ParentNode
 */
/**
 * @member {T} module:core.TreeNode#root
 */
/**
 * @function module:core.TreeNode#hasChild
 * @param {T} node
 * @returns {external:boolean}
 */
/**
 * @function module:core.TreeNode#newChild
 * @param {...*} args
 * @returns {T}
 */
/**
 * @function module:core.TreeNode#removeChild
 * @param {T} node
 * @returns {external:boolean}
 */
function direct(node, callback, inclusive = false) {
    const targets = inclusive ? [node] : node.children;
    if (targets === null || targets === void 0 ? void 0 : targets.length) {
        targets.forEach((target) => callback(target) !== false && direct(target, callback));
    }
}
function escalate(node, callback, inclusive = false) {
    const target = inclusive ? node : node.parent;
    if (target) {
        callback(target) !== false && escalate(target, callback);
    }
}
const indexOf = (children, child) => (children === null || children === void 0 ? void 0 : children.length) && child ? children.indexOf(child) : -1;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJlZS1ub2RlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3RyZWUtbm9kZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFpQkg7O0dBRUc7QUFFSDs7R0FFRztBQUVIOztHQUVHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7O0dBRUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSCxNQUFNLFVBQVUsTUFBTSxDQUF3QixJQUFPLEVBQUUsUUFBNEIsRUFBRSxZQUFxQixLQUFLO0lBQzNHLE1BQU0sT0FBTyxHQUFRLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUUxRCxJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxNQUFNLEVBQUU7UUFDakIsT0FBTyxDQUFDLE9BQU8sQ0FBRSxDQUFFLE1BQVMsRUFBRyxFQUFFLENBQUMsUUFBUSxDQUFFLE1BQU0sQ0FBRSxLQUFLLEtBQUssSUFBSSxNQUFNLENBQUssTUFBTSxFQUFFLFFBQVEsQ0FBRSxDQUFFLENBQUM7S0FDckc7QUFDTCxDQUFDO0FBRUQsTUFBTSxVQUFVLFFBQVEsQ0FBdUIsSUFBTyxFQUFFLFFBQTRCLEVBQUUsWUFBcUIsS0FBSztJQUM1RyxNQUFNLE1BQU0sR0FBTSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUVqRCxJQUFJLE1BQU0sRUFBRTtRQUNSLFFBQVEsQ0FBRSxNQUFNLENBQUUsS0FBSyxLQUFLLElBQUksUUFBUSxDQUFLLE1BQU0sRUFBRSxRQUFRLENBQUUsQ0FBQztLQUNuRTtBQUNMLENBQUM7QUFFRCxNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsQ0FBVyxRQUF1QixFQUFFLEtBQWtCLEVBQVcsRUFBRSxDQUFDLENBQUEsUUFBUSxhQUFSLFFBQVEsdUJBQVIsUUFBUSxDQUFFLE1BQU0sS0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUUsS0FBSyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDIn0=

/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WildcardExp)
/* harmony export */ });
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(16);
/* harmony import */ var _blue_parser__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_blue_parser__WEBPACK_IMPORTED_MODULE_0__);
/**
 * @author Jeff Rose
 */

/**
 * @class module:core.WildcardExp
 * @extends external:RegExp
 * @param {external:string} pattern A wildcard pattern
 */
class WildcardExp extends RegExp {
    constructor(pattern = '*') {
        const regExpPattern = _blue_parser__WEBPACK_IMPORTED_MODULE_0__.wildcardExpression.run(pattern).result;
        super(regExpPattern);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lsZGNhcmQtZXhwLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL3dpbGRjYXJkLWV4cC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFbEQ7Ozs7R0FJRztBQUNILE1BQU0sQ0FBQyxPQUFPLE9BQU8sV0FBWSxTQUFRLE1BQU07SUFDM0MsWUFBYSxVQUFrQixHQUFHO1FBQzlCLE1BQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDLEdBQUcsQ0FBRSxPQUFPLENBQUUsQ0FBQyxNQUFNLENBQUM7UUFDL0QsS0FBSyxDQUFFLGFBQWEsQ0FBRSxDQUFDO0lBQzNCLENBQUM7Q0FDSiJ9

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "AbstractValueComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.AbstractValueComparator),
/* harmony export */   "ApplicationError": () => (/* reexport safe */ _error__WEBPACK_IMPORTED_MODULE_7__.ApplicationError),
/* harmony export */   "AsEnumerableRingBuffer": () => (/* reexport safe */ _collection__WEBPACK_IMPORTED_MODULE_1__.AsEnumerableRingBuffer),
/* harmony export */   "AsPathMatcherFilter": () => (/* reexport safe */ _path_matcher__WEBPACK_IMPORTED_MODULE_11__.AsPathMatcherFilter),
/* harmony export */   "AsSerializableError": () => (/* reexport safe */ _error__WEBPACK_IMPORTED_MODULE_7__.AsSerializableError),
/* harmony export */   "Deferred": () => (/* reexport safe */ _deferred__WEBPACK_IMPORTED_MODULE_4__["default"]),
/* harmony export */   "DelegatingTransformer": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.DelegatingTransformer),
/* harmony export */   "EntriesIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.EntriesIterator),
/* harmony export */   "EqualsPathMatcher": () => (/* reexport safe */ _path_matcher__WEBPACK_IMPORTED_MODULE_11__.EqualsPathMatcher),
/* harmony export */   "FrameworkError": () => (/* reexport safe */ _error__WEBPACK_IMPORTED_MODULE_7__.FrameworkError),
/* harmony export */   "GlobPathMatcher": () => (/* reexport safe */ _path_matcher__WEBPACK_IMPORTED_MODULE_11__.GlobPathMatcher),
/* harmony export */   "GlobPatternInfo": () => (/* reexport safe */ _path_matcher__WEBPACK_IMPORTED_MODULE_11__.GlobPatternInfo),
/* harmony export */   "IllegalStateError": () => (/* reexport safe */ _error__WEBPACK_IMPORTED_MODULE_7__.IllegalStateError),
/* harmony export */   "IndexedIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.IndexedIterator),
/* harmony export */   "KeysIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.KeysIterator),
/* harmony export */   "MediaType": () => (/* reexport safe */ _media_type__WEBPACK_IMPORTED_MODULE_9__["default"]),
/* harmony export */   "MediaTypes": () => (/* reexport module object */ _media_types__WEBPACK_IMPORTED_MODULE_0__),
/* harmony export */   "MultiValueMap": () => (/* reexport safe */ _collection__WEBPACK_IMPORTED_MODULE_1__.MultiValueMap),
/* harmony export */   "Null": () => (/* reexport safe */ _null__WEBPACK_IMPORTED_MODULE_10__.Null),
/* harmony export */   "RangeIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.RangeIterator),
/* harmony export */   "ResizableRingBuffer": () => (/* reexport safe */ _collection__WEBPACK_IMPORTED_MODULE_1__.ResizableRingBuffer),
/* harmony export */   "RingBuffer": () => (/* reexport safe */ _collection__WEBPACK_IMPORTED_MODULE_1__.RingBuffer),
/* harmony export */   "ValuesIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.ValuesIterator),
/* harmony export */   "WildcardExp": () => (/* reexport safe */ _wildcard_exp__WEBPACK_IMPORTED_MODULE_16__["default"]),
/* harmony export */   "XCount": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XCount),
/* harmony export */   "XToArray": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XToArray),
/* harmony export */   "XToMap": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XToMap),
/* harmony export */   "XToMultiValueMap": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XToMultiValueMap),
/* harmony export */   "XToRecord": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XToRecord),
/* harmony export */   "XToSet": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.XToSet),
/* harmony export */   "comparableComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.comparableComparator),
/* harmony export */   "count": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.count),
/* harmony export */   "createNull": () => (/* reexport safe */ _null__WEBPACK_IMPORTED_MODULE_10__.createNull),
/* harmony export */   "dateComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.dateComparator),
/* harmony export */   "direct": () => (/* reexport safe */ _tree_node__WEBPACK_IMPORTED_MODULE_15__.direct),
/* harmony export */   "dispatchable": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.dispatchable),
/* harmony export */   "entriesIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.entriesIterator),
/* harmony export */   "equates": () => (/* reexport safe */ _equatable__WEBPACK_IMPORTED_MODULE_6__.equates),
/* harmony export */   "escalate": () => (/* reexport safe */ _tree_node__WEBPACK_IMPORTED_MODULE_15__.escalate),
/* harmony export */   "getIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.getIterator),
/* harmony export */   "indexOf": () => (/* reexport safe */ _tree_node__WEBPACK_IMPORTED_MODULE_15__.indexOf),
/* harmony export */   "indexedIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.indexedIterator),
/* harmony export */   "invertComparison": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.invertComparison),
/* harmony export */   "isEntries": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.isEntries),
/* harmony export */   "isEntry": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.isEntry),
/* harmony export */   "isJSONArray": () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_13__.isJSONArray),
/* harmony export */   "isJSONObject": () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_13__.isJSONObject),
/* harmony export */   "isJSONValue": () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_13__.isJSONValue),
/* harmony export */   "isNotPrimitive": () => (/* reexport safe */ _primitive__WEBPACK_IMPORTED_MODULE_12__.isNotPrimitive),
/* harmony export */   "isPrimitive": () => (/* reexport safe */ _primitive__WEBPACK_IMPORTED_MODULE_12__.isPrimitive),
/* harmony export */   "keysIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.keysIterator),
/* harmony export */   "likeComparable": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.likeComparable),
/* harmony export */   "likeComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.likeComparator),
/* harmony export */   "likeConstructable": () => (/* reexport safe */ _constructable__WEBPACK_IMPORTED_MODULE_3__.likeConstructable),
/* harmony export */   "likeEnumerable": () => (/* reexport safe */ _enumerable__WEBPACK_IMPORTED_MODULE_5__.likeEnumerable),
/* harmony export */   "likeEquatable": () => (/* reexport safe */ _equatable__WEBPACK_IMPORTED_MODULE_6__.likeEquatable),
/* harmony export */   "likeIterable": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.likeIterable),
/* harmony export */   "likePathMatcher": () => (/* reexport safe */ _path_matcher__WEBPACK_IMPORTED_MODULE_11__.likePathMatcher),
/* harmony export */   "likeReduced": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.likeReduced),
/* harmony export */   "likeSerializable": () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_13__.likeSerializable),
/* harmony export */   "likeTransformer": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.likeTransformer),
/* harmony export */   "naturalComparison": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.naturalComparison),
/* harmony export */   "numberComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.numberComparator),
/* harmony export */   "rangeIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.rangeIterator),
/* harmony export */   "reduce": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.reduce),
/* harmony export */   "serialize": () => (/* reexport safe */ _serializable__WEBPACK_IMPORTED_MODULE_13__.serialize),
/* harmony export */   "stringComparator": () => (/* reexport safe */ _comparable__WEBPACK_IMPORTED_MODULE_2__.stringComparator),
/* harmony export */   "toArray": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.toArray),
/* harmony export */   "toMap": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.toMap),
/* harmony export */   "toMultiValueMap": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.toMultiValueMap),
/* harmony export */   "toRecord": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.toRecord),
/* harmony export */   "toSet": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.toSet),
/* harmony export */   "valuesIterator": () => (/* reexport safe */ _iterable__WEBPACK_IMPORTED_MODULE_8__.valuesIterator),
/* harmony export */   "xCount": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.xCount),
/* harmony export */   "xToArray": () => (/* reexport safe */ _transducer__WEBPACK_IMPORTED_MODULE_14__.xToArray)
/* harmony export */ });
/* harmony import */ var _media_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(1);
/* harmony import */ var _collection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6);
/* harmony import */ var _comparable__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(4);
/* harmony import */ var _constructable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(10);
/* harmony import */ var _deferred__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(11);
/* harmony import */ var _enumerable__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(12);
/* harmony import */ var _equatable__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(13);
/* harmony import */ var _error__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(14);
/* harmony import */ var _iterable__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(7);
/* harmony import */ var _media_type__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(2);
/* harmony import */ var _null__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(5);
/* harmony import */ var _path_matcher__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(15);
/* harmony import */ var _primitive__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(9);
/* harmony import */ var _serializable__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(8);
/* harmony import */ var _transducer__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(17);
/* harmony import */ var _tree_node__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(18);
/* harmony import */ var _wildcard_exp__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(19);
/**
 * @author Jeff Rose
 * @module core
 * @requires parser
 * @requires util
 */
/**
 * @global
 * @external Arguments
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments}
 */
/**
 * @global
 * @external Array
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array}
 */
/**
* @global
* @external ArrayLike
* @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections}
*/
/**
 * @global
 * @external boolean
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @global
 * @external bigint
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @global
 * @external ClassDecorator
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */
/**
 * @global
 * @external Date
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
 */
/**
 * @global
 * @external Error
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
 */
/**
 * @global
 * @external Function
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function}
 */
/**
 * @global
 * @external Iterable
 * @property {external:symbol} Symbol.iterator
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol}
 */
/**
 * @global
 * @external IterableIterator
 * @extends external:Iterable
 * @extends external:Iterator
 * @property {external:symbol} Symbol.iterator
 * @see {@link external:Iterable|Iterable}
 * @see {@link external:Iterator|Iterator}
 */
/**
* @function external:IterableIterator.next
* @returns {external:IteratorResult}
*/
/**
 * @global
 * @external Iterator
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol}
 */
/**
 * @global
 * @external IteratorResult
 * @property {boolean} done Whether or not the iterator is done
 * @property {*} [value] The value
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol}
 */
/**
 * @function external:Iterator.next
 * @returns {external:IteratorResult}
 */
/**
 * @global
 * @external MethodDecorator
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */
/**
 * @global
 * @external number
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#number}
 */
/**
 * @global
 * @external null
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#null-and-undefined}
 */
/**
 * @global
 * @external Map
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */
/**
 * @global
 * @external Object
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object}
 */
/**
 * @global
 * @external ParameterDecorator
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */
/**
 * @global
 * @external Promise
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */
/**
 * @global
 * @external PropertyDecorator
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */
/**
 * @global
 * @external PropertyDescriptor
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}
 */
/**
 * @global
 * @external PropertyDescriptorMap
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties}
 */
/**
 * @global
 * @external PropertyKey
 * @see {@link external:number}
 * @see {@link external:string}
 * @see {@link external:symbol}
 */
/**
 * @global
 * @external Proxy
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy}
 */
/**
 * @global
 * @external ProxyHandler
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions}
 */
/**
 * @global
 * @external RegExp
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp}
 */
/**
 * @global
 * @external Set
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set}
 */
/**
 * @global
 * @external string
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#string}
 */
/**
 * @global
 * @external symbol
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */
/**
 * @global
 * @external undefined
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#null-and-undefined}
 */
/**
 * @global
 * @external void
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#void}
 */
/**
 * @global
 * @external WeakMap
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap}
 */
/**
 * @global
 * @external WeakSet
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet}
 */
/**
 * @global
 * @external Window
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Global_object}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window}
 */
/**
 * @global
 * @external Global
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Global_object}
 * @see {@link https://nodejs.org/api/globals.html#globals_global}
 */
/**
 * @global
 * @external Record
 * @see {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeystype}
 */





















//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFRjs7OztFQUlFO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7Ozs7Ozs7R0FRRztBQUVGOzs7RUFHRTtBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7O0dBR0c7QUFFSDs7Ozs7R0FLRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7OztHQUlHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVIOzs7O0dBSUc7QUFFSDs7Ozs7O0dBTUc7QUFFSDs7Ozs7R0FLRztBQUVIOzs7Ozs7R0FNRztBQUVIOzs7O0dBSUc7QUFFSDs7OztHQUlHO0FBRUg7Ozs7R0FJRztBQUVIOzs7OztHQUtHO0FBRUg7Ozs7O0dBS0c7QUFFSDs7OztHQUlHO0FBRUgsT0FBTyxRQUFRLENBQUM7QUFDaEIsT0FBTyxLQUFLLFVBQVUsTUFBTSxlQUFlLENBQUM7QUFFNUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDO0FBQ3RCLGNBQWMsY0FBYyxDQUFDO0FBQzdCLGNBQWMsY0FBYyxDQUFDO0FBQzdCLGNBQWMsaUJBQWlCLENBQUM7QUFDaEMsT0FBTyxFQUFFLE9BQU8sSUFBSSxRQUFRLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFDakQsY0FBYyxjQUFjLENBQUM7QUFDN0IsY0FBYyxhQUFhLENBQUM7QUFDNUIsY0FBYyxTQUFTLENBQUM7QUFDeEIsY0FBYyxZQUFZLENBQUM7QUFDM0IsY0FBYyxhQUFhLENBQUM7QUFDNUIsT0FBTyxFQUFFLE9BQU8sSUFBSSxTQUFTLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDcEQsY0FBYyxRQUFRLENBQUM7QUFDdkIsY0FBYyxnQkFBZ0IsQ0FBQztBQUMvQixjQUFjLFVBQVUsQ0FBQztBQUN6QixjQUFjLGFBQWEsQ0FBQztBQUM1QixjQUFjLGdCQUFnQixDQUFDO0FBQy9CLGNBQWMsY0FBYyxDQUFDO0FBQzdCLGNBQWMsYUFBYSxDQUFDO0FBQzVCLE9BQU8sRUFBRSxPQUFPLElBQUksV0FBVyxFQUFFLE1BQU0sZ0JBQWdCLENBQUMifQ==
})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
