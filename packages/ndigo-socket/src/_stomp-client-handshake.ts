/**
 * CONNECT handshake tracking for the STOMP client.
 */
import type { Handshake, HandshakeOutcome } from './_stomp-client-internal.js';

/**
 * Owns the single in-flight CONNECT handshake: a deferred settled by the
 * CONNECTED frame, an abort path, or one timeout timer.
 */
export class STOMPHandshake {
    readonly #timeoutMs: () => number;
    #current: Handshake | null = null;

    /**
     * @param timeoutMs - Resolves the CONNECT deadline at begin time.
     */
    constructor(timeoutMs: () => number) {
        this.#timeoutMs = timeoutMs;
    }

    /**
     * Starts a handshake for the given session epoch, aborting any prior
     * one so a stale pass can never fail the live session.
     *
     * @param epoch - The session epoch this handshake belongs to.
     * @returns The handshake `#onOpen` awaits.
     */
    begin(epoch: number): Handshake {
        this.abort();
        const { promise, resolve } = Promise.withResolvers<HandshakeOutcome>();
        const handshake: Handshake = {
            epoch,
            promise,
            timer: null,
            settle: (outcome) => {
                if (handshake.timer !== null) {
                    clearTimeout(handshake.timer);
                    handshake.timer = null;
                }
                resolve(outcome);
            },
        };
        handshake.timer = setTimeout(() => {
            handshake.timer = null;
            handshake.settle('timeout');
        }, this.#timeoutMs());
        this.#current = handshake;
        return handshake;
    }

    /**
     * Aborts the handshake in flight (drop, ERROR, teardown, or a newer
     * CONNECT): its deferred settles `aborted` and its timer is cleared.
     */
    abort(): void {
        const handshake = this.#current;
        if (handshake !== null) {
            this.#current = null;
            handshake.settle('aborted');
        }
    }

    /** Settles the in-flight handshake as `connected` (CONNECTED frame). */
    settle(): void {
        this.#current?.settle('connected');
    }

    /**
     * Clears the current handshake when it is the one that just settled.
     *
     * @param handshake - The handshake the caller awaited.
     */
    clear(handshake: Handshake): void {
        if (this.#current === handshake) {
            this.#current = null;
        }
    }
}
