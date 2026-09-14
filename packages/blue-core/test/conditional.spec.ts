/**
 * @module blue-core
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import {
    conditionalOnNode,
    conditionalOnProperty,
    conditionalOnMissingEntry,
    conditionalOnProfile,
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

describe('conditionalOnProfile', () => {
    test('matches when the profile is active', () => {
        @conditionalOnProfile('prod')
        class C {}
        const ctxProfiles = (members: Set<string>): ConditionContext => ({
            getProperty: () => undefined,
            hasValue: () => false,
            acceptsProfiles: (expr) => members.has(expr),
        });
        expect(isActive(C, ctxProfiles(new Set(['prod'])))).toBe(true);
        expect(isActive(C, ctxProfiles(new Set(['dev'])))).toBe(false);
    });

    test('supports expressions (delegated to the context evaluator)', () => {
        @conditionalOnProfile('!prod & (dev | test)')
        class C {}
        // The core decorator forwards the raw expression to the context's
        // acceptsProfiles; full grammar verification lives in blue-context's
        // profile-expression.spec. Here: a correct set-membership stub.
        const ctxEval = (members: Set<string>): ConditionContext => ({
            getProperty: () => undefined,
            hasValue: () => false,
            acceptsProfiles: (expr) => {
                // Exact semantic mirror of evaluateProfileExpression for this
                // one expression shape — NOT a general parser (core tests
                // must not reimplement the grammar).
                if (expr === '!prod & (dev | test)') {
                    const [left, right] = expr.split('&').map((s) => s.trim());
                    const notProd = !members.has(left.slice(1).trim());
                    const inside = right
                        .slice(1, -1)
                        .split('|')
                        .map((s) => s.trim());
                    return notProd && inside.some((p) => members.has(p));
                }
                return members.has(expr);
            },
        });
        expect(isActive(C, ctxEval(new Set(['dev'])))).toBe(true);
        expect(isActive(C, ctxEval(new Set(['prod'])))).toBe(false);
        expect(isActive(C, ctxEval(new Set(['test'])))).toBe(true);
    });

    test('no acceptsProfiles in context passes through (ctx-less behavior)', () => {
        @conditionalOnProfile('prod')
        class C {}
        expect(isActive(C)).toBe(true);
    });

    test('combines with property conditions', () => {
        @conditionalOnProfile('dev')
        @conditionalOnProperty({ name: 'app.feature' })
        class C {}
        const ctxDev: ConditionContext = {
            getProperty: () => undefined,
            hasValue: () => false,
            acceptsProfiles: (expr) => expr === 'dev',
        };
        expect(isActive(C, { ...ctxDev, getProperty: () => true })).toBe(true);
        expect(isActive(C, ctxDev)).toBe(false);
    });
});
