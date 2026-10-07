# blue-chat — Real-Time Room Chat

> WebSocket chat rooms with a browser Web Component client: path-bound rooms,
> history replay on join, presence, typing, and reconnect — plus a STOMP
> interop endpoint.

A Node server exposes one WebSocket room per path (`/ws/rooms/{room}`) and
serves a Vite-built Web Component (`<chat-room>`) that talks to it with
`@blue/socket`'s isomorphic client. The same server also runs the platform's
STOMP broker at `/stomp/chat` so a third-party STOMP client can exchange
messages on `/topic/chat`.

## Run

```bash
cd apps/13-blue-chat
pnpm build:client   # Vite builds client/main.ts -> dist/client.{js,css}
pnpm start          # or: pnpm start:full (build + start), pnpm dev
# GET  http://127.0.0.1:3060/            (shell mounting <chat-room>)
# WS   ws://127.0.0.1:3060/ws/rooms/lobby?user=Alice
# WS   ws://127.0.0.1:3060/stomp/chat
```

Set `PORT` to override the default `3060`.

## Routes & protocol

| Route                          | Kind | Purpose                                        |
| ------------------------------ | ---- | ---------------------------------------------- |
| `GET /`                        | HTTP | EJS shell mounting `<chat-room>`               |
| `GET /static/*`                | HTTP | Built client bundle (`dist/`)                  |
| `GET /health`, `GET /metrics`  | HTTP | Management endpoints (`@blue/management`)      |
| `WS /ws/rooms/{room}?user=<n>` | WS   | Room endpoint (path-bound room name)           |
| `WS /stomp/chat`               | WS   | STOMP 1.2 broker; subscribe/SEND `/topic/chat` |

Every frame in both directions shares one stable envelope:

```json
{
    "event": "message",
    "data": { "id": "…", "from": "Alice", "text": "hi", "at": 1728312000000 },
    "at": 1728312000000,
    "from": "Alice"
}
```

| event      | direction | `data`                                         | notes                                  |
| ---------- | --------- | ---------------------------------------------- | -------------------------------------- |
| `history`  | S → C     | `{ room, messages: ChatMessage[] }`            | replayed to the joiner only, newest 50 |
| `message`  | both      | C → S: the text string; S → C: a `ChatMessage` | broadcast to the room, sender included |
| `presence` | S → C     | `{ room, users: string[], joined?, left? }`    | roster broadcast on every join/leave   |
| `typing`   | both      | `boolean`                                      | broadcast to the room, sender included |
| `error`    | S → C     | `{ reason }`                                   | invalid/malformed inbound frame        |

A `ChatMessage` is `{ id, from, text, at }`; the client deduplicates replayed
history by `id`, so a reconnect re-joining the same path never duplicates.

## Demonstrates

- **Path-bound `@socketMapping` rooms** — `@socketMapping('/{room}')` +
  `pathVariable('room')`; joining is connecting.
- **Registry fan-out + rooms** — `session.join(room)` /
  `registry.broadcastTo(room, …)` (room-echo parity), with the platform's
  outbound backpressure watermark (`1013`) instead of unbounded per-session
  buffering.
- **Bounded history + presence** — a shared `RoomService` replays the newest
  messages and tracks the live roster.
- **Web Component + signals** — `@blue/view-webcomponent` element rendering from
  `@blue/signals`; the client reconnects with bounded exponential backoff and
  resubscribes by re-entering the path-bound room.
- **STOMP interop** — the platform `StompBroker` at `/stomp/chat`, consumed by a
  third-party client (`@stomp/stompjs`) in `test/stomp-interop.spec.ts` and the
  live interop command below.
- **Management** — `/health` and `/metrics` come for free from
  `@blue/management`.

## Tests

```bash
cd apps/13-blue-chat && pnpm test
```

- `test/http.spec.ts` — MockHTTP: the shell, its data attributes, `/health`.
- `test/room-service.spec.ts` — history bounding and presence bookkeeping.
- `test/rooms.spec.ts` — a real server on an ephemeral port driven by the Node
  global `WebSocket`: history replay on join, room isolation, presence
  join/leave, reconnect with no duplicate history, typing relay.
- `test/stomp-interop.spec.ts` — a third-party `@stomp/stompjs` client against
  `/stomp/chat`: connect → subscribe (receipt) → SEND → receive, a receipted
  SEND, and cross-connection fan-out.

## STOMP interop command

Against a running server:

```bash
cd apps/13-blue-chat
node --input-type=module -e '
import { Client } from "@stomp/stompjs";
const c = new Client({
  brokerURL: "ws://127.0.0.1:3060/stomp/chat",
  connectHeaders: { host: "127.0.0.1" },   // STOMP 1.2 requires host
  reconnectDelay: 0, heartbeatIncoming: 0, heartbeatOutgoing: 0,
});
c.onConnect = () => {
  c.subscribe("/topic/chat", (m) => { console.log("receipt:", m.body); c.deactivate(); });
  c.publish({ destination: "/topic/chat", body: JSON.stringify({ event: "chat", data: "hello stomp" }) });
};
c.activate();
'
```

## See Also

- [apps/README](../README.md) — the applications progression
- [Guide 06 — WebSockets, Rooms, Broadcast, and STOMP](../../docs/guides/06-websockets.md)
- [@blue/socket](../../packages/blue-socket/README.md) — the isomorphic client and STOMP layer
- [06-blue-island](../06-blue-island/README.md) — SSR shell + Web Component island + SSE
- [04-blue-api](../04-blue-api/README.md) — the raw socket and STOMP demos this app builds on

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
