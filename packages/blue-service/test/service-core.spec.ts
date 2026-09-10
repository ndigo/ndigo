import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Emitter } from '@blue/context';
import { ServiceRegistry, MapServiceRegistry } from '../src/service-registry';
import { TelemetryHooks, EventEmitterTelemetryHooks } from '../src/telemetry-hooks';
import { RequestIdCorrelation, CryptoRequestIdCorrelation } from '../src/request-id-correlation';

describe('MapServiceRegistry', () => {
    let registry: ServiceRegistry;

    beforeEach(() => {
        registry = new MapServiceRegistry();
    });

    test('should register and retrieve an endpoint', () => {
        registry.register('users', 'https://api.example.com/users');
        expect(registry.getEndpoint('users')).toBe('https://api.example.com/users');
    });

    test('should return null for a non-existent token', () => {
        expect(registry.getEndpoint('non-existent')).toBeNull();
    });

    test('should return a copy of the endpoints map', () => {
        registry.register('users', 'https://api.example.com/users');
        const endpoints = registry.getAllEndpoints();

        // Modifying the returned map should not affect the registry
        endpoints.set('users', 'https://modified.example.com/users');
        expect(registry.getEndpoint('users')).toBe('https://api.example.com/users');
    });
});

describe('EventEmitterTelemetryHooks', () => {
    let emitter: Emitter;
    let hooks: TelemetryHooks;

    beforeEach(() => {
        emitter = new Emitter();
        hooks = new EventEmitterTelemetryHooks(emitter);
    });

    test('should emit service:request:start on onRequest', () => {
        let eventData: unknown;
        emitter.on('service:request:start', (data) => {
            eventData = data;
        });

        const request = new Request('https://api.example.com/test', { method: 'GET' });
        hooks.onRequest(request);

        expect(eventData).toEqual({ url: 'https://api.example.com/test', method: 'GET' });
    });

    test('should emit service:request:end on onResponse', () => {
        let eventData: unknown;
        emitter.on('service:request:end', (data) => {
            eventData = data;
        });

        const response = new Response('ok', { status: 200 });
        hooks.onResponse(response);

        // response.url is empty for manually created responses
        expect(eventData).toEqual({ url: '', status: 200 });
    });

    test('should emit service:request:error on onError', () => {
        let eventData: unknown;
        emitter.on('service:request:error', (data) => {
            eventData = data;
        });

        const error = new Error('Something went wrong');
        hooks.onError(error);

        expect(eventData).toEqual({
            error: 'Something went wrong',
            stack: expect.any(String),
        });
    });
});

describe('CryptoRequestIdCorrelation', () => {
    let correlation: RequestIdCorrelation;

    beforeEach(() => {
        correlation = new CryptoRequestIdCorrelation();
    });

    test('should generate a valid UUID', () => {
        const id = correlation.generateRequestId();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    test('should generate an ID if none is set', () => {
        const id = correlation.getCorrelationId();
        expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    test('should set and retrieve a custom correlation ID', () => {
        const customId = 'custom-id-123';
        correlation.setCorrelationId(customId);
        expect(correlation.getCorrelationId()).toBe(customId);
    });

    test('should not generate a new ID if one is already set', () => {
        const customId = 'custom-id-123';
        correlation.setCorrelationId(customId);

        // Calling getCorrelationId multiple times should return the same ID
        expect(correlation.getCorrelationId()).toBe(customId);
        expect(correlation.getCorrelationId()).toBe(customId);
    });
});
