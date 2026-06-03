/**
 * @author Jeff Rose
 * @see {@link https://stackoverflow.com/questions/1969232/allowed-characters-in-cookies}
 * @see {@link https://curl.haxx.se/rfc/cookie_spec.html}
 * @see {@link https://www.ietf.org/rfc/rfc2109.txt}
 * @see {@link https://www.ietf.org/rfc/rfc2616.txt}
 * @see {@link https://www.ietf.org/rfc/rfc2965.txt}
 * @see {@link https://www.ietf.org/rfc/rfc6265.txt}
 */
import { decodeURIComponent as decode } from '@blue/util/string';

const cookieValueRule = /^[^;,\s]*/,
    percentEncodedRule = /(%[0-9A-Za-z]{2})+/g,
    percentDecode = (value: string): string => value.replace(percentEncodedRule, decode);

/** Parses a Cookie header string into a name→value record, percent-decoding both keys and values. */
const cookieExpression = {
    run(input: string): { isError: false; result: Record<string, string>; index: number; data: string } {
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

        return { isError: false, result, index: input.length, data: '' };
    },
};

export default cookieExpression;