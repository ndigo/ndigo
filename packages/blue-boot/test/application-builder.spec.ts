import { describe, test, expect } from 'vitest';
import { ApplicationBuilder } from '../src/application-builder';
import { configuration, entry } from '@blue/context';

@configuration
class BuilderConfiguration {
    @entry
    builderName() {
        return 'builder';
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
});
