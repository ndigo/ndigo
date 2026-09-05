import { decodeURIComponent as decode } from '@blue/util/string';

/**
 * Parses a raw matrix-parameter segment into an array of `[key, value]` pairs.
 *
 * Rules:
 * - Leading `;` is optional and skipped.
 * - Parameters are separated by `;`.
 * - `key=value` pairs: value may contain any character except `;`.
 * - Key-only params produce `[key, null]`.
 * - `+` is decoded to a space (via {@link decode}).
 * - Comma-separated values produce an array; empty segments become `null`.
 * - Empty values (`key=`) produce `null`.
 */
function parseMatrix(input: string): Record<string, any> {
    let pos = 0;
    const len = input.length;

    // Skip optional leading ';'
    if (pos < len && input[pos] === ';') pos++;

    const pairs: [string, any][] = [];

    while (pos < len) {
        // Parse key: /^[^=;]+/
        const keyStart = pos;
        while (pos < len && input[pos] !== '=' && input[pos] !== ';') pos++;

        const rawKey = input.slice(keyStart, pos);
        if (!rawKey) {
            // Empty key — skip the stray '=' and its value (if any), then any trailing ';'
            if (pos < len && input[pos] === '=') {
                pos++; // skip '='
                while (pos < len && input[pos] !== ';') pos++; // skip value
            }
            if (pos < len && input[pos] === ';') pos++; // skip separator
            continue;
        }

        // Replace + with space before decoding (avoids regex-escape issues in the decode fallback path)
        const key = decode(rawKey.replace(/\+/g, ' '));

        let value: any = null;

        if (pos < len && input[pos] === '=') {
            pos++; // consume '='
            // Parse value: /^[^;]*/ — may be empty
            const valueStart = pos;
            while (pos < len && input[pos] !== ';') pos++;
            const decoded = decode(input.slice(valueStart, pos).replace(/\+/g, ' '));

            if (decoded.includes(',')) {
                value = decoded.split(',').map((v) => (v === '' ? null : v));
            } else if (decoded === '') {
                value = null;
            } else {
                value = decoded;
            }
        }

        pairs.push([key, value]);

        // Consume the ';' separator before the next parameter
        if (pos < len && input[pos] === ';') pos++;
    }

    function fromRepeatedPairs(pairList: [any, any][]): Record<any, any> {
        const result: Record<any, any> = {};
        for (const [key, value] of pairList) {
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

    return fromRepeatedPairs(pairs);
}

export const matrixExpression = {
    run(input: string): { isError: false; result: Record<string, any>; index: number; data: string } {
        return { isError: false, result: parseMatrix(input), index: input.length, data: '' };
    },
};

export default matrixExpression;
