// @vitest-environment node
import { describe, test, expect } from 'vitest';
import {
    conditionalOnNode,
    conditionalOnProperty,
    conditionalOnMissingEntry,
    isActive,
    isActiveForCurrentPlatform,
    type ConditionContext,
} from '../src/conditional';

const ctx = (pv: Record<string, unknown>, presentEntries: string[] = []): ConditionContext => ({
    getProperty: (key) => pv[key],
    hasValue: (name) => presentEntries.includes(name),
});

describe('isActiveForCurrentPlatform', () => {
    test('no condition is always active', () => {
        class Plain {}
        expect(isActiveForCurrentPlatform(Plain)).toBe(true);
    });

    test('node platform gating', () => {
        @conditionalOnNode
        class NodeOnly {}
        expect(isActiveForCurrentPlatform(NodeOnly)).toBe(true);
    });
});

describe('conditionalOnProperty', () => {
    test('present truthy property is active', () => {
        @conditionalOnProperty({ name: 'app.metrics.enabled' })
        class C {}
        expect(isActive(C, ctx({ 'app.metrics.enabled': true }))).toBe(true);
        expect(isActive(C, ctx({ 'app.metrics.enabled': false }))).toBe(false);
        expect(isActive(C, ctx({}))).toBe(false);
    });

    test('havingValue requires an exact match', () => {
        @conditionalOnProperty({ name: 'server.port', havingValue: '8080' })
        class C {}
        expect(isActive(C, ctx({ 'server.port': '8080' }))).toBe(true);
        expect(isActive(C, ctx({ 'server.port': '9000' }))).toBe(false);
    });

    test('matchIfMissing activates when the property is absent', () => {
        @conditionalOnProperty({ name: 'app.flag', matchIfMissing: true })
        class C {}
        expect(isActive(C, ctx({}))).toBe(true);
        expect(isActive(C, ctx({ 'app.flag': 0 }))).toBe(false);
    });
});

describe('conditionalOnMissingEntry', () => {
    test('active when the entry is absent', () => {
        @conditionalOnMissingEntry('metricsController')
        class C {}
        expect(isActive(C, ctx({}))).toBe(true);
        expect(isActive(C, ctx({}, ['metricsController']))).toBe(false);
    });
});

describe('isActive combines conditions', () => {
    test('platform AND property must both pass', () => {
        @conditionalOnNode
        @conditionalOnProperty({ name: 'app.feature' })
        class C {}
        expect(isActive(C, ctx({ 'app.feature': true }))).toBe(true);
        expect(isActive(C, ctx({}))).toBe(false);
    });
});