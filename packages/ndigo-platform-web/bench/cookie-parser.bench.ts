/**
 * Cookie header parsing.
 *
 * Comparators: the `cookie` npm parser (percent-decodes) and a hand-written
 * split+decode baseline. The undecoded split row is kept only as a labelled
 * floor. All decoded results are verified before timing.
 */
import { parseCookie as parseWithCookie } from 'cookie';
import { test } from 'vitest';
import { parseCookieHeader } from '../src/parser/cookie-parser';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const retain = sink;
const cookieStrings = [
    'name=value',
    'name=value; path=/',
    'session=abc123; lang=en; theme=dark',
    'token=hello%20world; user=jeff',
    'a=1; b=2; c=3; d=4; e=5',
    'encoded%20key=hello%20world; x=%3D',
];

// `cookie` v2 decodes values but leaves percent-encoded keys untouched, so it
// is compared only on the fixtures where key decoding does not differ. The
// split+decode baseline covers the full contract.
const cookieNpmFixtures = cookieStrings.filter((input) => !input.includes('encoded%20key'));

function normalize(value: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(value).filter((entry): entry is [string, string] => entry[1] !== undefined)
    );
}

function splitDecoded(input: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const pair of input.split('; ')) {
        const separator = pair.indexOf('=');
        if (separator < 0) continue;
        result[decodeURIComponent(pair.slice(0, separator))] = decodeURIComponent(pair.slice(separator + 1));
    }
    return result;
}

function splitRaw(input: string): Record<string, string> {
    return Object.fromEntries(input.split('; ').map((pair) => pair.split('=') as [string, string]));
}

test('parseCookieHeader — decoded', async ({ bench }) => {
    for (const input of cookieStrings) {
        const expected = normalize(parseCookieHeader(input));
        assertEquivalent(`split-decode parity ${input}`, splitDecoded(input), expected);
    }
    for (const input of cookieNpmFixtures) {
        assertEquivalent(
            `cookie parity ${input}`,
            normalize(parseWithCookie(input)),
            normalize(parseCookieHeader(input))
        );
    }
    await bench.compare(
        bench(benchName('parseCookieHeader', cookieStrings.length), () => {
            for (const input of cookieStrings) retain(parseCookieHeader(input));
        }),
        bench(benchName('split + decodeURIComponent', cookieStrings.length), () => {
            for (const input of cookieStrings) retain(splitDecoded(input));
        }),
        bench(benchName('split without decode — floor', cookieStrings.length), () => {
            for (const input of cookieStrings) retain(splitRaw(input));
        }),
        bench(benchName('cookie npm parse (values only)', cookieNpmFixtures.length), () => {
            for (const input of cookieNpmFixtures) retain(parseWithCookie(input));
        })
    );
});
