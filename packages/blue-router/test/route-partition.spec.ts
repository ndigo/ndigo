import { describe, expect, test } from 'vitest';
import {
    matchesPartitionPath,
    normalizePartitionPrefix,
    restorePartitionPrefix,
    stripPartitionPrefix,
} from '../src/route-partition';

describe('route partition helpers', () => {
    test('normalizePartitionPrefix normalizes root and trailing slash', () => {
        expect(normalizePartitionPrefix('')).toBe('/');
        expect(normalizePartitionPrefix('/')).toBe('/');
        expect(normalizePartitionPrefix('todo')).toBe('/todo');
        expect(normalizePartitionPrefix('/todo/')).toBe('/todo');
    });

    test('matchesPartitionPath checks root and partition membership', () => {
        expect(matchesPartitionPath('/todo', '/todo')).toBe(true);
        expect(matchesPartitionPath('/todo/active', '/todo')).toBe(true);
        expect(matchesPartitionPath('/todos', '/todo')).toBe(false);
        expect(matchesPartitionPath('/account', '/')).toBe(true);
    });

    test('stripPartitionPrefix strips matched prefix and preserves feature root', () => {
        expect(stripPartitionPrefix('/todo', '/todo')).toBe('/');
        expect(stripPartitionPrefix('/todo/active', '/todo')).toBe('/active');
        expect(stripPartitionPrefix('/account/profile', '/todo')).toBe('/account/profile');
        expect(stripPartitionPrefix('/reports/summary', '/')).toBe('/reports/summary');
    });

    test('restorePartitionPrefix restores full shell route', () => {
        expect(restorePartitionPrefix('/', '/todo')).toBe('/todo');
        expect(restorePartitionPrefix('/active', '/todo')).toBe('/todo/active');
        expect(restorePartitionPrefix('/todo/completed', '/todo')).toBe('/todo/completed');
        expect(restorePartitionPrefix('/reports', '/')).toBe('/reports');
    });
});
