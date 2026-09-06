import '@tsmetadata/polyfill';

import { describe, expect, test, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { HTTP } from '@blue/http';
import { service, getCall, postCall, putCall, deleteCall, patchCall, queryCall, serviceClient } from '../src';

const AccountSchema = z.object({
    id: z.number(),
    name: z.string(),
});

@service('accounts', { baseUrl: 'https://api.example.com' })
class AccountsAPI {
    @getCall('/accounts/:id')
    getById(id: number): Promise<unknown> {
        return undefined as unknown;
    }

    @postCall('/accounts')
    create(account: Account): Promise<unknown> {
        return undefined as unknown;
    }

    @getCall('/accounts/profile/:userId', { responseSchema: AccountSchema })
    getProfile(userId: number): Promise<{ id: number; name: string }> {
        return undefined as unknown;
    }

    @putCall('/accounts/:id')
    update(id: number, account: Account): Promise<unknown> {
        return undefined as unknown;
    }

    @deleteCall('/accounts/:id')
    remove(id: number): Promise<unknown> {
        return undefined as unknown;
    }

    @queryCall('/accounts/search')
    search(query: string): Promise<unknown> {
        return undefined as unknown;
    }

    @patchCall('/accounts/:id')
    patch(id: number, account: Account): Promise<unknown> {
        return undefined as unknown;
    }
}

type Account = { id: number; name: string };

let fetchMock: ReturnType<typeof vi.fn>;
let http: HTTP;

beforeEach(() => {
    fetchMock = vi.fn();
    http = new HTTP([], {}, fetchMock as unknown as typeof fetch);
});

describe('serviceClient', () => {
    /** The HTTP client passes a Request object to fetch; extract it. */
    function lastRequest(): Request {
        const req = fetchMock.mock.calls[0]?.[0];
        expect(req).toBeInstanceOf(Request);
        return req as Request;
    }

    test('resolves path params and sends GET', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.getById(42);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(lastRequest().url).toBe('https://api.example.com/accounts/42');
        expect(lastRequest().method).toBe('GET');
    });

    test('attaches the service name correlation header', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.getById(7);

        expect(lastRequest().headers.get('X-Blue-Service')).toBe('accounts');
    });

    test('sends a JSON body for POST', async () => {
        fetchMock.mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 201 }));
        const client = serviceClient(AccountsAPI, http);

        await client.create({ id: 1, name: 'Alice' });

        expect(lastRequest().method).toBe('POST');
        expect(await lastRequest().text()).toBe(JSON.stringify({ id: 1, name: 'Alice' }));
    });

    test('sets the HTTP method for PUT/DELETE/PATCH/QUERY', async () => {
        fetchMock.mockResolvedValue(new Response('ok', { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        await client.update(1, { id: 1, name: 'A' });
        await client.remove(2);
        await client.patch(3, { id: 3, name: 'C' });
        await client.search('alice');

        const methods = fetchMock.mock.calls.map(([req]) => (req as Request).method);
        expect(methods).toEqual(['PUT', 'DELETE', 'PATCH', 'QUERY']);
    });

    test('validates the JSON response with the declared Zod schema', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ id: 1, name: 'Alice' }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        const client = serviceClient(AccountsAPI, http);

        const profile = await client.getProfile(1);
        expect(profile).toEqual({ id: 1, name: 'Alice' });
    });

    test('throws when the response fails Zod validation', async () => {
        fetchMock.mockResolvedValue(
            new Response(JSON.stringify({ id: 'nope', name: 42 }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            })
        );
        const client = serviceClient(AccountsAPI, http);

        await expect(client.getProfile(1)).rejects.toThrow('response validation failed');
    });

    test('returns the raw Response when no responseSchema is declared', async () => {
        fetchMock.mockResolvedValue(new Response('raw-body', { status: 200 }));
        const client = serviceClient(AccountsAPI, http);

        const result = await client.getById(9);
        expect(result).toBeInstanceOf(Response);
        expect(await (result as Response).text()).toBe('raw-body');
    });

    test('throws for a target without @service metadata', () => {
        class NotAService {}

        expect(() => serviceClient(NotAService, http)).toThrow('not @service-decorated');
    });
});
