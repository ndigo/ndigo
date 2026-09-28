/**
 * Health registry behavior — including AD-36 D-1 error redaction.
 * * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { HealthRegistry, HEALTH_ERROR_REDACTED, type HealthIndicator, type HealthState } from '../src/health';

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
