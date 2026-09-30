/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { z } from 'zod';
import { Route, ACCEPT_LANGUAGE_ATTRIBUTE } from '@blue/router';
import { AcceptHeaderLanguageResolver } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeMultipartFileMethodArgumentResolver } from '../src/multipart-file-argument-resolver';
import { NodeRequestPartMethodArgumentResolver } from '../src/request-part-argument-resolver';
import { NodeDataBindingMethodArgumentResolver } from '../src/data-binding-argument-resolver';

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

    test('provides a shared conversion service with schema targets (AD-38)', () => {
        const config = new NodeAutoConfiguration();
        const conversion = config.conversionService();
        // Schema target: contract-enforced projection…
        expect(conversion.convert({ id: 7, secret: 'x' }, z.object({ id: z.number() }))).toEqual({ id: 7 });
        // …and leaf target: registered converters still work.
        expect(conversion.convert('2026-09-29T00:00:00.000Z', Date)).toBeInstanceOf(Date);
    });

    test('provides 9 argument resolvers, including multipart file + part binding', () => {
        const config = new NodeAutoConfiguration();
        const resolvers = config.argumentResolvers();
        expect(resolvers).toHaveLength(9);
        // AD-26/D-6: the multipart and request-part resolvers are wired into
        // the runtime chain. Without them, @file()/fileValue() and
        // requestPart() parameters never bind and uploads return 400.
        expect(resolvers.some((r) => r instanceof NodeMultipartFileMethodArgumentResolver)).toBe(true);
        expect(resolvers.some((r) => r instanceof NodeRequestPartMethodArgumentResolver)).toBe(true);
        expect(resolvers.some((r) => r instanceof NodeDataBindingMethodArgumentResolver)).toBe(true);
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
