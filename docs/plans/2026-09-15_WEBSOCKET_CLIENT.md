# 2026-09-15 WebSocket Client & `@blue/socket` Package

**Status:** Proposed (ratification pending — ADR-22 records the decisions)
**Scope:** new `packages/blue-socket/` (contracts + client, isomorphic),
`blue-dispatcher` (re-export seam), `blue-platform-web` (online trigger),
`apps/blue-api` (demo gate)
**Companion docs:** [AD-22](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md),
[AD-21](../decisions/2026-09-13_AD21_WEBSOCKET_SESSION_REGISTRY.md),
[broadcast plan](2026-09-15_WEBSOCKET_BROADCAST.md)

---

## 1. Problem

The AD-21 server surface (rooms, broadcast, heartbeat) has no counterpart on
the wire: an app cannot connect to a room, observe connection state, or
survive network interruption. The client also settles the package boundary:
the socket domain now has two surfaces (server contract + client), and the
WHATWG `WebSocket` global makes the client isomorphic — the trigger for
`@blue/socket` (AD-22 D1/D2).

## 2. Current state (verified 2026-09-15)

- `SocketSession` / `SocketRequestSources` / `SocketSessionRegistry`:
  type-only contracts in `blue-dispatcher` (no runtime coupling — the
  dispatcher's execution path never references them).
- `NodeSocketSessionRegistry` + adapter + heartbeat: `blue-platform-node`.
- Consumers of the contracts: `node-http-server-adapter.ts`,
  `node-socket-session.ts`, `websocket.spec.ts`, `socket-auto-configuration.spec.ts`,
  `apps/blue-hello-node/hello-controller.ts`, `apps/blue-api/chat-controller.ts`,
  `parameters.ts` (extractor typing) — all import from `@blue/dispatcher`.
- No client abstraction anywhere; `blue-api` chat e2e uses raw `ws`.

## 3. Architecture (AD-22)

`@blue/socket` is the isomorphic socket domain package:

| Piece | Home | Notes |
| --- | --- | --- |
| `SocketSession`, `SocketRequestSources`, `SocketSessionRegistry` | `@blue/socket` (moved) | Type-only; dispatcher re-exports (D2) |
| `SocketClient` contract + `WebSocketClient` | `@blue/socket` | WHATWG `WebSocket` global (browser + Node ≥22) |
| Reconnect policy (backoff + jitter, status signal) | `@blue/socket` | Injectable clock; `@blue/signals` dep |
| Browser `online`-event reconnect trigger | `blue-platform-web` | Window globals stay out of the isomorphic package (D3) |
| Server machinery (registry, adapter, heartbeat) | `blue-platform-node` | Unchanged |
| Handler vocabulary (`@socketMapping`, `socketSession()` extractor) | `blue-dispatcher` | Imports + re-exports the moved types (D2) |

## 4. Surface

### `@blue/socket`

```ts
export type SocketStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface SocketClient {
    readonly url: string;
    /** Reactive connection state (AD-22 D3) — @blue/signals signal. */
    readonly status: Signal<SocketStatus>;
    /** Inbound messages (text strings / JSON-decoded), async iterable. */
    readonly messages: AsyncIterable<unknown>;
    /** Outbound: strings → text frames; anything else JSON-encoded. */
    send(data: unknown): void;
    /** Deliberate close — never triggers reconnect. */
    close(code?: number, reason?: string): void;
}

export interface ReconnectPolicy {
    baseMs: number;        // default 1_000
    maxMs: number;         // default 30_000
    jitter: number;        // default 0.2 (0–20%)
}

export interface WebSocketClientOptions {
    reconnect?: ReconnectPolicy | null;      // null disables auto-reconnect
    bufferWhileDisconnected?: { maxMessages: number };  // opt-in, default off
    /** Environment wiring (e.g. browser online event) pushes an immediate retry. */
    reconnectTrigger?: Signal<boolean> | (() => boolean);
    /** Injectable clock for deterministic tests. @internal */
    now?: () => number;
}
```

`WebSocketClient` wraps the WHATWG surface: `connecting → open`, unexpected
`close` → `reconnecting` → backoff timer → reconnect; deliberate `close()`
→ `closed`, no reconnect. Status is a `@blue/signals` signal; messages flow
through an async reader (the `AsyncReader` shape already used by
`nodeSocketSession`).

### `blue-platform-web`

`createOnlineReconnectTrigger(): Signal<boolean>` — window `online`/`offline`
events → signal; a truthy transition nudges a reconnecting client to retry
immediately. The only browser-global code in the feature.

## 5. Phases

### Phase 0 — Scaffold `@blue/socket`

- New package mirroring `blue-signals`' manifest shape (passes
  `scripts/check-manifests.mjs`), tsconfig.build, vitest config, `index.ts`
  with doc header.
