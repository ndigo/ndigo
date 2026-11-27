/**
 * URI component decoding.
 */

const plusMatcher = /\+/g;

/** `%` as a UTF-16 code unit. */
const PERCENT = 0x25;

/** Decodes one `%XX` triplet starting at `index` and returns its byte value. */
function readByte(input: string, index: number): number {
    return Number.parseInt(input.slice(index + 1, index + 3), 16);
}

/** Returns whether `code` is an ASCII hexadecimal digit. */
function isHexDigit(code: number): boolean {
    return (
        (code >= 0x30 && code <= 0x39) || // 0-9
        (code >= 0x41 && code <= 0x46) || // A-F
        (code >= 0x61 && code <= 0x66) // a-f
    );
}

/**
 * Returns the byte length of the UTF-8 sequence introduced by `byte`, or `0`
 * when `byte` cannot start one.
 */
function sequenceLength(byte: number): number {
    if (byte < 0x80) {
        return 1;
    }
    if (byte >= 0xc2 && byte <= 0xdf) {
        return 2;
    }
    if (byte >= 0xe0 && byte <= 0xef) {
        return 3;
    }
    if (byte >= 0xf0 && byte <= 0xf4) {
        return 4;
    }

    return 0;
}

/** Returns whether `byte` is a UTF-8 continuation byte. */
function isContinuation(byte: number): boolean {
    return byte >= 0x80 && byte <= 0xbf;
}

/**
 * Validates the byte after the lead byte against the ranges that exclude
 * overlong encodings, surrogates, and code points above U+10FFFF.
 */
function isValidSecondByte(lead: number, second: number): boolean {
    if (!isContinuation(second)) {
        return false;
    }
    if (lead === 0xe0) {
        return second >= 0xa0;
    }
    if (lead === 0xed) {
        return second <= 0x9f;
    }
    if (lead === 0xf0) {
        return second >= 0x90;
    }
    if (lead === 0xf4) {
        return second <= 0x8f;
    }

    return true;
}

/**
 * Decodes a validated UTF-8 sequence of `length` bytes beginning at `index`
 * into its code point.
 */
function codePoint(input: string, index: number, length: number): number {
    const first = readByte(input, index);

    if (length === 1) {
        return first;
    }

    let value = first & (0xff >> (length + 1));

    for (let offset = 1; offset < length; offset++) {
        value = (value << 6) | (readByte(input, index + offset * 3) & 0x3f);
    }

    return value;
}

/**
 * Decodes a maximal run of `%XX` escapes, keeping escapes that cannot be
 * decoded as part of a valid UTF-8 sequence literal.
 *
 * The whole run is decoded first because `decodeURIComponent` handles the
 * common case faster and rejects overlong or surrogate forms exactly. Only
 * when the run is not valid UTF-8 does the scanner fall back to decoding the
 * longest valid sequences it can find.
 */
function decodeRun(run: string): string {
    try {
        return decodeURIComponent(run);
    } catch {
        // Fall through to partial decoding.
    }

    // These two byte orders are the UTF-16 BOM byte sequences in the wrong
    // order; the historical contract renders them as replacement characters.
    if (run === '%FE%FF' || run === '%FF%FE') {
        return '\uFFFD\uFFFD';
    }

    const byteLength = run.length / 3;
    let result = '';
    let index = 0;

    while (index < byteLength) {
        const byte = readByte(run, index * 3);
        const length = sequenceLength(byte);

        if (length === 1) {
            result += String.fromCharCode(byte);
            index += 1;
            continue;
        }

        if (length > 1 && index + length <= byteLength) {
            const second = readByte(run, (index + 1) * 3);
            let valid = isValidSecondByte(byte, second);

            for (let offset = 2; valid && offset < length; offset++) {
                valid = isContinuation(readByte(run, (index + offset) * 3));
            }

            if (valid) {
                result += String.fromCodePoint(codePoint(run, index * 3, length));
                index += length;
                continue;
            }
        }

        // `%C2` is the lead byte of a truncated two-byte sequence (historically
        // the µ prefix); the previous decoder rendered a dangling `%C2` as a
        // replacement character, and callers rely on that.
        result += byte === 0xc2 ? '\uFFFD' : run.slice(index * 3, index * 3 + 3);
        index += 1;
    }

    return result;
}

/**
 * Enhanced decodeURIComponent
 * - Decodes `+` to a space.
 * - Converts the BOM to a replacement character.
 * - Does not throw with invalid encoded input.
 * - Decodes as much of the string as possible.
 *
 * The scan is single-pass and linear in the input length: decoded output is
 * never re-scanned, so `%2541` stays `%41` and a replacement string can never
 * be interpreted as a `String.replace` pattern.
 *
 * @param value - The encoded string.
 * @returns The decoded string.
 */
export default function (value: string): string {
    const input = value.replace(plusMatcher, ' ');
    const length = input.length;
    let result = '';
    let lastIndex = 0;
    let index = 0;

    while (index < length) {
        if (input.charCodeAt(index) !== PERCENT) {
            index++;
            continue;
        }

        const runStart = index;
        let runEnd = index;

        while (
            runEnd + 2 < length &&
            input.charCodeAt(runEnd) === PERCENT &&
            isHexDigit(input.charCodeAt(runEnd + 1)) &&
            isHexDigit(input.charCodeAt(runEnd + 2))
        ) {
            runEnd += 3;
        }

        if (runEnd === runStart) {
            index++;
            continue;
        }

        result += input.slice(lastIndex, runStart) + decodeRun(input.slice(runStart, runEnd));
        index = runEnd;
        lastIndex = runEnd;
    }

    if (lastIndex === 0) {
        return input;
    }

    return result + input.slice(lastIndex);
}
