/**
 * `kanban-board` — the browser half of Ndigo Kanban.
 *
 * A Web Component (shadow DOM) whose state is `@ndigo/signals` signals: one
 * `effect` re-renders on any change. It talks to the server over two channels,
 * and each owns one half of the story:
 *
 * - **REST** is the write path, and every write is *optimistic* — the local
 *   board is patched immediately, the request carries the version the client
 *   read, and a rejection (the `409` conflict above all) rolls the board back
 *   to the snapshot taken before the write and adopts the server's `current`
 *   card from the problem document.
 * - **The WebSocket** (`WS /ws/board/:boardId`, via `@ndigo/socket`'s
 *   reconnecting `WebSocketClient`) is the read path: the server sends the
 *   authoritative snapshot first on every connect — so a reconnect reconciles
 *   instead of replaying — and then one event per accepted write. An inbound
 *   update for the card the user is editing right now is *deferred*, never
 *   applied under the cursor, and lands when the edit ends.
 *
 * Inbound frames are parsed and validated with Zod at the boundary, so the
 * render path only ever reads checked values.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { effect, signal } from '@ndigo/signals';
import { WebSocketClient, type SocketStatus } from '@ndigo/socket';
import { AbstractWebComponent, TagMapping } from '@ndigo/view-webcomponent';
import { z } from 'zod';

/** A card as the server emits it. */
const CardSchema = z.object({
    id: z.string(),
    boardId: z.string(),
    columnId: z.string(),
    title: z.string(),
    position: z.number().int(),
    version: z.number().int(),
    updatedAt: z.string(),
});

/** A column with its ordered cards. */
const ColumnSchema = z.object({
    id: z.string(),
    boardId: z.string(),
    title: z.string(),
    position: z.number().int(),
    cards: z.array(CardSchema),
});

/** The whole board (the `snapshot` frame and `GET /api/boards/:id`). */
const BoardSchema = z.object({
    id: z.string(),
    title: z.string(),
    columns: z.array(ColumnSchema),
});

/** The shared wire envelope. */
const EnvelopeSchema = z.object({
    event: z.string(),
    data: z.unknown(),
    at: z.number(),
});

/** Per-event `data` payloads. */
const CardPayloadSchema = z.object({ card: CardSchema });
const MovedPayloadSchema = z.object({ card: CardSchema, fromColumnId: z.string() });
const DeletedPayloadSchema = z.object({ cardId: z.string(), columnId: z.string() });
const ErrorPayloadSchema = z.object({ reason: z.string() });

/** An RFC 9457 problem document, as far as the client reads it. */
const ProblemSchema = z.object({
    status: z.number(),
    detail: z.string().optional(),
    current: CardSchema.optional(),
});

type Card = z.infer<typeof CardSchema>;
type Column = z.infer<typeof ColumnSchema>;
type Board = z.infer<typeof BoardSchema>;
type Problem = z.infer<typeof ProblemSchema>;

/** The REST mount point (mirrors `BoardController`'s `@requestMapping`). */
const API = '/api';

/** Status-line copy per connection state. */
const STATUS_TEXT: Record<SocketStatus, string> = {
    connecting: 'connecting…',
    open: 'live',
    reconnecting: 'connection lost — reconnecting…',
    closed: 'offline',
};

/** Reconnect backoff: first delay, ceiling, and jitter. */
const RECONNECT = { baseMs: 500, maxMs: 10_000, jitter: 0.2 } as const;

/** How long a conflict/error notice stays on screen. */
const NOTICE_MS = 5_000;

/** The outcome of one REST call. */
type Response =
    | { readonly ok: true; readonly body: unknown }
    | { readonly ok: false; readonly status: number; readonly problem: Problem };

/**
 * The kanban board element. Registered by the `@TagMapping` decorator on
 * import; the shell mounts an inert `<kanban-board data-board="…">` that the
 * browser upgrades.
 */
