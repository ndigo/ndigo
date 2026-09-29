/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import type { AddressInfo } from 'node:net';
import { MetadataConfigApplicationContext } from '@blue/context';
import { getMapping, requestMapping } from '@blue/dispatcher';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';
import { NodeDispatcher } from '../src/node-dispatcher';
import { NodeHTTPServerAdapter } from '../src/node-http-server-adapter';
import { rateLimit } from '../src/rate-limit-interceptor';
import { TrustedProxySet, resolveClientAddress } from '../src/trusted-proxy';

/**
 * Trusted-proxy resolution (AD-37, closes the gap-analysis Tier-2 row):
 * `X-Forwarded-For` is honored ONLY when the direct socket peer is a
 * configured trusted proxy; otherwise it is attacker input and must be
 * ignored. The walk follows the industry-standard rightmost-untrusted
 * algorithm (MDN trusted-proxy-list method; Rails ActionDispatch::RemoteIp).
 */

describe('TrustedProxySet', () => {
    test('empty config trusts nobody', () => {
        const matcher = new TrustedProxySet();
        expect(matcher.size).toBe(0);
        expect(matcher.matches('127.0.0.1')).toBe(false);
        expect(matcher.matches('::1')).toBe(false);
    });

    test('matches bare IPv4 and IPv6 literals', () => {
        const matcher = new TrustedProxySet(['10.0.0.5', '::1', '2001:db8::1']);
        expect(matcher.matches('10.0.0.5')).toBe(true);
        expect(matcher.matches('::1')).toBe(true);
        expect(matcher.matches('2001:db8::1')).toBe(true);
        expect(matcher.matches('10.0.0.6')).toBe(false);
        expect(matcher.matches('2001:db8::2')).toBe(false);
        expect(matcher.matches('::2')).toBe(false);
    });

    test('matches CIDR prefixes with exact boundary semantics', () => {
        const matcher = new TrustedProxySet(['10.0.0.0/8', '192.168.1.1/32', 'fd00::/8']);
        expect(matcher.matches('10.255.255.255')).toBe(true);
        expect(matcher.matches('11.0.0.1')).toBe(false);
        expect(matcher.matches('192.168.1.1')).toBe(true);
        expect(matcher.matches('192.168.1.2')).toBe(false);
        expect(matcher.matches('fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff')).toBe(true);
        expect(matcher.matches('fe00::1')).toBe(false);
    });

    test('matches non-octet-aligned CIDR prefixes with exact bit semantics', () => {
        // Regression (2026-09-28 review COR-1): the mask loop used float
        // division (`prefix / 8`), so /25 ≡ /32, /9 ≡ /16, /1 ≡ /8 and the
        // partial-bit check read a fractional index. Every prefix not a
        // multiple of 8 silently narrowed the trusted set.
        const v4 = new TrustedProxySet(['10.0.0.0/25', '172.16.0.0/9', '192.168.1.0/31']);
        expect(v4.matches('10.0.0.127')).toBe(true); // last /25 octet, top bit 0
        expect(v4.matches('10.0.0.128')).toBe(false); // first bit of the /25 tail
        expect(v4.matches('10.0.1.0')).toBe(false); // beyond byte[2]
        expect(v4.matches('172.127.255.255')).toBe(true); // /9: second octet ≤ 0x7f
        expect(v4.matches('172.128.0.1')).toBe(false); // /9: second octet ≥ 0x80
        expect(v4.matches('192.168.1.0')).toBe(true); // /31 pair
        expect(v4.matches('192.168.1.1')).toBe(true);
        expect(v4.matches('192.168.1.2')).toBe(false);
        const v4Whole = new TrustedProxySet(['0.0.0.0/1']);
        expect(v4Whole.matches('63.255.255.255')).toBe(true); // /1: leading bit 0
        expect(v4Whole.matches('128.0.0.1')).toBe(false); // /1: leading bit 1
        const v33 = new TrustedProxySet(['fd00::/33']);
        expect(v33.matches('fd00:0:0:7fff:ffff:ffff:ffff:ffff')).toBe(true); // /33: group 2 ≤ 0x7fff
        expect(v33.matches('fd00:0:8000::')).toBe(false); // /33: group 2 ≥ 0x8000
        const v97 = new TrustedProxySet(['fd00::/97']);
        expect(v97.matches('fd00:0:0:0:0:0:7fff:ffff')).toBe(true); // /97: group 6 ≤ 0x7fff
        expect(v97.matches('fd00:0:0:0:0:0:8000::')).toBe(false); // /97: group 6 ≥ 0x8000
    });

    test('uppercase-hex IPv6 entries and probes match (case-folded groups)', () => {
        const matcher = new TrustedProxySet(['2001:db8::1', 'fd00::CAFE']);
        expect(matcher.matches('2001:DB8::1')).toBe(true);
        expect(matcher.matches('2001:db8::1')).toBe(true);
        expect(matcher.matches('fd00::cafe')).toBe(true);
        expect(matcher.matches('fd00::CAFE')).toBe(true);
    });

    test('IPv4-mapped IPv6 forms match IPv4 entries and vice versa', () => {
        const matcher = new TrustedProxySet(['127.0.0.1', '::ffff:10.0.0.7/32']);
        expect(matcher.matches('::ffff:127.0.0.1')).toBe(true);
        expect(matcher.matches('127.0.0.1')).toBe(true);
        expect(matcher.matches('::ffff:10.0.0.7')).toBe(true);
        expect(matcher.matches('10.0.0.7')).toBe(true);
        expect(matcher.matches('::ffff:10.0.0.8')).toBe(false);
    });

    test('IPv4 and IPv6 families never cross-match', () => {
        const matcher = new TrustedProxySet(['0.0.0.0/0', '::/0']);
        expect(matcher.matches('::1')).toBe(true);
        expect(matcher.matches('1.2.3.4')).toBe(true);
    });

    test('malformed entries fail loud at construction', () => {
        const invalid = [
            'banana',
            '10.0.0.1/33',
            '::1/129',
            '1.2.3.4/…',
            '300.1.1.1',
            '1.2.3',
            '10.0.0.1/24/1',
            '1.2.3.4:8080',
            '',
            ' 192.168.1.1 ',
            // RFC 4291 grammar (regression COR-2): dots only in the final
            // group, no empty groups outside the single `::` marker.
            '192.168.0.1::',
            '192.168.0.1:2:3:4:5:6:7',
            '1:::2',
            '1:2::3:',
            ':1:2:3:4:5:6:7',
            '1:2:3:4:5:6:7:',
        ];
        for (const entry of invalid) {
            expect(() => new TrustedProxySet([entry])).toThrow(RangeError);
        }
        // A valid entry next to a malformed one still fails — no silent subset.
        expect(() => new TrustedProxySet(['10.0.0.0/8', 'nope'])).toThrow(RangeError);
    });

    test('leading-zero IPv4 octets are rejected (ambiguous notation)', () => {
        expect(() => new TrustedProxySet(['010.0.0.1'])).toThrow(RangeError);
    });
});

