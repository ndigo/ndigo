/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, vi, afterEach } from 'vitest';
import { Application } from '../src/application';
import { WebAutoConfiguration } from '@ndigo/platform-web';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { configuration, entry } from '@ndigo/context';
import { whenProfile } from '@ndigo/core';
import { hashScope } from '@ndigo/factory';
import { HandlerMethodArgumentResolver } from '@ndigo/dispatcher';

@configuration
@whenProfile('dev')
class ProfiledConfiguration {
    @entry()
    appMode() {
        return 'dev';
    }
}

@configuration
class SourceConfiguration {
    @entry()
    appTitle() {
        return 'Ndigo';
    }
}

describe('Application', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    test('it should create instances', () => {
        const app = new Application([() => void 0]);
        expect(app).toBeInstanceOf(Application);
    });

    test('it should run and refresh context', async () => {
        const app = new Application([() => void 0]);
        const context = await app.run();

        expect(context.isActive).toBe(true);
    });

    test('it should apply configured profiles to environment before source registration', async () => {
        const app = new Application([ProfiledConfiguration]);
        app.setProfiles('dev');

        const context = await app.run();

        expect(context.environment.activeProfiles).toEqual(['dev']);
        expect(context.getValue('appMode')).toBe('dev');
    });

    test('it skips sources whose @whenProfile condition is inactive', async () => {
        const app = new Application([ProfiledConfiguration]);
        app.setProfiles('prod');

        const context = await app.run();

        expect(context.environment.activeProfiles).toEqual(['prod']);
        expect(context.hasValue('appMode')).toBe(false);
    });

    test('it should register metadata configuration sources into context', async () => {
        const app = new Application([SourceConfiguration]);
        const context = await app.run();

        expect(context.getValue('appTitle')).toBe('Ndigo');
    });

    test('it should set context name from application name', async () => {
        const app = new Application([]);
        app.setName('ndigo-app');

        const context = await app.run();

        expect(context.name).toBe('ndigo-app');
    });

    test('it should auto-configure web resolvers when window is defined', async () => {
        vi.stubGlobal('window', {});

        // Browser apps register the web auto-config explicitly (@ndigo/boot no
        // longer auto-registers it — node apps must not drag DOM).
        const app = new Application([WebAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');
        expect(resolvers.length).toBeGreaterThan(0);
    });

    test('it should register node resolvers from an explicit node source', async () => {
        vi.stubGlobal('window', undefined);

        // @ndigo/boot is platform-neutral — node auto-config is a source the
        // app provides, exactly like the web config above.
        const app = new Application([NodeAutoConfiguration]);
        const context = await app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<object[]>('argumentResolvers');
        expect(resolvers.some((r) => r.constructor.name.includes('Node'))).toBe(true);
    });

    test('FACTORY-12: a @hashScope constructor entry does not abort context refresh', async () => {
        @hashScope
        class HashScopedService {
            value = 'hash';
        }

        @configuration
        class HashScopeConfiguration {
            @entry()
            hashScoped() {
                // Returning a constructor stores it as a `$hashScoped` entry;
                // the refresh finish sweep must skip it (hash scope has no
                // active key at boot, so eager getValue used to throw).
                return HashScopedService;
            }
        }

        const app = new Application([HashScopeConfiguration]);
        const context = await app.run(); // before the fix: HashScope.getValue throws

        expect(context.isActive).toBe(true);
        expect(context.hasValue('hashScoped')).toBe(true);
    });
});
