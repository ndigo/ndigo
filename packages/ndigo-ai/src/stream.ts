/**
 * Bridges agent stream events onto the existing SSE write path. The yielded
 * envelopes are exactly what `ServerSentEventView` consumes and what
 * `parseServerSentEvents` returns on the client.
 */
import type { AiStreamEvent } from './agent';

/**
 * One SSE frame produced from an {@link AiStreamEvent}.
 */
export interface AiServerSentEvent {
    /** The SSE `event:` name (`text-delta`, `tool-call`, `tool-result`, `finish`). */
    readonly event: string;
    /** The JSON-serializable event payload. */
    readonly data: AiStreamEvent;
}

/**
 * Maps agent events to `ServerSentEventView` frames.
 *
 * @param events - The agent stream events.
 * @returns An async iterable of SSE envelopes.
 *
 * @example
 * ```ts
 * return new ServerSentEventView(toServerSentEvents(agent.stream(request)));
 * ```
 */
export async function* toServerSentEvents(events: AsyncIterable<AiStreamEvent>): AsyncGenerator<AiServerSentEvent> {
    for await (const event of events) {
        yield { event: event.type, data: event };
    }
}
