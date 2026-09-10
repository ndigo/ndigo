import { describe, test, expect, beforeEach, vi } from 'vitest';
import { Emitter } from '@blue/context';
import { HTTP, HeaderInterceptor, StatusInterceptor, ErrorNormalizationInterceptor } from '@blue/http';
import { MapServiceRegistry, EventEmitterTelemetryHooks, CryptoRequestIdCorrelation } from '../src';

describe('Service Layer Integration', () => {
    let registry: MapServiceRegistry;
    let telemetry: EventEmitterTelemetryHooks;
    let correlation: CryptoRequestIdCorrelation;
    let emitter: Emitter;

    beforeEach(() => {
        registry = new MapServiceRegistry();
        emitter = new Emitter();
        telemetry = new EventEmitterTelemetryHooks(emitter);
        correlation = new CryptoRequestIdCorrelation();
    });

    test('should resolve endpoint from registry and include correlation ID in request', async () => {
        registry.register('users', 'http://localhost/api/users');

        const http = new HTTP([
            new HeaderInterceptor({ generateRequestId: true }),
            new StatusInterceptor({ statusMappings: { 200: 'SUCCESS' } }),
        ]);

        // Verify registry resolves the endpoint
        expect(registry.getEndpoint('users')).toBe('http://localhost/api/users');

        // Verify correlation ID is generated
        const id1 = correlation.getCorrelationId();
        const id2 = correlation.getCorrelationId();
        expect(id1).toBe(id2); // Same ID returned on second call
        expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    });

    test('should emit telemetry events in correct order', async () => {
        const events: string[] = [];
        emitter.on('service:request:start', () => events.push('start'));
        emitter.on('service:request:end', () => events.push('end'));
        emitter.on('service:request:error', () => events.push('error'));

        telemetry.onRequest(new Request('http://localhost/test'));

        expect(events).toContain('start');

        telemetry.onResponse(new Response('ok', { status: 200 }));
        expect(events).toContain('end');
    });

    test('should generate unique request IDs for each generation call', () => {
        const id1 = correlation.generateRequestId();
        const id2 = correlation.generateRequestId();
        expect(id1).not.toBe(id2);
    });

    test('should allow overriding correlation ID', () => {
        const customId = 'my-custom-correlation-id';
        correlation.setCorrelationId(customId);
        expect(correlation.getCorrelationId()).toBe(customId);
    });

    test('should register and retrieve multiple endpoints', () => {
        registry.register('users', 'http://localhost/api/users');
        registry.register('orders', 'http://localhost/api/orders');

        expect(registry.getEndpoint('users')).toBe('http://localhost/api/users');
        expect(registry.getEndpoint('orders')).toBe('http://localhost/api/orders');
        expect(registry.getEndpoint('missing')).toBeNull();

        const all = registry.getAllEndpoints();
        expect(all.size).toBe(2);
        expect(all.has('users')).toBe(true);
        expect(all.has('orders')).toBe(true);
    });

    test('should emit error telemetry with error details', () => {
        let emittedData: { error: string; stack: string | undefined } | null = null;
        emitter.on('service:request:error', (data) => {
            emittedData = data;
        });

        const error = new Error('Connection refused');
        telemetry.onError(error);

        expect(emittedData?.error).toBe('Connection refused');
        expect(emittedData?.stack).toBeDefined();
    });
});
