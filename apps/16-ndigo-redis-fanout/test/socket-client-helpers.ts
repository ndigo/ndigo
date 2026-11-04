/**
 * Socket test helpers shared by the demo's two socket lanes: drain a client's
 * message stream into an array, wait for the connection to open, and wait for a
 * matching message. Both lanes drive real servers through the `@ndigo/socket`
 * `WebSocketClient` (the Node WHATWG transport, same wire as a browser), so the
 * helpers speak that client's API and nothing else.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
import { delay } from '@ndigo/test';

/** A drained client: the collected messages plus the pump's completion. */
export interface CollectedMessages {
    /** Every message the client received, parsed as a JSON object. */
    readonly messages: Array<Record<string, unknown>>;
    /** Completes when the client's stream ends (deliberate close). */
    readonly done: Promise<void>;
}

/**
 * Drains a client's message stream into an array (each frame parsed as JSON).
 *
 * @param client - The client to consume (its `messages` iterable is consumed).
 * @returns The collected messages and the pump's completion promise.
 */
export function collectMessages(client: { messages: AsyncIterable<unknown> }): CollectedMessages {
    const messages: Array<Record<string, unknown>> = [];
    const done = (async () => {
        for await (const message of client.messages) {
            messages.push(JSON.parse(String(message)) as Record<string, unknown>);
        }
    })();
    return { messages, done };
}

/**
 * Polls until the client reports `open`.
 *
 * @param client - The client to poll.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 * @returns A promise resolving once the connection is open.
 */
export async function waitForOpen(client: { status: { value: string } }, timeoutMs: number): Promise<void> {
    const started = Date.now();
    while (client.status.value !== 'open') {
        if (Date.now() - started > timeoutMs) {
            throw new Error(`socket did not open within ${timeoutMs}ms (status ${client.status.value})`);
        }
        // oxlint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated connection status
        await delay(25);
    }
}

/**
 * Resolves with the first collected message matching `predicate`.
 *
 * @param collected - The drained client (see {@link collectMessages}).
 * @param predicate - Match predicate over the parsed message.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 * @returns The matching message.
 */
export async function waitForMessage(
    collected: CollectedMessages,
    predicate: (message: Record<string, unknown>) => boolean,
    timeoutMs: number
): Promise<Record<string, unknown>> {
    const started = Date.now();
    for (;;) {
        const match = collected.messages.find(predicate);
        if (match !== undefined) {
            return match;
        }
        if (Date.now() - started > timeoutMs) {
            throw new Error(
                `no matching message within ${timeoutMs}ms (received ${JSON.stringify(collected.messages)})`
            );
        }
        // oxlint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated frame list
        await delay(25);
    }
}
