/**
 * @author Jeff Rose
 */
import { decodeURIComponent as decode } from '@blue/util/string';

const queryKeyRule = /^[A-Za-z+:/?[\]0-9%]+/,
    queryValueRule = /^[A-Za-z+:/?[\]0-9%=]+/,
    plusRe = /\+/g,
    replacePlus = (s: string) => s.replace(plusRe, ' ');

function parseQueryString(input: string): Record<string, unknown> {
    let str = input;

    // Strip one leading prefix char: ?, #, &
    if (str.length > 0 && (str[0] === '?' || str[0] === '#' || str[0] === '&')) {
        str = str.slice(1);
    }

    if (!str || !str.trim()) {
        return {};
    }

    const pairs: [string, string | null][] = [];
    // Split on & or ;
    const parts = str.split(/[&;]/);

    // Consecutive delimiters (e.g. 'a=1&&b=2') produce an empty segment.
    // The arcsecond parser failed in this case, so we preserve that behaviour.
    if (parts.some((p) => !p)) {
        return {};
    }

    for (const part of parts) {
        const keyMatch = queryKeyRule.exec(part);
        if (!keyMatch) continue;

        const rawKey = keyMatch[0];
        const rest = part.slice(rawKey.length);
        const key = decode(replacePlus(rawKey));

        let value: string | null = null;
        if (rest.length > 0 && rest[0] === '=') {
            const afterEq = rest.slice(1);
            const valueMatch = queryValueRule.exec(afterEq);
            const rawValue = valueMatch ? valueMatch[0] : '';
            value = rawValue.length > 0 ? decode(replacePlus(rawValue)) : null;
        }

        pairs.push([key, value]);
    }

    function fromRepeatedPairs(pairs: [any, any][]): Record<any, any> {
        const result: Record<any, any> = {};
        for (const [key, value] of pairs) {
            if (!Object.prototype.hasOwnProperty.call(result, key)) {
                result[key] = value;
            } else if (Array.isArray(result[key])) {
                result[key].push(value);
            } else {
                result[key] = [result[key], value];
            }
        }
        return result;
    }

    return fromRepeatedPairs(pairs as [any, any][]);
}

/** Parses a URL query string into a key→value(s) record. */
export const queryExpression = {
    run(input: string): { isError: false; result: Record<string, unknown>; index: number; data: string } {
        const result = parseQueryString(input);
        return { isError: false, result, index: input.length, data: '' };
    },
};

export default queryExpression;
