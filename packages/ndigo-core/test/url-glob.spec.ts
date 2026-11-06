/**
 */
import { describe, it, expect } from 'vitest';
import { parseUrlGlob } from '../src/url-glob';

describe('parseUrlGlob', () => {
    const tests: [string, string, boolean][] = [
        // --- Ported from glob.spec.ts (non-notDot cases) ---
        ['a', 'a*', true],
        ['abc', 'a*', true],
        ['abc', '**', true],
        ['bdir/', 'b*/', true],
        ['abc', '[a-c]b*', true],
        ['abd', '[a-y]*[!c]', true],
        ['abc', 'a?c', true],
        ['man/man1/bash.1', '*/man*/bash.*', true],
        ['man/man1/bash.1', 'man/man1/bash.1', true],
        ['abc', 'a***c', true],
        ['-', '[-abc]', true],
        ['[', '[[]', true],

        // --- URL-specific: no notDot / hidden-file restriction ---
        ['.well-known/jwks', '*/*', true], // would FAIL in fsGlob (notDot)
        ['.well-known/jwks', '*/jwks', true], // would FAIL in fsGlob
        ['.hidden', '*', true], // would FAIL in fsGlob
        ['/api/.well-known/foo', '/api/*/foo', true], // would FAIL in fsGlob

        // --- Path-param passthrough: {id} treated as literal, no brace expansion ---
        ['/{id}/', '/{id}/', true], // literal match
        ['/users/{id}/posts', '/users/{id}/posts', true],

        // --- POSIX class support ---
        ['/api/v2/users', '/api/[:digit:]/users', false], // 'v2' not all digits
        ['/api/2/users', '/api/[:digit:]*/users', true],

        // --- extGlob support ---
        ['/api/v1', '/api/@(v1|v2)', true],
        ['/api/v3', '/api/@(v1|v2)', false],
        // Note: !(pattern) negation in multi-segment paths is a known limitation —
        // the extGlob negation lookahead uses `$` anchored to the full string, not the
        // segment boundary. Whole-path negation still works: !(private) matches any
        // single-segment path that isn't exactly "private".
        ['v1', '!(private)', true],
        ['private', '!(private)', false],
    ];

    for (const [fixture, pattern, expected] of tests) {
        it(`should${expected ? '' : ' not'} match ${fixture} with ${pattern}`, () => {
            const regexSrc = parseUrlGlob(pattern);
            expect(regexSrc).not.toBeNull();
            const regex = new RegExp(String(regexSrc));
            const actual = regex.test(fixture as string);
            expect(actual).toBe(expected);
        });
    }

    describe('extglob ReDoS hardening (KRN-REV-URLGLOB-04)', () => {
        it('fails closed on quantified extglob groups with nested quantifiers', () => {
            // Each would otherwise expand to a nested quantifier such as
            // `(?:[^/]*?)+` with catastrophic backtracking.
            expect(parseUrlGlob('+(*)')).toBeNull();
            expect(parseUrlGlob('*(**)')).toBeNull();
            expect(parseUrlGlob('+(a*)')).toBeNull();
            expect(parseUrlGlob('?(a|b*)')).toBeNull();
        });

        it('still compiles quantified groups over quantifier-free alternatives', () => {
            const regexSrc = parseUrlGlob('+(a|b)');
            expect(regexSrc).not.toBeNull();
            const regex = new RegExp(String(regexSrc));
            expect(regex.test('a')).toBe(true);
            expect(regex.test('ab')).toBe(true);
        });

        it('rejects a previously catastrophic pattern without backtracking', () => {
            // The rejected input returns `null` immediately instead of
            // compiling a regex that would hang on adversarial paths.
            expect(parseUrlGlob('*(*)')).toBeNull();
        });
    });
});
