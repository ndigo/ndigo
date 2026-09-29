/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
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
    PARAMETERIZED_CACHE_LIMIT = 128,
    parameterizedRegistry = new Map<string, MediaType>(),
    parameterizedOrder: string[] = [],
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
 * Parameter values needing quotes when serialized (RFC 2045 §5.1
 * tspecials-impacting-subset: whitespace, `;`, `"`, `=`, `,`, parens).
 */
const requiresQuoting = /[\s;"=(),]/;

/**
 * Splits a `;`-separated media-type parameter section into parts, honoring
 * quoted strings (RFC 2045 §5.1): a `;` inside `"…"` is parameter data, not
 * a delimiter — splitting naively corrupts quoted values (COR-5).
 */
const splitParameters = (section: string): string[] => {
    const parts: string[] = [];
    let start = 0,
        inQuotes = false;
    for (let index = 0; index < section.length; index++) {
        const char = section[index];
        if (inQuotes && char === '\\') {
            // Escaped character inside a quoted string (e.g. `\"`) — skip
            // it so a quoted `"` is not mistaken for the closing quote.
            index++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ';' && !inQuotes) {
            parts.push(section.substring(start, index));
            start = index + 1;
        }
    }
    parts.push(section.substring(start));
    return parts;
};

/**
 * Removes surrounding quotes from a parameter value, unescaping `\"` and
 * `\\` (RFC 2045 §5.1, COR-5). The quote-escape is undone before the
 * backslash-escape so any literal `\"` in the original value round-trips.
 */
const unquote = (value: string): string => {
    if (value.length < 2 || value[0] !== '"' || value[value.length - 1] !== '"') {
        return value;
    }
    return value
        .substring(1, value.length - 1)
        .replaceAll('\\"', '"')
        .replaceAll('\\\\', '\\');
};

/**
 * Returns a copy of `value` with entries ordered by parameter name, so two
 * media types carrying the same parameters serialize, key, and compare
 * identically regardless of the order the parameters were provided (DSG-1).
 */
const sortParameters = (value: MediaTypeParameters): MediaTypeParameters => {
    const sorted: MediaTypeParameters = {};
    for (const name of Object.keys(value).sort((nameA, nameB) => stringComparator.compare(nameA, nameB))) {
        sorted[name] = value[name];
    }
    return sorted;
};

/**
 * Returns the interned instance for `key`, constructing it via `factory`
 * on a miss. Parameterless expressions are interned process-lifetime in
 * `typeRegistry` (a finite type/subtype space); parameterized expressions
 * go through the bounded FIFO cache so attacker-controlled header values
 * cannot grow the registry unboundedly (DSG-1).
 */
const intern = (key: string, factory: () => MediaType, parameterized: boolean): MediaType => {
    const cached = typeRegistry.get(key) ?? parameterizedRegistry.get(key);
    if (cached !== undefined) {
        return cached;
    }
    const mediaType = factory();
    if (parameterized) {
        parameterizedRegistry.set(key, mediaType);
        parameterizedOrder.push(key);
        if (parameterizedOrder.length > PARAMETERIZED_CACHE_LIMIT) {
            parameterizedRegistry.delete(parameterizedOrder.shift() as string);
        }
    } else {
        typeRegistry.set(key, mediaType);
    }
    return mediaType;
};

/**
 * Converts a `MediaTypeParameters` object into a formatted string suitable
 * for a media type header. Parameters are joined with semicolons in
 * canonical (name-sorted) order, e.g. ";charset=utf-8;level=1". Values
 * containing header separators are quoted with `"` and `\` escaped per
 * RFC 2045 §5.1 so parsing is round-trip safe (Wave 6, 2026-09-27; COR-5).
 * @param value - The `MediaTypeParameters` object to stringify.
 * @returns A string representation of the parameters, or an empty string if no parameters are present.
 */
const stringifyParameters = (value: MediaTypeParameters): string => {
    const pairs = Object.entries(value).sort(([nameA], [nameB]) => stringComparator.compare(nameA, nameB));
    if (!pairs.length) return '';
    return pairs.reduce((result, [key, val]) => {
        const stringValue = String(val);
        const serialized = requiresQuoting.test(stringValue)
            ? `"${stringValue.replaceAll('\\', '\\\\').replaceAll('"', '\\"')}"`
            : stringValue;
        return `${result};${key}=${serialized}`;
    }, '');
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

/**
 * Normalizes a raw media-type expression for registry interning: folds the
 * type and subtype to lower case (RFC 6838 §4.2 — both are case-insensitive
 * in HTTP 1.x), folds parameter NAMES to lower case (RFC 2045 §5.1), and
 * unquotes quoted parameter values (`;` inside quotes is data, not a
 * delimiter; `\"` and `\\` are unescaped — COR-5). Parameter VALUES keep
 * their case. The result is the canonical key that interning uses, so
 * header-case variants converge on one {@link MediaType} instance (Wave 6,
 * 2026-09-27).
 *
 * @param expression - A full `type/subtype;param=value;…` expression.
 * @returns The canonical key plus the normalized parse pieces, or `null`
 *   when the expression has no `/`.
 */
function normalizeMediaTypeExpression(
    expression: string
): { key: string; type: string; subtype: string; parameters: MediaTypeParameters } | null {
    const slashIndex = expression.indexOf('/');
    if (slashIndex === -1) {
        return null;
    }
    const type = expression.substring(0, slashIndex).trim().toLowerCase();
    if (type === '' || /[\s;]/.test(type)) {
        return null;
    }
    const parts = splitParameters(expression.substring(slashIndex + 1));
    let subtype = (parts.shift() as string).trim().toLowerCase();
    if (subtype === '') {
        subtype = WILDCARD;
    } else if (/[\s;]/.test(subtype)) {
        return null;
    }
    const parameters: MediaTypeParameters = {};
    for (const part of parts) {
        const equalsIndex = part.indexOf('=');
        if (equalsIndex <= 0) {
            // Bare or empty-name parameters cannot be parsed safely — skip.
            continue;
        }
        const name = part.substring(0, equalsIndex).trim().toLowerCase();
        if (name === '') {
            continue;
        }
        parameters[name] = unquote(part.substring(equalsIndex + 1).trim());
    }
    const sortedParameters = sortParameters(parameters);
    return {
        key: `${type}/${subtype}${stringifyParameters(sortedParameters)}`,
        type,
        subtype,
        parameters: sortedParameters,
    };
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
            // Malformed weights (e.g. `q=abc`) fall back to the default of 1
            // (RFC 7231 §5.3.1) — a parse artifact must never silently mean
            // "never" in negotiation (COR-7).
            const quality = parseFloat(value) as number;
            return Number.isFinite(quality) ? quality : 1;
        }
        if (typeof value === 'number') {
            return value as number;
        }
        return 1;
    }

    /**
     * Whether this media type is JSON: `application/json`, `text/json`,
     * or any `+json`-suffixed type (e.g. `application/problem+json`).
     * The single source for JSON-sniffing decisions previously
     * re-implemented in `http-request-limits` and the transform
     * interceptor (Wave 6, 2026-09-27).
     */
    get isJSON(): boolean {
        return this.suffix === 'json' || this.baseType === 'application/json' || this.baseType === 'text/json';
    }

    /**
     * Parses an `Accept` header value into {@link MediaType} instances in
     * header order. Each entry keeps its quality factor in
     * `parameters.q` — use the {@link qualityFactor} getter and
     * `MediaType.qualityFactorComparator` for negotiation decisions
     * (`qualityFactor === 0` means "never"). Malformed entries are dropped.
     *
     * @param accept - The raw `Accept` header value.
     * @returns The parsed media types (empty when absent or all-malformed).
     */
    static parseAccept(accept: string | null | undefined): MediaType[] {
        if (!accept) {
            return [];
        }
        const result: MediaType[] = [];
        for (const part of accept.split(',')) {
            const mediaType = MediaType.for(part.trim());
            if (mediaType !== null) {
                result.push(mediaType);
            }
        }
        return result;
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
        if (isString(subtype) && subtype !== WILDCARD) {
            // Component form (DSG-2): fold type, subtype, and parameter
            // names to lower case before keying/construction so this path
            // converges with expression parsing; parameter VALUES keep
            // their case (matching the expression path). The canonical key
            // is the same one expression parsing produces.
            const canonicalType = typeOrExpression.toLowerCase(),
                canonicalSubtype = subtype.toLowerCase(),
                canonicalParameters = sortParameters(
                    Object.fromEntries(Object.entries(parameters).map(([name, value]) => [name.toLowerCase(), value]))
                ),
                mediaTypeKey = `${canonicalType}/${canonicalSubtype}${stringifyParameters(canonicalParameters)}`;

            return intern(
                mediaTypeKey,
                () => new MediaType(canonicalType as SupportedMediaType, canonicalSubtype, canonicalParameters),
                keys(canonicalParameters).length > 0
            );
        }

        if (!typeOrExpression?.length) {
            return null;
        }

        const normalized = normalizeMediaTypeExpression(typeOrExpression as string);

        if (normalized === null) {
            // No slash found — treat as type only with wildcard subtype.
            // The type token must be plausible: empty/whitespace, a `;`,
            // or a stray `/` would serialize into an unparseable entry
            // (COR-6; `/foo` reaches here via the empty-type normalize null).
            const rawType = (typeOrExpression as string).trim();
            if (rawType === '' || /[/\s;]/.test(rawType)) {
                return null;
            }
            return intern(
                rawType.toLowerCase(),
                () => new MediaType(rawType.toLowerCase() as SupportedMediaType, WILDCARD, parameters),
                false
            );
        }

        return intern(
            normalized.key,
            () => new MediaType(normalized.type as SupportedMediaType, normalized.subtype, normalized.parameters),
            keys(normalized.parameters).length > 0
        );
    }

    /**
     * Number of instances currently held by the process-wide intern
     * registry: parameterless entries plus the bounded parameterized cache.
     * Exposed so the registry's boundedness is observable in tests (DSG-1).
     */
    static get registrySize(): number {
        return typeRegistry.size + parameterizedRegistry.size;
    }

    static qualityFactorComparator = qualityFactorComparator;

    static specificityComparator = specificityComparator;

    /**
     * Registers/retrieves a media type by authored components, guaranteed
     * non-null: the interned-registry path for programmatic construction
     * (`MediaTypes.*` constants) where a missing entry is a programming
     * error, not a parse outcome. Use {@link MediaType.for} for parsing
     * user/header values — those can legitimately return `null`.
     *
     * @param type - The top-level type (e.g. `'application'`).
     * @param subtype - The subtype or wildcard (default `'*'`).
     * @param parameters - Optional parameters.
     * @throws {IllegalStateError} When the composed expression is empty.
     */
    static registered(
        type: SupportedMediaType | string,
        subtype: string = WILDCARD,
        parameters: MediaTypeParameters = {}
    ): MediaType {
        const mediaType = MediaType.for(type as SupportedMediaType, subtype, parameters);
        if (mediaType === null) {
            throw new IllegalStateError(`Invalid registered media type: ${String(type)}/${String(subtype)}`);
        }
        return mediaType;
    }

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
