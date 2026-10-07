/**
 * Live-rebind specs for AD-29 Wave 1: `@refreshScope` on
 * `@configurationProperties` classes re-binds on environment `refresh()`;
 * unmarked classes keep the boot-time snapshot.
 * @module blue-boot
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi } from 'vitest';
import { ApplicationBuilder, configurationProperties } from '../src/index';
import { property, defaultValue, configuration, refreshScope, CONFIG_REFRESH_EVENT } from '@blue/context';
import type { ConfigurableEnvironment } from '@blue/context';

@configurationProperties('server')
@refreshScope
class RefreshableServerConfig {
    @property('port', Number) @defaultValue('8080') port!: number;
    @property('host', String) @defaultValue('localhost') host!: string;
}

@configurationProperties('plain')
class PlainServerConfig {
    @property('port', Number) @defaultValue('7000') port!: number;
}

@configurationProperties('first')
@refreshScope
class FirstRefreshableConfig {
    @property('port', Number) @defaultValue('1111') port!: number;
}

@configurationProperties('second')
@refreshScope
class SecondRefreshableConfig {
    // No default: a refresh that drops `second.port` makes the rebind throw.
    @property('port', Number) port!: number;
}

/** Refresh-scoped config that records its own teardown across rebinds (CTX-13). */
@configurationProperties('counting')
@refreshScope
class DestroyCountingConfig {
    /** Test probe: how many previous instances were destroyed. */
    static destroyedInstances = 0;

    @property('port', Number) @defaultValue('8080') port!: number;
    destroyed = false;

    destroy(): void {
        this.destroyed = true;
        DestroyCountingConfig.destroyedInstances += 1;
    }
}

