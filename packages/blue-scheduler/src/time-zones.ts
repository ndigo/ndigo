/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */

const group = (zones: Record<string, string>): Readonly<Record<string, string>> => Object.freeze(zones);

/**
 * Curated common IANA time-zone identifiers (AD-20 D6).
 *
 * Autocomplete + typo safety for the common cases without hand-maintaining
 * the full ~400-entry IANA catalog. Arbitrary identifiers remain accepted —
 * validated by {@link isValidTimeZone} — and a full generated catalog is a
 * named revisit if the curated set proves insufficient.
 */
export const TimeZones = Object.freeze({
    UTC: 'UTC',
    GMT: 'GMT',
    America: group({
        NewYork: 'America/New_York',
        Chicago: 'America/Chicago',
        Denver: 'America/Denver',
        LosAngeles: 'America/Los_Angeles',
        Phoenix: 'America/Phoenix',
        Anchorage: 'America/Anchorage',
        Honolulu: 'America/Honolulu',
        Toronto: 'America/Toronto',
        Vancouver: 'America/Vancouver',
        MexicoCity: 'America/Mexico_City',
        SaoPaulo: 'America/Sao_Paulo',
        BuenosAires: 'America/Argentina/Buenos_Aires',
    }),
    Europe: group({
        London: 'Europe/London',
        Dublin: 'Europe/Dublin',
        Lisbon: 'Europe/Lisbon',
        Paris: 'Europe/Paris',
        Berlin: 'Europe/Berlin',
        Madrid: 'Europe/Madrid',
        Rome: 'Europe/Rome',
        Amsterdam: 'Europe/Amsterdam',
        Stockholm: 'Europe/Stockholm',
        Oslo: 'Europe/Oslo',
        Copenhagen: 'Europe/Copenhagen',
        Zurich: 'Europe/Zurich',
        Vienna: 'Europe/Vienna',
        Warsaw: 'Europe/Warsaw',
        Prague: 'Europe/Prague',
        Athens: 'Europe/Athens',
        Helsinki: 'Europe/Helsinki',
        Istanbul: 'Europe/Istanbul',
        Moscow: 'Europe/Moscow',
    }),
    Africa: group({
        Cairo: 'Africa/Cairo',
        Johannesburg: 'Africa/Johannesburg',
        Lagos: 'Africa/Lagos',
        Nairobi: 'Africa/Nairobi',
    }),
    Asia: group({
        Tokyo: 'Asia/Tokyo',
        Seoul: 'Asia/Seoul',
        Shanghai: 'Asia/Shanghai',
        HongKong: 'Asia/Hong_Kong',
        Taipei: 'Asia/Taipei',
        Singapore: 'Asia/Singapore',
        Bangkok: 'Asia/Bangkok',
        Jakarta: 'Asia/Jakarta',
        Dhaka: 'Asia/Dhaka',
        Kolkata: 'Asia/Kolkata',
        Karachi: 'Asia/Karachi',
        Dubai: 'Asia/Dubai',
        Jerusalem: 'Asia/Jerusalem',
        Tehran: 'Asia/Tehran',
    }),
    Oceania: group({
        Sydney: 'Australia/Sydney',
        Melbourne: 'Australia/Melbourne',
        Brisbane: 'Australia/Brisbane',
        Adelaide: 'Australia/Adelaide',
        Perth: 'Australia/Perth',
        Auckland: 'Pacific/Auckland',
        Fiji: 'Pacific/Fiji',
        Guam: 'Pacific/Guam',
    }),
} as const);

/**
 * Validates an IANA time-zone identifier using the platform's ICU data.
 *
 * `Intl.DateTimeFormat` throws `RangeError` on unknown zones, which also
 * catches the silent-UTC-fallback class of configuration bugs (croner, for
 * example, accepts garbage zones silently — AD-20 D6 requires this probe).
 *
 * @param zone - The IANA identifier to validate.
 * @returns Whether the identifier is a recognized time zone.
 */
export function isValidTimeZone(zone: string): boolean {
    if (zone.length === 0) {
        return false;
    }
    try {
        new Intl.DateTimeFormat('en-US', { timeZone: zone });
        return true;
    } catch {
        return false;
    }
}
