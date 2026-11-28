/**
 * Environment-derived HTTP server configuration (TLS material and CSV lists).
 */
import type { TLSServerOptions } from './http-server-types.js';

/**
 * Reads optional TLS material from the environment:
 * `NDIGO_TLS_KEY` + `NDIGO_TLS_CERT` (both required together) and optional
 * `NDIGO_TLS_CA`. Absent both required keys → `undefined` (plaintext
 * origin, the edge-terminated topology). Blank/whitespace-only
 * values count as unset — an empty `NDIGO_TLS_KEY=` export is a
 * shell default, not a broken credential. One key without the other →
 * `RangeError`: a half-configured TLS listener must fail loud rather
 * than silently serve plaintext.
 */
export function readTLSOptionsFromEnv(env: NodeJS.ProcessEnv): TLSServerOptions | undefined {
    const key = env['NDIGO_TLS_KEY']?.trim() ?? '';
    const cert = env['NDIGO_TLS_CERT']?.trim() ?? '';
    if (key === '' && cert === '') {
        return undefined;
    }
    if (key === '' || cert === '') {
        throw new RangeError(
            'HTTPServer: NDIGO_TLS_KEY and NDIGO_TLS_CERT must be set together — a half-configured TLS listener would silently serve plaintext'
        );
    }
    const tls: TLSServerOptions = { key, cert };
    const ca = env['NDIGO_TLS_CA']?.trim() ?? '';
    if (ca !== '') {
        tls.ca = ca;
    }
    return tls;
}

/**
 * Parses a comma-separated env list (e.g. `NDIGO_SOCKET_ALLOWED_ORIGINS`,
 * `NDIGO_TRUSTED_PROXIES`) into trimmed entries. Empty/whitespace input →
 * `undefined` (unconstrained / trust-nobody posture); empty entries are
 * dropped. Malformed entries surface as a `RangeError` when the consumer
 * validates them at construction.
 */
export function parseCSVEnv(raw: string | undefined): string[] | undefined {
    if (raw === undefined || raw.trim() === '') {
        return undefined;
    }
    const entries = raw
        .split(',')
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);
    return entries.length > 0 ? entries : undefined;
}
