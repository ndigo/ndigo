/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { type SessionRecord, type SessionStore, DefaultPrincipal } from '@blue/auth-core';
import type { ServerResponse } from 'node:http';
import type { Route } from '@blue/router';
import { NODE_REQUEST_ATTRIBUTE, NODE_RESPONSE_ATTRIBUTE, getNodeRequest, type NodeRequest } from '../src/node-request';
import {
    buildSessionCookie,
    buildSessionCookieClear,
    clearSessionCookie,
    setSessionCookie,
    SESSION_COOKIE,
} from '../src/session-cookie';
import { NodeSessionInterceptor } from '../src/node-session-interceptor';

/** Minimal route stand-in carrying attributes (like the real Route). */
function fakeRoute(res?: ServerResponse): Route {
    return { attributes: { [NODE_RESPONSE_ATTRIBUTE]: res } } as unknown as Route;
}

/** Test-only delay helper (Promise.withResolvers pattern). */
function delay(ms: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
}

/** Asserts the fixture route carries a node request and returns it. */
function requireNodeRequest(route: Route): NodeRequest {
    const request = getNodeRequest(route);
    if (request === undefined) {
        throw new Error('expected a node request on the fixture route');
    }
    return request;
}

describe('session cookie helpers', () => {
    test('default cookie value carries HttpOnly, SameSite=Lax, Path and Secure', () => {
        const value = buildSessionCookie('tok123');
        expect(value).toBe('blue-session=tok123; HttpOnly; SameSite=Lax; Path=/; Secure');
    });

    test('secure can be disabled (dev/localhost over plain HTTP)', () => {
        const value = buildSessionCookie('tok123', { secure: false });
        expect(value).toBe('blue-session=tok123; HttpOnly; SameSite=Lax; Path=/');
    });

    test('clear value expires the cookie immediately', () => {
        const value = buildSessionCookieClear();
        expect(value).toContain('blue-session=;');
        expect(value).toContain('Max-Age=0');
        expect(value).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    });

    test('setSessionCookie writes Set-Cookie on the node response', () => {
        let written: string | undefined;
        const res = {
            headersSent: false,
            setHeader: (name: string, value: string) => void (written = value),
        } as unknown as ServerResponse;
        setSessionCookie(fakeRoute(res), 'tok', { secure: false });
        expect(written).toBe('blue-session=tok; HttpOnly; SameSite=Lax; Path=/');
    });

    test('setSessionCookie is a no-op when headers were already sent', () => {
        let written = false;
        const res = { headersSent: true, setHeader: () => void (written = true) } as unknown as ServerResponse;
        setSessionCookie(fakeRoute(res), 'tok');
        clearSessionCookie(fakeRoute(res));
        expect(written).toBe(false);
    });
});

class StubSessionStore implements SessionStore {
    readonly kind = 'stub';
    readonly #sessions = new Map<string, SessionRecord>();
    readonly #expiresAt = new Map<string, number>();

    async create(record: SessionRecord, ttlMs: number): Promise<string> {
        const id = `sid-${this.#sessions.size}`;
        this.#sessions.set(id, record);
        this.#expiresAt.set(id, Date.now() + ttlMs);
        return id;
    }

    async get(sessionId: string): Promise<SessionRecord | null> {
        const expiresAt = this.#expiresAt.get(sessionId);
        if (expiresAt === undefined) return null;
        if (expiresAt <= Date.now()) {
            this.#sessions.delete(sessionId);
            this.#expiresAt.delete(sessionId);
            return null;
        }
        return this.#sessions.get(sessionId) ?? null;
    }

    async rotate(sessionId: string, record: SessionRecord): Promise<string> {
        this.#sessions.delete(sessionId);
        this.#expiresAt.delete(sessionId);
        return this.create(record, 60_000);
    }

    async delete(sessionId: string): Promise<void> {
        this.#sessions.delete(sessionId);
        this.#expiresAt.delete(sessionId);
    }
}

describe('NodeSessionInterceptor', () => {
    const principal = new DefaultPrincipal('u1', 'alice', ['user']);
    const record: SessionRecord = { principal, tokenVersion: 0, issuedAt: Date.now() };

    function routeWithCookie(cookie?: string): Route {
        return {
            attributes: {
                [NODE_REQUEST_ATTRIBUTE]: {
                    cookies: cookie === undefined ? {} : { [SESSION_COOKIE]: cookie },
                    session: {},
                } as NodeRequest,
            },
        } as unknown as Route;
    }

    test('fills the request session bag from the session store', async () => {
        const store = new StubSessionStore();
        const token = await store.create(record, 60_000);
        const interceptor = new NodeSessionInterceptor(store);
        const route = routeWithCookie(token);
        expect(await interceptor.preHandle(route, undefined)).toBe(true);
        const request = requireNodeRequest(route);
        expect(request.session['principal']).toBe(principal);
        expect(request.session['token']).toBe(token);
    });

    test('leaves the bag empty without a session cookie (anonymous)', async () => {
        const interceptor = new NodeSessionInterceptor(new StubSessionStore());
        const route = routeWithCookie(undefined);
        expect(await interceptor.preHandle(route)).toBe(true);
        expect(requireNodeRequest(route).session).toEqual({});
    });

    test('leaves the bag empty for an unknown or expired token', async () => {
        const store = new StubSessionStore();
        const token = await store.create(record, 1);
        await delay(5);
        const interceptor = new NodeSessionInterceptor(store);
        const route = routeWithCookie(token);
        expect(await interceptor.preHandle(route)).toBe(true);
        expect(requireNodeRequest(route).session).toEqual({});
    });

    test('preHandle stays open when no request context exists', async () => {
        const interceptor = new NodeSessionInterceptor(new StubSessionStore());
        expect(await interceptor.preHandle(fakeRoute())).toBe(true);
    });
});
