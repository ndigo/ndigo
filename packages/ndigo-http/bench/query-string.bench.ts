/**
 * QueryString parse and stringify.
 *
 * `URLSearchParams` is adapted to build the same record; `qs` uses
 * `depth: 0`, `plainObjects: true`, and `arrayFormat: 'repeat'` plus sorted keys
 * for stringify. All three produce the same value on the fixtures before timing.
 */
import qs from 'qs';
import { test } from 'vitest';
import QueryString from '../src/query-string';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const retain = sink;
const queryStrings = [
    'foo=bar',
    '?foo=bar&baz=qux',
    'a=1&b=2&c=3',
    '?search=hello%20world&lang=en',
    '?a=1&b=2&c=3&d=4&e=5&f=6',
    '?',
    'key',
    'a=1&a=2&a=3',
];

function normalize(value: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(value));
}

function parseWithURLSearchParams(input: string): Record<string, unknown> {
    const result: Record<string, string | string[]> = {};
    for (const [key, value] of new URLSearchParams(input)) {
        const existing = result[key];
        if (existing === undefined) result[key] = value;
        else if (Array.isArray(existing)) existing.push(value);
        else result[key] = [existing, value];
    }
    return result;
}

function parseWithQs(input: string): Record<string, unknown> {
    return qs.parse(input.startsWith('?') ? input.slice(1) : input, {
        depth: 0,
        allowPrototypes: false,
        plainObjects: true,
    });
}

function stringifyWithQs(value: Record<string, unknown>): string {
    return qs.stringify(value, {
        arrayFormat: 'repeat',
        sort: (left: string, right: string) => left.localeCompare(right),
    });
}

const stringifyValue = { b: 2, a: 'hello world', arr: ['x', 'y'] };
const expectedString = 'a=hello%20world&arr=x&arr=y&b=2';

test('parse — query strings', async ({ bench }) => {
    for (const input of queryStrings) {
        const expected = normalize(QueryString.parse(input));
        assertEquivalent(`URLSearchParams parity ${input}`, normalize(parseWithURLSearchParams(input)), expected);
        assertEquivalent(`qs parity ${input}`, normalize(parseWithQs(input)), expected);
    }
    await bench.compare(
        bench(benchName('ndigo QueryString.parse', queryStrings.length), () => {
            for (const input of queryStrings) retain(QueryString.parse(input));
        }),
        bench(benchName('URLSearchParams adapter', queryStrings.length), () => {
            for (const input of queryStrings) retain(parseWithURLSearchParams(input));
        }),
        bench(benchName('qs.parse (equivalent options)', queryStrings.length), () => {
            for (const input of queryStrings) retain(parseWithQs(input));
        })
    );
});

test('stringify — sorted flat record', async ({ bench }) => {
    assertEquivalent('QueryString.stringify', QueryString.stringify(stringifyValue), expectedString);
    assertEquivalent('qs.stringify', stringifyWithQs(stringifyValue), expectedString);
    await bench.compare(
        bench('ndigo QueryString.stringify', () => retain(QueryString.stringify(stringifyValue))),
        bench('qs.stringify (sorted, repeated arrays)', () => retain(stringifyWithQs(stringifyValue)))
    );
});
