/**
 */
import { X_FORWARDED_FOR } from '@ndigo/http';
import { type Matchable } from '@ndigo/core';
import { type NodeRequest } from './node-request';

/**
 * Trusted-proxy client-IP resolution (AD-37).
 *
 * `X-Forwarded-For` is attacker input unless the request's DIRECT socket
 * peer is a proxy the operator has explicitly trusted. The industry-
 * standard resolution (MDN trusted-proxy-list method; Rails
 * `ActionDispatch::RemoteIp`; Fastify v5 `trustProxy`) walks the header
 * from the rightmost entry — the address added by the proxy closest to
 * the server — skipping every hop that matches the trusted set. The
 * first non-trusted, valid IP literal is the client. Reads the header
 * through the `@ndigo/http` headers module (`HTTPHeader`/`X_FORWARDED_FOR`),
 * which joins repeated header lines into one chain.
 */

/** The masked comparison byte-widths of parsed IP literals. */
type IPFamily = 4 | 6;

/** A validated IP literal: network-order bytes plus family. */
interface ParsedIP {
    readonly bytes: readonly number[];
    readonly family: IPFamily;
}

/**
 * Parses an IP literal into network-order bytes. Accepts dotted IPv4 and
 * full RFC 4291 IPv6 (compression, embedded IPv4 tail); IPv4-mapped IPv6
 * (`::ffff:a.b.c.d`) normalizes to IPv4 — Node reports dual-stack IPv4
 * peers in mapped form, and trusted entries are usually configured in the
 * simpler dotted form. Returns `null` for anything else (hostnames, ports,
 * whitespace-padded input, ambiguous leading-zero octets).
 */
function parseIPLiteral(value: string): ParsedIP | null {
    const ipv6 = parseIPv6(value);
    if (ipv6 !== null) {
        return ipv6;
    }
    return parseIPv4(value);
}

function parseIPv4(value: string): ParsedIP | null {
    const parts = value.split('.');
    if (parts.length !== 4) {
        return null;
    }
    const bytes: number[] = [];
    for (const part of parts) {
        // Reject leading zeros: `010.0.0.1` is ambiguous (octal legacy) and
        // must not silently mean `10.0.0.1`.
        if (part.length === 0 || part.length > 3 || (part.length > 1 && part.startsWith('0'))) {
            return null;
        }
        let octet = 0;
        const length = part.length;
        for (let index = 0; index < length; index++) {
            const digit = part.charCodeAt(index) - 48;
            if (digit < 0 || digit > 9) {
                return null;
            }
            octet = octet * 10 + digit;
        }
        if (octet > 255) {
            return null;
        }
        bytes.push(octet);
    }
    return { bytes, family: 4 };
}

function parseIPv6(value: string): ParsedIP | null {
    // Split on the compression marker; at most one `::` is valid.
    const marker = value.indexOf('::');
    if (marker !== -1 && value.indexOf('::', marker + 2) !== -1) {
        return null;
    }
    const head = marker === -1 ? value : value.slice(0, marker);
    const tail = marker === -1 ? '' : value.slice(marker + 2);
    const headGroups: number[] = [];
    const tailGroups: number[] = [];
    // Validates one side of the address, appending its 16-bit groups.
    // Rules (RFC 4291 §2.2/§2.5.5.1): an embedded dotted-quad is legal only
    // as the final group of the whole address (never after `::`, never in a
    // leading position); empty groups cannot occur within a side because the
    // single `::` marker was already consumed — `1:::2` or `a::b::`-style
    // spellings must fail loud rather than silently widen the zero run.
    const parseSide = (side: string, into: number[], quadAllowed: boolean): boolean => {
        if (side === '') {
            return true;
        }
        const parts = side.split(':');
        const length = parts.length;
        for (let index = 0; index < length; index++) {
            if (parts[index].length === 0) {
                return false;
            }
            const parsed = parseIPv6Group(parts[index], quadAllowed && index === parts.length - 1);
            if (parsed === null) {
                return false;
            }
            into.push(...parsed);
        }
        return true;
    };
    // A dotted-quad may terminate the address only when no `::` follows it.
    if (!parseSide(head, headGroups, marker === -1)) {
        return null;
    }
    if (!parseSide(tail, tailGroups, true)) {
        return null;
    }
    if (marker === -1) {
        if (!value.includes(':') || headGroups.length !== 8) {
            return null; // uncompressed forms must be complete
        }
    } else {
        const missing = 8 - headGroups.length - tailGroups.length;
        if (missing <= 0) {
            return null; // `::` must compress at least one zero group
        }
        // Lay out the full 8 groups, inserting the zeros at the marker.
        const expanded: (number | null)[] = new Array<number | null>(8).fill(null);
        const headGroupsLength = headGroups.length;
        for (let index = 0; index < headGroupsLength; index++) {
            expanded[index] = headGroups[index];
        }
        const tailGroupsLength = tailGroups.length;
        for (let index = 0; index < tailGroupsLength; index++) {
            expanded[headGroups.length + missing + index] = tailGroups[index];
        }
        headGroups.length = 0;
        for (const group of expanded) {
            if (group === null) {
                headGroups.push(0);
            } else {
                headGroups.push(group);
            }
        }
    }
    const bytes: number[] = [];
    for (const group of headGroups) {
        push16(bytes, group);
    }
    // IPv4-mapped IPv6 (`::ffff:a.b.c.d`, `0:0:0:0:0:ffff:a.b.c.d`)
    // normalizes to the IPv4 form — matches Node dual-stack peers.
    if (
        bytes[0] === 0 &&
        bytes[1] === 0 &&
        bytes[2] === 0 &&
        bytes[3] === 0 &&
        bytes[4] === 0 &&
        bytes[5] === 0 &&
        bytes[6] === 0 &&
        bytes[7] === 0 &&
        bytes[8] === 0 &&
        bytes[9] === 0 &&
        bytes[10] === 0xff &&
        bytes[11] === 0xff
    ) {
        return { bytes: bytes.slice(12), family: 4 };
    }
    return { bytes, family: 6 };
}

