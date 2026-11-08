# ndigo-kanban — Collaborative Board

> A kanban board whose cards are versioned `@ndigo/orm` entities: optimistic
> drag-and-drop in the browser, `409` on a stale write, and every accepted
> change broadcast to the board's room over a WebSocket — with the
> authoritative snapshot replayed first so a reconnect reconciles.

A Node server serves a Vite-built Web Component (`<kanban-board>`) and exposes
one REST surface for writes plus one socket room per board for reads. Two tabs
is the whole demo: drag a card in one and watch it move in the other; rename the
same card in both and watch one tab lose the race, roll back to the server's
card, and say so.

## Run

```bash
cd apps/14-ndigo-kanban
pnpm build:client   # Vite builds client/main.ts -> dist/client.{js,css}
pnpm start          # or: pnpm dev (build + start)
# GET  http://127.0.0.1:3070/                 (shell mounting <kanban-board>)
# GET  http://127.0.0.1:3070/api/boards/demo  (full board snapshot)
# WS   ws://127.0.0.1:3070/ws/board/demo      (snapshot, then card events)
```

`PORT` overrides the default `3070` (it is read before the context is built, so
the managed server binds it).

### Two-tab demo

1. Open <http://127.0.0.1:3070/> in **two** browser tabs (the connection
   indicator reads `[live] board: demo` in both).
2. **Add**: click _+ Add card_ in _Backlog_, type, press **Enter** — the card
   appears immediately in the tab you typed in and a moment later in the other.
3. **Move**: drag a card into another column (drop position is where the cursor
   is, not where the render is) — same result in both tabs.
4. **Rename**: double-click a card's text, edit, press **Enter** (or click
   away). `Escape` cancels.
5. **Race it**: start editing a card in tab B, then rename the same card in tab
   A. Tab B keeps _your_ text while you type (the remote change is deferred, not
   clobbered); press **Enter** in tab B and its stale `PATCH` is rejected —
   the card snaps back to tab A's version and a red notice explains why.
6. **Reconnect**: stop the server, watch both tabs flip to
   `connection lost — reconnecting…`, start it again — each tab receives the
   authoritative snapshot before any new events, so nothing is missed or
   replayed twice.

## Routes & protocol

| Route                               | Kind | Purpose                                                                        |
| ----------------------------------- | ---- | ------------------------------------------------------------------------------ |
| `GET /`                             | HTTP | EJS shell mounting `<kanban-board>`                                            |
| `GET /static/*`                     | HTTP | Built client bundle (`dist/`)                                                  |
| `GET /health`, `GET /metrics`       | HTTP | Management endpoints (`@ndigo/management`)                                     |
| `GET /api/boards/:id`               | HTTP | Full board: `{ board: { id, title, columns: [...] } }`                         |
| `POST /api/boards/:id/cards`        | HTTP | Create a card — `{ title, columnId?, position? }` → `201 { card }`             |
| `POST /api/columns/:columnId/cards` | HTTP | Create a card in a named column — `{ title, position? }`                       |
| `PATCH /api/cards/:cardId`          | HTTP | Rename/reorder/move — `{ version, title?, columnId?, position? }` → `{ card }` |
| `DELETE /api/cards/:cardId`         | HTTP | Remove a card → `204`                                                          |
| `WS /ws/board/:boardId`             | WS   | Board room: authoritative snapshot, then card events                           |

A card on the wire is
`{ id, boardId, columnId, title, position, version, updatedAt }`; `position` is
dense and zero-based within its column, so ordering never depends on insert
order. Every 4xx is an RFC 9457 `application/problem+json` document.

Every socket frame shares one envelope — `{ event, data, at }`:

| event          | direction | `data`                                         |
| -------------- | --------- | ---------------------------------------------- |
| `snapshot`     | S → C     | the whole board (sent first on every connect)  |
| `card-created` | S → C     | `{ card }`                                     |
| `card-updated` | S → C     | `{ card }` (rename / reorder)                  |
| `card-moved`   | S → C     | `{ card, fromColumnId }`                       |
| `card-deleted` | S → C     | `{ cardId, columnId }`                         |
| `error`        | S → C     | `{ reason }` (malformed/unknown inbound frame) |

A client may send `{ "event": "resync" }` to be handed a fresh `snapshot`;
there is no client → server mutation channel — writes are the REST surface.

## Concurrency model

**Cards are versioned; the client's expected version is the write's
precondition.**

- Every card carries a monotonically increasing `version`, starting at `1`; a
  successful write increments it by one and stamps `updatedAt`.
- `PATCH /api/cards/:cardId` **requires** `version`. The service compares it
  against the stored card inside a single-writer queue, so the compare and the
  write cannot interleave: of two racing updates that both read version _v_,
  the first is applied (_v → v+1_) and the second compares against _v+1_ and
  **loses** with `409 Conflict` — no retry, no last-write-wins fallback, no
  sleep on the path. The problem body carries the current card, so the loser
  reconciles without a second round trip:

    ```json
    {
        "type": "urn:ndigo:kanban:stale-version",
        "title": "Conflict",
        "status": 409,
        "detail": "card '…' was updated concurrently: expected version 2, current version 3",
        "current": { "id": "…", "version": 3, "title": "…", "columnId": "in-progress", "position": 0 }
    }
    ```

