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
import type { ServerResponse } from 'node:http';
import { CORSInterceptor } from '../src/cors-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE } from '../src/node-request';
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
        const route = { attributes: { [ACCEPT_LANGUAGE_ATTRIBUTE]: 'fr-CH, fr;q=0.9, en;q=0.8' } } as unknown as Route;

        expect(resolver.resolveLanguage(route)).toBe('fr-CH');
        expect(resolver.resolveLanguage({ attributes: {} } as Route)).toBe('en-US');
    });
    test('registers a fail-closed CORS interceptor when no cors config is present', async () => {
        const config = new NodeAutoConfiguration();
        (config as unknown as { applicationContext: unknown }).applicationContext = {
            environment: { getProperty: () => undefined },
        };

        const mapping = config.handlerMapping();
        const cors = mapping.interceptors.find((interceptor) => interceptor instanceof CORSInterceptor);
        expect(cors).toBeInstanceOf(CORSInterceptor);

        // Fail-closed: an Origin header is not permitted without cors.allowedOrigins.
        const headers = new Map<string, string | string[]>();
        const res = {
            headersSent: false,
            getHeader: (name: string) => headers.get(name.toLowerCase()),
            setHeader: (name: string, value: string | string[]) => {
                headers.set(name.toLowerCase(), value);
            },
        } as unknown as ServerResponse;
        const route = {
            method: 'GET',
            path: '/api/x',
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: { headers: { origin: 'https://evil.example' } },
                [NODE_RESPONSE_ATTRIBUTE]: res,
            },
        } as unknown as Route;
        await (cors as CORSInterceptor).preHandle(route, undefined);
        expect(headers.get('access-control-allow-origin')).toBeUndefined();
    });

    test('reads cors.allowedOrigins from the environment and permits that origin', async () => {
        const config = new NodeAutoConfiguration();
        (config as unknown as { applicationContext: unknown }).applicationContext = {
            environment: {
                getProperty: (key: string) =>
                    key === 'cors' ? { allowedOrigins: ['https://app.example.com'] } : undefined,
            },
        };

        const mapping = config.handlerMapping();
        const cors = mapping.interceptors.find((interceptor) => interceptor instanceof CORSInterceptor);
        expect(cors).toBeInstanceOf(CORSInterceptor);

        const headers = new Map<string, string | string[]>();
        const res = {
            headersSent: false,
            getHeader: (name: string) => headers.get(name.toLowerCase()),
            setHeader: (name: string, value: string | string[]) => {
                headers.set(name.toLowerCase(), value);
            },
        } as unknown as ServerResponse;
        const route = {
            method: 'GET',
            path: '/api/x',
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: { headers: { origin: 'https://app.example.com' } },
                [NODE_RESPONSE_ATTRIBUTE]: res,
            },
        } as unknown as Route;
        await (cors as CORSInterceptor).preHandle(route, undefined);
        expect(headers.get('access-control-allow-origin')).toBe('https://app.example.com');
    });
    test('honors documented server.port config when PORT is unset', () => {
        const saved = process.env.PORT;
        delete process.env.PORT;
        try {
            const config = new NodeAutoConfiguration();
            (config as unknown as { applicationContext: unknown }).applicationContext = {
                environment: { getProperty: (key: string) => (key === 'server.port' ? 4321 : undefined) },
            };
            expect(config.httpServer().port).toBe(4321);
        } finally {
            if (saved !== undefined) process.env.PORT = saved;
        }
    });

    test('prefers process.env.PORT over server.port config', () => {
        const saved = process.env.PORT;
        process.env.PORT = '3999';
        try {
            const config = new NodeAutoConfiguration();
            (config as unknown as { applicationContext: unknown }).applicationContext = {
                environment: { getProperty: (key: string) => (key === 'server.port' ? 4321 : undefined) },
            };
            expect(config.httpServer().port).toBe(3999);
        } finally {
            if (saved === undefined) delete process.env.PORT;
            else process.env.PORT = saved;
        }
    });

    test('falls back to the server default when neither PORT nor server.port is set', () => {
        const saved = process.env.PORT;
        delete process.env.PORT;
        try {
            const config = new NodeAutoConfiguration();
            (config as unknown as { applicationContext: unknown }).applicationContext = {
                environment: { getProperty: () => undefined },
            };
            expect(config.httpServer().port).toBe(3000);
        } finally {
            if (saved !== undefined) process.env.PORT = saved;
        }
    });
});
