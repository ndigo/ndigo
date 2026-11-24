/**
 * STOMP endpoint protocol: the per-connection frame loop, handshake, and
 * command dispatch. The broker owns fan-out, delivery, and the public API.
 */
import { parseStompFrame, StompProtocolError, type StompFrame } from './stomp-frame';
import type { SocketSession } from './socket-session';
import { StompAckHandler, type StompAckHost } from './_stomp-ack';
import { StompCommands, type StompCommandHost } from './_stomp-commands';
import { controlSend, fail } from './_stomp-replies';

/** Version negotiation set — we speak 1.2 semantics, accept 1.0–1.2. */
const SUPPORTED_VERSIONS: readonly string[] = ['1.2', '1.1', '1.0'];

/** Per-connection protocol state. */
interface StompConnectionState {
    connected: boolean;
    version: string | null;
    sessionId: string | null;
}

/**
 * The broker-owned seams the endpoint needs.
 */
export interface StompEndpointHost extends StompCommandHost, StompAckHost {
    readonly verifyCredentials: ((login: string, passcode: string, session: SocketSession) => unknown) | null;
    readonly nextMessageId: () => string;
    readonly sessions: Set<SocketSession>;
    isReady(): boolean;
}

/**
 * Runs the STOMP endpoint protocol over one socket session.
 *
 * @example
 * ```ts
 * await endpoint.handleSocket(session);
 * ```
 */
export class StompEndpoint {
    readonly #host: StompEndpointHost;
    readonly #commands: StompCommands;
    readonly #acks: StompAckHandler;

    /**
     * @param host - The broker's fan-out, delivery, and reply seams.
     */
    constructor(host: StompEndpointHost) {
        this.#host = host;
        this.#commands = new StompCommands(host);
        this.#acks = new StompAckHandler(host);
    }