- **The mechanism, concretely**: every mutation runs as
  `queue → InMemoryTransactionManager.run(body)` (`BoardService.#mutate`), the
  body is fully synchronous, and the `version` compare happens first. The queue
  is what makes the in-memory transaction manager's "one transaction at a time"
  rule an invariant instead of an error path, and it is also what makes two
  interleaved writes deterministic — the store-level spec asserts "exactly one
  winner" with no sleeps.
- **Who wins**: the writer whose `version` still matched at its turn. In the
  UI that is simply "whoever committed last from a current view"; the loser sees
  the server's card and a conflict notice.
- **Deletes are deliberately unversioned** (a deleted card cannot be repaired by
  a version check); the `card-deleted` broadcast is what tells other clients to
  drop it.
- **Creation** needs no token: a new card is not a concurrent edit of anything.

### Client-side

Writes are **optimistic**: the local board is patched immediately (the card
renders as `saving…`), the request carries the version the client last saw, and
a rejection rolls the board back to the snapshot taken before the write —
adopting the server's `current` card when the problem carries one and showing a
brief conflict notice. Live updates from other clients are applied, except for
the card currently open in the inline editor: those are **deferred** until the
edit ends, so a remote rename can never clobber what you are typing. A
reconnect (or an explicit `resync`) replaces the board wholesale from the
snapshot, keeping the in-progress edit on top.

## Demonstrates

- **`@ndigo/orm` entities behind a service seam** — `Board` → `BoardColumn` →
  `Card` mapped with `@entity`/`@column`, persisted through
  `InMemoryEntityManager` and written inside `InMemoryTransactionManager`
  transactions; controllers only ever talk to `BoardService`, which hands out
  detached records (never the stored instances).
- **Versioned writes (optimistic concurrency)** — the CAS above, with the
  `409`/`current` problem body and a store-level spec proving one winner.
- **`@ndigo/socket` rooms + broadcast** — `WS /ws/board/{boardId}` joins the room
  `board:<id>`; `BoardBroadcaster` subscribes to the service's event stream and
  fans accepted writes out with `registry.broadcastTo(room, …)`. Delivery is
  fire-and-forget, so a slow transport can never turn a committed write into an
  error response.
- **Snapshot-first reconciliation** — the join path sends the authoritative
  board before any event, so a reconnect resynchronizes instead of replaying a
  backlog.
- **`@ndigo/signals` optimistic UI** — one `effect` renders from signals; the
  edit/add drafts are deliberately _plain fields_, because a signal read from
  inside `render()` would be tracked by that effect and re-render the board on
  every keystroke.
- **Native HTML5 drag & drop, no new libraries** — `draggable` cards with
  `dragstart`/`dragover`/`drop`; the drop index comes from the cursor position.
- **`@ndigo/test` + a real socket lane** — MockHTTP for the REST surface and the
  emitted events, and a real server on an ephemeral port driven by the Node
  global `WebSocket` for the cross-client behavior.
- **Management** — `/health` and `/metrics` come for free from
  `@ndigo/management`.

## Tests

```bash
cd apps/14-ndigo-kanban && pnpm test
```

- `test/board-service.spec.ts` — store-level: dense/ordered snapshots, version
  increments, **two interleaved updates from the same base version → exactly one
  winner** (deterministic, no sleeps), a failed write publishing nothing, moves
  leaving both columns dense, create/insert/delete renumbering.
- `test/board-api.spec.ts` — MockHTTP over the REST surface: snapshot shape,
  create (both endpoints), rename, move (`card-moved` + `fromColumnId`), the
  stale-version `409` with the current card, `404`/`422` problems, delete, and
  the broadcast event emitted per write.
- `test/board-socket.spec.ts` — a real server on an ephemeral port: two clients
  seeing each other's events, a reconnect receiving the snapshot before the
  event stream, room isolation between two boards, `resync`, `error` frames,
  and the `1008` refusals.
- `test/http.spec.ts` — the shell that mounts the component, `/health`, and the
  socket path staying 404/405 over plain HTTP.

## See Also

- [apps/README](../README.md) — the applications progression
- [13-ndigo-chat](../13-ndigo-chat/README.md) — the nearest sibling: socket rooms,
  presence, and a reconnecting Web Component client
- [05-ndigo-api](../05-ndigo-api/README.md) — controllers, `@ndigo/orm`, and the
  problem+json error contract in depth
- [Guide 15 — WebSockets](../../docs/guides/15-websockets.md)
- [Guide 29 — Signals & Islands](../../docs/guides/29-signals-and-islands.md)
- [Guide 36 — Testing with `@ndigo/test`](../../docs/guides/36-testing.md)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