function parseIPv6Group(group: string, quadAllowed: boolean): number[] | null {
    // An embedded IPv4 tail (`…:192.168.0.1`) must be the last group.
    if (group.includes('.')) {
        if (!quadAllowed) {
            return null;
        }
        const ipv4 = parseIPv4(group);
        if (ipv4 === null || ipv4.family !== 4) {
            return null;
        }
        return [ipv4.bytes[0] * 256 + ipv4.bytes[1], ipv4.bytes[2] * 256 + ipv4.bytes[3]];
    }
    if (group.length === 0 || group.length > 4) {
        return null;
    }
    let value = 0;
    const length = group.length;
    for (let index = 0; index < length; index++) {
        const code = group.charCodeAt(index);
        let nibble: number;
        if (code >= 48 && code <= 57) {
            nibble = code - 48;
        } else if (code >= 97 && code <= 102) {
            nibble = code - 87;
        } else if (code >= 65 && code <= 70) {
            nibble = code - 55;
        } else {
            return null;
        }
        value = value * 16 + nibble;
    }
    return [value];
}

function push16(bytes: number[], value: number): void {
    bytes.push((value >> 8) & 0xff, value & 0xff);
}

/**
 * A validated trusted-proxy allowlist: IP literals and CIDR prefixes
 * (IPv4/IPv6), with a membership predicate. Implements `Matchable<string>`
 * from `@ndigo/core` — `matches` tests whether an address belongs to the
 * configured set (the value-matching half of the core matcher family; the
 * `PatternMatcher`/`PathMatcher`/`URLMatcher` side matches caller-supplied
 * patterns against values and does not fit a set that owns its entries).
 * Construction fails loud on malformed entries — a typo must not silently
 * narrow the trusted set.
 */
export class TrustedProxySet implements Matchable<string> {
    #entries: readonly (readonly number[])[];
    #prefixBits: readonly number[];
    #families: readonly IPFamily[];
    readonly #size: number;

    /**
     * @param entries - Proxy addresses/ranges, e.g. `['10.0.0.0/8', '::1']`.
     * @throws {RangeError} When an entry is not an IP literal or CIDR
     * (hostnames and ports are rejected — proxies must be identified by
     * address range), or the prefix is out of range.
     */
    constructor(entries: readonly string[] = []) {
        const parsed: (readonly number[])[] = [];
        const prefixes: number[] = [];
        const families: IPFamily[] = [];
        for (const entry of entries) {
            const slash = entry.indexOf('/');
            const address = slash === -1 ? entry : entry.slice(0, slash);
            const ip = parseIPLiteral(address);
            if (ip === null) {
                throw new RangeError(
                    `TrustedProxyMatcher entry is not an IP literal or CIDR: ${JSON.stringify(entry)}`
                );
            }
            const familyBits = ip.family === 4 ? 32 : 128;
            const prefix = slash === -1 ? familyBits : Number(entry.slice(slash + 1));
            if (!Number.isInteger(prefix) || prefix < 0 || prefix > familyBits) {
                throw new RangeError(
                    `TrustedProxyMatcher CIDR prefix out of range for ${entry} (family width ${familyBits})`
                );
            }
            parsed.push(ip.bytes);
            prefixes.push(prefix);
            families.push(ip.family);
        }
        this.#entries = parsed;
        this.#prefixBits = prefixes;
        this.#families = families;
        this.#size = entries.length;
    }

