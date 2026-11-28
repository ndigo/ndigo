/**
 * Options and derived types for the locale-aware formatters.
 */

/**
 * Shared formatting options. The locale is always explicit; the time zone is
 * always explicit for date/time formatting so server-rendered output can be
 * pinned and hydrated identically on the client (never ambient server time).
 *
 * @example
 * ```ts
 * const options: FormatOptions = { locale: 'en-US', timeZone: 'UTC' };
 * ```
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
 * Options for `DateTimeFormatter`.
 *
 * @example
 * ```ts
 * const options: DateTimeFormatterOptions = { locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' };
 * ```
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
 * Options for `NumberFormatter`.
 *
 * @example
 * ```ts
 * const options: NumberFormatterOptions = { locale: 'de-DE', style: 'currency', currency: 'EUR' };
 * ```
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
 * Options for `RelativeTimeFormatter`.
 *
 * @example
 * ```ts
 * const options: RelativeTimeFormatterOptions = { locale: 'en', numeric: 'always' };
 * ```
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
 * Options for `ListFormatter`.
 *
 * @example
 * ```ts
 * const options: ListFormatterOptions = { locale: 'en', type: 'conjunction' };
 * ```
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

/**
 * Options for `createFormattingService`.
 *
 * @example
 * ```ts
 * const options: FormattingServiceOptions = { locale: 'en-US', timeZone: 'UTC' };
 * ```
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
 * `FormattingService` where service-wide defaults fill the gaps.
 *
 * @example
 * ```ts
 * const options: DefaultableFormatOptions = { locale: 'en-US', timeZone: 'UTC' };
 * ```
 */
export interface DefaultableFormatOptions {
    /** Locale used for formatting. */
    locale?: string;
    /** Time zone used for formatting. */
    timeZone?: string;
}

/**
 * `DateTimeFormatter` options with optional shared fields (service-style).
 *
 * @example
 * ```ts
 * const options: DateTimeFormatOptions = { locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' };
 * ```
 */
export type DateTimeFormatOptions = Omit<DateTimeFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/**
 * `NumberFormatter` options with optional shared fields (service-style).
 *
 * @example
 * ```ts
 * const options: NumberFormatOptions = { locale: 'de-DE', style: 'currency', currency: 'EUR' };
 * ```
 */
export type NumberFormatOptions = Omit<NumberFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/**
 * `RelativeTimeFormatter` options with optional shared fields (service-style).
 *
 * @example
 * ```ts
 * const options: RelativeTimeFormatOptions = { locale: 'en', numeric: 'always' };
 * ```
 */
export type RelativeTimeFormatOptions = Omit<RelativeTimeFormatterOptions, keyof DefaultableFormatOptions> &
    DefaultableFormatOptions;

/**
 * `ListFormatter` options with optional shared fields (service-style).
 *
 * @example
 * ```ts
 * const options: ListFormatOptions = { locale: 'en', type: 'conjunction' };
 * ```
 */
export type ListFormatOptions = Omit<ListFormatterOptions, keyof DefaultableFormatOptions> & DefaultableFormatOptions;
