/**
 * @module ndigo-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Serializable, JSONValue } from './serializable.js';
import {
    Comparator,
    StringComparable,
    chainComparisons,
    compareBy,
    invertComparison,
    stringComparator,
    numberComparator,
} from './comparable.js';
import { Null } from './null.js';
import { isString } from '@ndigo/util/types';
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
    PARAMETERLESS_CACHE_LIMIT = 256,
    parameterizedRegistry = new Map<string, MediaType>(),
    parameterizedOrder: string[] = [],
    parameterlessRegistry = new Map<string, MediaType>(),
    parameterlessOrder: string[] = [],
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
 * Splits a header section on `delimiter`, honoring quoted strings
 * (RFC 2045 §5.1): a delimiter inside `"…"` is data, not a separator —
 * splitting naively corrupts quoted values (COR-5, KRN-REV-MEDIA-18).
 */
const splitQuoted = (section: string, delimiter: string): string[] => {
    const parts: string[] = [];
    let start = 0,
        inQuotes = false;
    const length = section.length;
    for (let index = 0; index < length; index++) {
        const char = section[index];
        if (inQuotes && char === '\\') {
            // Escaped character inside a quoted string (e.g. `\"`) — skip
            // it so a quoted `"` is not mistaken for the closing quote.
            index++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
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
 * Removes `key` from a FIFO eviction order, if present — used when a
 * bounded-cache entry is promoted to the permanent registry (SEC-7).
 */
const removeFromOrder = (order: string[], key: string): void => {
    const index = order.indexOf(key);
    if (index !== -1) {
        order.splice(index, 1);
    }
};

/**
 * Returns the interned instance for `key`, constructing it via `factory`
 * on a miss. Parse-originated expressions — parameterless and parameterized
 * alike — go through bounded FIFO caches so attacker-controlled header
 * values cannot grow the registry unboundedly (DSG-1, SEC-7). Entries
 * interned via the `registered()` path (`permanent`) live process-lifetime
 * in `typeRegistry`, so the `MediaTypes.*` constants always resolve.
 */
const intern = (key: string, factory: () => MediaType, parameterized: boolean, permanent = false): MediaType => {
    const cached = typeRegistry.get(key) ?? parameterlessRegistry.get(key) ?? parameterizedRegistry.get(key);
    if (cached !== undefined) {
        return cached;
    }

    if (permanent) {
        // Promote a bounded-cache instance parsed earlier so the constant
        // becomes process-lifetime; otherwise intern it permanently (SEC-7).
        const bounded = parameterizedRegistry.get(key) ?? parameterlessRegistry.get(key);
        if (bounded !== undefined) {
            removeFromOrder(parameterlessOrder, key);
            removeFromOrder(parameterizedOrder, key);
            typeRegistry.set(key, bounded);
            return bounded;
        }
        const mediaType = factory();
        typeRegistry.set(key, mediaType);
        return mediaType;
    }

    const mediaType = factory();
    if (parameterized) {
        parameterizedRegistry.set(key, mediaType);
        parameterizedOrder.push(key);
        if (parameterizedOrder.length > PARAMETERIZED_CACHE_LIMIT) {
            parameterizedRegistry.delete(parameterizedOrder.shift() as string);
        }
    } else {
        parameterlessRegistry.set(key, mediaType);
        parameterlessOrder.push(key);
        if (parameterlessOrder.length > PARAMETERLESS_CACHE_LIMIT) {
            parameterlessRegistry.delete(parameterlessOrder.shift() as string);
        }
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

const qualityFactorComparator: Comparator<MediaType> = {
    compare: chainComparisons(
        invertComparison(compareBy((mediaType: MediaType) => mediaType.qualityFactor, numberComparator.compare)),
        specificityComparator.compare.bind(specificityComparator)
    ),
};

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
    const parts = splitQuoted(expression.substring(slashIndex + 1), ';');
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

/**
 * Interns `typeOrExpression` with the same normalization `for` performs,
 * shared by both public entry points: parse/`for` intern into the bounded
 * FIFO caches, while `registered()` (`permanent`) interns into
 * `typeRegistry` so `MediaTypes.*` constants stay process-lifetime (SEC-7).
 *
 * @param typeOrExpression - Type/subtype components or a full expression.
 * @param subtype - The subtype (component form) or wildcard default.
 * @param parameters - The parameters (component form).
 * @param permanent - Whether the entry is process-lifetime (`registered()`).
 * @returns The interned instance, or `null` for an invalid expression.
 */
function internComponents(
    typeOrExpression: SupportedMediaType | string,
    subtype: string,
    parameters: MediaTypeParameters,
    permanent: boolean
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
            keys(canonicalParameters).length > 0,
            permanent
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
        // The wildcard-subtype component form (`for(type, '*', params)`) must
        // fold its parameters into the intern key, otherwise a later call with
        // different parameters is served the first instance (KRN-REV-MEDIA-07).
        const canonicalType = rawType.toLowerCase(),
            canonicalParameters = sortParameters(
                Object.fromEntries(Object.entries(parameters).map(([name, value]) => [name.toLowerCase(), value]))
            );
        return intern(
            `${canonicalType}${stringifyParameters(canonicalParameters)}`,
            () => new MediaType(canonicalType as SupportedMediaType, WILDCARD, canonicalParameters),
            keys(canonicalParameters).length > 0,
            permanent
        );
    }

    return intern(
        normalized.key,
        () => new MediaType(normalized.type as SupportedMediaType, normalized.subtype, normalized.parameters),
        keys(normalized.parameters).length > 0,
        permanent
    );
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
        // A comma inside a quoted parameter value (e.g. `boundary="a,b"`) is
        // data, not an entry separator.
        for (const part of splitQuoted(accept, ',')) {
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
        return internComponents(typeOrExpression, subtype, parameters, false);
    }

    /**
     * Number of instances currently held by the process-wide intern
     * registry: the permanent registered entries plus the bounded
     * parameterless and parameterized caches. Exposed so the registry's
     * boundedness is observable in tests (DSG-1, SEC-7).
     */
    static get registrySize(): number {
        return typeRegistry.size + parameterlessRegistry.size + parameterizedRegistry.size;
    }

    static qualityFactorComparator = qualityFactorComparator;

    static specificityComparator = specificityComparator;

    /**
     * Registers/retrieves a media type by authored components, guaranteed
     * non-null: the interned-registry path for programmatic construction
     * (`MediaTypes.*` constants) where a missing entry is a programming
     * error, not a parse outcome. Registered entries are interned
     * process-lifetime — they are exempt from the bounded FIFO caches that
     * cap parse-originated entries (SEC-7). Use {@link MediaType.for} for
     * parsing user/header values — those can legitimately return `null`.
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
        const mediaType = internComponents(type, subtype, parameters, true);
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

        // The structured-syntax suffix is whatever follows the *last* `+`
        // (RFC 6838 §4.2): a subtype such as `x.y+z+xml` keeps `x.y+z` as the
        // base and `xml` as the suffix, so `type/*+xml` can match it.
        const plusIndex = subtype.lastIndexOf('+');
        if (plusIndex !== -1 && plusIndex < subtype.length - 1) {
            const base = subtype.substring(0, plusIndex);
            this.subtype = base;
            this.facets = base.split('.');
            this.suffix = subtype.substring(plusIndex + 1);
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
            if (this.isWildcardSubtype) {
                // A suffix-specific wildcard such as `application/*+xml` includes
                // only values carrying the same suffix; a plain `application/*`
                // (suffix `null`) includes every subtype.
                if (this.suffix !== null) {
                    return value.suffix === this.suffix;
                }
                return true;
            }
            if (this.subtype === value.subtype) {
                return true;
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
        // The constructor splits `subtype+suffix`; re-join them so
        // `application/problem+json` does not degrade to `application/problem`.
        const subtype = this.suffix === null ? this.subtype : `${this.subtype}+${this.suffix}`;
        return new MediaType(this.type, subtype, { ...this.parameters, charset });
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
