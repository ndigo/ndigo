import { describe, test, expect } from 'vitest';
import { ApplicationBuilder } from '../src/application-builder';
import { StandardEnvironment, configuration, entry } from '@blue/context';

@configuration
class BuilderConfiguration {
    @entry
    builderName() {
        return 'builder';
    }
}

@configuration
class ExtraConfiguration {
    @entry
    extraValue() {
        return 'extra';
    }
}

@configuration
class ChildConfiguration {
    @entry
    childValue() {
        return 'child';
    }
}

describe('ApplicationBuilder', () => {
    test('it should store properties without throwing', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        expect(() => builder.properties({ featureFlag: true })).not.toThrow();
    });

    test('it should only run once and return same context', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        const first = builder.run();
        const second = builder.run();

        expect(first).toBe(second);
    });

    test('it should create child builder without throwing', () => {
        const parent = new ApplicationBuilder([BuilderConfiguration]);
        parent.properties({ featureFlag: true });

        expect(() => parent.child(BuilderConfiguration)).not.toThrow();
    });

    test('it should register additional sources added through sources()', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        builder.sources([ExtraConfiguration]);

        const context = builder.run();

        expect(context.getValue('builderName')).toBe('builder');
        expect(context.getValue('extraValue')).toBe('extra');
    });

    test('it should apply profiles to the built application context', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);

        const context = builder.profiles('dev', 'test').run();

        expect(context.environment.activeProfiles).toEqual(['dev', 'test']);
    });

    test('it should apply explicit environment to the built application context', () => {
        const builder = new ApplicationBuilder([BuilderConfiguration]);
        const environment = new StandardEnvironment();

        const context = builder.environment(environment).run();

        expect(context.environment).toBe(environment);
    });

    test('it should keep child properties isolated from parent', () => {
        const parent = new ApplicationBuilder([BuilderConfiguration]).properties({ parentOnly: true });
        const child = parent.child(ChildConfiguration).properties({ childOnly: true });

        const parentContext = parent.run();
        const childContext = child.run();

        expect(parentContext.getValue('childValue')).toBeUndefined();
        expect(childContext.getValue('childValue')).toBe('child');
    });
});