- `pnpm install` (lockfile); root build includes the new project (Nx
  auto-discovers via workspace glob).
- Deps: `@blue/signals` (status signal). DevDeps: `ws` + `@types/ws` for
  integration tests only.

### Phase 1 — Move contracts; dispatcher re-export seam

- Move `socket-session.ts`, `socket-session-registry.ts` to `@blue/socket`
  (types + JSDoc intact, ADR references re-pointed).
- `blue-dispatcher`: import + re-export from `@blue/socket`; drop the local
  files; `parameters.ts` import updated. Add `@blue/socket` dependency.
- Consumer imports unchanged (dispatcher re-export keeps them compiling) —
  no caller churn.
- Verify: dispatcher + platform-node + blue-api + blue-hello-node suites.

### Phase 2 — `SocketClient` + `WebSocketClient` + reconnect policy

- Contract + implementation with status signal, async-iterable messages,
  send/close parity, backoff-jitter reconnect (injectable clock),
  deliberate-close latch, optional bounded outbound queue.
- Unit tests: WHATWG-shaped transport double (open/message/close/error
  emission), fake timers + injected clock for backoff progression
  (base → cap, jitter bounds), queue overflow drops oldest, deliberate
  close never reconnects, `reconnect: null` disables.

### Phase 3 — Browser online trigger (`blue-platform-web`)

- `createOnlineReconnectTrigger()` + spec (jsdom: dispatch `online`/`offline`,
  assert signal transitions).

### Phase 4 — Demo gate (apps/blue-api)

- Rewire `chat.spec.ts` through `WebSocketClient` (Node global WebSocket
  against the real app — identical wire to a browser): fan-out + chat-tick
  assertions unchanged in substance, client status observed
  (`open` → messages → deliberate close → `closed`).
- Docs: guide 06 §5 deferral updated; plans README index.

### Phase 5 — Verification

- Root `pnpm build`, `pnpm lint`, `pnpm format:check` (changed files),
  full `pnpm test`.

## 6. Non-goals / deferred (documented)

- Backpressure policy (`ws.bufferedAmount` handling: drop vs close `1008`) —
  separate small follow-up, not this plan.
- STOMP layer — future, post-client (AD-22 D5): client codec in
  `@blue/socket`, server in `blue-platform-node`.
- SockJS — never (AD-22 D4); third-party territory.
- Redis pub/sub backplane — post-1.0 (needs a store contract).
- Message history/persistence.

## 7. Risks

| Risk | Mitigation |
| --- | --- |
| WHATWG `WebSocket` surface drift between browser and Node (undici) | Client depends on a minimal structural subset (onopen/onmessage/onclose/onerror, send/close/readyState); unit doubles enforce it |
| Reconnect storms (server down, many clients) | Cap at `maxMs`; jitter staggers; deliberate-close latch |
| Status signal churn re-rendering consumers | Status transitions are monotone-ish by design (connecting → open → reconnecting* → closed); consumers read, not write |
| Package move breaks hidden importers | Verified consumer list (7 files); dispatcher re-export keeps the public surface stable |

## 8. References

- AD-22: `docs/decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md`
- Server surface: AD-21 + `2026-09-15_WEBSOCKET_BROADCAST.md`
- Existing shapes: `packages/blue-platform-node/src/node-socket-session.ts`
  (AsyncReader), `packages/blue-scheduler/src/task-scheduler.ts`
  (injectable clock), `packages/blue-signals/` (signal API)