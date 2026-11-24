/**
 * Protocol bounds for the STOMP broker: identifier caps, header budget,
 * deliverable framing, and the per-session replay budget.
 */
import type { StompFrame } from './stomp-frame';
import { StompProtocolError } from './stomp-frame';
import type { SocketSession } from './socket-session';
import type { SessionState } from './_stomp-broker-types';
import { headerOctets } from './message-store';

/** Headers whose value is a protocol identifier — capped by `maxIdentifierLength`. */
const IDENTIFIER_HEADERS: readonly string[] = [
    'destination',
    'id',
    'subscription',
    'transaction',
    'receipt',
    // `accept-version` is split on commas into the offered-version list, so
    // an unbounded header is an unbounded allocation (REV-009).
    'accept-version',
];

/**
 * Construction seams for {@link StompLimits}.
 */
export interface StompLimitOptions {
    /** Maximum identifier header length; `0` disables the cap. */
    readonly maxIdentifierLength: number;
    /** Maximum serialized header octets; `0` disables the cap. */
    readonly maxHeaderBytes: number;
    /** Per-session replay budget; `0` disables the cap. */
    readonly maxReplayBytesPerSession: number;
    /** Fail-closed protocol reply owned by the broker. */
    readonly fail: (session: SocketSession, frame: StompFrame, message: string, code?: number) => boolean;
    /** Per-session delivery accounting, created on first use. */
    readonly stateFor: (session: SocketSession) => SessionState;
}

/**
 * Enforces the broker's per-frame and per-session protocol bounds.
 *
 * @example
 * ```ts
 * const limits = new StompLimits({ maxIdentifierLength: 1024, maxHeaderBytes: 16384, maxReplayBytesPerSession: 0, fail, stateFor });
 * limits.assertIdentifiers(session, frame);
 * ```
 */
export class StompLimits {
    readonly #maxIdentifierLength: number;
    readonly #maxHeaderBytes: number;
    readonly #maxReplayBytesPerSession: number;
    readonly #fail: StompLimitOptions['fail'];
    readonly #stateFor: StompLimitOptions['stateFor'];

    /**
     * @param options - The configured bounds and the broker's reply seams.
     */
    constructor(options: StompLimitOptions) {
        this.#maxIdentifierLength = options.maxIdentifierLength;
        this.#maxHeaderBytes = options.maxHeaderBytes;
        this.#maxReplayBytesPerSession = options.maxReplayBytesPerSession;
        this.#fail = options.fail;
        this.#stateFor = options.stateFor;
    }

    /**
     * Enforce `maxIdentifierLength` (SEC-2) on every identifier-valued header.
     *
     * @param session - The sending session.
     * @param frame - The frame to check.
     * @returns `true` when within bounds, `false` after the fail-closed reply.
     */
    assertIdentifiers(session: SocketSession, frame: StompFrame): boolean {
        const max = this.#maxIdentifierLength;
        if (max <= 0) {
            return true;
        }
        for (const name of IDENTIFIER_HEADERS) {
            const value = frame.headers[name];
            if (value !== undefined && value.length > max) {
                return this.#fail(session, frame, `${name} header exceeds ${max} characters`);
            }
        }
        return true;
    }

    /**
     * Enforce `maxHeaderBytes` (REV-002) on a frame's serialized header block.
     *
     * @param session - The sending session.
     * @param frame - The frame to check.
     * @returns `true` when within bounds, `false` after the fail-closed reply.
     */
    assertHeaderBudget(session: SocketSession, frame: StompFrame): boolean {
        const max = this.#maxHeaderBytes;
        if (max <= 0 || headerOctets(frame.headers) <= max) {
            return true;
        }
        return this.#fail(session, frame, `frame headers exceed ${max} octets`);
    }

    /**
     * Reject a programmatic destination or headers that cannot be framed.
     *
     * @param destination - The destination the MESSAGE would carry.
     * @param headers - The pass-through headers.
     * @throws on a value that cannot be framed.
     */
    assertDeliverable(destination: string, headers: Record<string, string>): void {
        if (destination.includes('\0')) {
            throw new StompProtocolError('destination contains a NUL character');
        }
        const max = this.#maxHeaderBytes;
        if (max > 0 && headerOctets(headers) > max) {
            throw new StompProtocolError(`headers exceed ${max} octets`);
        }
        for (const [name, value] of Object.entries(headers)) {
            if (name === '' || /[\n\r:\0]/.test(name)) {
                throw new StompProtocolError(`invalid header name: "${name}"`);
            }
            if (value.includes('\0')) {
                throw new StompProtocolError(`header value contains NUL: "${name}"`);
            }
        }
    }

    /**
     * Charge one session's replay budget (SEC-6).
     *
     * @param session - The session consuming the budget.
     * @param octets - The body octets to charge.
     * @returns `false` when the budget is exhausted (the caller fails closed).
     */
    chargeReplay(session: SocketSession, octets: number): boolean {
        const budget = this.#maxReplayBytesPerSession;
        if (budget <= 0) {
            return true;
        }
        const state = this.#stateFor(session);
        if (state.replayBytes + octets > budget) {
            return false;
        }
        state.replayBytes += octets;
        return true;
    }
}
