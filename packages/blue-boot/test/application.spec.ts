import { describe, test, expect, vi, afterEach } from 'vitest';
import { Application } from '../src/application';
import { configuration, entry, profile } from '@blue/context';
import { HandlerMethodArgumentResolver } from '@blue/dispatcher';

@configuration
@profile('dev')
class ProfiledConfiguration {
    @entry
    appMode() {
        return 'dev';
    }
}

@configuration
class SourceConfiguration {
    @entry
    appTitle() {
        return 'Blue';
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

    test('it should run and refresh context', () => {
        const app = new Application([() => void 0]);
        const context = app.run();

        expect(context.isActive).toBe(true);
    });

    test('it should apply configured profiles to environment before source registration', () => {
        const app = new Application([ProfiledConfiguration]);
        app.setProfiles('dev');

        const context = app.run();

        expect(context.environment.activeProfiles).toEqual(['dev']);
        expect(context.getValue('appMode')).toBe('dev');
    });

    test('it should register metadata configuration sources into context', () => {
        const app = new Application([SourceConfiguration]);
        const context = app.run();

        expect(context.getValue('appTitle')).toBe('Blue');
    });

    test('it should set context name from application name', () => {
        const app = new Application([]);
        app.setName('blue-app');

        const context = app.run();

        expect(context.name).toBe('blue-app');
    });

    test('it should auto-configure web resolvers when window is defined', () => {
        vi.stubGlobal('window', {});

        const app = new Application([]);
        const context = app.run();

        expect(context.hasValue('argumentResolvers')).toBe(true);
        const resolvers = context.getValue<HandlerMethodArgumentResolver[]>('argumentResolvers');
        expect(resolvers.length).toBeGreaterThan(0);
    });
});