    /**
     * Run the STOMP endpoint protocol for one connection.
     *
     * Consumes `session.messages` until the connection closes: parses each
     * frame, answers CONNECT with CONNECTED, maintains the session's
     * subscriptions, fans out SEND frames, validates ACK/NACK, emits
     * receipts, and fails closed on protocol violations. Session
     * subscriptions are dropped when the stream ends.
     *
     * @param session - The socket session (any transport).
     * @returns A promise that resolves when the session stream ends.
     */
    async handleSocket(session: SocketSession): Promise<void> {
        if (!this.#host.isReady()) {
            throw new Error('StompBroker is not ready; await connect()');
        }
        const state: StompConnectionState = {
            connected: false,
            version: null,
            sessionId: null,
        };
        try {
            this.#host.sessions.add(session);
            for await (const message of session.messages) {
                if (!(await this.#process(session, state, message))) {
                    return;
                }
            }
        } finally {
            this.#host.registry.dropSession(session);
            this.#host.transactions.closeSession(session);
            this.#host.sessions.delete(session);
        }
    }

    /**
     * Process one inbound message for a session.
     *
     * @param session - The owning session.
     * @param state - Per-connection protocol state.
     * @param message - The raw inbound message (text or binary frame).
     * @returns `false` when the connection should end (protocol error or
     *   DISCONNECT); `true` to keep reading.
     */
    #process(session: SocketSession, state: StompConnectionState, message: unknown): Promise<boolean> {
        if (typeof message !== 'string' && !(message instanceof Uint8Array) && !(message instanceof ArrayBuffer)) {
            return Promise.resolve(fail(session, null, 'STOMP frames must be text or binary'));
        }
        let frame: StompFrame;
        try {
            frame = parseStompFrame(message as string);
        } catch (error) {
            return Promise.resolve(
                fail(session, null, error instanceof StompProtocolError ? error.message : 'malformed frame')
            );
        }
        // Heart-beat pings (bare newlines) — nothing to do.
        if (frame.command === '') {
            return Promise.resolve(true);
        }
        // SEC-2: every identifier-valued header is bounded on every
        // non-ping frame (including CONNECT — `login`/`passcode` are
        // credentials, capped by their own verifier).
        if (!this.#host.limits.assertIdentifiers(session, frame)) {
            return Promise.resolve(false);
        }
        // REV-002: the serialized header block is capped too, so headers
        // cannot dwarf the body budgets the broker charges.
        if (!this.#host.limits.assertHeaderBudget(session, frame)) {
            return Promise.resolve(false);
        }
        if (!state.connected) {
            if (frame.command === 'CONNECT' || frame.command === 'STOMP') {
                return this.#connect(session, state, frame);
            }
            return Promise.resolve(fail(session, frame, 'CONNECT must be the first frame'));
        }
        switch (frame.command) {
            case 'SUBSCRIBE':
                return this.#commands.subscribe(session, frame);
            case 'UNSUBSCRIBE':
                return Promise.resolve(this.#commands.unsubscribe(session, frame));
            case 'SEND':
                return this.#commands.send(session, frame);
            case 'ACK':
            case 'NACK':
                return Promise.resolve(this.#acks.ack(session, frame));
            case 'DISCONNECT':
                return Promise.resolve(this.#disconnect(session, frame));
            case 'BEGIN':
                return Promise.resolve(this.#host.transactions.begin(session, frame));
            case 'COMMIT':
                return this.#host.transactions.commit(session, frame);
            case 'ABORT':
                return Promise.resolve(this.#host.transactions.abort(session, frame));
            default:
                return Promise.resolve(fail(session, frame, `unknown command: ${frame.command}`));
        }
    }

    /**
     * The CONNECT handshake: version negotiation, optional credential
     * verification, CONNECTED reply.
     *
     * @param session - The connecting session.
     * @param state - Per-connection protocol state (mutated on success).
     * @param frame - The CONNECT/STOMP frame.
     * @returns Always `true` (a failed handshake closes the session).
     */
    async #connect(session: SocketSession, state: StompConnectionState, frame: StompFrame): Promise<boolean> {
        // STOMP 1.2 §1.1: "If the accept-version header is missing, it
        // means that the client only supports version 1.0 of the protocol."
        const acceptVersion = frame.headers['accept-version'];
        const offered = (acceptVersion ?? '1.0').split(',').map((v) => v.trim());
        const mutual = SUPPORTED_VERSIONS.find((version) => offered.includes(version)) ?? null;
        if (mutual === null) {
            return fail(session, frame, `no supported version in accept-version: ${offered.join(', ')}`);
        }
        // SEC-7: credentials are verified or refused — never ignored.
        const login = frame.headers['login'];
        const passcode = frame.headers['passcode'];
        if (login !== undefined || passcode !== undefined) {
            const verify = this.#host.verifyCredentials;
            if (verify === null) {
                return fail(session, frame, 'CONNECT credentials rejected: no credential verifier is configured', 1008);
            }
            const verified = await verify(login ?? '', passcode ?? '', session);
            if (!verified) {
                return fail(session, frame, 'invalid credentials', 1008);
            }
        }
        // STOMP 1.1+ requires `host` (the virtual host). A 1.0-only client
        // has none — accept it (we still negotiate the frame we got).
        if (mutual !== '1.0' && frame.headers['host'] === undefined) {
            return fail(session, frame, 'CONNECT requires a host header (STOMP 1.1+)');
        }
        state.connected = true;
        state.version = mutual;
        const sessionId = this.#host.nextMessageId();
        state.sessionId = sessionId;
        controlSend(session, {
            command: 'CONNECTED',
            headers: {
                version: mutual,
                session: sessionId,
                server: 'Ndigo',
                // Liveness is the WS layer's job; negotiate
                // STOMP heartbeats off.
                'heart-beat': '0,0',
            },
            body: '',
        });
        return true;
    }

    /**
     * DISCONNECT: reply RECEIPT when asked, then close the connection.
     *
     * @param session - The session.
     * @param frame - The DISCONNECT frame.
     * @returns Always `false` — the connection ends.
     */
    #disconnect(session: SocketSession, frame: StompFrame): boolean {
        if (frame.headers['receipt'] !== undefined) {
            controlSend(session, {
                command: 'RECEIPT',
                headers: { 'receipt-id': frame.headers['receipt'] as string },
                body: '',
            });
        }
        if (!session.isClosed) {
            session.close(1000, 'disconnect');
        }
        return false;
    }
}
