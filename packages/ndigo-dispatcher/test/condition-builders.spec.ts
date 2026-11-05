/**
 * Route-condition builder specs (AD-34 D6).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { queryParamCondition, matrixParamCondition } from '../src/condition-builders';
import { QueryParamExpression, QueryParamCondition } from '../src/query-param-condition';
import { Route } from '@ndigo/router';

const routeWith = (data: Record<string, unknown> | undefined): Route =>
    ({
        method: 'GET',
        path: '/items',
        query: undefined,
        data,
    }) as unknown as Route;

describe('condition builders (AD-34 D6)', () => {
    test('produces the canonical expressions for value and presence forms', () => {
        expect(queryParamCondition('filter', 'all')).toBe('filter=all');
        expect(queryParamCondition('flag')).toBe('flag');
        expect(queryParamCondition('flag', undefined, { negate: true })).toBe('!flag');
        expect(queryParamCondition('filter', 'all', { negate: true })).toBe('filter!=all');
        expect(matrixParamCondition('color')).toBe('color');
        expect(matrixParamCondition('color', 'red')).toBe('color=red');
        expect(matrixParamCondition('color', 'red', { negate: true })).toBe('color!=red');
    });

    test('built conditions parse back identically through the grammar', () => {
        const canonical = queryParamCondition('filter', 'all');
        const parsed = new QueryParamExpression(canonical);
        expect(parsed.name).toBe('filter');
        expect(parsed.value).toBe('all');
        expect(parsed.isNegated).toBe(false);
        expect(parsed.toString()).toBe(canonical);
    });

    test('matches routes exactly like the hand-written strings', () => {
        const condition = new QueryParamCondition(queryParamCondition('filter', 'all'));
        expect(condition.match(routeWith({ filter: 'all' }))).not.toBeNull();
        expect(condition.match(routeWith({ filter: 'other' }))).toBeNull();
    });

    test('rejects names and values that would change meaning', () => {
        // A name containing '=' breaks the name/value split.
        expect(() => queryParamCondition('a=b', 'x')).toThrowError();
        // A name ending in '!' parses as a negation marker.
        expect(() => queryParamCondition('a!', 'x')).toThrowError();
        expect(() => matrixParamCondition('a=b', 'x')).toThrowError();
        // Values containing '=' or '!' are rejected outright (builder contract).
        expect(() => queryParamCondition('filter', 'a=b')).toThrowError();
        expect(() => matrixParamCondition('color', 'a!b')).toThrowError();
        expect(() => queryParamCondition('filter', 'a=b', { negate: true })).toThrowError();
    });
});
