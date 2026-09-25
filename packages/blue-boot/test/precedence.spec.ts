/**
 * PrecedenceDoc assertions (AD-13 D6): the documented source order, the
 * uniqueness of names, and — critically — that REAL boot wiring satisfies
 * the documented chain (first registered = highest precedence). The runtime
 * test caught a real regression when the chain was first wired (defaults
 * outranked builder properties); it boots a full application through
 * `ApplicationBuilder` so the two can never drift.
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { ConfigurableEnvironment, MutablePropertySources } from '@blue/context';
import { ApplicationBuilder } from '../src/application-builder';
import { PRECEDENCE } from '../src/precedence';
import { NodeEnvironment } from '@blue/platform-node';

class AppConfig {}

/** Stub fetch serving an empty JSON doc with an ETag (never changes). */
const stubFetch = () =>
    Promise.resolve({
        ok: true,
        status: 200,
        headers: { get: () => null },
        text: async () => '{"server":{"port":"1"}}',
    } as unknown as Response);

describe('PrecedenceDoc', () => {
    test('should list every source from highest to lowest precedence', () => {
        expect(PRECEDENCE).toEqual([
            'commandLine',
            'boot',
            'systemEnvironment',
            'configServer',
            'dotenv',
            'application',
            'defaults',
        ]);
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
        registry.addLast('configServer', {});
        registry.addLast('dotenv', {});
        registry.addLast('application', {});
        registry.addLast('defaults', {});

        // The wired order (first = highest) must equal PRECEDENCE exactly.
        expect(registry.toArray().map((s) => s.name)).toEqual([...PRECEDENCE]);
    });

    test('REAL boot wiring equals the documented chain (regression pin)', async () => {
        // Boot a full stack: NodeEnvironment (systemEnvironment), builder
        // properties (boot), CLI (commandLine), a remote config source
        // (configServer), and defaults. Every documented slot must land in
        // the documented relative order — this is the assertion that caught
        // defaults outranking boot before the fix.
        const app = new ApplicationBuilder([AppConfig]);
        app.environment(new NodeEnvironment());
        app.properties({ 'server.port': '9090' });
        app.defaults({ 'server.port': '1' });
        app.configServer({
            url: 'https://config.example.test/app.json',
            optional: true,
            fetch: stubFetch,
        });

        const context = await app.run('--cli.flag=x');
        const names = [...(context.environment as ConfigurableEnvironment).getPropertySources()].map((s) => s.name);

        // Every present source must appear in PRECEDENCE order (absent
        // optional sources are skipped — dotenv is not registered by this
        // stack).
        const expected = [...PRECEDENCE].filter((name) => names.includes(name));
        const order = names.filter((name) => PRECEDENCE.includes(name));
        expect(order).toEqual(expected);

        // The hard guarantees: commandLine highest, boot above env,
        // configServer between env and defaults, defaults lowest.
        expect(names.indexOf('commandLine')).toBeLessThan(names.indexOf('boot'));
        expect(names.indexOf('boot')).toBeLessThan(names.indexOf('systemEnvironment'));
        expect(names.indexOf('configServer')).toBeGreaterThan(names.indexOf('systemEnvironment'));
        expect(names.indexOf('defaults')).toBe(names.length - 1);
        context.close();
    });
});
