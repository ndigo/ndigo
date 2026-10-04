/**
 * Health registry behavior — including AD-36 D-1 error redaction.
 * * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { HealthRegistry, HEALTH_ERROR_REDACTED, type HealthIndicator, type HealthResult, type HealthState } from '../src/health';

const throwingIndicator: HealthIndicator = {
    name: 'boom',
    check: () => {
        throw new Error('read /etc/app/creds.sqlite: EACCES');
    },
};
const healthyIndicator: HealthIndicator = {
    name: 'ok',
    check: () => ({ status: 'UP' as HealthState, details: { features: 3 } }),
};

describe('HealthRegistry', () => {
    test('enumerates current indicators in registration order after replacement and unregister', () => {
        const other: HealthIndicator = { name: 'other', check: () => ({ status: 'UNKNOWN' }) };
        const replacement: HealthIndicator = { name: 'ok', check: () => ({ status: 'DOWN' }) };
        const registry = new HealthRegistry().register(healthyIndicator).register(other);
        const names = registry.names;
        const assertIndicators = (indicators: HealthIndicator[]) => {
            expect([...registry.keys()]).toEqual(indicators.map((indicator) => indicator.name));
            expect([...registry.values()]).toEqual(indicators);
            expect([...registry.entries()]).toEqual(indicators.map((indicator) => [indicator.name, indicator]));
        };

        assertIndicators([healthyIndicator, other]);
        registry.register(replacement);
        assertIndicators([replacement, other]);
        expect([...registry.values()][0]).toBe(replacement);
        expect(registry.unregister('ok')).toBe(true);
        expect(registry.unregister('ok')).toBe(false);
        assertIndicators([other]);
        registry.register(replacement);
        assertIndicators([other, replacement]);

        expect(Object.isFrozen(names)).toBe(true);
        expect(names).toEqual(['ok', 'other']);
        expect(registry.names).toEqual(['other', 'ok']);
    });

    test('forEach visits current registrations with context and registry identity', () => {
        const replacement: HealthIndicator = { name: 'ok', check: () => ({ status: 'DOWN' }) };
        const registry = new HealthRegistry().register(healthyIndicator).register(throwingIndicator);
        registry.register(replacement);
        const context = { entries: [] as [string, HealthIndicator][] };

        registry.forEach(function (this: typeof context, value, key, collection) {
            expect(this).toBe(context);
            expect(collection).toBe(registry);
            expect(value.name).toBe(key);
            this.entries.push([key, value]);
        }, context);

        expect(context.entries).toEqual([['ok', replacement], ['boom', throwingIndicator]]);
        expect(context.entries[0][1]).toBe(replacement);
        expect(registry.names).toEqual(['ok', 'boom']);
    });

    test('checkAll starts probes concurrently and keeps the registrations captured at invocation', async () => {
        const started: string[] = [];
        let release!: (result: HealthResult) => void;
        const result = new Promise<HealthResult>((resolve) => {
            release = resolve;
        });
        const registry = new HealthRegistry();
        for (const name of ['a', 'b']) {
            registry.register({
                name,
                check() {
                    started.push(name);
                    return result;
                },
            });
        }

        const pending = registry.checkAll();
        const startedBeforeResolution = [...started];
        registry.unregister('b');
        registry.register({ name: 'a', check: () => ({ status: 'DOWN' }) });
        registry.register({ name: 'c', check: () => ({ status: 'DOWN' }) });
        release({ status: 'UP' });

        expect(startedBeforeResolution).toEqual(['a', 'b']);
        const status = await pending;
        expect(status.status).toBe('UP');
        expect(status.components).toEqual({ a: { status: 'UP' }, b: { status: 'UP' } });
    });

    test('aggregates healthy indicators as UP with details', async () => {
        const registry = new HealthRegistry();
        registry.register(healthyIndicator);
        const status = await registry.checkAll();
        expect(status.status).toBe('UP');
        expect(status.components['ok'].details?.features).toBe(3);
    });

    test('keeps the raw indicator error by default (registry-neutral)', async () => {
        const registry = new HealthRegistry();
        registry.register(throwingIndicator);
        const status = await registry.checkAll();
        expect(status.status).toBe('DOWN');
        expect(status.components['boom'].details?.error).toBe('read /etc/app/creds.sqlite: EACCES');
    });

    test('redacts thrown indicator errors to the stable marker when asked', async () => {
        const registry = new HealthRegistry({ redactHealthErrors: true });
        registry.register(throwingIndicator);
        const status = await registry.checkAll();
        expect(status.status).toBe('DOWN');
        expect(status.components['boom'].details?.error).toBe(HEALTH_ERROR_REDACTED);
        // The secret text never reaches the aggregate.
        expect(JSON.stringify(status)).not.toContain('creds.sqlite');
    });

    test('successful indicators are untouched by redaction', async () => {
        const registry = new HealthRegistry({ redactHealthErrors: true });
        registry.register(healthyIndicator);
        const status = await registry.checkAll();
        expect(status.status).toBe('UP');
        expect(status.components['ok'].details?.features).toBe(3);
    });
});
