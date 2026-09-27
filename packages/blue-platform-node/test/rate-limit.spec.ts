/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import type { ServerResponse } from 'node:http';
import type { Route } from '@blue/router';
import { FixedWindowRateLimiter } from '../src/rate-limit';
import { RateLimitInterceptor, RATE_LIMIT_KEY, rateLimit } from '../src/rate-limit-interceptor';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, type NodeRequest } from '../src/node-request';

/** Test-only delay helper (Promise.withResolvers pattern). */
function delay(ms: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
}

/** A route whose request carries `remoteAddress` (the key source). */
function routeFrom(address?: string): Route {
    return {
        attributes: {
            [NODE_REQUEST_ATTRIBUTE]: {
                cookies: {},
                session: {},
                body: {},
                headers: {},
                remoteAddress: address,
            } as NodeRequest,
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
    const res = {
        writableEnded: false,
        writeHead(status: number, headers: Record<string, string>) {
            head = { status, headers };
        },
        end(chunk: string) {
            body = chunk;
            this.writableEnded = true;
        },
    } as unknown as ServerResponse;
    return { res, head: () => head, body: () => body };
}

describe('FixedWindowRateLimiter', () => {
    test('kind is fixed-window', () => {
        expect(new FixedWindowRateLimiter().kind).toBe('fixed-window');
    });

    test('allows requests up to the limit and denies the next', () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 3, windowMs: 60_000 };
        expect(limiter.consume('a', policy).allowed).toBe(true);
        expect(limiter.consume('a', policy).allowed).toBe(true);
        expect(limiter.consume('a', policy).allowed).toBe(true);
        const denied = limiter.consume('a', policy);
        expect(denied.allowed).toBe(false);
        expect(denied.retryAfterMs).toBeGreaterThan(0);
    });

    test('distinct keys are independent', () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 1, windowMs: 60_000 };
        expect(limiter.consume('a', policy).allowed).toBe(true);
        expect(limiter.consume('b', policy).allowed).toBe(true);
        expect(limiter.consume('a', policy).allowed).toBe(false);
    });

    test('a new window resets the count', async () => {
        const limiter = new FixedWindowRateLimiter();
        const policy = { limit: 1, windowMs: 30 };
        expect(limiter.consume('a', policy).allowed).toBe(true);
        expect(limiter.consume('a', policy).allowed).toBe(false);
        await delay(40);
        expect(limiter.consume('a', policy).allowed).toBe(true);
    });

    test('invalid policies fail loud', () => {
        const limiter = new FixedWindowRateLimiter();
        expect(() => limiter.consume('a', { limit: 0, windowMs: 1000 })).toThrow(RangeError);
        expect(() => limiter.consume('a', { limit: 1.5, windowMs: 1000 })).toThrow(RangeError);
        expect(() => limiter.consume('a', { limit: 1, windowMs: -1 })).toThrow(RangeError);
    });
});

describe('@rateLimit decorator + RateLimitInterceptor', () => {
    test('decorator validates its policy at decoration time', () => {
        // @ts-expect-error -- invalid policy must be rejected by the factory
        expect(() => rateLimit({ limit: 0, windowMs: 1000 })).toThrow(RangeError);
    });

    test('requests without metadata pass through untouched', () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        expect(
            interceptor.preHandle(routeFrom('10.0.0.1'), {
                handler: { constructor: { [Symbol.metadata]: {} } },
                method: 'x',
            } as unknown as object)
        ).toBe(true);
    });

    test('enforces the method policy per client address and writes 429 + Retry-After', () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const policy = { limit: 2, windowMs: 60_000 };
        const handler = limitedHandler('login', policy);
        const { res, head, body } = captureResponse();
        const route = routeFrom('203.0.113.7');
        route.attributes[NODE_RESPONSE_ATTRIBUTE] = res;

        expect(interceptor.preHandle(route, handler) === true).toBe(true);
        expect(interceptor.preHandle(route, handler) === true).toBe(true);
        const denial = interceptor.preHandle(route, handler);
        expect(denial).not.toBe(true);
        expect((denial as { statusCode: number }).statusCode).toBe(429);

        const written = head();
        expect(written?.status).toBe(429);
        expect(Number(written?.headers['Retry-After'])).toBeGreaterThan(0);
        expect(body()).toContain('Too Many Requests');
    });

    test('a different client address has its own budget', () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const policy = { limit: 1, windowMs: 60_000 };
        const handler = limitedHandler('login', policy);
        expect(interceptor.preHandle(routeFrom('10.0.0.1'), handler) === true).toBe(true);
        expect(interceptor.preHandle(routeFrom('10.0.0.2'), handler) === true).toBe(true);
        expect((interceptor.preHandle(routeFrom('10.0.0.1'), handler) as { statusCode: number }).statusCode).toBe(429);
    });

    test('method policy overrides a class-wide policy', () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const handler = limitedHandler('login', { limit: 1, windowMs: 60_000 }, { limit: 10, windowMs: 60_000 });
        expect(interceptor.preHandle(routeFrom('10.0.0.1'), handler) === true).toBe(true);
        expect((interceptor.preHandle(routeFrom('10.0.0.1'), handler) as { statusCode: number }).statusCode).toBe(429);
    });

    test('requests without a client address share the fallback key', () => {
        const interceptor = new RateLimitInterceptor(new FixedWindowRateLimiter());
        const handler = limitedHandler('login', { limit: 1, windowMs: 60_000 });
        expect(interceptor.preHandle(routeFrom(undefined), handler) === true).toBe(true);
        expect((interceptor.preHandle(routeFrom(undefined), handler) as { statusCode: number }).statusCode).toBe(429);
    });
});
