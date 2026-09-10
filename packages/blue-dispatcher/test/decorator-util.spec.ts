import { describe, it, expect } from 'vitest';
import { getFunctionParamNames } from '../src/_decorator-util';

describe('getFunctionParamNames', () => {
    it('extracts parameter names from regular function', () => {
        function example(foo, bar, baz) {}
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'baz']);
    });

    it('extracts parameter names from arrow function', () => {
        const example = (foo, bar, baz) => {};
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'baz']);
    });

    it('extracts parameter names from method', () => {
        class Example {
            method(foo, bar, baz) {}
        }
        expect(getFunctionParamNames(Example.prototype.method)).toEqual(['foo', 'bar', 'baz']);
    });

    it('handles TypeScript type annotations', () => {
        const example = (foo: string, bar: number, baz: boolean) => {};
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'baz']);
    });

    it('handles default parameter values', () => {
        function example(foo = 'default', bar = 10, baz = true) {}
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'baz']);
    });

    it('handles optional parameters', () => {
        const example = (foo?: string, bar?: number) => {};
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar']);
    });

    it('handles rest parameters', () => {
        function example(foo, bar, ...rest) {}
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'rest']);
    });

    it('handles no parameters', () => {
        function example() {}
        expect(getFunctionParamNames(example)).toEqual([]);
    });

    it('handles single parameter', () => {
        function example(foo) {}
        expect(getFunctionParamNames(example)).toEqual(['foo']);
    });

    it('handles async functions', () => {
        async function example(foo, bar) {}
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar']);
    });

    it('handles mixed TypeScript features', () => {
        const example = (foo: string, bar: number = 10, baz?: boolean, ...rest: unknown[]) => {};
        expect(getFunctionParamNames(example)).toEqual(['foo', 'bar', 'baz', 'rest']);
    });
});