describe('resolveClientAddress', () => {
    const peer = '10.0.0.5';
    const trusted = new TrustedProxySet(['10.0.0.0/8']);

    /** Node-style lower-cased header record (the IncomingMessage shape). */
    const headers = (xff?: string | string[]) => ({
        'x-forwarded-for': xff,
    });

    test('no trusted proxies configured → header never consulted', () => {
        const none = new TrustedProxySet();
        // An attacker-supplied header over a direct connection must be ignored.
        expect(resolveClientAddress(peer, headers('6.6.6.6'), none)).toBe(peer);
        expect(resolveClientAddress(peer, headers(), none)).toBe(peer);
    });

    test('direct peer not trusted → header is attacker input and ignored', () => {
        expect(resolveClientAddress('203.0.113.7', headers('6.6.6.6, 7.7.7.7'), trusted)).toBe('203.0.113.7');
    });

    test('missing peer yields undefined', () => {
        expect(resolveClientAddress(undefined, headers('6.6.6.6'), trusted)).toBeUndefined();
    });

    test('mid-chain empty entries are skipped, not attributed', () => {
        // Regression coverage (review COV-1): a hole between hops
        // (`203.0.113.7,,10.0.0.3`) must not stop or poison the walk.
        expect(resolveClientAddress(peer, headers('203.0.113.7,,10.0.0.3'), trusted)).toBe('203.0.113.7');
        expect(resolveClientAddress(peer, headers('203.0.113.7, ,10.0.0.3'), trusted)).toBe('203.0.113.7');
        expect(resolveClientAddress(peer, headers('bad,,,203.0.113.7,10.0.0.3'), trusted)).toBe('203.0.113.7');
    });

    test('trusted peer with no XFF header → peer', () => {
        expect(resolveClientAddress(peer, headers(), trusted)).toBe(peer);
        expect(resolveClientAddress(peer, {}, trusted)).toBe(peer);
    });

    test('trusted peer with empty header → peer', () => {
        expect(resolveClientAddress(peer, headers(''), trusted)).toBe(peer);
        expect(resolveClientAddress(peer, headers('   ,  '), trusted)).toBe(peer);
    });

    test('single proxy appends the client → rightmost untrusted entry wins', () => {
        expect(resolveClientAddress(peer, headers('203.0.113.7'), trusted)).toBe('203.0.113.7');
    });

    test('client-spoofed leftmost values never win over the proxy-appended tail', () => {
        // Attacker sends `X-Forwarded-For: 6.6.6.6, 7.7.7.7`; the trusted
        // proxy appends the real client. The walk starts at the rightmost
        // (proxy-added) entry.
        expect(resolveClientAddress(peer, headers('6.6.6.6, 7.7.7.7, 203.0.113.7'), trusted)).toBe('203.0.113.7');
    });

    test('chain of trusted proxies is skipped to reach the client', () => {
        expect(resolveClientAddress(peer, headers('203.0.113.7, 10.0.0.4, 10.0.0.3'), trusted)).toBe('203.0.113.7');
        expect(resolveClientAddress(peer, headers('203.0.113.7 , 10.0.0.4 , 10.0.0.3 '), trusted)).toBe('203.0.113.7');
    });

    test('all hops trusted → peer (nothing indicates a real client)', () => {
        expect(resolveClientAddress(peer, headers('10.0.0.4, 10.0.0.3'), trusted)).toBe(peer);
    });

    test('invalid entries are skipped, never attributed', () => {
        expect(resolveClientAddress(peer, headers('6.6.6.6, garbage, 203.0.113.7'), trusted)).toBe('203.0.113.7');
        expect(resolveClientAddress(peer, headers('6.6.6.6, 203.0.113.7:8080, 10.0.0.3'), trusted)).toBe('6.6.6.6');
    });

    test('IPv6 clients and proxies resolve', () => {
        const ipv6 = new TrustedProxySet(['fd00::/8']);
        expect(resolveClientAddress('fd00::1', headers('2001:db8::7, fd00::2'), ipv6)).toBe('2001:db8::7');
        // IPv4-mapped IPv6 peer normalizes against an IPv4 trust entry.
        expect(
            resolveClientAddress('::ffff:127.0.0.1', headers('203.0.113.7'), new TrustedProxySet(['127.0.0.1']))
        ).toBe('203.0.113.7');
    });

    test('repeated XFF header lines are joined, not truncated (MDN parsing)', () => {
        // Node surfaces repeated header lines as a string[] record value.
        expect(resolveClientAddress(peer, headers(['6.6.6.6', '203.0.113.7']), trusted)).toBe('203.0.113.7');
        expect(resolveClientAddress(peer, headers(['6.6.6.6', '10.0.0.3', '203.0.113.7']), trusted)).toBe(
            '203.0.113.7'
        );
        // NOTE: fetch-client tuple collections (`[name, value][]`) are NOT an
        // input shape here — the server adapter only ever hands over the
        // node `IncomingMessage` record. The `@blue/http` HTTPHeader
        // methods read the first tuple pair, so multi-line tuples would
        // truncate the chain; the resolver's contract is the record.
    });

    test('canonical-name lookups hit lower-cased node records', () => {
        expect(resolveClientAddress(peer, { 'X-Forwarded-For': '203.0.113.7' }, trusted)).toBe('203.0.113.7');
    });
});

