/**
 * `chat-room` — the browser half of Ndigo Chat.
 *
 * A Web Component (shadow DOM) whose state is `@ndigo/signals` signals; a single
 * `effect` re-renders on any state change. The transport is the isomorphic
 * `WebSocketClient` from `@ndigo/socket`: it reconnects with bounded exponential
 * backoff, and because the room is bound to the socket's path
 * (`/ws/rooms/{room}`), a reconnect automatically re-enters the room and the
 * server replays history — which the view deduplicates by message id.
 *
 * Inbound frames are parsed and validated with Zod at the boundary, so the
 * render path only ever reads checked values.
 * @module ndigo-chat
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { effect, signal } from '@ndigo/signals';
import { WebSocketClient, type SocketStatus } from '@ndigo/socket';
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { z } from 'zod';

/** One chat message as the server emits it. */
const ChatMessageSchema = z.object({
    id: z.string(),
    from: z.string(),
    text: z.string(),
    at: z.number(),
});
type ChatMessage = z.infer<typeof ChatMessageSchema>;

/** The shared wire envelope (see the server's `src/protocol.ts`). */
const EnvelopeSchema = z.object({
    event: z.string(),
    data: z.unknown(),
    at: z.number(),
    from: z.string(),
});

/** Per-event `data` payloads. */
const HistorySchema = z.object({ messages: z.array(ChatMessageSchema) });
const PresenceSchema = z.object({ users: z.array(z.string()) });
const ErrorSchema = z.object({ reason: z.string() });

/** Status-line copy per connection state. */
const STATUS_TEXT: Record<SocketStatus, string> = {
    connecting: 'connecting…',
    open: 'connected',
    reconnecting: 'connection lost — reconnecting…',
    closed: 'disconnected',
};

/** Reconnect backoff: first delay, ceiling, and jitter. */
const RECONNECT = { baseMs: 500, maxMs: 10_000, jitter: 0.2 } as const;

/** How long after the last keystroke the "typing" flag clears. */
const TYPING_IDLE_MS = 1_200;

/**
 * The chat room element. Registered by the `@TagMapping` decorator on import;
 * the shell mounts an inert `<chat-room data-rooms=… >` that the browser
 * upgrades.
 */
@TagMapping('chat-room')
export class ChatRoom extends AbstractWebComponent {
    readonly #status = signal<SocketStatus>('closed');
    readonly #messages = signal<ChatMessage[]>([]);
    readonly #users = signal<string[]>([]);
    readonly #typingUsers = signal<string[]>([]);
    readonly #room = signal<string>('lobby');
    readonly #notice = signal<string | null>(null);

    #client: WebSocketClient | null = null;
    #stopEffect: (() => void) | undefined;
    #typingTimer: ReturnType<typeof setTimeout> | undefined;

    #messageList: HTMLOListElement | undefined;
    #roster: HTMLUListElement | undefined;
    #statusLine: HTMLParagraphElement | undefined;
    #typingLine: HTMLParagraphElement | undefined;
    #noticeLine: HTMLParagraphElement | undefined;
    #nameInput: HTMLInputElement | undefined;
    #composerInput: HTMLInputElement | undefined;

