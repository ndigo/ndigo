# 2026-09-15 WebSocket Client & `@ndigo/socket` Package

**Status:** Implemented (ratified by [AD-22](../decisions/archive/2026-09-15_AD22_WEBSOCKET_CLIENT.md);
shipped in `5472171a`, `6e7ddbf9`, `d2aa32d1`, `184c5ceb`, `f0718252`, `af3857ab`)
**As-built deviations (surface changed after this plan was written):**

- `reconnectTrigger` is a `ReconnectTrigger` object (`{ onChange(listener): () => void }`), not a `Signal<boolean>` — added in `6e7ddbf9`; browser wiring lives in `@ndigo/platform-web` (`createOnlineReconnectTrigger()`).
- The injectable `now?: () => number` clock was **not** implemented; deterministic tests use `transportFactory` + fake timers instead (`5472171a`).
- `onStatusChange` observer (telemetry seam) and `maxInboundMessages` (inbound watermark) were added after planning — `184c5ceb`, Phase-3 review (2026-09-15).
- Inbound `messages` are raw strings/ArrayBuffers — **no** automatic JSON decode (plan §4 said "JSON-decoded").
- `createOnlineReconnectTrigger()` returns an `OnlineReconnectTrigger` (online signal + `onChange` + `dispose`), not a bare `Signal<boolean>`.
  **Scope:** new `packages/ndigo-socket/` (contracts + client, isomorphic),
  `ndigo-dispatcher` (re-export seam), `ndigo-platform-web` (online trigger),
  `apps/ndigo-api` (demo gate)
  **Companion docs:** [AD-22](../decisions/archive/2026-09-15_AD22_WEBSOCKET_CLIENT.md),
  [AD-21](../decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md),
  [broadcast plan](2026-09-15_WEBSOCKET_BROADCAST.md)

---

## 1. Problem

The AD-21 server surface (rooms, broadcast, heartbeat) has no counterpart on
the wire: an app cannot connect to a room, observe connection state, or
survive network interruption. The client also settles the package boundary:
the socket domain now has two surfaces (server contract + client), and the
WHATWG `WebSocket` global makes the client isomorphic — the trigger for
`@ndigo/socket` (AD-22 D1/D2).

## 2. Current state (verified 2026-09-15)

- `SocketSession` / `SocketRequestSources` / `SocketSessionRegistry`:
  type-only contracts in `ndigo-dispatcher` (no runtime coupling — the
  dispatcher's execution path never references them).
- `NodeSocketSessionRegistry` + adapter + heartbeat: `ndigo-platform-node`.
- Consumers of the contracts: `node-http-server-adapter.ts`,
  `node-socket-session.ts`, `websocket.spec.ts`, `socket-auto-configuration.spec.ts`,
  `apps/ndigo-hello-node/hello-controller.ts`, `apps/ndigo-api/chat-controller.ts`,
  `parameters.ts` (extractor typing) — all import from `@ndigo/dispatcher`.
- No client abstraction anywhere; `ndigo-api` chat e2e uses raw `ws`.

## 3. Architecture (AD-22)

`@ndigo/socket` is the isomorphic socket domain package:

| Piece                                                                   | Home                    | Notes                                                  |
| ----------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------ |
| `SocketSession`, `SocketRequestSources`, `SocketSessionRegistry`        | `@ndigo/socket` (moved) | Type-only; dispatcher re-exports (D2)                  |
| `SocketClient` contract + `WebSocketClient`                             | `@ndigo/socket`         | WHATWG `WebSocket` global (browser + Node ≥22)         |
| Reconnect policy (backoff + jitter, status signal)                      | `@ndigo/socket`         | Injectable clock; `@ndigo/signals` dep                 |
| Browser `online`-event reconnect trigger                                | `ndigo-platform-web`    | Window globals stay out of the isomorphic package (D3) |
| Server machinery (registry, adapter, heartbeat)                         | `ndigo-platform-node`   | Unchanged                                              |
| Handler vocabulary (`@socketMapping`, `socketSessionValue()` extractor) | `ndigo-dispatcher`      | Imports + re-exports the moved types (D2)              |

## 4. Surface

### `@ndigo/socket`

```ts
export type SocketStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export interface SocketClient {
    readonly url: string;
    /** Reactive connection state (AD-22 D3) — @ndigo/signals signal. */
    readonly status: Signal<SocketStatus>;
    /** Inbound messages (text strings / JSON-decoded), async iterable. */
    readonly messages: AsyncIterable<unknown>;
    /** Outbound: strings → text frames; anything else JSON-encoded. */
    send(data: unknown): void;
    /** Deliberate close — never triggers reconnect. */
    close(code?: number, reason?: string): void;
}

export interface ReconnectPolicy {
    baseMs: number; // default 1_000
    maxMs: number; // default 30_000
    jitter: number; // default 0.2 (0–20%)
}

export interface WebSocketClientOptions {
    reconnect?: ReconnectPolicy | null; // null disables auto-reconnect
    bufferWhileDisconnected?: { maxMessages: number }; // opt-in, default off
    /** Boundary on the inbound messages stream (opt-in; drops on overflow). */
    maxInboundMessages?: number;
    /** Environment wiring: `{ onChange(listener): () => void }` (e.g. the browser online trigger). */
    reconnectTrigger?: ReconnectTrigger | null;
    /** Status-transition observer — the telemetry seam (never called with the same state twice). */
    onStatusChange?: (status: SocketStatus) => void;
    /** Transport factory for tests and non-standard environments. @internal */
    transportFactory?: (url: string) => SocketTransport;
}
```

`WebSocketClient` wraps the WHATWG surface: `connecting → open`, unexpected
`close` → `reconnecting` → backoff timer → reconnect; deliberate `close()`
→ `closed`, no reconnect. Status is a `@ndigo/signals` signal; messages flow
through the shared `AsyncReader` (same class server sessions use — one
implementation, two sides of the wire, `2026-09-15`).

### `ndigo-platform-web`

`createOnlineReconnectTrigger(): OnlineReconnectTrigger` — window
`online`/`offline` events → an `online` signal, an `onChange(listener)`
subscription (an offline→online transition nudges a reconnecting client to
retry immediately), and `dispose()`. The only browser-global code in the
feature.

## 5. Phases

### Phase 0 — Scaffold `@ndigo/socket`

- New package mirroring `ndigo-signals`' manifest shape (passes
  `scripts/check-manifests.mjs`), tsconfig.build, vitest config, `index.ts`
  with doc header.
