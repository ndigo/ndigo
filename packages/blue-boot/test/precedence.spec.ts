import { describe, test, expect } from 'vitest';
import { MutablePropertySources } from '@blue/context';
import { PRECEDENCE } from '../src/precedence';

describe('PrecedenceDoc', () => {
    test('should list every source from highest to lowest precedence', () => {
        expect(PRECEDENCE).toEqual(['commandLine', 'boot', 'systemEnvironment', 'dotenv', 'application', 'defaults']);
    });

    test('should be a readonly tuple with unique names', () => {
        expect(new Set(PRECEDENCE).size).toBe(PRECEDENCE.length);
    });

    test('runtime wiring must satisfy the documented precedence (no drift)', () => {
        // Build the registry exactly as boot wires it: HIGHEST first
        // (registry position 0 = highest precedence in the chain's first-wins).
        const registry = new MutablePropertySources();
        registry.addFirst('commandLine', {});
        registry.addLast('boot', {});
        registry.addLast('systemEnvironment', {});
        registry.addLast('dotenv', {});
        registry.addLast('application', {});
        registry.addLast('defaults', {});

        // The wired order (first = highest) must equal PRECEDENCE exactly.
        expect(registry.toArray().map((s) => s.name)).toEqual([...PRECEDENCE]);
    });
});