    /** The number of configured entries (`0` = trust nobody). */
    get size(): number {
        return this.#size;
    }

    /**
     * Whether the given address belongs to a trusted proxy. IPv4-mapped
     * IPv6 spellings compare equal to their dotted form. Non-address input
     * never matches.
     *
     * @param address - An IP literal (socket peer or header entry).
     */
    matches(address: string): boolean {
        const ip = parseIPLiteral(address);
        if (ip === null) {
            return false;
        }
        const entriesLength = this.#entries.length;
        for (let index = 0; index < entriesLength; index++) {
            if (this.#families[index] !== ip.family) {
                continue;
            }
            const network = this.#entries[index];
            const prefix = this.#prefixBits[index];
            const fullBytes = prefix >> 3;
            const partialBits = prefix % 8;
            let matched = true;
            for (let byte = 0; byte < fullBytes; byte++) {
                if (network[byte] !== ip.bytes[byte]) {
                    matched = false;
                    break;
                }
            }
            if (matched && partialBits > 0) {
                const mask = 0xff << (8 - partialBits);
                if ((network[fullBytes] & mask) !== (ip.bytes[fullBytes] & mask)) {
                    matched = false;
                }
            }
            if (matched) {
                return true;
            }
        }
        return false;
    }
}

/**
 * Resolves the client address of a request, honoring `X-Forwarded-For`
 * only from trusted proxies (AD-37).
 *
 * - No trusted proxies configured → the socket peer is returned and the
 *   header is never read (spoof-proof default).
 * - The direct peer is not trusted → the peer is returned; the header is
 *   attacker input and is ignored (MDN: if the server can be reached
 *   directly, no part of XFF is trustworthy).
 * - The peer is trusted → the header chain is walked rightmost-first,
 *   skipping hops that match the trusted set; the first non-trusted valid
 *   IP literal is the client. Malformed entries are skipped, never
 *   attributed. Empty, missing, or all-trusted chains fall back to the
 *   peer.
 *
 * @param peer - The direct socket address (`req.socket.remoteAddress`).
 * @param headers - The request headers in the node `IncomingMessage`
 * record shape (`NodeRequest['headers']`); repeated header lines arrive as
 * `string[]` values and are joined into one chain (MDN parsing
 * requirement) by `@ndigo/http`'s `X_FORWARDED_FOR`.
 * @param trustedProxies - The configured trusted-proxy allowlist
 * (`Matchable<string>` membership test).
 * @returns The resolved client address, or `undefined` when no peer exists.
 */
export function resolveClientAddress(
    peer: string | undefined,
    headers: NodeRequest['headers'],
    trustedProxies: TrustedProxySet
): string | undefined {
    if (peer === undefined || trustedProxies.size === 0) {
        return peer;
    }
    // The header is only read after the direct peer proves trusted.
    if (!trustedProxies.matches(peer)) {
        return peer;
    }
    const forwardedFor = headers ? X_FORWARDED_FOR.getJoined(headers, ',') : null;
    if (forwardedFor === null || forwardedFor === '') {
        return peer;
    }
    const entries = forwardedFor.split(',');
    // Walk from the RIGHT: the rightmost entry was appended by the proxy
    // closest to the server, so it is the first trustworthy position.
    for (let index = entries.length - 1; index >= 0; index--) {
        const entry = entries[index].trim();
        if (entry === '') {
            continue;
        }
        if (trustedProxies.matches(entry)) {
            continue; // a trusted hop — keep walking left toward the client
        }
        // Non-IP entries (garbage, ports, hostnames) can only have been
        // appended by a trusted proxy; skip, don't attribute.
        if (parseIPLiteral(entry) === null) {
            continue;
        }
        return entry;
    }
    // Every hop trusted (or the chain held nothing usable): the direct
    // proxy is the only address we can stand behind.
    return peer;
}
