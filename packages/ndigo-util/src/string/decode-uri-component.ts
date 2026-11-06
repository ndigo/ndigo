/**
 * URI component decoding.
 */
const token = '%[a-f0-9]{2}',
    singleMatcher = new RegExp(token, 'gi'),
    multiMatcher = new RegExp(`(?:${token})+|${token}|.`, 'gi'),
    plusMatcher = /\+/g;

function decode(input: string): string {
    try {
        return decodeURIComponent(input);
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let tokens = input.match(singleMatcher);
        if (!tokens) {
            return input;
        }
        let index = 1;

        for (; index < tokens.length; index++) {
            input = decodeURIComponentList(tokens, index).join('');
            tokens = input.match(singleMatcher);
            if (!tokens) {
                break;
            }
        }

        return input;
    }
}

function decodeURIComponentList(components: string[], index: number = 1): string[] {
    try {
        // Try to decode the entire string first
        return [decodeURIComponent(components.join(''))];
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // Do nothing
    }

    if (components.length === 1) {
        return components;
    }

    // Split the array in 2 parts
    const left = components.slice(0, index),
        right = components.slice(index);

    return [...decodeURIComponentList(left), ...decodeURIComponentList(right)];
    //return Array.prototype.concat.call( [], decodeURIComponentList( left ), decodeURIComponentList( right ) );
}

/** Escapes characters that are significant in a `RegExp` source. */
const regexSpecial = /[.*+?^${}()|[\]\\]/g,
    escapeRegExp = (pattern: string): string => pattern.replace(regexSpecial, '\\$&');

function enhancedDecodeURIComponent(input: string): string {
    // Keep track of all the replacements and prefill the map with the
    const replaceMap: { [key: string]: string } = {
        '%FE%FF': '\uFFFD\uFFFD',
        '%FF%FE': '\uFFFD\uFFFD',
    };
    let match: RegExpExecArray | null = multiMatcher.exec(input);

    while (match) {
        try {
            // Decode as big chunks as possible
            replaceMap[match[0]] = decodeURIComponent(match[0]);
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const result: string = decode(match[0]);

            if (result !== match[0]) {
                replaceMap[match[0]] = result;
            }
        }
        match = multiMatcher.exec(input);
    }

    // Add  at the end of the map to make sure it does not replace the combinator before everything else
    replaceMap['%C2'] = '\uFFFD';

    const entries = Object.keys(replaceMap),
        length = entries.length;
    let index = 0,
        key: string;

    for (; index < length; index++) {
        // Replace all decoded components. Keys can be any single matched
        // character (including regex metacharacters like `+`), so interpolate
        // them escaped — a raw key would throw or match unintended text.
        key = entries[index];
        input = input.replace(new RegExp(escapeRegExp(key), 'g'), replaceMap[key]);
    }

    return input;
}

/**
 * Enhanced decodeURIComponent
 * - Decodes + to a space.
 * - Converts the BOM to a replacement character �.
 * - Does not throw with invalid encoded input.
 * - Decodes as much of the string as possible.
 * @param value - The encoded string.
 * @returns The decoded string.
 */
export default function (value: string): string {
    try {
        // Try the built in decoder first
        return decodeURIComponent(value.replace(plusMatcher, ' '));
    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        // Fallback to a more advanced decoder. The plus-to-space contract
        // applies on this path too, so apply it before enhancing.
        return enhancedDecodeURIComponent(value.replace(plusMatcher, ' '));
    }
}
