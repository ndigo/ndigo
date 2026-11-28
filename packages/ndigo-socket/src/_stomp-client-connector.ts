/**
 * CONNECT-on-open flow for the STOMP client.
 */
import type { Handshake } from './_stomp-client-internal.js';
import type { STOMPClientOptions } from './stomp-client-types.js';
import type { STOMPFrame } from './stomp-frame.js';

/** Live session accessors the open flow reads before and after the await. */
export interface STOMPConnectorHost {
    /** CONNECT headers. */
    readonly options: STOMPClientOptions;
    /** Whether the session already ended. */
    readonly done: boolean;
    /** The current session epoch. */
    readonly epoch: number;
    /** The socket URL (for the default host header). */
    readonly socketUrl: string;
    /** Whether the transport is still open. */
    isSocketOpen(): boolean;
    /** Starts a CONNECT handshake for the epoch. */
    beginHandshake(epoch: number): Handshake;
    /** Clears a settled handshake. */
    clearHandshake(handshake: Handshake): void;
    /** Serializes and sends a frame. */
    sendFrame(frame: STOMPFrame): void;
    /** Re-subscribes pending entries after CONNECTED. */
    resubscribe(): void;
    /** Flushes sends buffered while connecting. */
    flushPending(): void;
    /** Fails the session (timeout). */
    fail(message: string): void;
}

/**
 * A transport `open`: send CONNECT, await the handshake resolver, then
 * re-SUBSCRIBE active subscriptions and flush buffered sends.
 *
 * @param getHost - Reads live session state (the epoch/done may change
 *   while the handshake is awaited).
 */
export async function openStompSession(getHost: () => STOMPConnectorHost): Promise<void> {
    const host = getHost();
    if (host.done || !host.isSocketOpen()) {
        // The status flipped again before this queued pass ran (a fast
        // drop, or a deliberate close): never CONNECT a dead transport.
        return;
    }
    const handshake = host.beginHandshake(host.epoch);
    const connectHost = host.options.host ?? socketHost(host.socketUrl);
    host.sendFrame({
        command: 'CONNECT',
        headers: {
            'accept-version': host.options.acceptVersion ?? '1.2,1.1,1.0',
            host: connectHost,
            'heart-beat': host.options.heartBeat ?? '0,0',
            ...(host.options.login !== undefined ? { login: host.options.login } : {}),
            ...(host.options.passcode !== undefined ? { passcode: host.options.passcode } : {}),
        },
        body: '',
    });
    // Await the deferred: settled by the CONNECTED frame, by an
    // ERROR/fail, by a transport drop/close (the status watcher), or by the
    // handshake's single timeout timer — no signal polling.
    const outcome = await handshake.promise;
    host.clearHandshake(handshake);
    if (handshake.epoch !== host.epoch || host.done) {
        // A newer session epoch superseded this handshake (a drop followed
        // by a fast reconnect, or a failure) — stop without failing the
        // live session.
        return;
    }
    if (outcome === 'timeout') {
        // No CONNECTED before the deadline — surface and give up.
        host.fail('CONNECT timed out');
        return;
    }
    if (outcome !== 'connected') {
        return; // transport dropped/ERRORed before the handshake finished
    }
    // Re-SUBSCRIBE every pending subscription (same ids, same readers).
    host.resubscribe();
    // Flush sends that arrived while (re)connecting. Per-item fault
    // isolation: one failing send must never abort the rest of the queue.
    host.flushPending();
}

/**
 * Best-effort host derivation from the socket URL.
 *
 * @param url - The socket URL.
 * @returns The URL host, or `localhost` when unparseable.
 */
function socketHost(url: string): string {
    try {
        return new URL(url).host;
    } catch {
        return 'localhost';
    }
}
