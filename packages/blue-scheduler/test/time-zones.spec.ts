/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { TimeZones, isValidTimeZone } from '../src/time-zones';

describe('@blue/scheduler TimeZones', () => {
    test('exposes curated common identifiers', () => {
        expect(TimeZones.UTC).toBe('UTC');
        expect(TimeZones.America.NewYork).toBe('America/New_York');
        expect(TimeZones.Europe.Paris).toBe('Europe/Paris');
        expect(TimeZones.Asia.Tokyo).toBe('Asia/Tokyo');
        expect(TimeZones.Oceania.Auckland).toBe('Pacific/Auckland');
        expect(TimeZones.Africa.Nairobi).toBe('Africa/Nairobi');
    });

    test('the catalog is frozen, groups included', () => {
        expect(Object.isFrozen(TimeZones)).toBe(true);
        expect(Object.isFrozen(TimeZones.America)).toBe(true);
        expect(Object.isFrozen(TimeZones.Europe)).toBe(true);
    });
});

describe('@blue/scheduler isValidTimeZone', () => {
    test('accepts curated and arbitrary valid IANA identifiers', () => {
        expect(isValidTimeZone('UTC')).toBe(true);
        expect(isValidTimeZone('GMT')).toBe(true);
        expect(isValidTimeZone('America/Argentina/Buenos_Aires')).toBe(true);
        expect(isValidTimeZone('Pacific/Kiritimati')).toBe(true);
    });

    test('rejects unknown, empty, and malformed identifiers', () => {
        expect(isValidTimeZone('Bogus/Zone')).toBe(false);
        expect(isValidTimeZone('NotATimeZone')).toBe(false);
        expect(isValidTimeZone('')).toBe(false);
        expect(isValidTimeZone('America/New York')).toBe(false); // spaces not valid
    });
});
