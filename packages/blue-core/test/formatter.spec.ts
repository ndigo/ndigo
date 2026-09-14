/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import {
    createFormattingService,
    DateTimeFormatter,
    ListFormatter,
    NumberFormatter,
    RelativeTimeFormatter,
} from '../src/formatter';

const UTC_NOON = new Date('2026-09-13T12:00:00Z');

describe('@blue/core DateTimeFormatter', () => {
    test('formats a Date in the explicit locale and time zone', () => {
        const formatter = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' });

        expect(formatter.format(UTC_NOON)).toContain('2026');
    });

    test('time zone changes the rendered wall time', () => {
        const utc = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', timeStyle: 'short' });
        const newYork = new DateTimeFormatter({ locale: 'en-US', timeZone: 'America/New_York', timeStyle: 'short' });

        expect(utc.format(UTC_NOON)).toBe('12:00 PM');
        expect(newYork.format(UTC_NOON)).toBe('8:00 AM');
    });

    test('accepts ISO strings and timestamps', () => {
        const formatter = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' });

        expect(formatter.format('2026-09-13T12:00:00Z')).toBe(formatter.format(UTC_NOON));
        expect(formatter.format(UTC_NOON.getTime())).toBe(formatter.format(UTC_NOON));
    });

    test('throws a clear error for invalid dates', () => {
        const formatter = new DateTimeFormatter({ locale: 'en-US', timeZone: 'UTC', dateStyle: 'medium' });

        expect(() => formatter.format('not-a-date')).toThrow(TypeError);
        expect(() => formatter.format('not-a-date')).toThrow(/invalid date/);
        expect(() => formatter.format(new Date('nope'))).toThrow(TypeError);
    });

    test('throws RangeError for locales outside the BCP 47 shape', () => {
        expect(() => new DateTimeFormatter({ locale: '" autofocus onfocus="alert(1)' })).toThrow(RangeError);
        expect(() => new NumberFormatter({ locale: 'en US' })).toThrow(RangeError);
    });
});

describe('@blue/core NumberFormatter', () => {
    test('formats decimals with locale separators', () => {
        const en = new NumberFormatter({ locale: 'en-US' });
        const de = new NumberFormatter({ locale: 'de-DE' });

        expect(en.format(1234.5)).toBe('1,234.5');
        expect(de.format(1234.5)).toBe('1.234,5');
    });

    test('formats currency and percent styles', () => {
        const currency = new NumberFormatter({ locale: 'de-DE', style: 'currency', currency: 'EUR' });
        const percent = new NumberFormatter({ locale: 'en-US', style: 'percent' });

        expect(currency.format(1234.5)).toContain('€');
        expect(percent.format(0.42)).toBe('42%');
    });

    test('honors fraction digit bounds', () => {
        const formatter = new NumberFormatter({ locale: 'en-US', minimumFractionDigits: 2, maximumFractionDigits: 2 });

        expect(formatter.format(1.5)).toBe('1.50');
    });
});

describe('@blue/core RelativeTimeFormatter', () => {
    test('formats past and future deltas', () => {
        const formatter = new RelativeTimeFormatter({ locale: 'en', numeric: 'always' });

        expect(formatter.format(-3, 'day')).toBe('3 days ago');
        expect(formatter.format(1, 'hour')).toBe('in 1 hour');
    });

    test('auto numeric allows natural phrasing', () => {
        const auto = new RelativeTimeFormatter({ locale: 'en', numeric: 'auto' });

        expect(auto.format(-1, 'day')).toBe('yesterday');
    });
});

describe('@blue/core ListFormatter', () => {
    test('formats conjunction lists with locale rules', () => {
        const en = new ListFormatter({ locale: 'en', type: 'conjunction' });
        const de = new ListFormatter({ locale: 'de', type: 'conjunction' });

        expect(en.format(['Ada', 'Grace'])).toBe('Ada and Grace');
        expect(de.format(['Ada', 'Grace', 'Linus'])).toContain('und');
    });

    test('formats disjunction lists', () => {
        const formatter = new ListFormatter({ locale: 'en', type: 'disjunction' });

        expect(formatter.format(['tea', 'coffee'])).toBe('tea or coffee');
    });
});

describe('@blue/core createFormattingService', () => {
    test('applies service defaults to all formatters', () => {
        const format = createFormattingService({ locale: 'de-DE', timeZone: 'UTC' });

        expect(
            format
                .number({ style: 'currency', currency: 'EUR' })
                .format(9.5)
                .replace(/\u00a0/g, ' ')
        ).toBe('9,50 €');
        expect(format.date({ dateStyle: 'medium' }).format(UTC_NOON)).toContain('2026');
        expect(format.relativeTime({ numeric: 'always' }).format(-3, 'day')).toContain('Tagen');
        expect(format.list({ type: 'conjunction' }).format(['a', 'b'])).toContain('und');
    });

    test('per-formatter options override service defaults', () => {
        const format = createFormattingService({ locale: 'de-DE', timeZone: 'UTC' });

        const englishDate = format.date({ locale: 'en-US', dateStyle: 'medium' });
        expect(englishDate.format(UTC_NOON)).toContain('Sep 13, 2026');
    });
});
