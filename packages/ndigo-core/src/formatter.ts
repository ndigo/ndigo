/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { IllegalStateError } from './error.js';

/**
 * Shared formatting options. The locale is always explicit; the time zone is
 * always explicit for date/time formatting so server-rendered output can be
 * pinned and hydrated identically on the client (never ambient server time).
 */
export interface FormatOptions {
    /**
     * A BCP 47 language tag, e.g. `en-US`, `fr-CA`, `de`.
     */
    locale: string;
    /**
     * An IANA time zone, e.g. `UTC`, `America/New_York`.
     */
    timeZone?: string;
}

/**
 * Options for {@link DateTimeFormatter}.
 */
export interface DateTimeFormatterOptions extends FormatOptions {
    /**
     * Predefined date presentation style.
     */
    dateStyle?: Intl.DateTimeFormatOptions['dateStyle'];
    /**
     * Predefined time presentation style.
     */
    timeStyle?: Intl.DateTimeFormatOptions['timeStyle'];
}

/**
 * Options for {@link NumberFormatter}.
 */
export interface NumberFormatterOptions extends FormatOptions {
    /**
     * Number presentation style.
     */
    style?: Intl.NumberFormatOptions['style'];
    /**
     * ISO 4217 currency code — required when `style` is `currency`.
     */
    currency?: string;
    /**
     * Unit identifier — used when `style` is `unit`.
     */
    unit?: string;
    /**
     * Minimum digits after the decimal separator.
     */
    minimumFractionDigits?: number;
    /**
     * Maximum digits after the decimal separator.
     */
    maximumFractionDigits?: number;
    /**
     * Compact or scientific notation.
     */
    notation?: Intl.NumberFormatOptions['notation'];
}

/**
 * Options for {@link RelativeTimeFormatter}.
 */
export interface RelativeTimeFormatterOptions extends FormatOptions {
    /**
     * `auto` allows strings like "yesterday" where the language supports them.
     */
    numeric?: 'always' | 'auto';
    /**
     * Message length.
     */
    style?: 'long' | 'short' | 'narrow';
}

/**
 * Options for {@link ListFormatter}.
 */
export interface ListFormatterOptions extends FormatOptions {
    /**
     * List semantics: conjunction (and), disjunction (or), or unit.
     */
    type?: 'conjunction' | 'disjunction' | 'unit';
    /**
     * Message length.
     */
    style?: 'long' | 'short' | 'narrow';
}

const stringifyOptions = (options: object): string => {
    const entries = Object.entries(options).sort(([a], [b]) => a.localeCompare(b));
    return JSON.stringify(entries);
};

// Module-level caches: Intl constructors are expensive and formatters are
// immutable after construction, so instances are shared per option set.
// Bounded: when the cap is exceeded the cache resets, so long-lived
// processes cannot grow it without limit (the locale half of the key is
// request-derived).
const dateTimeCache = new Map<string, Intl.DateTimeFormat>();
const numberCache = new Map<string, Intl.NumberFormat>();
const relativeTimeCache = new Map<string, Intl.RelativeTimeFormat>();
const listCache = new Map<string, Intl.ListFormat>();

/** Cap on concurrently cached formatter instances per Intl kind. */
const MAX_CACHED_FORMATTERS = 256;

/**
 * Returns the cached formatter for `key`, creating and caching it on a miss.
 *
 * @template T - The Intl formatter type.
 * @param cache - The per-kind formatter cache.
 * @param key - The option-set cache key.
 * @param create - Builder for a fresh formatter.
 * @returns The cached (or freshly created) formatter.
 */
function cachedFormatter<T>(cache: Map<string, T>, key: string, create: () => T): T {
    let formatter = cache.get(key);
    if (formatter === undefined) {
        formatter = create();
        if (cache.size >= MAX_CACHED_FORMATTERS) {
            cache.clear();
        }
        cache.set(key, formatter);
    }
    return formatter;
}

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
     * @throws {TypeError} When the value cannot be parsed as a valid date.
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

