/**
 * Server-Sent Events parsing for streaming service calls (AD-09).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { ServerSentEvent } from '@ndigo/core';

/** Pending fields of the event currently being assembled. */
interface PendingEvent {
    id?: string;
    event?: string;
    data: string[];
}

/** The default event type assigned when no `event:` field is present. */
const DEFAULT_EVENT = 'message';

/**
 * Attempts to parse an SSE data payload as JSON, falling back to the raw
 * string.
 *
 * @param raw - The joined `data:` field value(s).
 * @returns The parsed value, or the raw string.
 */
function parseData(raw: string): unknown {
    if (raw.length === 0) {
        return raw;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return raw;
    }
}

/**
 * Incremental parser for `text/event-stream` content.
 *
 * @example
 * ```ts
 * const parser = new ServerSentEventParser();
 * for (const chunk of chunks) {
 *     for (const event of parser.feed(chunk)) handle(event);
 * }
 * for (const event of parser.finish()) handle(event);
 * ```
 */
export class ServerSentEventParser {
    /** Chunk bytes not yet consumed as a complete line. */
    #buffer = '';
    /** The event currently being assembled, if any field line was seen. */
    #current: PendingEvent | null = null;
    /** No content consumed yet — a leading BOM is still strippable. */
    #atStart = true;

    /**
     * Consume a transport chunk and return the complete events it contains.
     *
     * Lines end with `CRLF`, `LF` or a lone `CR` (WHATWG event-stream
     * parsing), and one leading `U+FEFF` byte order mark is stripped from
     * the very start of the stream (REV-007).
     *
     * @param chunk - A decoded chunk of the event stream.
     * @returns The events completed by this chunk.
     */
    feed(chunk: string): ServerSentEvent[] {
        const events: ServerSentEvent[] = [];
        this.#buffer += chunk;

        if (this.#atStart && this.#buffer.length > 0) {
            if (this.#buffer.charCodeAt(0) === 0xfeff) {
                this.#buffer = this.#buffer.slice(1);
            }
            this.#atStart = false;
        }

        let lineEnd: number;
        while ((lineEnd = this.#buffer.search(/\r\n|\r|\n/)) !== -1) {
            const line = this.#buffer.slice(0, lineEnd);
            // A CR immediately followed by LF is one CRLF terminator;
            // otherwise the CR alone is the terminator (and a following LF
            // in the next chunk reads as the blank line, as it should).
            const width = this.#buffer[lineEnd] === '\r' && this.#buffer[lineEnd + 1] === '\n' ? 2 : 1;
            this.#buffer = this.#buffer.slice(lineEnd + width);
            this.#processLine(line, events);
        }
        return events;
    }

    /**
     * Flush the trailing partial line and any pending event. Use when the
     * transport ends (a bounded stream, or a final chunk without a newline).
     *
     * @returns The events completed by the stream's end.
     */
    finish(): ServerSentEvent[] {
        const events: ServerSentEvent[] = [];
        if (this.#buffer.length > 0) {
            this.#processLine(this.#buffer, events);
            this.#buffer = '';
        }
        this.#emit(events);
        return events;
    }

    /**
     * Process one complete line according to the event-stream rules.
     *
     * @param line - The line, without its terminator.
     * @param events - The events accumulated so far.
     */
    #processLine(line: string, events: ServerSentEvent[]): void {
        if (line.length === 0) {
            this.#emit(events);
            return;
        }
        if (line[0] === ':') {
            return; // comment / keep-alive line — ignore
        }

        const colon = line.indexOf(':');
        // A line without a colon is a field name with an empty value.
        const field = colon === -1 ? line : line.slice(0, colon);
        let value = colon === -1 ? '' : line.slice(colon + 1);
        if (value[0] === ' ') {
            value = value.slice(1);
        }

        // Only event-carrying fields may start a pending event: `retry:` (and
        // unknown fields, which are ignored per spec) must not, or the blank
        // line would dispatch a phantom `message` event.
        if (field !== 'data' && field !== 'event' && field !== 'id') {
            return;
        }
        if (this.#current === null) {
            this.#current = { data: [] };
        }
        switch (field) {
            case 'data':
                this.#current.data.push(value);
                break;
            case 'event':
                this.#current.event = value;
                break;
            case 'id':
                this.#current.id = value;
                break;
        }
    }

    /**
     * Dispatch the pending event (if any) and reset.
     *
     * @param events - The events accumulated so far.
     */
    #emit(events: ServerSentEvent[]): void {
        const pending = this.#current;
        this.#current = null;
        // An `id`-only block has no payload to dispatch; `event`-only blocks
        // still do (the parser's documented behavior).
        if (!pending || (pending.data.length === 0 && pending.event === undefined)) {
            return;
        }
        const { event = DEFAULT_EVENT, data, id } = pending;
        events.push({
            ...(id !== undefined ? { id } : {}),
            event,
            data: data.length > 0 ? parseData(data.join('\n')) : undefined,
        });
    }
}

/**
 * Parses an async chunk stream into Server-Sent Events.
 *
 * @param chunks - The decoded body chunks of the event stream.
 * @returns An async iterable of parsed events, as they complete.
 *
 * @example
 * ```ts
 * for await (const event of parseServerSentEvents(chunks)) {
 *     console.log(event.event, event.data);
 * }
 * ```
 */
export async function* parseServerSentEvents(chunks: AsyncIterable<string>): AsyncGenerator<ServerSentEvent> {
    const parser = new ServerSentEventParser();
    for await (const chunk of chunks) {
        for (const event of parser.feed(chunk)) {
            yield event;
        }
    }
    for (const event of parser.finish()) {
        yield event;
    }
}
