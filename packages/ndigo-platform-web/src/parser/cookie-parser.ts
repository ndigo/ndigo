/**
 */
import { decodeURIComponent as decode } from '@ndigo/util/string';

const cookieValueRule = /^[^;,\s]*/,
    percentEncodedRule = /(%[0-9A-Za-z]{2})+/g,
    percentDecode = (value: string): string => value.replace(percentEncodedRule, decode);

/** Parses a Cookie header string into a name→value record, percent-decoding both keys and values. */
export function parseCookieHeader(input: string): Record<string, string> {
    const result = Object.create(null) as Record<string, string>;
    let pos = 0;
    const len = input.length;

    while (pos <= len) {
        let end = input.indexOf('; ', pos);
        if (end === -1) end = len;
        const pair = input.slice(pos, end);
        const eqIdx = pair.indexOf('=');
        if (eqIdx >= 0) {
            const rawKey = pair.slice(0, eqIdx);
            const rawValue = (cookieValueRule.exec(pair.slice(eqIdx + 1)) ?? [''])[0];
            result[percentDecode(rawKey)] = percentDecode(rawValue);
        }
        pos = end + 2; // advance past '; '
    }

    return result;
}
