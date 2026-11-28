/**
 * Locale-aware formatting services for dates, numbers, lists, and relative time.
 *
 * Each formatter is constructed with a locale and (optionally) an ICU-style
 * options object, and exposes a `format` method. A `FormattingService`
 * aggregates formatters for consistent, locale-aware rendering.
 *
 * @example
 * ```ts
 * const fmt = new DateTimeFormatter('en-US', { dateStyle: 'medium' });
 * fmt.format(new Date('2024-01-02T00:00:00Z'));
 * ```
 */

import { IllegalStateError } from './error.js';
import type {
    DateTimeFormatOptions,
    DefaultableFormatOptions,
    FormattingServiceOptions,
    ListFormatOptions,
    NumberFormatOptions,
    RelativeTimeFormatOptions,
} from './formatter-options.js';
import { DateTimeFormatter, ListFormatter, NumberFormatter, RelativeTimeFormatter } from './formatters.js';

/**
 * A registry-style factory producing configured formatters.
 *
 * Each method returns a formatter with the service defaults applied; the
 * defaults can be overridden per formatter. Underlying `Intl` instances are
 * cached per option set, so repeated construction is cheap.
 *
 * @example
 * ```ts
 * const format = createFormattingService({ locale: 'en-US', timeZone: 'UTC' });
 * format.date({ dateStyle: 'medium' });
 * ```
 */
export interface FormattingService {
    /**
     * Creates a {@link DateTimeFormatter} with the service defaults.
     * @param options - Optional overrides.
     */
    date(options?: DateTimeFormatOptions): DateTimeFormatter;
    /**
     * Creates a {@link NumberFormatter} with the service defaults.
     * @param options - Optional overrides.
     */
    number(options?: NumberFormatOptions): NumberFormatter;
    /**
     * Creates a {@link RelativeTimeFormatter} with the service defaults.
     * @param options - Optional overrides.
     */
    relativeTime(options?: RelativeTimeFormatOptions): RelativeTimeFormatter;
    /**
     * Creates a {@link ListFormatter} with the service defaults.
     * @param options - Optional overrides.
     */
    list(options?: ListFormatOptions): ListFormatter;
}

/**
 * Creates a {@link FormattingService} with shared locale/time-zone defaults.
 *
 * @param options - The service-wide defaults.
 * @returns A configured formatting service.
 * @throws When a formatter is created without a locale
 * from either the service defaults or the per-formatter options.
 *
 * @remarks The ambient runtime locale is never used; a missing locale is a
 * programming error so server and client render identically.
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

export * from './formatter-options.js';
export * from './formatters.js';
