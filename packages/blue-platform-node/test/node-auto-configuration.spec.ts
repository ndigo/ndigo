import { describe, test, expect } from 'vitest';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';

describe('NodeAutoConfiguration', () => {
    test('creates an instance', () => {
        const config = new NodeAutoConfiguration();
        expect(config).toBeInstanceOf(NodeAutoConfiguration);
    });

    test('provides argument value converter registry', () => {
        const config = new NodeAutoConfiguration();
        const converters = config.argumentValueConverterRegistry();
        expect(converters).toBeDefined();
    });

    test('provides 6 argument resolvers', () => {
        const config = new NodeAutoConfiguration();
        const resolvers = config.argumentResolvers();
        expect(resolvers).toHaveLength(6);
    });

    test('provides handler mapping', () => {
        const config = new NodeAutoConfiguration();
        const mapping = config.handlerMapping();
        expect(mapping).toBeDefined();
    });
});
