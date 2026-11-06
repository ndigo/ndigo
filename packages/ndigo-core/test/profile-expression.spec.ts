/**
 */
import { describe, test, expect } from 'vitest';
import { evaluateProfileExpression } from '../src/profile-expression';

const active = (...profiles: string[]) => new Set<string>(profiles);

describe('evaluateProfileExpression', () => {
    test('simple name matches when active', () => {
        expect(evaluateProfileExpression('dev', active('dev'))).toBe(true);
        expect(evaluateProfileExpression('dev', active('prod'))).toBe(false);
    });

    test('name with dashes/dots/underscores', () => {
        expect(evaluateProfileExpression('my-service', active('my-service'))).toBe(true);
        expect(evaluateProfileExpression('v1.2', active('v1.2'))).toBe(true);
        expect(evaluateProfileExpression('dev_1', active('dev_1'))).toBe(true);
    });

    test('NOT inverts', () => {
        expect(evaluateProfileExpression('!dev', active('prod'))).toBe(true);
        expect(evaluateProfileExpression('!dev', active('dev'))).toBe(false);
        expect(evaluateProfileExpression('!!dev', active('dev'))).toBe(true);
    });

    test('AND requires both', () => {
        expect(evaluateProfileExpression('a & b', active('a', 'b'))).toBe(true);
        expect(evaluateProfileExpression('a & b', active('a'))).toBe(false);
    });

    test('OR requires either', () => {
        expect(evaluateProfileExpression('a | b', active('a'))).toBe(true);
        expect(evaluateProfileExpression('a | b', active('b'))).toBe(true);
        expect(evaluateProfileExpression('a | b', active('c'))).toBe(false);
    });

    test('& binds tighter than |', () => {
        // a | b & c  ===  a | (b & c)
        expect(evaluateProfileExpression('a | b & c', active('a'))).toBe(true);
        expect(evaluateProfileExpression('a | b & c', active('b'))).toBe(false);
        expect(evaluateProfileExpression('a | b & c', active('b', 'c'))).toBe(true);
    });

    test('parentheses override precedence', () => {
        expect(evaluateProfileExpression('(a | b) & c', active('a', 'c'))).toBe(true);
        expect(evaluateProfileExpression('(a | b) & c', active('a'))).toBe(false);
        expect(evaluateProfileExpression('(a | b) & c', active('b', 'c'))).toBe(true);
    });

    test('whitespace is tolerated', () => {
        expect(evaluateProfileExpression('  a &  b ', active('a', 'b'))).toBe(true);
        expect(evaluateProfileExpression('! dev', active('prod'))).toBe(true);
    });

    test('empty expression throws', () => {
        expect(() => evaluateProfileExpression('', active('dev'))).toThrowError(/Empty profile expression/);
    });

    test('malformed expressions throw, naming the expression', () => {
        expect(() => evaluateProfileExpression('a &', active('a'))).toThrowError(/profile expression/);
        expect(() => evaluateProfileExpression('& a', active('a'))).toThrowError(/profile expression/);
        expect(() => evaluateProfileExpression('a & & b', active('a', 'b'))).toThrowError(/profile expression/);
        expect(() => evaluateProfileExpression('(a', active('a'))).toThrowError(/profile expression/);
        expect(() => evaluateProfileExpression('a)', active('a'))).toThrowError(/Unexpected token/);
        expect(() => evaluateProfileExpression('a &&', active('a'))).toThrowError(/profile expression/);
    });

    test('invalid character throws', () => {
        expect(() => evaluateProfileExpression('a^b', active('a'))).toThrowError(/Invalid character/);
    });

    test('excessive nesting hits the depth cap', () => {
        const nested = '('.repeat(12) + 'a' + ')'.repeat(12);
        expect(() => evaluateProfileExpression(nested, active('a'))).toThrowError(/maximum nesting depth/);
    });

    test('depth cap boundary: 10 deep is legal', () => {
        const nested = '('.repeat(10) + 'a' + ')'.repeat(10);
        expect(evaluateProfileExpression(nested, active('a'))).toBe(true);
    });
});