@TagMapping('kanban-board')
export class KanbanBoard extends AbstractWebComponent {
    readonly #board = signal<Board | null>(null);
    readonly #status = signal<SocketStatus>('closed');
    readonly #notice = signal<string>('');
    /** Card ids with a request in flight (rendered as "saving…"). */
    readonly #pending = signal<readonly string[]>([]);
    /** The card currently open in the inline editor, if any. */
    readonly #editing = signal<string | null>(null);
    /** The column whose "add card" composer is open, if any. */
    readonly #adding = signal<string | null>(null);
    /**
     * The open editor's text and the open composer's text.
     *
     * Deliberately **plain fields, not signals**: `render()` reads them when it
     * builds those inputs, and `render()` runs *inside* the render effect — so
     * a signal here would be tracked as a dependency of that effect, and every
     * keystroke would re-render the whole board, replacing the very input the
     * user is typing into (whose `blur` would then look like "I'm done" and
     * commit a half-typed title). Plain fields keep the live input as the
     * source of truth while it is on screen; the value is still preserved
     * across an unrelated re-render.
     */
    #draft = '';
    #addDraft = '';

    #boardId = 'demo';
    #client: WebSocketClient | null = null;
    #stopEffect: (() => void) | undefined;
    #noticeTimer: ReturnType<typeof setTimeout> | undefined;
    #dragging: string | null = null;
    #tempSeq = 0;
    /**
     * Inbound updates for the card under the cursor: held back rather than
     * applied, and flushed when the edit ends (or discarded when the commit
     * wins — the server's reply is authoritative either way).
     */
    readonly #deferred = new Map<string, Card>();

    #statusLine: HTMLParagraphElement | undefined;
    #noticeLine: HTMLParagraphElement | undefined;
    #columnsHost: HTMLDivElement | undefined;