- `pnpm install` (lockfile); root build includes the new project (Nx
  auto-discovers via workspace glob).
- Deps: `@ndigo/signals` (status signal). DevDeps: `ws` + `@types/ws` for
  integration tests only.

### Phase 1 — Move contracts; dispatcher re-export seam

- Move `socket-session.ts`, `socket-session-registry.ts` to `@ndigo/socket`
  (types + JSDoc intact, ADR references re-pointed).
- `ndigo-dispatcher`: import + re-export from `@ndigo/socket`; drop the local
  files; `parameters.ts` import updated. Add `@ndigo/socket` dependency.
- Consumer imports unchanged (dispatcher re-export keeps them compiling) —
  no caller churn.
- Verify: dispatcher + platform-node + ndigo-api + ndigo-hello-node suites.

### Phase 2 — `SocketClient` + `WebSocketClient` + reconnect policy

- Contract + implementation with status signal, async-iterable messages,
  send/close parity, backoff-jitter reconnect (injectable clock),
  deliberate-close latch, optional bounded outbound queue.
- Unit tests: WHATWG-shaped transport double (open/message/close/error
  emission), fake timers + injected clock for backoff progression
  (base → cap, jitter bounds), queue overflow drops oldest, deliberate
  close never reconnects, `reconnect: null` disables.

### Phase 3 — Browser online trigger (`ndigo-platform-web`)

- `createOnlineReconnectTrigger()` + spec (jsdom: dispatch `online`/`offline`,
  assert signal transitions).

### Phase 4 — Demo gate (apps/ndigo-api)

- Rewire `chat.spec.ts` through `WebSocketClient` (Node global WebSocket
  against the real app — identical wire to a browser): fan-out + chat-tick
  assertions unchanged in substance, client status observed
  (`open` → messages → deliberate close → `closed`).
- Docs: guide 06 §5 deferral updated; plans README index.

### Phase 5 — Verification

- Root `pnpm build`, `pnpm lint`, `pnpm format:check` (changed files),
  full `pnpm test`.

## 6. Non-goals / deferred (documented)

- **Backpressure policy** — implemented 2026-09-15 outside this plan: the
  registry's `SocketBackpressurePolicy` (1 MiB watermark, `close` `1013` —
  Spring's `SESSION_NOT_RELIABLE` — or `drop`; default `close`, disabled
  explicitly). Server-side only; see the broadcast plan.
- STOMP layer — future, post-client (AD-22 D5): client codec in
  `@ndigo/socket`, server in `ndigo-platform-node`.
- SockJS — never (AD-22 D4); third-party territory.
- Redis pub/sub backplane — post-1.0 (needs a store contract).
- Message history/persistence.

## 7. Risks

| Risk                                                               | Mitigation                                                                                                                       |
| ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| WHATWG `WebSocket` surface drift between browser and Node (undici) | Client depends on a minimal structural subset (onopen/onmessage/onclose/onerror, send/close/readyState); unit doubles enforce it |
| Reconnect storms (server down, many clients)                       | Cap at `maxMs`; jitter staggers; deliberate-close latch                                                                          |
| Status signal churn re-rendering consumers                         | Status transitions are monotone-ish by design (connecting → open → reconnecting* → closed); consumers read, not write            |
| Package move breaks hidden importers                               | Verified consumer list (7 files); dispatcher re-export keeps the public surface stable                                           |

## 8. References

- AD-22: `docs/decisions/archive/2026-09-15_AD22_WEBSOCKET_CLIENT.md`
- Server surface: AD-21 + `2026-09-15_WEBSOCKET_BROADCAST.md`
- Existing shapes: `packages/ndigo-platform-node/src/node-socket-session.ts`
  (AsyncReader), `packages/ndigo-scheduler/src/task-scheduler.ts`
  (injectable clock), `packages/ndigo-signals/` (signal API)
