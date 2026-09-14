/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { Route, ACCEPT_LANGUAGE_ATTRIBUTE } from '@blue/router';
import { AcceptHeaderLanguageResolver } from '@blue/dispatcher';
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

    test('provides an accept-header language resolver', () => {
        const config = new NodeAutoConfiguration();
        const resolver = config.languageResolver();
        expect(resolver).toBeInstanceOf(AcceptHeaderLanguageResolver);
    });

    test('language resolver negotiates from the route accept-language attribute', () => {
        const config = new NodeAutoConfiguration();
        const resolver = config.languageResolver() as AcceptHeaderLanguageResolver;
        const route = { attributes: { [ACCEPT_LANGUAGE_ATTRIBUTE]: 'fr-CH, fr;q=0.9, en;q=0.8' } } as Route;

        expect(resolver.resolveLanguage(route)).toBe('fr-CH');
        expect(resolver.resolveLanguage({ attributes: {} } as Route)).toBe('en-US');
    });
});