    /** Wires the reactive render path, fetches the board, opens the socket. */
    protected handleConnect(): void {
        this.#boardId = this.dataset.board ?? 'demo';
        this.#stopEffect = effect(() => {
            // Read every signal the render depends on, so the effect re-runs on
            // any change. The edit/add drafts are plain fields (never signals):
            // `render()` reads them, and a read inside this effect would make
            // them dependencies — re-rendering the board on every keystroke and
            // replacing the focused input under the user.
            void this.#board.value;
            void this.#status.value;
            void this.#notice.value;
            void this.#pending.value;
            void this.#editing.value;
            void this.#adding.value;
            this.render();
        });
        void this.#load();
        this.#connect();
    }

    /** Releases connect-time resources (the effect, the socket, any timer). */
    protected handleDisconnect(): void {
        this.#stopEffect?.();
        this.#stopEffect = undefined;
        clearTimeout(this.#noticeTimer);
        this.#client?.close(1000, 'component detached');
        this.#client = null;
    }

    /** Opens the board socket; `@ndigo/socket` owns reconnect + backoff. */
    #connect(): void {
        const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
        const client = new WebSocketClient(
            `${scheme}://${location.host}/ws/board/${encodeURIComponent(this.#boardId)}`,
            {
                reconnect: { ...RECONNECT },
                bufferWhileDisconnected: { maxMessages: 50 },
                maxInboundMessages: 500,
                onStatusChange: (status) => {
                    this.#status.value = status;
                },
            }
        );
        this.#client = client;
        void this.#consume(client);
    }

    /** Drains the socket's message stream, ignoring frames from a stale socket. */
    async #consume(client: WebSocketClient): Promise<void> {
        try {
            for await (const raw of client.messages) {
                if (this.#client !== client) {
                    return;
                }
                // The server emits text frames only; binary frames are not part
                // of this protocol and are dropped.
                if (typeof raw === 'string') {
                    this.#applyFrame(raw);
                }
            }
        } catch {
            // The stream errored; `WebSocketClient` owns reconnection and the
            // status signal already reflects the drop.
        }
    }

    /** Applies one inbound frame to the reactive state. */
    #applyFrame(text: string): void {
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
        const { event, data } = parsed.data;
        switch (event) {
            case 'snapshot': {
                const snapshot = BoardSchema.safeParse(data);
                if (snapshot.success) {
                    this.#board.value = this.#preserveEdited(snapshot.data);
                    this.#deferred.clear();
                }
                return;
            }
            case 'card-created':
            case 'card-updated': {
                const payload = CardPayloadSchema.safeParse(data);
                if (payload.success) {
                    this.#applyRemote(payload.data.card, payload.data.card.position);
                }
                return;
            }
            case 'card-moved': {
                const payload = MovedPayloadSchema.safeParse(data);
                if (payload.success) {
                    this.#applyRemote(payload.data.card, payload.data.card.position);
                }
                return;
            }
            case 'card-deleted': {
                const payload = DeletedPayloadSchema.safeParse(data);
                if (payload.success) {
                    this.#deferred.delete(payload.data.cardId);
                    this.#removeLocal(payload.data.cardId);
                }
                return;
            }
            case 'error': {
                const payload = ErrorPayloadSchema.safeParse(data);
                this.#showNotice(payload.success ? payload.data.reason : 'protocol error');
            }
        }
    }

    /**
     * Applies a remote card change — unless that card is under the cursor, in
     * which case the change is deferred so typing is never clobbered.
     *
     * @param card - The server's card.
     * @param position - Its index within its column.
     */
    #applyRemote(card: Card, position: number): void {
        if (this.#editing.value === card.id) {
            this.#deferred.set(card.id, card);
            return;
        }
        this.#placeCard(card, position);
    }

    /**
     * Re-applies the locally-edited card's text on top of a fresh snapshot, so
     * a reconnect (or a `resync`) cannot discard an edit in progress.
     *
     * @param snapshot - The authoritative board.
     * @returns The board to show — the snapshot, with the edited card's title
     *   restored when the user is mid-edit.
     */
    #preserveEdited(snapshot: Board): Board {
        const editingId = this.#editing.value;
        if (editingId === null) {
            return snapshot;
        }
        const title = this.#draft;
        return {
            ...snapshot,
            columns: snapshot.columns.map((column) => ({
                ...column,
                cards: column.cards.map((card) => (card.id === editingId ? { ...card, title } : card)),
            })),
        };
    }

    // ---- local state transitions (optimistic, and the rollback targets) ----

    /**
     * Puts a card at `position` inside its own column, removing it from
     * wherever it was. Renumbers the affected columns densely, mirroring the
     * server's ordering invariant.
     *
     * @param card - The card's target state (its `columnId` decides where).
     * @param position - Target index within that column.
     */
    #placeCard(card: Card, position: number): void {
        const board = this.#board.value;
        if (board === null) {
            return;
        }
        this.#board.value = {
            ...board,
            columns: board.columns.map((column) => {
                const others = column.cards.filter((existing) => existing.id !== card.id);
                if (column.id !== card.columnId) {
                    return { ...column, cards: renumber(others) };
                }
                const index = Math.max(0, Math.min(position, others.length));
                others.splice(index, 0, card);
                return { ...column, cards: renumber(others) };
            }),
        };
    }

    /**
     * Removes a card from the board.
     *
     * @param cardId - The card to drop.
     */
    #removeLocal(cardId: string): void {
        const board = this.#board.value;
        if (board === null) {
            return;
        }
        this.#board.value = {
            ...board,
            columns: board.columns.map((column) => ({
                ...column,
                cards: renumber(column.cards.filter((card) => card.id !== cardId)),
            })),
        };
    }

    /**
     * Marks (or unmarks) a card as having a request in flight.
     *
     * @param cardId - The card.
     * @param inFlight - Whether its write is still unresolved.
     */
    #setPending(cardId: string, inFlight: boolean): void {
        const current = this.#pending.value;
        this.#pending.value = inFlight
            ? current.includes(cardId)
                ? current
                : [...current, cardId]
            : current.filter((id) => id !== cardId);
    }

    /** Shows a notice (a conflict, a failed write) and auto-clears it. */
    #showNotice(message: string): void {
        this.#notice.value = message;
        clearTimeout(this.#noticeTimer);
        this.#noticeTimer = setTimeout(() => {
            this.#notice.value = '';
        }, NOTICE_MS);
    }

    /**
     * Rolls a rejected optimistic write back: restore what was on screen, then
     * adopt the server's card when the problem carried one (the `409` does).
     *
     * @param snapshot - The board as it was before the optimistic patch.
     * @param response - The failed response.
     */
    #rollback(snapshot: Board | null, response: Extract<Response, { ok: false }>): void {
        if (snapshot !== null) {
            this.#board.value = snapshot;
        }
        const current = response.problem.current;
        if (current !== undefined) {
            this.#placeCard(current, current.position);
        }
        this.#showNotice(response.problem.detail ?? `write failed (${response.status})`);
        if (response.status === 404) {
            void this.#load();
        }
    }

    // ---- REST ----

    /**
     * Issues one JSON request against the board API.
     *
     * @param path - Path below `/api`.
     * @param init - Method and body.
     * @returns The parsed body, or the problem document the server answered.
     */
    async #request(path: string, init: RequestInit): Promise<Response> {
        try {
            const response = await fetch(`${API}${path}`, {
                headers: { 'Content-Type': 'application/json' },
                ...init,
            });
            if (response.status === 204) {
                return { ok: true, body: undefined };
            }
            const body: unknown = await response.json().catch(() => undefined);
            if (!response.ok) {
                const problem = ProblemSchema.safeParse(body);
                return {
                    ok: false,
                    status: response.status,
                    problem: problem.success ? problem.data : { status: response.status },
                };
            }
            return { ok: true, body };
        } catch (error) {
            return {
                ok: false,
                status: 0,
                problem: { status: 0, detail: `network error: ${error instanceof Error ? error.message : ''}` },
            };
        }
    }

    /** Fetches the board over REST (initial paint, and after a `404`). */
    async #load(): Promise<void> {
        const response = await this.#request(`/boards/${encodeURIComponent(this.#boardId)}`, { method: 'GET' });
        if (response.ok) {
            const parsed = z.object({ board: BoardSchema }).safeParse(response.body);
            if (parsed.success) {
                this.#board.value = this.#preserveEdited(parsed.data.board);
            }
            return;
        }
        this.#showNotice(response.problem.detail ?? `board '${this.#boardId}' could not be loaded`);
    }

    // ---- writes (optimistic) ----

    /**
     * Creates a card at the end of a column.
     *
     * @param columnId - The target column.
     * @param title - The card text.
     */
    async #createCard(columnId: string, title: string): Promise<void> {
        const board = this.#board.value;
        if (board === null) {
            return;
        }
        const column = board.columns.find((candidate) => candidate.id === columnId);
        if (column === undefined) {
            return;
        }
        this.#adding.value = null;
        this.#addDraft = '';

        const draftId = `draft-${++this.#tempSeq}`;
        this.#placeCard(
            {
                id: draftId,
                boardId: board.id,
                columnId,
                title,
                position: column.cards.length,
                version: 0,
                updatedAt: new Date().toISOString(),
            },
            column.cards.length
        );
        this.#setPending(draftId, true);

        const response = await this.#request(`/columns/${encodeURIComponent(columnId)}/cards`, {
            method: 'POST',
            body: JSON.stringify({ title }),
        });
        this.#setPending(draftId, false);
        if (!response.ok) {
            this.#removeLocal(draftId);
            this.#showNotice(response.problem.detail ?? 'card could not be created');
            return;
        }
        const created = z.object({ card: CardSchema }).safeParse(response.body);
        this.#removeLocal(draftId);
        if (created.success) {
            this.#applyRemote(created.data.card, created.data.card.position);
        }
    }

    /**
     * Moves a card into another column (or another index in its own).
     *
     * @param card - The card being moved.
     * @param toColumnId - The target column.
     * @param position - Target index within that column.
     */
    async #moveCard(card: Card, toColumnId: string, position: number): Promise<void> {
        const snapshot = this.#board.value;
        this.#placeCard({ ...card, columnId: toColumnId }, position);
        this.#setPending(card.id, true);

        const response = await this.#request(`/cards/${encodeURIComponent(card.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ version: card.version, columnId: toColumnId, position }),
        });
        this.#setPending(card.id, false);
        if (!response.ok) {
            this.#rollback(snapshot, response);
            return;
        }
        const updated = z.object({ card: CardSchema }).safeParse(response.body);
        if (updated.success) {
            this.#applyRemote(updated.data.card, updated.data.card.position);
        }
    }

    /**
     * Renames a card (the inline editor's commit).
     *
     * @param card - The card as the client last knew it.
     * @param title - The new title.
     */
    async #renameCard(card: Card, title: string): Promise<void> {
        const trimmed = title.trim();
        this.#closeEditor();
        if (trimmed === '' || trimmed === card.title) {
            return;
        }
        const snapshot = this.#board.value;
        this.#placeCard({ ...card, title: trimmed }, card.position);
        this.#setPending(card.id, true);

        const response = await this.#request(`/cards/${encodeURIComponent(card.id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ version: card.version, title: trimmed }),
        });
        this.#setPending(card.id, false);
        if (!response.ok) {
            this.#rollback(snapshot, response);
            return;
        }
        const updated = z.object({ card: CardSchema }).safeParse(response.body);
        if (updated.success) {
            this.#applyRemote(updated.data.card, updated.data.card.position);
        }
    }

    /**
     * Deletes a card.
     *
     * @param card - The card to delete.
     */
    async #deleteCard(card: Card): Promise<void> {
        const snapshot = this.#board.value;
        this.#removeLocal(card.id);
        const response = await this.#request(`/cards/${encodeURIComponent(card.id)}`, { method: 'DELETE' });
        if (!response.ok) {
            this.#rollback(snapshot, response);
        }
    }

    // ---- inline editing ----

    /**
     * Opens the inline editor on a card.
     *
     * @param card - The card to edit.
     */
    #openEditor(card: Card): void {
        this.#draft = card.title;
        this.#editing.value = card.id;
    }

    /** Closes the editor and flushes any deferred update for that card. */
    #closeEditor(): void {
        const editingId = this.#editing.value;
        this.#editing.value = null;
        this.#draft = '';
        if (editingId === null) {
            return;
        }
        const deferred = this.#deferred.get(editingId);
        if (deferred !== undefined) {
            this.#deferred.delete(editingId);
            this.#placeCard(deferred, deferred.position);
        }
    }

    // ---- rendering ----

    /** Renders the component into its (once-built) shadow shell. */
    render(): void {
        const root = this.ensureShadowRoot();
        if (this.#columnsHost?.getRootNode() !== root) {
            this.#buildShell(root);
        }
        const host = this.#columnsHost;
        if (!host) {
            return;
        }

        const board = this.#board.value;
        host.replaceChildren(...(board?.columns ?? []).map((column) => this.#renderColumn(column)));
        if (this.#statusLine) {
            this.#statusLine.textContent = `[${STATUS_TEXT[this.#status.value]}] board: ${this.#boardId}`;
        }
        if (this.#noticeLine) {
            this.#noticeLine.textContent = this.#notice.value;
        }
        this.#restoreEditorFocus();
    }

    /** Builds one column section, its cards, and its add-card control. */
    #renderColumn(column: Column): HTMLElement {
        const section = document.createElement('section');
        section.className = 'column';
        section.dataset['columnId'] = column.id;

        const header = document.createElement('h2');
        header.textContent = column.title;
        const count = document.createElement('span');
        count.className = 'count';
        count.textContent = String(column.cards.length);
        header.append(' ', count);

        const list = document.createElement('ol');
        list.className = 'cards';
        list.append(...column.cards.map((card) => this.#renderCard(card)));
        list.addEventListener('dragover', (event) => {
            event.preventDefault();
            section.classList.add('drop-target');
        });
        list.addEventListener('dragleave', () => {
            section.classList.remove('drop-target');
        });
        list.addEventListener('drop', (event) => {
            event.preventDefault();
            section.classList.remove('drop-target');
            this.#handleDrop(column.id, dropIndex(list, event.clientY));
        });

        section.append(header, list, this.#renderComposer(column));
        return section;
    }

    /** Builds one draggable card — or its editor, when it is being edited. */
    #renderCard(card: Card): HTMLElement {
        const item = document.createElement('li');
        item.className = 'card';
        item.dataset['cardId'] = card.id;
        if (this.#pending.value.includes(card.id)) {
            item.classList.add('pending');
        }

        if (this.#editing.value === card.id) {
            const editor = document.createElement('input');
            editor.className = 'editor';
            editor.value = this.#draft;
            editor.setAttribute('aria-label', `Edit ${card.title}`);
            editor.addEventListener('input', () => {
                this.#draft = editor.value;
            });
            editor.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    void this.#renameCard(card, editor.value);
                } else if (event.key === 'Escape') {
                    event.preventDefault();
                    this.#closeEditor();
                }
            });
            editor.addEventListener('blur', () => {
                // A re-render replaces the editor element, and detaching it
                // blurs it too — only a blur from an editor still on screen is
                // the user's "I'm done".
                if (!editor.isConnected) {
                    return;
                }
                if (this.#editing.value === card.id) {
                    void this.#renameCard(card, editor.value);
                }
            });
            item.append(editor);
            return item;
        }

        item.draggable = true;
        item.addEventListener('dragstart', (event) => {
            this.#dragging = card.id;
            item.classList.add('dragging');
            event.dataTransfer?.setData('text/plain', card.id);
            if (event.dataTransfer) {
                event.dataTransfer.effectAllowed = 'move';
            }
        });
        item.addEventListener('dragend', () => {
            this.#dragging = null;
            item.classList.remove('dragging');
        });

        const title = document.createElement('span');
        title.className = 'title';
        title.textContent = card.title;
        title.title = 'Double-click to rename';
        title.addEventListener('dblclick', () => this.#openEditor(card));

        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'remove';
        remove.textContent = '×';
        remove.title = 'Delete card';
        remove.setAttribute('aria-label', `Delete ${card.title}`);
        remove.addEventListener('click', () => void this.#deleteCard(card));

        item.append(title, remove);
        return item;
    }

    /** Builds the column footer: the add-card button, or its open form. */
    #renderComposer(column: Column): HTMLElement {
        const footer = document.createElement('div');
        footer.className = 'composer';

        if (this.#adding.value !== column.id) {
            const open = document.createElement('button');
            open.type = 'button';
            open.className = 'add';
            open.textContent = '+ Add card';
            open.addEventListener('click', () => {
                this.#addDraft = '';
                this.#adding.value = column.id;
            });
            footer.append(open);
            return footer;
        }

        const form = document.createElement('form');
        const input = document.createElement('input');
        input.className = 'add-input';
        input.value = this.#addDraft;
        input.placeholder = `New card in ${column.title}`;
        input.setAttribute('aria-label', `New card in ${column.title}`);
        input.addEventListener('input', () => {
            this.#addDraft = input.value;
        });
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.#adding.value = null;
            }
        });
        const submit = document.createElement('button');
        submit.type = 'submit';
        submit.textContent = 'Add';
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const title = this.#addDraft.trim();
            if (title !== '') {
                void this.#createCard(column.id, title);
            }
        });
        form.append(input, submit);
        footer.append(form);
        queueMicrotask(() => input.focus());
        return footer;
    }

    /** Moves the dropped card to the drop index. */
    #handleDrop(toColumnId: string, position: number): void {
        const cardId = this.#dragging;
        this.#dragging = null;
        const board = this.#board.value;
        if (cardId === null || board === null) {
            return;
        }
        const card = board.columns.flatMap((column) => column.cards).find((item) => item.id === cardId);
        if (card === undefined) {
            return;
        }
        const target = board.columns.find((column) => column.id === toColumnId);
        const index = target === undefined ? position : Math.min(position, target.cards.length);
        if (card.columnId === toColumnId && card.position === index) {
            return;
        }
        void this.#moveCard(card, toColumnId, index);
    }

    /** Puts the caret back after a re-render replaced the editor element. */
    #restoreEditorFocus(): void {
        if (this.#editing.value === null) {
            return;
        }
        const editor = this.#columnsHost?.querySelector<HTMLInputElement>('input.editor');
        if (editor === undefined || editor === null || document.activeElement === editor) {
            return;
        }
        editor.focus();
        editor.setSelectionRange(editor.value.length, editor.value.length);
    }

    /** Builds the model-independent DOM shell once. */
    #buildShell(root: ShadowRoot): void {
        const style = document.createElement('style');
        style.textContent = [
            ':host { display: block; }',
            '.status { color: #555; font-size: .85rem; min-height: 1.2em; }',
            '.notice { color: #b00020; font-size: .85rem; min-height: 1.2em; font-weight: 600; }',
            '.columns { display: grid; grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr)); gap: .75rem; }',
            '.column { border: 1px solid #ddd; border-radius: 8px; padding: .5rem .6rem; background: #fafafa; }',
            '.column.drop-target { border-color: #4a7cf7; background: #eef4ff; }',
            '.column h2 { font-size: .95rem; margin: 0 0 .4rem; }',
            '.column .count { color: #777; font-weight: 400; }',
            'ol.cards { list-style: none; margin: 0; padding: 0; min-height: 3rem; display: flex; flex-direction: column; gap: .35rem; }',
            'li.card { display: flex; align-items: flex-start; gap: .35rem; background: #fff; border: 1px solid #e2e2e2; border-radius: 6px; padding: .35rem .45rem; cursor: grab; }',
            'li.card.dragging { opacity: .4; }',
            'li.card.pending { border-style: dashed; }',
            'li.card .title { flex: 1; word-break: break-word; }',
            'li.card .remove { border: 0; background: none; color: #999; cursor: pointer; font-size: 1rem; line-height: 1; }',
            'li.card .remove:hover { color: #b00020; }',
            'input.editor { flex: 1; font: inherit; width: 100%; }',
            '.composer { margin-top: .4rem; }',
            '.composer form { display: flex; gap: .3rem; }',
            '.composer input { flex: 1; font: inherit; padding: .15rem .3rem; min-width: 0; }',
            '.composer button { font: inherit; cursor: pointer; }',
        ].join('\n');

        const statusLine = document.createElement('p');
        statusLine.className = 'status';
        statusLine.setAttribute('role', 'status');
        const noticeLine = document.createElement('p');
        noticeLine.className = 'notice';
        noticeLine.setAttribute('role', 'alert');
        const columnsHost = document.createElement('div');
        columnsHost.className = 'columns';

        root.replaceChildren(style, statusLine, noticeLine, columnsHost);
        this.#statusLine = statusLine;
        this.#noticeLine = noticeLine;
        this.#columnsHost = columnsHost;
    }
}

/**
 * Renumbers a column's cards densely in place, mirroring the server's ordering
 * invariant so local and server positions agree.
 *
 * @param cards - The cards, already in display order.
 * @returns The same array, with each card's `position` matching its index.
 */
function renumber(cards: Card[]): Card[] {
    return cards.map((card, index) => (card.position === index ? card : { ...card, position: index }));
}

/**
 * The drop index for a pointer position: the first card whose midpoint is
 * below the cursor, else the end of the list.
 *
 * @param list - The column's card list.
 * @param clientY - The pointer's viewport Y coordinate.
 * @returns The insertion index.
 */
function dropIndex(list: HTMLElement, clientY: number): number {
    const items = [...list.querySelectorAll('li.card')];
    for (let index = 0; index < items.length; index++) {
        const bounds = items[index].getBoundingClientRect();
        if (clientY < bounds.top + bounds.height / 2) {
            return index;
        }
    }
    return items.length;
}