/**
 * End-to-end over a real `node:http` server: the adapter resolves
 * `NodeRequest.remoteAddress` through the trusted-proxy allowlist, and
 * the rate limiter keys on the resolved address (SEC-6 Wave 3 keying).
 */
@requestMapping('/')
class LimitedController {
    @getMapping('/limited')
    @rateLimit({ limit: 3, windowMs: 60_000 })
    limited() {
        return { ok: true };
    }
}

async function bootServer(trustedProxies: string[] | undefined): Promise<{ base: string; close: () => Promise<void> }> {
    const context = new MetadataConfigApplicationContext('trusted-proxy');
    context.register(NodeAutoConfiguration);
    context.setValue(LimitedController.name, new LimitedController());
    context.refresh();
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    const adapter = new NodeHTTPServerAdapter(dispatcher, { trustedProxies });
    await adapter.listen(0, '127.0.0.1');
    const port = (adapter.server as { address(): AddressInfo }).address().port;
    return { base: `http://127.0.0.1:${port}`, close: () => adapter.close() };
}

describe('trusted-proxy resolution over a real server', () => {
    describe('no trusted proxies configured (default posture)', () => {
        let base: string;
        let close: () => Promise<void>;

        beforeAll(async () => {
            const server = await bootServer(undefined);
            base = server.base;
            close = server.close;
        });

        afterAll(async () => {
            await close();
        });

        test('X-Forwarded-For from a direct peer is spoofed input — ignored for rate limiting', async () => {
            // Four different header values, all keyed on the real peer
            // (127.0.0.1): the fourth request 429s, proving the header
            // never influenced the key.
            const values = ['203.0.113.7', '203.0.113.8', '6.6.6.6', '203.0.113.9'];
            const statuses: number[] = [];
            for (const value of values) {
                // Requests MUST be sequential: each one must land before the
                // next so the 429 proves the fourth keyed on the same peer.
                // eslint-disable-next-line no-await-in-loop
                const res = await fetch(`${base}/limited`, {
                    headers: { 'x-forwarded-for': value },
                });
                statuses.push(res.status);
            }
            expect(statuses).toEqual([200, 200, 200, 429]);
        });
    });

    describe('trusted proxy allowlist configured', () => {
        let base: string;
        let close: () => Promise<void>;

        beforeAll(async () => {
            // The test client IS the trusted proxy: requests to loopback
            // with the allowlist naming 127.0.0.1.
            const server = await bootServer(['127.0.0.1']);
            base = server.base;
            close = server.close;
        });

        afterAll(async () => {
            await close();
        });

        test('rate-limit buckets key on the resolved client, not the proxy peer', async () => {
            const request = async (xff: string) =>
                (await fetch(`${base}/limited`, { headers: { 'x-forwarded-for': xff } })).status;

            // Client A exhausts its own bucket (limit 3)…
            expect([await request('203.0.113.7'), await request('203.0.113.7'), await request('203.0.113.7')]).toEqual([
                200, 200, 200,
            ]);
            expect(await request('203.0.113.7')).toBe(429);
            // …while client B still has a fresh bucket — separate keys.
            expect(await request('203.0.113.8')).toBe(200);
            expect(await request('203.0.113.8')).toBe(200);
            expect(await request('203.0.113.8')).toBe(200);
            expect(await request('203.0.113.8')).toBe(429);
        });

        test('an IPv4-mapped IPv6 loopback peer matches the dotted allowlist entry', async () => {
            // Node reports the dual-stack socket peer in mapped form; the
            // allowlist entry is the dotted literal. Bound on the same
            // host, the peer normalizes and the header resolves.
            const res = await fetch(`${base}/limited`, {
                headers: { 'x-forwarded-for': '203.0.113.77' },
            });
            expect(res.status).toBe(200);
        });
    });

    describe('malformed allowlist fails loud', () => {
        test('adapter construction rejects a hostname entry', async () => {
            const context = new MetadataConfigApplicationContext('trusted-proxy-invalid');
            context.register(NodeAutoConfiguration);
            context.setValue(LimitedController.name, new LimitedController());
            context.refresh();
            const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
            expect(() => new NodeHTTPServerAdapter(dispatcher, { trustedProxies: ['proxy.example'] })).toThrow(
                RangeError
            );
        });
    });
});
