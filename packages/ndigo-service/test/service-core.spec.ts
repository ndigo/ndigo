/**
 */
import { describe, test, expect, beforeEach, vi, Mock } from 'vitest';
import { Emitter } from '@ndigo/context';
import { HTTP } from '@ndigo/http';
import { ServiceRegistry, MapServiceRegistry } from '../src/service-registry';
import { TelemetryHooks, EventEmitterTelemetryHooks } from '../src/telemetry-hooks';
import { RequestIdCorrelation, CryptoRequestIdCorrelation } from '../src/request-id-correlation';
import { Service } from '../src/service';

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
        emitter.on('service:request:start', (data: unknown) => {
            eventData = data;
        });

        const request = new Request('https://api.example.com/test', { method: 'GET' });
        hooks.onRequest(request);

        expect(eventData).toEqual({ url: 'https://api.example.com/test', method: 'GET' });
    });

    test('should emit service:request:end on onResponse', () => {
        let eventData: unknown;
        emitter.on('service:request:end', (data: unknown) => {
            eventData = data;
        });

        const response = new Response('ok', { status: 200 });
        hooks.onResponse(response);

        // response.url is empty for manually created responses
        expect(eventData).toEqual({ url: '', status: 200 });
    });

    test('should emit service:request:error on onError', () => {
        let eventData: unknown;
        emitter.on('service:request:error', (data: unknown) => {
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

describe('Service.call correlation id', () => {
    let fetchMock: Mock;
    let http: HTTP;
    let registry: MapServiceRegistry;
    let telemetry: TelemetryHooks;
    let correlation: RequestIdCorrelation;
    let service: Service;

    const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

    beforeEach(() => {
        fetchMock = vi.fn().mockResolvedValue(new Response('ok', { status: 200 }));
        http = new HTTP([], {}, fetchMock as unknown as typeof fetch);
        registry = new MapServiceRegistry();
        registry.register('users', 'http://localhost/api/users');
        telemetry = new EventEmitterTelemetryHooks(new Emitter());
        correlation = new CryptoRequestIdCorrelation();
        service = new Service('svc', http, registry, telemetry, correlation);
    });

    test('stamps a FRESH correlation id on each call (distinct per call)', async () => {
        await service.call('users', null);
        await service.call('users', null);

        expect(fetchMock).toHaveBeenCalledTimes(2);
        const first = (fetchMock.mock.calls[0][0] as Request).headers.get('X-Correlation-ID');
        const second = (fetchMock.mock.calls[1][0] as Request).headers.get('X-Correlation-ID');

        expect(first).toMatch(uuidRe);
        expect(second).toMatch(uuidRe);
        expect(first).not.toBe(second);
    });

    test('a call stamps a fresh id without mutating the shared correlation state', async () => {
        const customId = 'root-correlation-id';
        correlation.setCorrelationId(customId);

        const emitter = new Emitter();
        // The telemetry emit point runs with the call in flight — the shared
        // correlation id must be untouched (the id is local to the call, PLN-F7).
        const inCallIds: string[] = [];
        emitter.on('service:request:start', () => {
            inCallIds.push(correlation.getCorrelationId());
        });
        const localService = new Service('svc', http, registry, new EventEmitterTelemetryHooks(emitter), correlation);

        await localService.call('users', null);

        const header = (fetchMock.mock.calls[0][0] as Request).headers.get('X-Correlation-ID');
        expect(header).toMatch(uuidRe);
        expect(inCallIds).toEqual([customId]);
        expect(correlation.getCorrelationId()).toBe(customId);
    });

    test('concurrent calls cannot corrupt the shared correlation id (PLN-F7)', async () => {
        const customId = 'root-correlation-id';
        correlation.setCorrelationId(customId);

        // Hold both requests open until both have been issued, so their
        // in-flight windows overlap (the old save/restore captured the other
        // call's id as its "previous" and left a per-call id behind).
        const releases: Array<() => void> = [];
        fetchMock.mockImplementation(
            () =>
                new Promise<Response>((resolve) => {
                    releases.push(() => resolve(new Response('ok', { status: 200 })));
                })
        );

        const first = service.call('users', null);
        const second = service.call('users', null);
        await vi.waitFor(() => expect(releases).toHaveLength(2));

        const firstHeader = (fetchMock.mock.calls[0][0] as Request).headers.get('X-Correlation-ID');
        const secondHeader = (fetchMock.mock.calls[1][0] as Request).headers.get('X-Correlation-ID');
        expect(firstHeader).toMatch(uuidRe);
        expect(secondHeader).toMatch(uuidRe);
        expect(firstHeader).not.toBe(secondHeader);

        for (const release of releases) {
            release();
        }
        await Promise.all([first, second]);

        // The ambient id set before the calls survives both of them.
        expect(correlation.getCorrelationId()).toBe(customId);
    });

    test('restores the previous correlation id after a call', async () => {
        const customId = 'custom-id-123';
        correlation.setCorrelationId(customId);

        await service.call('users', null);

        expect(correlation.getCorrelationId()).toBe(customId);
    });
});
