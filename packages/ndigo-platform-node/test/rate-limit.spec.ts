/**
 * `@rateLimit` metadata + `RateLimitInterceptor` contracts (SEC-6): the
 * metadata gate, per-client-address budgets over the platform's limiter
 * bean, and the 429 + `Retry-After` denial. The limiter itself is tested
 * in `@ndigo/rate-limit` (AD-79 moved the SPI).
 */
import { describe, test, expect } from 'vitest';
import type { ServerResponse } from 'node:http';
import type { Route } from '@ndigo/router';
import { FixedWindowRateLimiter } from '@ndigo/rate-limit';
import { RateLimitInterceptor, RATE_LIMIT_KEY, rateLimit } from '../src/rate-limit-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, type NodeRequest } from '../src/node-request';

/** A route whose request carries `remoteAddress` (the key source). */
function routeFrom(address?: string): Route {
    return {
        attributes: {
            [NODE_REQUEST_ATTRIBUTE]: { remoteAddress: address } as NodeRequest,
        },
    } as unknown as Route;
}

/** A fake handler carrying `@rateLimit` metadata (guard-style read). */
function limitedHandler(method: string, policy: Record<string, unknown>, classPolicy?: Record<string, unknown>) {
    const metadata: Record<string, unknown> = {};
    metadata[`${RATE_LIMIT_KEY}:${method}`] = policy;
    if (classPolicy) metadata[RATE_LIMIT_KEY] = classPolicy;
    return { handler: { constructor: { [Symbol.metadata]: metadata } }, method } as unknown as object;
}

/** Captures what `writeProblem` wrote, like MockHTTP's memory sink. */
function captureResponse() {
    let head: { status: number; headers: Record<string, string> } | null = null;
    let body = '';
    const flags = { writableEnded: false };
    const res = {
        get writableEnded() {
            return flags.writableEnded;
        },
        writeHead(status: number, headers: Record<string, string>) {
            head = { status, headers };
        },
        end(chunk: string) {
            body = chunk;
            flags.writableEnded = true;
        },
    } as unknown as ServerResponse;
    return { res, head: () => head, body: () => body };
}

describe('@rateLimit decorator + RateLimitInterceptor', () => {
    test('decorator validates its policy at decoration time', () => {
        expect(() => rateLimit({ limit: 0, windowMs: 1000 })).toThrow(RangeError);
    });

    test('requests without metadata pass through untouched', async () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        await expect(
            interceptor.preHandle(routeFrom('10.0.0.1'), {
                handler: { constructor: { [Symbol.metadata]: {} } },
                method: 'x',
            } as unknown as object)
        ).resolves.toBe(true);
    });

    test('enforces the method policy per client address and writes 429 + Retry-After', async () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const policy = { limit: 2, windowMs: 60_000 };
        const handler = limitedHandler('login', policy);
        const { res, head, body } = captureResponse();
        const route = routeFrom('203.0.113.7');
        route.attributes[NODE_RESPONSE_ATTRIBUTE] = res;

        expect(await interceptor.preHandle(route, handler)).toBe(true);
        expect(await interceptor.preHandle(route, handler)).toBe(true);
        const denial = await interceptor.preHandle(route, handler);
        expect(denial).not.toBe(true);
        expect((denial as { statusCode: number }).statusCode).toBe(429);

        const written = head();
        expect(written?.status).toBe(429);
        expect(Number(written?.headers['Retry-After'])).toBeGreaterThan(0);
        expect(body()).toContain('Too Many Requests');
    });

    test('a different client address has its own budget', async () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const policy = { limit: 1, windowMs: 60_000 };
        const handler = limitedHandler('login', policy);
        expect(await interceptor.preHandle(routeFrom('10.0.0.1'), handler)).toBe(true);
        expect(await interceptor.preHandle(routeFrom('10.0.0.2'), handler)).toBe(true);
        expect((await interceptor.preHandle(routeFrom('10.0.0.1'), handler)) as { statusCode: number }).toMatchObject({
            statusCode: 429,
        });
    });

    test('method policy overrides a class-wide policy', async () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const handler = limitedHandler('login', { limit: 1, windowMs: 60_000 }, { limit: 10, windowMs: 60_000 });
        expect(await interceptor.preHandle(routeFrom('10.0.0.1'), handler)).toBe(true);
        expect((await interceptor.preHandle(routeFrom('10.0.0.1'), handler)) as { statusCode: number }).toMatchObject({
            statusCode: 429,
        });
    });

    test('requests without a client address share the fallback key', async () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const handler = limitedHandler('login', { limit: 1, windowMs: 60_000 });
        expect(await interceptor.preHandle(routeFrom(undefined), handler)).toBe(true);
        expect((await interceptor.preHandle(routeFrom(undefined), handler)) as { statusCode: number }).toMatchObject({
            statusCode: 429,
        });
    });
});
