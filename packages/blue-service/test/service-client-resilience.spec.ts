/**
 * Demo gate for `@blue/resilience` (AD-43 D-7): the exact composition a real
 * app uses — `interceptMethods(serviceClient(API, http), [circuit, retry])` —
 * exercised on the service layer's real failure path: response-schema
 * validation throws `IllegalStateError` (`service-client.ts`), which the
 * interceptor contract sees.
 *
 * Transport-level failures are documented out of v1 scope: `HTTP.request`
 * never throws — fetch failures resolve as `ResponseError` *values* — so the
 * exception-path interceptors do not see them (see AD-43 D-8 amendment).
 *
 * @module blue-service
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { HTTP } from '@blue/http';
import { service, getCall, serviceClient } from '../src';
import { interceptMethods } from '@blue/proxy';
import { CircuitBreakerInterceptor, CircuitOpenError, RetryInterceptor, circuitBreaker, retry } from '@blue/resilience';

const ItemSchema = z.object({ id: z.number() });

@service('resilient', { baseUrl: 'https://api.example.com' })
class ResilientAPI {
    @retry({ attempts: 3 })
    @circuitBreaker({ failureThreshold: 2, resetMs: 10_000 })
    @getCall('/items', { responseSchema: ItemSchema })
    items(): Promise<{ id: number }> {
        return undefined as unknown as Promise<{ id: number }>;
    }
}

let fetchMock: ReturnType<typeof vi.fn>;
let http: HTTP;

beforeEach(() => {
    fetchMock = vi.fn();
    http = new HTTP([], {}, fetchMock as unknown as typeof fetch);
});

/** A 200 with a body that fails the response schema — the real validation error path. */
function invalidBody() {
    return new Response('{"nope": true}', { status: 200 });
}

@service('plain', { baseUrl: 'https://api.example.com' })
class PlainAPI {
    @getCall('/plain')
    plain(): Promise<unknown> {
        return undefined as unknown as Promise<unknown>;
    }
}

describe('resilient service client composition (AD-43 D-7 demo gate)', () => {
    test('retry intercepts validation failures through the service client', async () => {
        fetchMock.mockResolvedValue(invalidBody());
        const api = interceptMethods(serviceClient(ResilientAPI, http), [new RetryInterceptor()]);

        await expect(api.items()).rejects.toThrow(/Service 'resilient' response validation failed/);
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });

    test('the circuit opens after the threshold and fails fast', async () => {
        fetchMock.mockResolvedValue(invalidBody());
        const api = interceptMethods(serviceClient(ResilientAPI, http), [new CircuitBreakerInterceptor()]);

        await expect(api.items()).rejects.toThrow(/response validation failed/);
        await expect(api.items()).rejects.toThrow(/response validation failed/);
        await expect(api.items()).rejects.toBeInstanceOf(CircuitOpenError);
        await expect(api.items()).rejects.toBeInstanceOf(CircuitOpenError);
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    test('retry sits inside the circuit: one chain pass counts one failure', async () => {
        fetchMock.mockResolvedValue(invalidBody());
        const api = interceptMethods(serviceClient(ResilientAPI, http), [
            new CircuitBreakerInterceptor(),
            new RetryInterceptor(),
        ]);

        await expect(api.items()).rejects.toThrow(/response validation failed/);
        await expect(api.items()).rejects.toThrow(/response validation failed/);
        await expect(api.items()).rejects.toBeInstanceOf(CircuitOpenError);
        // Two full chain passes × 3 retry attempts; the third pass failed
        // fast before any request went out.
        expect(fetchMock).toHaveBeenCalledTimes(6);
    });

    test('a client with no annotated methods passes through unchanged', () => {
        const raw = serviceClient(PlainAPI, http);
        const unannotated = interceptMethods(raw, [new RetryInterceptor()]);

        // interceptMethods matched nothing — same object, no proxy.
        expect(unannotated).toBe(raw);
    });
});
