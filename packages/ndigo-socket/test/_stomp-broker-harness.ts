/**
 * Shared session/store doubles and frame helpers for the STOMP broker specs.
 */
import {
    AsyncReader,
    StompBroker,
    parseStompFrame,
    serializeStompFrame,
    type QueueMessageStore,
    type SocketSession,
    type StoredQueueMessage,
} from '../src/index';

/**
 * Controlled `SocketSession` double: tests push inbound frames and inspect
 * outbound frames / close calls.
 */
export class FakeSession implements SocketSession {
    readonly path = '/stomp/chat';
    readonly params: Record<string, unknown> = {};
    readonly query: Record<string, string | string[]> = {};
    readonly headers: Record<string, string | string[] | undefined> = {};
    readonly cookies: Record<string, string> = {};
    readonly attributes: Record<string, unknown> = {};
    readonly #inbound = new AsyncReader<unknown>();
    readonly #outbound: Array<string | Uint8Array> = [];
    readonly #closedEvents = new AsyncReader<number>();
    closedCalls: Array<{ code: number; reason: string }> = [];
    joined: string[] = [];
    left: string[] = [];
    /** When true, `send` throws — simulates a transport mid-close. */
    failSends = false;

    get messages(): AsyncIterable<unknown> {
        return this.#inbound.iterable();
    }

    get closed(): AsyncIterable<number> {
        return this.#closedEvents.iterable();
    }

    get isClosed(): boolean {
        return this.closedCalls.length > 0;
    }

    /** Push a raw inbound frame (string or binary bytes). */
    pushFrame(raw: string | Uint8Array): void {
        this.#inbound.push(raw);
    }

    /** Push a frame with body/headers already split (serializes it). */
    push(command: string, headers: Record<string, string> = {}, body: string | Uint8Array = ''): void {
        this.pushFrame(
            typeof body === 'string'
                ? `${command}\n${Object.entries(headers)
                      .map(([k, v]) => `${k}:${v}`)
                      .join('\n')}\n\n${body}\0`
                : serializeStompFrame({ command, headers, body })
        );
    }

    /** Simulate the peer closing by completing the inbound stream. */
    closeFromPeer(): void {
        this.#inbound.complete();
    }

    send(data: unknown): void {
        if (this.failSends) {
            throw new Error('transport is CLOSING');
        }
        this.#outbound.push(typeof data === 'string' ? data : data instanceof Uint8Array ? data : String(data));
    }

    close(code: number = 1000, reason: string = ''): void {
        this.closedCalls.push({ code, reason });
        if (code !== 0) {
            this.#inbound.complete();
        }
    }

    join(room: string): void {
        this.joined.push(room);
    }

    leave(room: string): void {
        this.left.push(room);
    }

    /** Outbound frames as parsed objects (body text or bytes). */
    get sent(): Array<{ command: string; headers: Record<string, string>; body: string | Uint8Array }> {
        return this.#outbound.map((raw) => parseStompFrame(raw));
    }

    /** Wait for `handleSocket` to finish (stream complete or protocol close). */
    async handled(broker: StompBroker): Promise<void> {
        await broker.handleSocket(this);
    }
}

/** A store whose `append` always fails (backend down). */
export class FailingStore implements QueueMessageStore {
    readonly kind = 'failing';
    async append(): Promise<StoredQueueMessage> {
        throw new Error('disk full');
    }
    async replay(): Promise<StoredQueueMessage[]> {
        return [];
    }
    async prune(): Promise<number> {
        return 0;
    }
    async has(): Promise<boolean> {
        return false;
    }
}

/** A store whose `replay` always fails (backend down) but whose appends succeed. */
export class ReplayFaultStore implements QueueMessageStore {
    readonly kind = 'replay-fault';
    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        return { ...message, seq: 1, storedAt: 0 };
    }
    async replay(): Promise<StoredQueueMessage[]> {
        throw new Error('backend down');
    }
    async prune(): Promise<number> {
        return 0;
    }
    async has(): Promise<boolean> {
        return true;
    }
}

/** Boot a session through the CONNECT handshake on a broker. */
export function connect(broker: StompBroker, session: FakeSession, host = 'example.com'): void {
    session.push('CONNECT', { 'accept-version': '1.2,1.1,1.0', host, 'heart-beat': '0,0' });
}

/**
 * A store that retains appends and can hold its next `replay` open — the
 * COR-2 probe needs a replay that is demonstrably in flight while a live
 * publish happens.
 */
export class GatedStore implements QueueMessageStore {
    readonly kind = 'gated';
    readonly messages: StoredQueueMessage[] = [];
    replays = 0;
    #gate: Promise<void> | null = null;

    /** Hold the next `replay` until the returned release runs. */
    hold(): () => void {
        let release: () => void = () => undefined;
        this.#gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        return () => {
            this.#gate = null;
            release();
        };
    }

    async append(message: Omit<StoredQueueMessage, 'seq' | 'storedAt'>): Promise<StoredQueueMessage> {
        const stored: StoredQueueMessage = { ...message, seq: this.messages.length + 1, storedAt: 0 };
        this.messages.push(stored);
        return stored;
    }

    async replay(): Promise<StoredQueueMessage[]> {
        this.replays += 1;
        const gate = this.#gate;
        if (gate !== null) {
            await gate;
        }
        return Array.from(this.messages);
    }

    async prune(): Promise<number> {
        return 0;
    }

    async has(): Promise<boolean> {
        return this.messages.length > 0;
    }
}
