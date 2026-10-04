/**
 * @module blue-content
 * @since 1.0.0
 * @author Jeff Rose
 */
import { Equatable, JSONValue, Serializable, StringComparable, stringComparator } from '@blue/core';

const { defineProperty } = Reflect;

/**
 * BCP 47-ish shape for a language tag: a 2–8 letter primary subtag followed
 * by 1–8 alphanumeric extension subtags. This is deliberately stricter
 * than `Intl` (which silently accepts near-anything): quotable and
 * whitespace characters — `"`, `<`, `>`, `'`, `&`, control chars — never
 * pass, so a validated value is safe in generated markup and as a cache
 * key.
 */
const languageTagPattern = /^[A-Za-z]{2,8}(?:-[A-Za-z0-9]{1,8})*$/u;

/**
 * Cap on tag length — 8 primary + 8×(8+1) extension chars worst case is
 * 80; 64 keeps room for real tags while bounding attacker-supplied input.
 */
const MAX_LOCALE_LENGTH = 64;

/**
 * Validates and canonicalizes a language tag.
 *
 * Rejects non-strings, empty/overlong values, tags with characters outside
 * the BCP 47 alphabet (quotes, whitespace, angle brackets), and tags the
 * platform's `Intl` implementation refuses. Returns the canonical form
 * (`EN-us` → `en-US`) or `undefined` when the value is not a usable tag.
 *
 * @param value - The candidate language tag.
 * @returns The canonical tag, or `undefined` when unusable.
 */
export const normalizeLocale = (value: unknown): string | undefined => {
    if (typeof value !== 'string' || value.length === 0 || value.length > MAX_LOCALE_LENGTH) {
        return undefined;
    }
    if (!languageTagPattern.test(value)) {
        return undefined;
    }
    try {
        return Intl.getCanonicalLocales(value)[0];
    } catch {
        return undefined;
    }
};

/**
 * Represents a validated, canonicalized BCP 47 language tag.
 *
 * The instance stores only the canonical tag; construction validates and
 * canonicalizes input, so misspelled or malformed codes (`en_US`, `en US`,
 * markup-injectable values) fail fast instead of silently missing content.
 *
 * ```ts
 * new LanguageCode('EN-us').code; // 'en-US'
 * LanguageCode.for('en_us');      // null
 * String(LanguageCodes.EN_US);    // 'en-US'
 * ```
 */
export class LanguageCode implements Serializable, Equatable<LanguageCode>, StringComparable<LanguageCode> {
    /**
     * The canonical language tag used for lookups and comparisons.
     */
    readonly code!: string;

    get [Symbol.toStringTag](): string {
        return `LanguageCode:${this.code}`;
    }

    /**
     * Creates a validated language code for the given tag.
     *
     * @param code - The language tag to canonicalize.
     * @throws {TypeError} When the value is not a usable BCP 47 tag.
     */
    constructor(code: string) {
        const canonical = normalizeLocale(code);
        if (canonical === undefined) {
            throw new TypeError(`Invalid language tag: "${code}"`);
        }
        /**
         * @readonly
         */
        defineProperty(this, 'code', {
            value: canonical,
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }

    /**
     * Parses a language tag without throwing.
     *
     * @param value - The candidate language tag.
     * @returns A {@link LanguageCode}, or `null` when the value is unusable.
     */
    static for(value: unknown): LanguageCode | null {
        const canonical = normalizeLocale(value);
        return canonical === undefined ? null : new LanguageCode(canonical);
    }

    /**
     * Compares complete canonical tags, including region, script, and extensions.
     * Equality is by value, not instance identity or shared base language.
     */
    equals(other: LanguageCode): boolean {
        return other instanceof LanguageCode && this.code === other.code;
    }

    /**
     * Orders canonical tags lexicographically, not by language preference or specificity.
     * @returns A negative number, zero, or a positive number for less, equal, or greater.
     */
    compareTo(other: LanguageCode): number {
        return stringComparator.compare(this.code, other.code);
    }

    /**
     * Orders canonical tags lexicographically with case ignored.
     * @returns A negative number, zero, or a positive number for less, equal, or greater.
     */
    compareToIgnoreCase(other: LanguageCode): number {
        return stringComparator.compareIgnoreCase(this.code, other.code);
    }

    /**
     * @returns {module:core.JSONObject} A JSON representation of the language code
     */
    toJSON(): JSONValue {
        return this.code;
    }

    /**
     * @returns {string} A string representation of the language code
     */
    toString(): string {
        return this.code;
    }
}