/**
 * Options for {@link createFormattingService}.
 */
export interface FormattingServiceOptions {
    /**
     * Default locale applied to formatters that do not specify one. When
     * neither this nor a per-formatter locale is set, creating a formatter
     * throws — the ambient runtime locale is never used.
     */
    locale?: string;
    /**
     * Default time zone applied to formatters that do not specify one.
     */
    timeZone?: string;
}

/**
 * Formatter options with all shared fields optional — used by
 * {@link FormattingService} where service-wide defaults fill the gaps.
 */
export interface DefaultableFormatOptions {
    locale?: string;
    timeZone?: string;
}

/** {@link DateTimeFormatter} options with optional shared fields (service-style). */
export type DateTimeFormatOptions = Omit<DateTimeFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/** {@link NumberFormatter} options with optional shared fields (service-style). */
export type NumberFormatOptions = Omit<NumberFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/** {@link RelativeTimeFormatter} options with optional shared fields (service-style). */
export type RelativeTimeFormatOptions = Omit<RelativeTimeFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/** {@link ListFormatter} options with optional shared fields (service-style). */
export type ListFormatOptions = Omit<ListFormatterOptions, keyof DefaultableFormatOptions> & DefaultableFormatOptions;

/**
 * A registry-style factory producing configured formatters.
 *
 * Each method returns a formatter with the service defaults applied; the
 * defaults can be overridden per formatter. Underlying `Intl` instances are
 * cached per option set, so repeated construction is cheap.
 */
export interface FormattingService {
    /**
     * Creates a {@link DateTimeFormatter} with the service defaults.
     */
    date(options?: DateTimeFormatOptions): DateTimeFormatter;
    /**
     * Creates a {@link NumberFormatter} with the service defaults.
     */
    number(options?: NumberFormatOptions): NumberFormatter;
    /**
     * Creates a {@link RelativeTimeFormatter} with the service defaults.
     */
    relativeTime(options?: RelativeTimeFormatOptions): RelativeTimeFormatter;
    /**
     * Creates a {@link ListFormatter} with the service defaults.
     */
    list(options?: ListFormatOptions): ListFormatter;
}

/**
 * Creates a {@link FormattingService} with shared locale/time-zone defaults.
 *
 * @param options - The service-wide defaults.
 * @returns A configured formatting service.
 * @throws {IllegalStateError} When a formatter is created without a locale
 * from either the service defaults or the per-formatter options.
 *
 * @example
 * ```ts
 * const format = createFormattingService({ locale: 'en-US', timeZone: 'UTC' });
 * format.date({ dateStyle: 'medium' }).format(new Date());       // 'Sep 13, 2026'
 * format.number({ style: 'percent' }).format(0.42);              // '42%'
 * ```
 */
export function createFormattingService(options: FormattingServiceOptions = {}): FormattingService {
    const { locale, timeZone } = options;

    // Fill service-wide defaults into per-formatter options; explicit
    // per-formatter values always win.
    const withDefaults = <T extends DefaultableFormatOptions>(specific?: T): T & { locale: string } => {
        const merged = { ...(specific ?? ({} as T)) } as T & { locale: string };
        if (locale && !merged.locale) {
            merged.locale = locale;
        }
        if (timeZone && !merged.timeZone) {
            merged.timeZone = timeZone;
        }
        if (!merged.locale) {
            // The ambient runtime locale would render differently on server
            // and client — a missing locale is a programming error.
            throw new IllegalStateError(
                'No locale resolved: pass a locale to createFormattingService or to the formatter options (the ambient runtime locale is never used)'
            );
        }
        return merged;
    };

    return {
        date(specific) {
            return new DateTimeFormatter(withDefaults(specific));
        },
        number(specific) {
            return new NumberFormatter(withDefaults(specific));
        },
        relativeTime(specific) {
            return new RelativeTimeFormatter(withDefaults(specific));
        },
        list(specific) {
            return new ListFormatter(withDefaults(specific));
        },
    };
}
