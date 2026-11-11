/**
 * Parses `document.cookie` header strings.
 */
import { decodeURIComponent as decode } from '@ndigo/util/string';

const percentEncodedRule = /(%[0-9A-Za-z]{2})+/g;

const percentDecode = (value: string): string => {
    if (value.indexOf('%') === -1) return value;
    return value.replace(percentEncodedRule, decode);
};

/**
 * Parses a `Cookie` header string into a name→value record, percent-decoding
 * both keys and values.
 *
 * @param input - The raw `Cookie` header.
 * @returns The percent-decoded cookie record.
 */
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

            const valueStart = eqIdx + 1;
            let valueEnd = valueStart;
            const pairLen = pair.length;
            while (valueEnd < pairLen) {
                const ch = pair.charCodeAt(valueEnd);
                // `;` `,` or whitespace terminates the value.
                if (ch === 59 || ch === 44 || ch === 32 || ch === 9 || ch === 10 || ch === 13 || ch === 12) break;
                valueEnd++;
            }
            const rawValue = pair.slice(valueStart, valueEnd);

            result[percentDecode(rawKey)] = percentDecode(rawValue);
        }
        pos = end + 2; // advance past '; '
    }

    return result;
}