    /** Wires the reactive render path and opens the initial connection. */
    protected handleConnect(): void {
        this.#room.value = this.dataset.defaultRoom ?? 'lobby';
        this.#stopEffect = effect(() => {
            // Read every signal so the effect re-runs on any change.
            void this.#status.value;
            void this.#messages.value;
            void this.#users.value;
            void this.#typingUsers.value;
            void this.#notice.value;
            this.render();
        });
        this.#connect();
    }

    /** Releases connect-time resources (the effect, the socket, any timer). */
    protected handleDisconnect(): void {
        this.#stopEffect?.();
        this.#stopEffect = undefined;
        clearTimeout(this.#typingTimer);
        this.#client?.close(1000, 'component detached');
        this.#client = null;
    }

    /** The display name from the name field (or the shell default). */
    #currentName(): string {
        return this.#nameInput?.value.trim() || this.dataset.user || 'guest';
    }

    /** (Re)connects to the currently selected room. */
    #connect(): void {
        this.#client?.close(1000, 'switching');
        this.#messages.value = [];
        this.#users.value = [];
        this.#typingUsers.value = [];
        this.#notice.value = null;

        const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${scheme}://${location.host}/ws/rooms/${encodeURIComponent(this.#room.value)}?user=${encodeURIComponent(this.#currentName())}`;
        const client = new WebSocketClient(url, {
            reconnect: { ...RECONNECT },
            bufferWhileDisconnected: { maxMessages: 100 },
            maxInboundMessages: 500,
            onStatusChange: (status) => {
                this.#status.value = status;
            },
        });
        this.#client = client;
        void this.#consume(client);
    }

    /** Drains the client's message stream, ignoring frames from a stale socket. */
    async #consume(client: WebSocketClient): Promise<void> {
        try {
            for await (const raw of client.messages) {
                if (this.#client !== client) {
                    return;
                }
                // The server emits text frames only; binary frames are not part
                // of this protocol and are dropped.
                if (typeof raw === 'string') {
                    this.#apply(raw);
                }
            }
        } catch {
            // The stream errored; `WebSocketClient` owns reconnection and the
            // status signal already reflects the drop.
        }
    }

    /** Applies one inbound frame to the reactive state. */
    #apply(text: string): void {
        let value: unknown;
        try {
            value = JSON.parse(text);
        } catch {
            return;
        }
        const parsed = EnvelopeSchema.safeParse(value);
        if (!parsed.success) {
            return;
        }
        const frame = parsed.data;
        switch (frame.event) {
            case 'history': {
                const history = HistorySchema.safeParse(frame.data);
                if (!history.success) {
                    return;
                }
                // Server-authoritative snapshot: replacing (not appending) is
                // what keeps a reconnect from duplicating replayed history.
                this.#messages.value = history.data.messages;
                this.#typingUsers.value = [];
                return;
            }
            case 'message': {
                const message = ChatMessageSchema.safeParse(frame.data);
                if (!message.success || this.#messages.value.some((m) => m.id === message.data.id)) {
                    return;
                }
                this.#messages.value = [...this.#messages.value, message.data];
                this.#typingUsers.value = this.#typingUsers.value.filter((user) => user !== message.data.from);
                return;
            }
            case 'presence': {
                const presence = PresenceSchema.safeParse(frame.data);
                if (presence.success) {
                    this.#users.value = presence.data.users;
                }
                return;
            }
            case 'typing': {
                if (frame.from === this.#currentName()) {
                    return;
                }
                const next = new Set(this.#typingUsers.value);
                if (frame.data === true) {
                    next.add(frame.from);
                } else {
                    next.delete(frame.from);
                }
                this.#typingUsers.value = [...next];
                return;
            }
            case 'error': {
                const error = ErrorSchema.safeParse(frame.data);
                this.#notice.value = error.success ? error.data.reason : 'error';
            }
        }
    }

    /** Sends a chat message and clears the composer. */
    #submitMessage(): void {
        const text = this.#composerInput?.value.trim() ?? '';
        if (text === '') {
            return;
        }
        this.#client?.send({ event: 'message', data: text });
        if (this.#composerInput) {
            this.#composerInput.value = '';
        }
        clearTimeout(this.#typingTimer);
        this.#client?.send({ event: 'typing', data: false });
    }

    /** Publishes the "typing" flag, clearing it after an idle pause. */
    #signalTyping(): void {
        this.#client?.send({ event: 'typing', data: true });
        clearTimeout(this.#typingTimer);
        this.#typingTimer = setTimeout(() => {
            this.#client?.send({ event: 'typing', data: false });
        }, TYPING_IDLE_MS);
    }

    /** Renders the component into its (once-built) shadow shell. */
    render(): void {
        const root = this.ensureShadowRoot();
        if (this.#messageList?.getRootNode() !== root) {
            this.#buildShell(root);
        }
        const messageList = this.#messageList;
        const roster = this.#roster;
        if (!messageList || !roster) {
            return;
        }

        messageList.replaceChildren(
            ...this.#messages.value.map((message) => {
                const item = document.createElement('li');
                const author = document.createElement('strong');
                author.textContent = `${message.from}: `;
                item.append(author, document.createTextNode(message.text));
                return item;
            })
        );
        roster.replaceChildren(
            ...this.#users.value.map((user) => {
                const item = document.createElement('li');
                item.textContent = user;
                return item;
            })
        );
        if (this.#statusLine) {
            this.#statusLine.textContent = `[${STATUS_TEXT[this.#status.value]}] room: ${this.#room.value}`;
        }
        if (this.#typingLine) {
            this.#typingLine.textContent =
                this.#typingUsers.value.length === 0 ? '' : `${this.#typingUsers.value.join(', ')} typing…`;
        }
        if (this.#noticeLine) {
            this.#noticeLine.textContent = this.#notice.value ?? '';
        }
        // Keep the newest message in view.
        messageList.scrollTop = messageList.scrollHeight;
    }

    /** Builds the model-independent DOM shell once, wiring its controls. */
    #buildShell(root: ShadowRoot): void {
        const style = document.createElement('style');
        style.textContent = [
            'header { display: flex; gap: .5rem; align-items: center; flex-wrap: wrap; }',
            'header select, header input { font: inherit; padding: .25rem .4rem; }',
            '.status { color: #555; font-size: .85rem; }',
            '.notice { color: #b00020; font-size: .85rem; min-height: 1.2em; }',
            '.typing { color: #555; font-size: .85rem; min-height: 1.2em; }',
            'ol.messages { list-style: none; margin: .75rem 0; padding: .5rem; height: 18rem; overflow-y: auto; border: 1px solid #eee; border-radius: 6px; }',
            'ol.messages li { padding: .15rem 0; }',
            'ul.roster { list-style: none; margin: 0; padding: 0; display: flex; gap: .5rem; flex-wrap: wrap; font-size: .85rem; }',
            'ul.roster li { background: #eef4ff; border-radius: 999px; padding: .1rem .55rem; }',
            'form.composer { display: flex; gap: .5rem; margin-top: .5rem; }',
            'form.composer input { flex: 1; font: inherit; padding: .4rem; }',
        ].join('\n');

        const header = document.createElement('header');
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.setAttribute('aria-label', 'Your name');
        nameInput.value = this.dataset.user ?? 'guest';
        nameInput.maxLength = 32;

        const roomSelect = document.createElement('select');
        roomSelect.setAttribute('aria-label', 'Room');
        for (const room of this.#rooms()) {
            const option = document.createElement('option');
            option.value = room;
            option.textContent = room;
            roomSelect.append(option);
        }
        roomSelect.value = this.#room.value;

        const joinButton = document.createElement('button');
        joinButton.type = 'button';
        joinButton.textContent = 'Join';
        const joinRoom = () => {
            this.#room.value = roomSelect.value;
            this.#connect();
        };
        joinButton.addEventListener('click', joinRoom);
        roomSelect.addEventListener('change', joinRoom);
        nameInput.addEventListener('change', () => this.#connect());
        header.append(nameInput, roomSelect, joinButton);

        const statusLine = document.createElement('p');
        statusLine.className = 'status';
        const roster = document.createElement('ul');
        roster.className = 'roster';
        const messageList = document.createElement('ol');
        messageList.className = 'messages';
        const typingLine = document.createElement('p');
        typingLine.className = 'typing';
        const noticeLine = document.createElement('p');
        noticeLine.className = 'notice';
        noticeLine.setAttribute('role', 'status');

        const form = document.createElement('form');
        form.className = 'composer';
        const composerInput = document.createElement('input');
        composerInput.type = 'text';
        composerInput.placeholder = 'Message…';
        composerInput.setAttribute('aria-label', 'Message');
        composerInput.maxLength = 2000;
        composerInput.addEventListener('input', () => this.#signalTyping());
        const sendButton = document.createElement('button');
        sendButton.type = 'submit';
        sendButton.textContent = 'Send';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.#submitMessage();
        });
        form.append(composerInput, sendButton);

        root.replaceChildren(style, header, statusLine, roster, messageList, typingLine, noticeLine, form);
        this.#nameInput = nameInput;
        this.#composerInput = composerInput;
        this.#messageList = messageList;
        this.#roster = roster;
        this.#statusLine = statusLine;
        this.#typingLine = typingLine;
        this.#noticeLine = noticeLine;
    }

    /** The room options from the shell's `data-rooms` attribute. */
    #rooms(): string[] {
        try {
            const parsed: unknown = JSON.parse(this.dataset.rooms ?? '[]');
            if (Array.isArray(parsed) && parsed.every((room) => typeof room === 'string')) {
                return parsed;
            }
        } catch {
            // Fall through to the default.
        }
        return ['lobby'];
    }
}
