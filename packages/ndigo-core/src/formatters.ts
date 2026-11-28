/**
 * Locale-aware Intl formatters for dates, numbers, relative time, and lists.
 */
import {
    cachedFormatter,
    dateTimeCache,
    listCache,
    numberCache,
    relativeTimeCache,
    stringifyOptions,
} from './_formatter-cache.js';
import type {
    DateTimeFormatterOptions,
    ListFormatterOptions,
    NumberFormatterOptions,
    RelativeTimeFormatterOptions,
} from './formatter-options.js';

/**
 * Formats a Date for display in an explicit locale and time zone.
 *
 * A thin wrapper over `Intl.DateTimeFormat` that caches the underlying
 * instance per option set and rejects invalid inputs with a clear error.
 *
 * @example
 * ```ts
 * const formatter = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' });
 * formatter.format(new Date('2026-09-13T12:00:00Z')); // 'Sep 13, 2026'
 * ```
 */
export class DateTimeFormatter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "DateTimeFormatter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object DateTimeFormatter]"
     */
    get [Symbol.toStringTag](): string {
        return 'DateTimeFormatter';
    }

    readonly #format: Intl.DateTimeFormat;

    /**
     * Creates a date/time formatter.
     *
     * @param options - Locale, time zone, and presentation styles.
     */
    constructor(options: DateTimeFormatterOptions) {
        const { locale, timeZone, dateStyle, timeStyle } = options;
        const key = stringifyOptions({
            locale,
            timeZone: timeZone ?? null,
            dateStyle: dateStyle ?? null,
            timeStyle: timeStyle ?? null,
        });

        this.#format = cachedFormatter(
            dateTimeCache,
            key,
            () =>
                new Intl.DateTimeFormat(locale, {
                    ...(timeZone ? { timeZone } : {}),
                    ...(dateStyle ? { dateStyle } : {}),
                    ...(timeStyle ? { timeStyle } : {}),
                })
        );
    }

    /**
     * Formats a date value.
     *
     * @param value - A `Date`, an ISO 8601 string, or a millisecond timestamp.
     * @returns The locale-formatted date string.
     * @throws When the value cannot be parsed as a valid date.
     */
    format(value: Date | string | number): string {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new TypeError(`Cannot format invalid date: ${String(value)}`);
        }
        return this.#format.format(date);
    }
}

/**
 * Formats numbers for display in an explicit locale.
 *
 * A thin wrapper over `Intl.NumberFormat` that caches the underlying
 * instance per option set.
 *
 * @example
 * ```ts
 * const formatter = new NumberFormatter({ locale: 'de-DE', style: 'currency', currency: 'EUR' });
 * formatter.format(1234.5); // '1.234,50 EUR'
 * ```
 */
export class NumberFormatter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "NumberFormatter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object NumberFormatter]"
     */
    get [Symbol.toStringTag](): string {
        return 'NumberFormatter';
    }

    readonly #format: Intl.NumberFormat;

    /**
     * Creates a number formatter.
     *
     * @param options - Locale and number presentation options.
     */
    constructor(options: NumberFormatterOptions) {
        const { locale, style, currency, unit, minimumFractionDigits, maximumFractionDigits, notation } = options;
        const key = stringifyOptions({
            locale,
            style: style ?? null,
            currency: currency ?? null,
            unit: unit ?? null,
            minimumFractionDigits: minimumFractionDigits ?? null,
            maximumFractionDigits: maximumFractionDigits ?? null,
            notation: notation ?? null,
        });

        this.#format = cachedFormatter(
            numberCache,
            key,
            () =>
                new Intl.NumberFormat(locale, {
                    ...(style ? { style } : {}),
                    ...(currency ? { currency } : {}),
                    ...(unit ? { unit } : {}),
                    ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
                    ...(maximumFractionDigits !== undefined ? { maximumFractionDigits } : {}),
                    ...(notation ? { notation } : {}),
                })
        );
    }

    /**
     * Formats a numeric value.
     *
     * @param value - The number to format.
     * @returns The locale-formatted number string.
     */
    format(value: number): string {
        return this.#format.format(value);
    }
}

/**
 * Formats relative time (e.g. "3 days ago") in an explicit locale.
 *
 * A thin wrapper over `Intl.RelativeTimeFormat` that caches the underlying
 * instance per option set.
 *
 * @example
 * ```ts
 * const formatter = new RelativeTimeFormatter({ locale: 'en', numeric: 'always' });
 * formatter.format(-3, 'day'); // '3 days ago'
 * ```
 */
export class RelativeTimeFormatter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "RelativeTimeFormatter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object RelativeTimeFormatter]"
     */
    get [Symbol.toStringTag](): string {
        return 'RelativeTimeFormatter';
    }

    readonly #format: Intl.RelativeTimeFormat;

    /**
     * Creates a relative-time formatter.
     *
     * @param options - Locale and presentation options.
     */
    constructor(options: RelativeTimeFormatterOptions) {
        const { locale, numeric, style } = options;
        const key = stringifyOptions({ locale, numeric: numeric ?? null, style: style ?? null });

        this.#format = cachedFormatter(
            relativeTimeCache,
            key,
            () =>
                new Intl.RelativeTimeFormat(locale, {
                    ...(numeric ? { numeric } : {}),
                    ...(style ? { style } : {}),
                })
        );
    }

    /**
     * Formats a relative time value.
     *
     * @param value - The delta (negative for the past).
     * @param unit - The time unit.
     * @returns The locale-formatted relative time string.
     */
    format(value: number, unit: Intl.RelativeTimeFormatUnit): string {
        return this.#format.format(value, unit);
    }
}

/**
 * Formats string lists (e.g. "a, b, and c") in an explicit locale.
 *
 * A thin wrapper over `Intl.ListFormat` that caches the underlying instance
 * per option set.
 *
 * @example
 * ```ts
 * const formatter = new ListFormatter({ locale: 'en', type: 'conjunction' });
 * formatter.format(['Ada', 'Grace']); // 'Ada and Grace'
 * ```
 */
export class ListFormatter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "ListFormatter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object ListFormatter]"
     */
    get [Symbol.toStringTag](): string {
        return 'ListFormatter';
    }

    readonly #format: Intl.ListFormat;

    /**
     * Creates a list formatter.
     *
     * @param options - Locale and list presentation options.
     */
    constructor(options: ListFormatterOptions) {
        const { locale, type, style } = options;
        const key = stringifyOptions({ locale, type: type ?? null, style: style ?? null });

        this.#format = cachedFormatter(
            listCache,
            key,
            () =>
                new Intl.ListFormat(locale, {
                    ...(type ? { type } : {}),
                    ...(style ? { style } : {}),
                })
        );
    }

    /**
     * Formats a list of strings.
     *
     * @param values - The strings to join.
     * @returns The locale-formatted list string.
     */
    format(values: readonly string[]): string {
        return this.#format.format(values);
    }
}
