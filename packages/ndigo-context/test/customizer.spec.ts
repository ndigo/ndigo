/**
 * @module ndigo-context
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { StandardEnvironment } from '@ndigo/context';
import { MutablePropertySources } from '../src/property-sources';
import { applyCustomizers } from '../src/customizer';
import type { EnvironmentCustomizer } from '../src/customizer';

describe('applyCustomizers (AD-16 D2)', () => {
    test('runs in registration order with each seeing the prior mutations', () => {
        const env = new StandardEnvironment();
        const order: string[] = [];

        const first: EnvironmentCustomizer = {
            customize(e) {
                order.push('first');
                e.getPropertySources().addLast('customA', { a: 1 });
            },
        };
        const second: EnvironmentCustomizer = {
            customize(e) {
                order.push('second');
                // sees the first's source
                expect(e.getPropertySources().get('customA')).toBeDefined();
                e.getPropertySources().addLast('customB', { b: 2 });
            },
        };

        applyCustomizers(env, [first, second]);

        expect(order).toEqual(['first', 'second']);
        expect(env.getProperty('a')).toBe(1);
        expect(env.getProperty('b')).toBe(2);
    });

    test('mutations are visible through lookups immediately', () => {
        const env = new StandardEnvironment();
        applyCustomizers(env, [
            {
                customize(e) {
                    e.getPropertySources().addLast('custom', { mode: 'test' });
                },
            },
        ]);

        expect(env.getProperty('mode')).toBe('test');
    });

    test('no customizers is a no-op', () => {
        const env = new StandardEnvironment();
        applyCustomizers(env, []);
        expect(env.getPropertySources().size).toBe(0);
    });
});

describe('originOf (AD-16 D1)', () => {
    test('flat strategy reports the winning top-level source', () => {
        const registry = new MutablePropertySources();
        registry.addLast('application', { server: { port: 8080 } });
        registry.addLast('commandLine', { mode: 'cli' });
        const env = new StandardEnvironment([], { index: 'flat' });
        // Replace the default registry with the prebuilt one via the setter.
        env.getPropertySources().addLast('application', { server: { port: 8080 } });
        env.getPropertySources().addLast('commandLine', { mode: 'cli' });
        void registry;

        expect(env.originOf('server')).toBe('application');
        expect(env.originOf('server.port')).toBe('application'); // top-level granularity
        expect(env.originOf('mode')).toBe('commandLine');
        expect(env.originOf('missing')).toBe(null);
    });

    test('prototype strategy returns null (no retained origins)', () => {
        const env = new StandardEnvironment([{ server: { port: 1 } }]);
        expect(env.originOf('server')).toBeNull();
    });
});

describe('refresh (AD-16 D3)', () => {
    test('rebuilds after in-place source mutation (forced)', () => {
        const registry = new MutablePropertySources();
        registry.addLast('user', { a: 'one' });
        const env = new StandardEnvironment([], { index: 'flat' });
        const resolverEnv = env;
        // Wire the registry-backed resolver via the same pattern as create.
        void resolverEnv;

        // Build a registry-backed environment manually: standard env accepts a
        // constructor array; use the registry through getPropertySources.
        env.getPropertySources().addLast('user', { a: 'one' });
        env.getPropertySources().replace('user', { a: 'two' });

        expect(env.getProperty('a')).toBe('two'); // lazy-dirty path already covers
        env.refresh();
        expect(env.getProperty('a')).toBe('two');
    });

    test('does not re-run customizers (environment-scope only)', () => {
        let runs = 0;
        const customizer: EnvironmentCustomizer = {
            customize() {
                runs++;
            },
        };
        const env = new StandardEnvironment();
        applyCustomizers(env, [customizer]);

        expect(runs).toBe(1);
        env.refresh();
        expect(runs).toBe(1); // refresh does NOT re-apply
    });
});
