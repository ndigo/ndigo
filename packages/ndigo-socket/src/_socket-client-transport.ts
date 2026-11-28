/**
 * Default transport factory and reconnect policy for the WebSocket client.
 */
import type { ReconnectPolicy, SocketTransport } from './socket-client-types.js';

export const DEFAULT_RECONNECT: ReconnectPolicy = Object.freeze({ baseMs: 1_000, maxMs: 30_000, jitter: 0.2 });

/** Shared encoder for the outbound byte-size observer (module-level, reused). */
export const TEXT_ENCODER = new TextEncoder();

/**
 * Default transport: the WHATWG global. The cast is deliberate — the
 * global's full surface is wider than the documented `SocketTransport`
 * subset the client touches (browser and Node ≥24 both implement it).
 */
export function defaultTransportFactory(url: string): SocketTransport {
    // The source type is wider than this consumer's contract; the assertion is confined to this boundary.
    return new WebSocket(url) as unknown as SocketTransport;
}