describe('@refreshScope live rebind (AD-29 D-1/D-2)', () => {
    test('rebinds @refreshScope config classes with fresh values on refresh()', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
        app.properties({ server: { port: '9090', host: 'blue.dev' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const before = context.getValue<RefreshableServerConfig>('refreshableServerConfig');
        expect(before.port).toBe(9090);

        // Change the winning source, then refresh the environment.
        environment.getPropertySources().replace('boot', { server: { port: '7070', host: 'new.dev' } });
        environment.refresh();

        const after = context.getValue<RefreshableServerConfig>('refreshableServerConfig');
        expect(after).not.toBe(before); // fresh bound instance
        expect(after.port).toBe(7070);
        expect(after.host).toBe('new.dev');
    });

    test('does NOT rebind unmarked config classes (snapshot identity)', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, PlainServerConfig]);
        app.properties({ plain: { port: '1111' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const before = context.getValue<PlainServerConfig>('plainServerConfig');
        expect(before.port).toBe(1111);

        environment.getPropertySources().replace('boot', { plain: { port: '2222' } });
        environment.refresh();

        const after = context.getValue<PlainServerConfig>('plainServerConfig');
        expect(after).toBe(before); // same instance — boot-time snapshot
        expect(after.port).toBe(1111);
    });

    test('refresh() with no source change leaves bound values intact', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
        app.properties({ server: { port: '9090' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const before = context.getValue<RefreshableServerConfig>('refreshableServerConfig');
        environment.refresh();

        const after = context.getValue<RefreshableServerConfig>('refreshableServerConfig');
        expect(after).not.toBe(before); // re-bound (refresh always re-binds)
        expect(after.port).toBe(9090); // but values unchanged
    });

    test('mid-loop rebind failure is surfaced fail-loud and the error event is dispatched (ARC-1)', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, FirstRefreshableConfig, SecondRefreshableConfig]);
        app.properties({ first: { port: '1111' }, second: { port: '2222' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const firstBefore = context.getValue<FirstRefreshableConfig>('firstRefreshableConfig');
        const secondBefore = context.getValue<SecondRefreshableConfig>('secondRefreshableConfig');
        expect(secondBefore.port).toBe(2222);

        // Sniff the emitter's 'error' re-dispatch: the rebind listener's throw
        // must surface here (the fail-loud channel), not vanish.
        const errorListener = vi.fn();
        environment.on('error', errorListener);
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        // Second-class rebind now fails: `second.port` is required, no default.
        environment.getPropertySources().replace('boot', { first: { port: '3333' } });
        environment.refresh();

        // The failing rebind surfaced as an 'error' event (ARC-1(b)) — without
        // the fail-loud wiring it was swallowed; with no handler at all the
        // emitter rethrows out of refresh().
        expect(errorListener).toHaveBeenCalledTimes(1);
        const firstCall = errorListener.mock.calls[0] as unknown[];
        const surfaced = (firstCall[0] as Error).message;
        expect(surfaced).toContain('second.port');
        // Boot logged the failure through the fail-loud channel (ARC-1(c)).
        expect(consoleError).toHaveBeenCalledWith(
            expect.stringContaining('config:refresh rebind failure'),
            expect.any(Error)
        );

        // Half-refresh caveat (ARC-1(c), NO rollback): the first class rebound
        // with fresh values, the second kept its pre-refresh instance.
        const firstAfter = context.getValue<FirstRefreshableConfig>('firstRefreshableConfig');
        const secondAfter = context.getValue<SecondRefreshableConfig>('secondRefreshableConfig');
        expect(firstAfter).not.toBe(firstBefore);
        expect(firstAfter.port).toBe(3333);
        expect(secondAfter).toBe(secondBefore);
        expect(secondAfter.port).toBe(2222);
        consoleError.mockRestore();
    });

    test('close() detaches refresh listeners: refresh after close does not write into the closed context (ARC-6/CTX-05)', async () => {
        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, RefreshableServerConfig]);
        app.properties({ server: { port: '9090' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const before = context.getValue<RefreshableServerConfig>('refreshableServerConfig'); // bind once
        // ARC-6/CTX-05: BOTH refresh subscriptions detach on CONTEXT close — the
        // context's scope-clear listener (context.close) and the app's rebind
        // listener (hooked to the context's own context:close event). No
        // Application.close() call is needed any more.
        const beforePort = before.port;
        context.close();

        // The rebind listener was detached: refresh after close must NOT
        // write a fresh bound instance into the closed context (a still-
        // attached listener would re-run resolveConfigurationProperties +
        // context.setValue silently).
        environment.getPropertySources().replace('boot', { server: { port: '7070' } });
        environment.refresh(); // must not throw and must not touch the context

        expect(environment.listenerCount(CONFIG_REFRESH_EVENT)).toBe(0);
        // The closed context still holds only the pre-close binding — a
        // still-attached rebind listener would have replaced it with a fresh
        // instance reporting the refreshed 7070 value.
        const after = context.getValue<RefreshableServerConfig>('refreshableServerConfig');
        expect(after).toBe(before);
        expect(after.port).toBe(beforePort); // 9090, not 7070 — no rebind write
    });

    test('CTX-13: a rebind destroys the previous @refreshScope instance before replacing it', async () => {
        DestroyCountingConfig.destroyedInstances = 0;

        @configuration
        class BootConfig {}
        const app = new ApplicationBuilder([BootConfig, DestroyCountingConfig]);
        app.properties({ counting: { port: '9090' } });

        const context = await app.run();
        const environment = context.environment as ConfigurableEnvironment;

        const before = context.getValue<DestroyCountingConfig>('destroyCountingConfig');
        expect(before.port).toBe(9090);
        expect(before.destroyed).toBe(false);

        environment.getPropertySources().replace('boot', { counting: { port: '7070' } });
        environment.refresh();

        // The replaced instance was torn down before `setValue` ...
        expect(before.destroyed).toBe(true);
        expect(DestroyCountingConfig.destroyedInstances).toBe(1);
        // ... and a live fresh instance now reports the new value.
        const after = context.getValue<DestroyCountingConfig>('destroyCountingConfig');
        expect(after).not.toBe(before);
        expect(after.port).toBe(7070);
        expect(after.destroyed).toBe(false);
    });
});
