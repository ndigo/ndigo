# Review and Remediation Plan — AD-21/22/23 wave (WebSocket registry, client, STOMP)

**Date:** 2026-09-17
**Status:** Implemented — all Block/Must-Fix items landed and **every
repository gate passes** (§7). The two
owner decisions (§ Decisions) are encoded in the code; §7 records what landed,
where the probes ended up as regression tests, and the three findings the
certification pass added (COR-16, DOC-5, GATE-4).
**Scope:** Review of the recent wave — AD-19..AD-23 commits (content/i18n,
scheduling, host runtime, WS session registry, WS client, STOMP) **plus the
uncommitted working tree** (STOMP second wave, `/queue` store seam + libsql
backend, ring-buffer/async-reader rewrites). Repo-wide gates and the
architecture seams the wave created are covered as well; untouched older
subsystems are out of scope.
**Method:** Read of every new/changed source in the wave (codec, broker,
client, store, transport, telemetry) against the STOMP 1.2 specification
([stomp.github.io](https://stomp.github.io/stomp-specification-1.2.html)),
the ADRs (`docs/decisions/2026-09-1{5,6}_AD2{1,2,3}_*.md`) and the plans;
live execution of every repository gate (`pnpm lint`, `pnpm format:check`,
package `tsc -b`, package `vitest run`); targeted throwaway probes for the
defects marked **[exec]** (each probe reproduced a concrete wrong
observation, then was deleted); static security pass over the socket surface;
`ws@8.21.3` source read for the transport claims.

**Legend:** `[exec]` reproduced by execution · `[code]` established by
reading the cited lines · `[spec]` STOMP 1.2 clause quoted · `[agent]` from a
delegated review pass, cross-checked against the cited lines.

**Decisions (2026-09-17, owner):**

- **D-A — conform to the specification.** COR-8 resolves to ERROR ⇒ close
  (the store-fault path closes after the ERROR; the replay path takes the same
  posture), and COR-3/5/6/7/13/14/15 are fixed to the spec text rather than
  documented as deviations. Non-conformant leniency is removed, not
  documented.
- **D-B — enforce the decorator metadata.** SEC-3 resolves to metadata
  enforcement in the socket dispatch path: a socket-mapped handler marked
  `@authenticated`/`@authorized` (class or method) requires a principal at
  `session.attributes.principal` and fails closed with close `1008` when it is
  missing or lacks a required role. The adapter's `authenticate` hook (or the
  context-resolved socket authenticator bean) is the identity source that must
  populate it. `apps/blue-api` wires this as the reference implementation.

---

## 1. Verified baseline (what is healthy)

| Gate                        | Command                                       | Result (2026-09-17, working tree)                                                                         |
| --------------------------- | --------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `@blue/socket` tests        | `cd packages/blue-socket && pnpm test`        | ✅ 169/169 (6 files: codec 45, broker 66, client 25, socket-client 23)                                    |
| `@blue/platform-node` tests | `cd packages/blue-platform-node && pnpm test` | ✅ 244/244 (incl. `stomp.spec.ts` 11, `websocket.spec.ts` 19)                                             |
| `@blue/core` ring buffer    | `vitest run test/ring-buffer.spec.ts`         | ✅ 24/24                                                                                                  |
| Type-check (changed pkgs)   | `tsc -b tsconfig.build.json`                  | ✅ `blue-socket`, `blue-orm-drizzle` exit 0                                                               |
| Lint (`--deny-warnings`)    | `pnpm lint`                                   | ❌ **exit 1 — 54 warnings** (§2.1 GATE-1)                                                                 |
| Format                      | `pnpm format:check`                           | ❌ **exit 1 — 67 files** (§2.1 GATE-2)                                                                    |
| Working tree                | `git status`                                  | 26 modified + 5 untracked files uncommitted (§2.5 HYG-1); this review adds this plan + a plan-index entry |

Verified-sound (do not "fix" these): the AD-23 D1 isomorphism claim —
`@blue/socket` imports only `@blue/core`, `@blue/signals` and its own modules
(no `ws`, no `node:*`, no platform package; verified over every `src/*.ts`);
codec framing for LF frames
(content-length octet math, trailing-data rejection, null-prototype header
maps, NUL/CR rejection, prototype-pollution safety), D5 per-subscription
framing, D7 buffered ordering + held receipts, D8 byte-exact binary bodies,
D10 principal scoping (client SEND to `/user/*` reaches only the sender's own
scope; no unresolved principal ⇒ 1008), session teardown pruning
(`#dropSession`), transport bounds (1 MiB `maxPayload`, 1024 msgs / 4 MiB
inbound, 1 MiB outbound watermark → 1013, `permessage-deflate` off, O(1)
`bufferedAmount`), MESSAGE header spoofing blocked (`destination`/
`subscription`/`message-id`/`redelivered` are broker-set; only `content-type`
is forwarded), ack/transaction scoping to the sender's own subscriptions.

---

## 2. Findings

### 2.1 Blocks — the repository's own gates are red

**GATE-1 (Block) — `pnpm lint` fails: 54 warnings, all introduced by this wave.**
`pnpm lint` = `oxlint --type-aware --deny-warnings .` (CI lane "Lint (zero
warnings)", `.github/workflows/ci.yml`), exit 1.
`[exec]` Distribution: `packages/blue-socket/test/stomp-broker.spec.ts` 42
(`typescript(no-floating-promises)`), `packages/blue-socket/src/stomp-broker.ts`
4, `test/message-store.spec.ts` 3, `blue-platform-node/test/stomp.spec.ts` 2,
`test/async-reader.spec.ts` 1, `blue-orm-drizzle/test/libsql-queue-message-store.spec.ts`
1, `apps/blue-api/src/stomp-chat-controller.ts:51` 1.
The 4 source findings: `stomp-broker.ts:474,850` (`unicorn/no-useless-spread`);
`:1013` (`no-await-in-loop` — the COMMIT loop is order-contractual, so it needs
the CONTRIBUTING rule-5 line-scoped disable with a reason); and `:359` — a
**false positive of the repo's own rule**: `@blue/no-browser-globals-in-isomorphic`
flags the `history()` method because the name matches a browser global. The
rule must ignore member/property names (or the method renamed); with
`--deny-warnings` a rule false positive is a hard gate failure.

**GATE-2 (Block) — `pnpm format:check` fails on 67 files; the wave's files are among them.**
`[exec]` Spot-checked history: `packages/blue-core/src/formatter.ts` (last
touched by `95ea360e`, AD-20), `packages/blue-socket/tsconfig.json` (`5472171a`,
AD-22), `packages/blue-core/README.md` (`b24e26b4`), `docs/decisions/2026-09-15_AD21_*`,
`docs/plans/2026-09-15_WEBSOCKET_*` — i.e. the gate went red during this wave
and stayed red. `docs/plans/2026-09-16_STOMP.md` §6 lists `pnpm lint` +
`pnpm format:check` as the final verification, so either they were run scoped
(changed files only) or not at all.

**GATE-3 (Block, process) — the ADR/plan claim implementation that is uncommitted.**
`docs/decisions/2026-09-16_AD23_STOMP.md` documents the second wave (D7–D11)
as implemented and the guide describes the queue store seam, while the code
for both sits uncommitted (26 modified, 5 untracked files — incl.
`packages/blue-socket/src/message-store.ts` and
`packages/blue-orm-drizzle/src/libsql-queue-message-store.ts`). Anyone reading
`master` gets documentation for behavior the tree does not have.

### 2.2 STOMP correctness and specification conformance

**COR-1 (Must Fix) — `client-individual` ACK/NACK is cumulative; redelivery
obligations are silently dropped.** `[exec]` `stomp-broker.ts:952-958`
dequeues the whole delivered prefix up to the named message regardless of
`subscription.ack` (no mode branch). Reproduced: subscribe
`ack:client-individual`, publish `m-one`,`m-two` (`broker.unackedMessages`
2 → after ACKing **m-two** → **0**), then NACK `m-one` → **no redelivery**
(0 `redelivered:true` frames). STOMP 1.2 §1.4.1 (`client-individual` ACKs the
named message only; "an ACK/NACK for a subsequent message MUST NOT
acknowledge a previous one") `[spec]`; AD-23 D9 promises "removes exactly the
named message". Impact: two messages the client never processed lose their
retry path, and `maxUnacked` accounting under-reports.

**COR-2 (Must Fix) — a `/queue` subscriber can receive live traffic before —
and duplicated with — the backlog replay.** `[exec]` `stomp-broker.ts:700-717`:
the subscription is inserted into `#byDestination` _before_
`await this.#replayQueue(...)`. Reproduced with a store whose `replay` awaits
60 ms: a client subscribing to `/queue/q` (retained `old1`) while `live1` is
published received **`live1, old1, live1`**. AD-23 D11 requires backlog first,
then live traffic. The in-code claim "ordering is preserved" holds only for the
subscriber's own frame pipeline, not for cross-session publishes (which is the
realistic case: scheduler/HTTP/app `publish`).

**COR-3 (Must Fix) — CRLF frames are rejected; a conforming STOMP 1.2 client
cannot connect.** `[exec]` `parseStompFrame('SEND\r\ndestination:/t\r\n\r\nhi\0')`
throws `frame has no header terminator`. `stomp-frame.ts:267` looks for `\n\n`
only, and `parseHeaderBlock` (`:143-146`) treats any line containing `\r` as
malformed. STOMP 1.2's first incompatible change is "it is now possible to end
frame lines with carriage return plus line feed" (ABNF `EOL = [CR] LF`) `[spec]`.
Since the broker negotiates 1.2 and `host`/ERROR paths assume it, CRLF clients
get ERROR + close 1002 on their first frame.

**COR-4 (Must Fix) — MESSAGE carries no `ack` header and ACK/NACK demands a
`subscription` header, so spec-shaped acks fail closed.** `[code]`
`stomp-broker.ts:1098-1104` builds MESSAGE headers without `ack`;
`stomp-broker.ts:896` fails closed when `subscription` is absent. STOMP 1.2
requires the `ack` header on MESSAGE for `client`/`client-individual`
subscriptions ("used to relate the message to a subsequent ACK or NACK") and
defines ACK/NACK as REQUIRED `id` + OPTIONAL `transaction` `[spec]`. Impact:
third-party clients (Spring, STOMP.js) either have no id to ack with or are
closed out; the framework's own client always sends `subscription`, which is
why the e2e suite passes.

**COR-5 (Must Fix) — a missing `accept-version` is fatal instead of meaning 1.0.**
`[code]`+`[spec]` `stomp-broker.ts:599-603`: `offered` defaults to `['']`, no
mutual version → ERROR + close. STOMP 1.2 Protocol Negotiation: "If the
`accept-version` header is missing, it means that the client only supports
version 1.0 of the protocol." The `mutual !== '1.0'` host exemption in the
same method is unreachable today for exactly that reason.

**COR-6 (Must Fix) — undefined header escapes are accepted; the spec makes them
fatal.** `[code]`+`[spec]` `stomp-frame.ts:108-118` passes `\t`-style unknown
escapes through ("leniency toward never-escaping 1.0 clients"). STOMP 1.2
Value Encoding: "Undefined escape sequences such as `\t` MUST be treated as a
fatal protocol error." The leniency also lets two different wire encodings
decode to the same header value — the divergence class the codec's own
duplicate-header check was written to avoid.

**COR-7 (Must Fix) — user-defined SEND headers are dropped (MUST pass through);
the live and transactional paths disagree.** `[code]`+`[spec]`
`stomp-broker.ts:868-873` (`#sendHeaders`) forwards only `content-type` into
MESSAGE frames, while the live SEND path hands `#onMessage` the _full_ frame
headers (`:783`) and the COMMIT path hands it the _reduced_ set (`:1050`).
STOMP 1.2 SEND: "The user defined headers MUST be passed through in the
MESSAGE frame" — this is how selectors, tracing and app routing on MESSAGE
headers work in every broker.

**COR-8 (Should Fix) — a store-fault ERROR frame does not close the connection
(spec MUST), and the client/server postures disagree.** `[code]`+`[spec]`
`stomp-broker.ts:801-816` withholds the receipt, sends
`ERROR message:queue store unavailable`, and returns `true` ("the session
survives"). STOMP 1.2 ERROR: "The server MAY send ERROR frames … In this case
it MUST then close the connection just after sending the ERROR frame." Peers
that follow the spec (Spring/STOMP.js) tear the session down anyway, while
this broker keeps it live; and `StompClient` treats every ERROR as terminal
(`stomp-client.ts:556`), so framework client and framework server disagree
about the same frame.

**COR-9 (Must Fix) — `queueBacklog: 1` silently loses messages.** `[exec]`
`message-store.ts:169-190`: when the count guard fires and `#dropOldest`
empties the ring, `#dropOldest` (`:270-278`) **deletes the destination from
`#byDestination`**, and `append` then writes the new message into the now
detached ring. Reproduced: `append(a)`, `append(b)` → `replay('/queue/q')`
returns **`[]`** (and `has()` is false); `append(a,b,c)` retains only `c`.
Reachable from documented config (`new StompBroker({ queueBacklog: 1 })` is
passed straight through as `maxMessagesPerDestination`). Root cause is the
side effect inside a helper the caller keeps using — see HYG-2.

**COR-10 (Must Fix) — transaction ACK/NACK ops bypass the D7 caps.** `[exec]`
`stomp-broker.ts:906-912` pushes buffered ack ops with no
`maxTransactionOps`/`maxTransactionBytes` check (the SEND branch at `:762-774`
has both). Reproduced with `maxTransactionOps: 3`: five transactional ACK
frames produced no ERROR and no close. Impact: the documented per-session
memory bounds do not cover ack ops — unbounded per-session growth for the
life of a connection.

**COR-11 (Should Fix) — COMMIT can report success for a partially applied
transaction.** `[code]` `stomp-broker.ts:1012-1016` ignores the `false`
returned by `#sendToUserScope` (`:1049-1058`, which has already sent ERROR and
closed 1008), keeps applying the remaining ops, deletes the buffer and emits
the COMMIT receipt. Observed shape per the delegated review: `CONNECTED,
ERROR, RECEIPT:r` with the later ops delivered anyway.

**COR-12 (Must Fix) — `StompClient.send()` promises never settle after a
transport drop.** `[code]` `stomp-client.ts:234-248`: the `reconnecting`
branch settles receipts only when `reconnect === false`; with the default
`reconnect: true`, `#receipts` survives the gap and the new STOMP session can
never receipt the old ids. An `await send(...)` (or `Promise.all` over sends)
hangs forever — the exact failure mode `send()`'s docs promise to avoid.

**COR-13 (Should Fix) — headerless frames serialize with an extra LF, putting
a body on frames that MUST NOT have one.** `[code]` `stomp-frame.ts:362`
already terminates the header block, and both return paths append a second
`'\n'`. `serializeStompFrame({command:'DISCONNECT',headers:{},body:''})` →
`"DISCONNECT\n\n\n\0"`, which re-parses with body `"\n"`. `StompClient.disconnect()`
sends exactly that frame; STOMP 1.2: "Only SEND, MESSAGE and ERROR frames MAY
have a body" `[spec]`. Codec round-trip is broken on the public path.

**COR-14 (Should Fix) — repeated header entries are fatal; the spec says
first-wins.** `[code]`+`[spec]` `stomp-frame.ts:148-152` throws on duplicates.
STOMP 1.2 Repeated Header Entries: "only the first header entry SHOULD be used
… subsequent values … MAY be ignored" — the motivating case is a message that
traversed another broker that prepended/updated a header. Current behavior
drops the connection on legal store-and-forward traffic.

**COR-15 (Optional) — trailing EOLs after the terminating NUL are rejected.**
`[code]`+`[spec]` `stomp-frame.ts:233,249,296,309`: "The NULL octet can be
optionally followed by multiple EOLs." `…hi\0\n` therefore closes the
connection.

### 2.3 Security

**SEC-1 (Must Fix, critical availability) — the queue store retains one map
entry per client-chosen `/queue` destination forever.**
`[exec]`(grep)+`[code]` `message-store.ts:147,169-170,190`: `#seqs` is written
on every append to a new destination and **never deleted** — neither
`#dropOldest` (`:270`) nor `#evictDestinationsPastCap` (`:280`) touch it. A
SEND to `/queue/<name>` reaches `store.append` with a fully attacker-chosen
key and no length cap ([SEC-2]), so each frame permanently retains its
destination string; bodies are evicted by the byte caps, the _keys_ are not.
An unauthenticated peer (no auth is wired, SEC-3) can grow the process heap
~1:1 with wire bytes until OOM. `docs/guides/06-websockets.md:331` currently
claims the opposite ("A client cannot grow the server's memory by SENDing to
arbitrary `/queue/<name>` destinations") — the documentation must be corrected
in the same change (DOC-1).

**SEC-2 (Must Fix) — no length bounds on protocol identifiers.**
`[code]` `stomp-broker.ts:637-645,753` and `message-store.ts:297-300` accept
destinations/subscription ids/receipt ids/transaction ids of any length (only
`undefined`/empty are rejected); the only bound is the transport's 1 MiB
`maxPayload`. Combined with SEC-1 and the retained-subscription index, a peer
can pin megabytes of key strings. The codec is a public API too, so the bound
belongs in the broker (not only in `ws`).

**SEC-3 (Must Fix) — socket dispatch bypasses the interceptor chain: the auth
decorators are inert, and nothing wires the only real seam.**
`[code]` `node-http-server-adapter.ts:557` calls
`handlerMethod.call(target.instance, ...args)` directly — no
`RouteHandlerExecutionChain`, so `@authenticated`/`@authorized`
(`blue-auth-server/src/route-guard.ts`, metadata written by
`blue-auth-core/src/_decorators.ts`) never run for `@socketMapping`/
`@stompMapping` methods: fail-open by construction. The only upgrade-time seam
is `NodeHTTPServerAdapterOptions.authenticate` (`:527-545`), and no app in the
repo passes one (`node-auto-configuration.ts` builds `new HTTPServer()`;
`apps/blue-api/src/index.ts:49` starts it unchanged), and
`BLUE_SOCKET_ALLOWED_ORIGINS` is set nowhere. The AD-23 demo gate
(`/stomp/chat`) is therefore an open broker on the default config — the e2e
spec itself connects with no credentials.

**SEC-4 (Must Fix) — no destination authorization: any connected client can
read the retained backlog of any `/queue` and publish to any destination.**
`[code]` `stomp-broker.ts:636-660` (SUBSCRIBE binds any destination),
`:709-717` (a late `/queue` subscriber is handed the retained window), `:745-786`
(SEND publishes to any destination). The only policy hook, `onMessage`, is
synchronous, suppress-only — a suppressed SEND still gets a RECEIPT
(`:783-785`), so an application cannot express a denial — and is skipped for
live `/user/*` SENDs (`:777` routes before the hook) while the COMMIT path
calls it (`:1050`): the enforcement path depends on how the client framed the
send.

**SEC-5 (Should Fix) — unacked (`client`/`client-individual`) tracking is
count-bounded only.** `[code]` `stomp-broker.ts:1113-1123`: entries keep the
body by reference and only `maxUnacked` (default 1000) bounds them — no byte
bound, no per-session bound, and up to 1000 subscriptions per session
(`:657-660`). ~1 GiB of retained bodies per connection at the defaults is
reachable by a slow reader that never ACKs. The transaction path already has
the byte budget this path lacks (`maxTransactionBytes`).

**SEC-6 (Should Fix) — replay amplification has no per-session budget.**
`[code]` `stomp-broker.ts:709-717` re-materializes and re-sends the replay
window on **every** SUBSCRIBE; a session may hold 1000 subscriptions, and a
peer can seed the backlog itself, so one connection can force ~10⁶ MESSAGE
sends from its own traffic.

**SEC-7 (Should Fix) — CONNECT `login`/`passcode` are accepted and never
validated.** `[code]` `stomp-broker.ts:594-630` reads only `accept-version`
and `host`; `StompClient` has `login`/`passcode` options and sends them
(`stomp-client.ts:470-471`). A deployment that assumes broker credentials are
checked gets silent fail-open — worse than rejecting them.

**SEC-8 (Optional) — `__proto__` query keys mutate the parsed map's prototype.**
`[code]` `node-http-server-adapter.ts:296-307` (upgrade path) and `:660-670`
(HTTP path) accumulate repeated parameters with `if (key in query)` +
`query[key] = …` on a plain `{}`: for `?__proto__=a&__proto__=b`, `'__proto__' in
query` is true, so `existing` is `Object.prototype` and the assignment hits the
inherited setter, replacing the map's prototype. Object-local (not
`Object.prototype`) pollution of a trusted source handed to handlers and
argument resolvers. The codec already uses `Object.create(null)` for exactly
this reason.

**SEC-9 (Optional) — no connection cap, liveness refreshed by any byte, no
auth-hook timeout.** `[code]` `node-socket-session-registry.ts:221-222`
refreshes `#lastSeen` on any inbound message (a lone newline defeats idle
reaping), `register`/`#sessions` has no maximum, and
`node-http-server-adapter.ts:528-545` awaits `authenticate` with no timeout
while the session is deliberately unregistered (so the sweep cannot reap it).

**SEC-10 (FYI) — upgrade handshakes skip the adapter's header limits.**
`[code]` `#assertHeaderLimits` runs only in `handleRequest` (`:641`); the
upgrade path (`shouldHandle`, `:293-315`) parses query/headers/cookies without
it. Node's 16 KiB `maxHeaderSize` is the only bound today.

### 2.4 Client/runtime, store and telemetry

**RT-1 (Should Fix) — the CONNECT handshake is a 10 ms busy-poll.**
`[code]` `stomp-client.ts:483-495`: up to 10 000 `setTimeout` wakeups per
reconnect, on the client hot path. The socket already exposes signals —
resolve a promise from the `CONNECTED`/`ERROR`/status transitions instead
(one `Promise.withResolvers` per handshake).

**RT-2 (Should Fix) — `LibSQLQueueMessageStore` has no dispose seam.**
`[code]` `libsql-queue-message-store.ts:53-68` owns a libsql `Client` and
never exposes/`close()`s it; the broker holds the store for its lifetime, so
graceful shutdown leaks the DB handle and any in-flight writes.
`QueueMessageStore` should gain an optional `dispose()` consumed by the
broker/`gracefulShutdown`.

**RT-3 (Should Fix) — a failing replay is indistinguishable from an empty
queue.** `[code]` `stomp-broker.ts:#replayQueue` (`:377-392`) catches store
faults and returns `[]`, then SUBSCRIBE receipts success. For a _durable_
store that silently converts "backend down" into "no history" — the opposite
posture from the SEND path, which fails closed (COR-8). Pick one posture and
document it ([SEC-3]-adjacent): at minimum surface the fault to an observer.

**TEL-1 (Should Fix) — binary payloads are measured by JSON-encoding them.**
`[code]` `blue-telemetry-web/.../websocket-client.ts:146-149` and
`blue-telemetry-node/.../websocket-server.ts:193-196`: `payloadBytes` maps
non-strings through `JSON.stringify`, so an `ArrayBuffer` records **2 bytes**
(`'{}'`) and a 3-byte `Uint8Array` records 19; the web docblock claims
`SocketClient.send` parity, which sends those as binary frames
(`socket-client.ts:239-242`). Fix: branch on `ArrayBuffer`/`ArrayBuffer.isView`
before the JSON fallback.

**TEL-2 (Should Fix) — fan-out and send payloads are serialized twice.**
`[code]` the instrumentation stringifies to measure, then the registry
(`node-socket-session-registry.ts:264,282`) / client (`socket-client.ts:246-254`)
stringifies again. On `/topic` broadcasts of large payloads that doubles the
CPU/GC cost of the path the metric measures. Prefer an explicit observation
seam (the registry already has `addOverflowObserver` precedent) that reports
the size from the single serialization.

**TEL-3 (Optional) — `socket.room` is an unbounded metric attribute.**
`[code]` `blue-telemetry-node/.../websocket-server.ts:141-146`; rooms are
arbitrary app strings ("finer grouping" per the guide), so per-entity room
names mint unbounded series. Gate behind an opt-in or emit the bounded path
dimension `[agent]`.

**TEL-4 (Optional) — the client close counter misses a terminal close after a
drop.** `[agent]` status-guard in `blue-telemetry-web/.../websocket-client.ts`
counts a deliberate close only while `status === 'open'`. Low impact, wrong
number.

### 2.5 Documentation, hygiene, design smells

**DOC-1 (Must Fix, with SEC-1) — the guide's memory-bound claim is false.**
`docs/guides/06-websockets.md:331-332` (quoted in SEC-1).

**DOC-2 (Should Fix) — inbound overflow close code documented as 1009 in two
places.** `docs/guides/06-websockets.md:90` and
`packages/blue-platform-node/README.md:68` say the queue overflow closes
`1009`; the implementation closes `1013` (`node-socket-session.ts:195-215`) and
line 245 of the _same guide_ says 1013. The README table also omits the new
knobs `BLUE_SOCKET_MAX_QUEUED_BYTES`, `BLUE_SOCKET_MAX_BUFFERED_BYTES`,
`BLUE_SOCKET_ON_OVERFLOW`.

**DOC-3 (Should Fix) — AD-23 D1 dependency statement is stale.**
`docs/decisions/2026-09-16_AD23_STOMP.md` says the package dependency "stays
`@blue/signals` … no `@blue/util` dependency needed"; `packages/blue-socket/package.json`
now declares `@blue/core` (used by the ring-buffer-backed reader/queues). State
the real dependency set.

**DOC-4 (Optional) — AD-23 documents ack semantics the code does not
implement** (D9 "client-individual … removes exactly the named message" vs
COR-1), and D2's "answered-on-the-wire semantics" for `/queue` ordering vs
COR-2. Fix the code (preferred) and keep the ADR honest.

**HYG-1 (Block, process) — see GATE-3.** Commit the wave in reviewable slices
(codec+broker, store seam, libsql backend, transport bounds, telemetry, docs),
in that order, after Wave 1 + Wave 2 land.

**HYG-2 (Should Fix) — duplicated teardown and size logic.**
`[code]` `stomp-broker.ts:1261` (`#dropSession`) duplicates
`:1223` (`#removeSubscription`) almost verbatim (user-scope splice,
destination splice, empty-array deletion), and `materialOctets` is defined
twice (`stomp-broker.ts:1299`, `message-store.ts:29`). The COR-9 defect is the
same class of bug that duplication breeds: index mutation in two places with
different callers' assumptions. Have `#dropSession` iterate through
`#removeSubscription` and share one size helper.

**HYG-3 (Optional) — `#capacityFor()` mixes units.** `[code]`
`message-store.ts:287-295` returns `Math.min(countCap, byteCap)` — a byte
budget used as a ring-item capacity. Verified _not_ currently exploitable
(the `RingBuffer` power-of-2 floor is ≥ any reachable item count, and each
item is ≥ 1 byte), but it is misleading arithmetic that a future bound change
could turn into silent overwrite + `#bytes` drift. Express it as "capacity =
count bound, rounded up" with a comment, or drop the hint entirely.

**HYG-4 (FYI, no action) — `@blue/signals` appears in both `dependencies` and
`peerDependencies` of `packages/blue-socket/package.json`.** Re-checked
against the repo convention: `blue-dispatcher` declares `zod` the same way,
and the dependency-vs-peer split is used repo-wide to ship a default while
letting consumers align the instance. Not a defect; leave it.

**HYG-5 (FYI) — `@blue/dispatcher` now type-only re-exports `@blue/socket`
contracts** (`socket-session.ts`, `socket-session-registry.ts`, both 7 lines,
peer-dep declared). Deliberate per AD-22 D2; noted so the direction
(dispatcher → socket, type-only) is not "cleaned up" by accident.

---

## 3. Remediation plan

### Wave 1 — Unblock the gates (GATE-1, GATE-2)

1. **Zero-warning lint.** Fix the 4 source findings (`void`/await the floating
   promises in `stomp-broker.spec.ts` + the 3 other spec files; drop the two
   useless spreads in `stomp-broker.ts:474,850`; add the CONTRIBUTING-rule-5
   line-scoped `no-await-in-loop` disable with a reason on
   `stomp-broker.ts:1013`). Fix the `@blue/no-browser-globals-in-isomorphic`
   false positive in `packages/blue-oxlint-plugin` so member/property names are
   not treated as global references (add a rule test case with a `history()`
   method), or rename the broker method — rule fix preferred.
    - Acceptance: `pnpm lint` exits 0 repo-wide on the fixed tree.
    - Verify: run it; assert a deliberately introduced warning still fails.
2. **Format baseline.** `pnpm format` over the wave's files (or the whole
   failing set, 67 files) in one commit; keep `format:check` in CI.
    - Acceptance: `pnpm format:check` exits 0.
    - Verify: run it.

### Wave 2 — STOMP correctness and conformance (COR-1…COR-15)

Ordering inside the wave: codec first (COR-3/6/13/14/15 + their codec tests),
then broker semantics (COR-1, COR-2, COR-4, COR-5, COR-7, COR-9, COR-10,
COR-11), then client (COR-12), then the error-posture decision (COR-8).

3. **COR-3 CRLF:** accept `[CR] LF` in the terminator scan and strip one
   trailing CR per line before parsing (escaped `\r` stays untouched).
   Acceptance: CRLF and LF frames parse identically; a CR inside a header
   value still fails closed. Regression test: the CRLF probe case.
4. **COR-6 fatal escapes, COR-14 first-wins duplicates, COR-15 trailing EOLs:**
   throw on undefined escapes; keep the first occurrence of a repeated header;
   skip trailing EOLs after the NUL (still reject other trailing octets).
   Acceptance: the three probes produce parse/throw exactly as specified.
5. **COR-13 headerless serialization:** emit the blank-line LF once.
   Acceptance: `parse(serialize(f))` round-trips for headerless frames; the
   DISCONNECT frame on the wire has no body.
6. **COR-1 client-individual acks:** branch `#resolveAck` on
   `subscription.ack` — cumulative prefix drop for `client`, dequeue-and-
   re-`put`-all-but-target for `client-individual`; NACK redelivers the named
   message and nothing else.
   Acceptance: probe from COR-1 shows 2 → 1 outstanding after ACKing the
   newest, and NACK of the oldest redelivers it.
7. **COR-2 replay ordering:** keep the subscription out of `#byDestination`
   until the replay completes, and drop live frames already inside the
   replayed window (dedupe by store `seq`/`message-id`).
   Acceptance: the COR-2 probe yields `old1, live1` with no duplicate.
8. **COR-4 ack interop:** add `ack: <message-id>` to MESSAGEs on non-auto
   subscriptions; resolve the owning subscription from a session-scoped
   message-id index when the ACK/NACK `subscription` header is absent (keep
   requiring it to match when present).
   Acceptance: `ACK\nid:<id>\n\n\0` alone acks correctly; an ack for another
   session's message still fails closed.
9. **COR-5 version negotiation:** missing `accept-version` ⇒ offer `1.0`.
   Acceptance: a header-less-version CONNECT gets `CONNECTED version:1.0`.
10. **COR-7 header pass-through:** forward every SEND header except the
    framing set (`destination`, `transaction`, `receipt`, `content-length`) to
    both MESSAGE frames and `onMessage`, live and transactional.
    Acceptance: `x-trace-id` survives SEND → MESSAGE; the two paths produce
    identical MESSAGE headers for identical frames.
11. **COR-9 store bound eviction:** re-insert the ring after the count guard
    (or make `#dropOldest` non-destructive to the map). Acceptance: with
    `queueBacklog: 1`, `append(a); append(b)` → `replay` returns `[b]` and
    `has()` is true (regression test).
12. **COR-10 transaction ack caps:** apply the ops/bytes guard in `#ack`
    (count an ack op as one op). Acceptance: the COR-10 probe now gets ERROR +
    close.
13. **COR-11 COMMIT abort:** `#applyOp` returns success/failure; COMMIT stops
    applying and does not receipt when an op has failed closed.
14. **COR-12 client receipts:** settle all pending receipts (reject with
    `StompProtocolError('connection closed')`) on the `reconnecting`
    transition regardless of `reconnect`; a send issued during the gap still
    buffers and resolves on the new session. Acceptance: probe shows the
    promise rejects within the drop, not hangs.
15. **COR-8 error posture (decision D-A):** make the store-fault path
    spec-conformant — ERROR frame, then close (`1011`); the subscribe-replay
    path takes the same posture (`#replayQueue` returns a discriminated
    `ok`/`fault` result: SUBSCRIBE fails closed on `fault`, the read-only
    `history()` API stays documented-fail-open). `StompClient`'s ERROR
    handling already matches (terminal). Encode both in tests.

### Wave 3 — Security hardening (SEC-1…SEC-10)

16. **SEC-1 + SEC-2 bounds:** delete/evict `#seqs` wherever a destination is
    dropped (or replace it with an LRU capped by `maxDestinations`), and cap
    destination/id lengths in the broker (e.g. 1 KiB) with ERROR + close.
    Acceptance: appending to 10⁵ distinct destinations with
    `maxDestinations: 10` keeps retention flat; a 2 KiB destination is
    refused. Fix DOC-1 in the same change.
17. **SEC-3 socket auth (decision D-B):** in the socket dispatch path, read
    the handler's auth metadata (class + method `auth:required` / `auth:roles`
    — the `AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY` contract owned by
    `@blue/auth-core`) and fail closed with close `1008` when a principal is
    required and `session.attributes.principal` is absent or lacks a required
    role (`principal.hasRole`). Identity comes from the adapter's
    `authenticate` hook; `HTTPServer` additionally resolves an optional
    `socketRequestAuthenticator` context bean (mirroring the
    `socketSessionRegistry` pattern) so bean-based apps wire it without
    constructing the server. `apps/blue-api` supplies the reference
    authenticator (demo token → principal, published as
    `attributes.principal` + `attributes.user`) and marks the STOMP endpoint
    `@authenticated`; its e2e authenticates. Document the model in the
    platform README + guide ("HTTP interceptors do not run on sockets; auth is
    metadata-enforced at dispatch").
18. **SEC-4 destination authorization:** add an
    `authorize(destination, action: 'subscribe' | 'send', session)` seam
    (sync or promise), consulted uniformly on SUBSCRIBE (before replay) and on
    SEND in **both** the live and transactional paths, failing closed with
    ERROR + close `1008`. Keep `onMessage`'s existing suppress-and-receipt
    contract (it means "the app routed this itself") and document the
    distinction; fix the live/transactional divergence by consulting the hooks
    in one order in both paths. Acceptance: a denied SUBSCRIBE yields ERROR +
    close, a denied SEND yields no RECEIPT and no fan-out, and the same SEND
    is treated identically whether or not the client wrapped it in a
    transaction.
19. **SEC-5/SEC-6 bounds:** add `maxUnackedBytes` (per subscription) **and**
    `maxUnackedSessionBytes` (per session, evicting the globally oldest
    unacked delivery) — the per-subscription bound alone still permits
    `maxSubscriptionsPerSession × maxUnackedBytes` retention from one
    connection — plus `maxReplayBytesPerSession`, consumed by backlog replays
    (ERROR + close once exhausted). All FIFO/oldest-first eviction like the
    existing count guard, with the defaults stated in the option docs.
    Acceptance: a slow-acking subscriber evicts oldest at the byte bound; one
    session cannot exceed the session byte or replay budget by adding
    subscriptions.
20. **SEC-7 credentials:** `verifyCredentials?(login, passcode, session)` in
    `#connect` (ERROR + close 1008 on rejection), or reject CONNECT frames
    carrying credentials when no verifier is configured.
21. **SEC-8 null-prototype query maps** in both adapter paths; **SEC-9**
    `maxConnections` + auth-hook timeout (+ consider `verifyClient` so
    unauthenticated peers never complete the handshake); **SEC-10** run the
    header limits on the upgrade path.
22. **SEC document:** add a "socket auth model" section (or ADR) stating where
    identity comes from, what is enforced by default, and what an app MUST
    wire — the current gap is documented only in a code comment
    (`node-http-server-adapter.ts:523-527`).

### Wave 4 — Client, store, telemetry

23. **RT-1** replace the handshake poll with a resolver driven by the
    `CONNECTED`/`ERROR`/status transitions. Acceptance: handshake tests pass
    with no `setTimeout` loop; a stalled server still times out.
24. **RT-2** add an optional `dispose()` to `QueueMessageStore`, called by the
    broker's shutdown path; libsql closes its client.
25. **RT-3** surface replay failures (observer/`onError` seam) instead of
    silently replaying nothing.
26. **TEL-1/TEL-2** measure binary payloads by `byteLength` and stop
    serializing twice (observation seam); **TEL-3** gate the room attribute;
    **TEL-4** count the terminal close correctly. Acceptance: metric values
    for a 3-byte `Uint8Array` and an 8-byte `ArrayBuffer` equal 3 and 8 in the
    instrumentation specs.

### Wave 5 — Docs, duplication, commit hygiene

27. **HYG-2** collapse `#dropSession`/`#removeSubscription` and share
    `materialOctets`. **HYG-3/HYG-4** nits. **DOC-2** fix the 1009/1013 drift
    and document the new env knobs in `packages/blue-platform-node/README.md`.
    **DOC-3/DOC-4** update AD-23 (dependency set, ack/queue semantics) and the
    plan index (`docs/plans/README.md` entry for this plan; move the STOMP
    plan's status to reflect the open items).
28. **HYG-1/GATE-3** commit the tree in the slices above, each slice after its
    acceptance check passes, and refresh `graft build`.

### Wave 6 — Certification

29. Run the full ladder on a clean tree: `pnpm build`, `pnpm test`,
    `pnpm lint`, `pnpm format:check`, `pnpm audit --prod`,
    `pnpm manifest:check`, the scoped strict `tsc -b` lane, `pnpm doc`,
    `graft build`. All must exit 0 — GATE-1/GATE-2 make this the first time
    the wave's stated verification actually holds.
    - Add the four probe cases (COR-1, COR-2, COR-3, COR-9, COR-10) as
      permanent regression tests: each fails on the pre-fix commit and passes
      after, and each asserts observable protocol behavior (frames received,
      broker gauges), not implementation.
30. Re-run the security probes: unauthenticated upgrade, cross-user `/queue`
    read, distinct-destination flood (SEC-1), oversized destination (SEC-2).

---

## 4. Dependencies and sequencing

- **Implementation order (2026-09-17):** the per-file lint fixes of Wave 1
  ride with the slice that owns the file (they are the same lines Wave 2/3
  rewrites), so the effective order is: code slices (Waves 2–4) → repo-wide
  format pass + the `@blue/no-browser-globals-in-isomorphic` rule fix →
  `pnpm lint` / `format:check` green → docs (Wave 5) → commit slices → Wave 6
  certification. Wave 1 still gates the merge; it just stops being a separate
  first pass.
- Wave 2's codec changes land before the broker's ack/replay tests are
  meaningful (they exercise parse/serialize round-trips).
- Shared-file discipline: `stomp-broker.ts` has one owner; the store's
  `materialOctets` export is consumed by the broker in the same change set.
- COR-10/COR-11 touch the same `#applyOp`/cap code as SEC-5 (land together);
  COR-9 and SEC-1 are the same file/`#dropOldest` region (land together);
  DOC-1 must land with SEC-1, DOC-4 with COR-1/COR-2.
- SEC-3 (auth) is the only item that changes application-visible behavior of
  the demo app; it needs the platform README + guide note (and the decision
  recorded above) before implementation.
- HYG-1 (committing) is last in each slice, never first: the ADR/plan docs
  currently describe behavior the tree does not have, and the probes above
  should become the regression tests that travel with the fixes.

## 5. Non-goals

- No new STOMP features (a selector language, durable cross-node pub/sub,
  STOMP-over-TCP) — unchanged from AD-23 §Non-goals.
- No restyling/refactoring of untouched packages; the older audit items
  (`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`) are tracked separately.
- No metric/telemetry redesign beyond making existing counters correct.

## 6. Evidence trail

- Gate runs: repo-wide `oxlint --type-aware --deny-warnings .` (54 warnings,
  exit 1); `oxfmt --check .` (67 files, exit 1); `vitest run` per package;
  `tsc -b tsconfig.build.json` per changed package.
- Spec clauses quoted from
  <https://stomp.github.io/stomp-specification-1.2.html> — §1.2 Value Encoding
  (undefined escapes fatal), §1.2 Repeated Header Entries, §1.2 Size Limits,
  §1.2 Frames ("NULL octet can be optionally followed by multiple EOLs"),
  §1.5 ERROR ("MUST then close the connection"), §1.1 Protocol Negotiation
  (missing `accept-version` = 1.0), §2.1 SEND (user headers MUST pass
  through), changes list (CRLF), §1.4 ACK (`id` REQUIRED).
- Throwaway probes (deleted after use; each reproduced the stated observation
  once): `queueBacklog: 1` message loss, `client-individual` ack prefix drop +
  lost redelivery, transactional ACK cap bypass, `/queue` replay interleaving
  (`live1,old1,live1`), CRLF frame rejection.
- Delegated review passes (read-only) covered the protocol layer, the socket
  security surface, the store/ring-buffer diff, telemetry, and package seams;
  every finding kept here was re-checked against the cited lines above.

---

## 7. Outcome (2026-09-17, same day)

### 7.1 Gates — all green

| Gate                            | Before (§1)        | After                                                                                                                  |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                    | ✅                 | ✅ 32 projects                                                                                                         |
| `pnpm test`                     | ✅ (3 packages)    | ✅ 37 projects (full suite)                                                                                            |
| `pnpm lint` (`--deny-warnings`) | ❌ 54 warnings     | ✅ exit 0                                                                                                              |
| `pnpm format:check`             | ❌ 67 files        | ✅ exit 0                                                                                                              |
| Strict `tsc -b` lane            | (not run in §1)    | ✅ exit 0 (see COR-16)                                                                                                 |
| `pnpm manifest:check`           | —                  | ✅                                                                                                                     |
| `pnpm doc` (0 errors/warnings)  | (not run in §1)    | ✅ exit 0 (see DOC-5)                                                                                                  |
| `pnpm audit --prod`             | ❌ 1 high (GATE-4) | ✅ green — override `smol-toml: '>=1.7.1'` (`pnpm-workspace.yaml`, GHSA-7w5x-hrqm-74c2), lockfile re-resolved to 1.8.0 |

### 7.2 What landed

- **Codec (COR-3/6/13/14/15):** CRLF accepted (`EOL = [CR] LF`, mixed EOLs),
  undefined escapes fatal, first-wins repeated headers, trailing EOLs allowed
  after the NUL, headerless frames serialize with one blank line. 45 → 56
  codec tests.
- **Broker (COR-1/2/4/5/7/8/10/11 + SEC-2/4/5/6/7):** `client-individual`
  acks are exact (`#extractUnacked`); `/queue` subscriptions buffer live
  deliveries during the replay and dedupe by `message-id`; MESSAGE carries
  `ack`, ACK resolves by `id` through a per-session index; a missing
  `accept-version` negotiates 1.0; user headers pass through; store faults
  ERROR ⇒ close `1011` (both the SEND and replay paths); COMMIT aborts on a
  failed op; transactional ACK ops are capped; `maxIdentifierLength`,
  `authorize`, `verifyCredentials`, `maxUnackedBytes`,
  `maxUnackedSessionBytes`, `maxReplayBytesPerSession` added with documented
  defaults. 66 → 93 broker tests.
- **Store (COR-9, SEC-1, RT-2):** eviction no longer detaches an in-flight
  ring; `#seqs` is released with its destination and `stats` exposes
  `{ destinations, retainedBytes, seqEntries }`; `dispose?()` on the contract
    - libsql client close; the two backends now share the TTL boundary, the
      non-finite `limit` rule and destination validation. 13 + 11 store tests.
- **Client (COR-12, RT-1):** sent receipts settle on a reconnect drop (buffered
  ones still resolve on the new session); the CONNECT handshake is a deferred
    - one timer instead of a 10 ms poll. 25 → 33 client tests.
- **Platform/security (SEC-3/8/9/10, decision D-B):** `@authenticated` /
  `@authorized` metadata is enforced in the socket dispatch (close `1008`),
  identity via the `authenticate` hook or a new `socketRequestAuthenticator`
  context bean, `maxConnections` + `authenticateTimeoutMs` added, upgrade
  handshakes respect the header limits, query maps are null-prototype.
  `blue-api` wires the reference authenticator + `@authenticated` on its STOMP
  endpoint (e2e authenticates; `/ws/chat` stays the public contrast).
  19 → 33 websocket tests.
- **Telemetry (TEL-1/3/4 + TEL-2 by integration):** binary payloads measured
  by `byteLength`; the room attribute is opt-in (`roomAttribute`); the client
  close counter latches per session; fan-out metrics now read the registry's
  new `addFanoutObserver` event (payload serialized once — the double
  `JSON.stringify` is gone) and registry fan-out passes
  `Uint8Array`/`ArrayBuffer` through as binary frames like
  `SocketSession.send`.
- **Docs:** guide 06 (queue bounds + the corrected memory claim, ack
  semantics, resource caps, policy seams, spec conformance, socket
  authentication section, `1009`→`1013`), platform/telemetry/app READMEs,
  AD-23 D1 dependency statement. AD-23's D9/D11 claims are true again rather
  than softened.

### 7.3 Findings added during certification

**COR-16 (fixed) — the strict typecheck lane was red from the AD-19/20 wave.**
`apps/blue-todo/src/todo-context.ts:69` called `context.setMessageSource(...)`
on an `ApplicationContext`, but the AD-19 commit added that setter to
`ConfigurableApplicationContext`; `shell-composition.ts` imported two default
exports as named imports. Fixed by widening `ApplicationBuilder`'s context type
to `ConfigurableApplicationContext` (`packages/blue-boot/src/application-builder.ts`
— it already holds one; `Application.run()` returns that type) and using the
default imports. Lane now exits 0.

**DOC-5 (fixed) — `pnpm doc` failed on 7 unresolved cross-package links.** Six
were missing `externalSymbolLinkMappings` entries (added for
`NodeSocketSessionRegistry[.broadcastTo]`, `ACCEPT_LANGUAGE_ATTRIBUTE`,
`NavigatorLanguageResolver`, `ReconnectTrigger`, `WebSocketClient`,
`MessageSource`); the last was an unqualified `{@link MessageSource}` in
`blue-view-ejs`, now `{@link @blue/content!MessageSource}`.

**GATE-4 (fixed 2026-09-17) — `pnpm audit --prod` reported 1 high
advisory.** `smol-toml <= 1.7.0` (patched `>= 1.7.1`) via
`@nx/devkit → nx → smol-toml`, a dev-tool chain (`packages/blue-generators`),
untouched by the socket work. Fixed per the owner's decision with the repo's
existing security-overrides pattern: `pnpm-workspace.yaml` adds
`smol-toml: '>=1.7.1'` (GHSA-7w5x-hrqm-74c2); the lockfile re-resolved to
1.8.0 and the importer blocks were renormalized (they were also stale for
`packages/blue-socket`'s `ws`/`@types/ws` dev-deps removal and `@blue/core`
dependency — both part of the pre-existing uncommitted wave work). Audit,
build, all 37 test projects, lint, format, manifest and doc lanes pass with
the bump.

### 7.4 Verification

Each fix carries a regression test that fails on the pre-fix tree; the review's
throwaway probes (COR-1, COR-2, COR-3, COR-9, COR-10, SEC-1) were re-run
against the fixed tree as a final acceptance pass (5/5 pass, deleted after —
the permanent equivalents live in `stomp-broker.spec.ts`,
`stomp-frame.spec.ts`, `message-store.spec.ts`, `websocket.spec.ts` and
`apps/blue-api/test/stomp.spec.ts`).

**Commit state (HYG-1, executed 2026-09-17):** the tree is committed in 12
topical slices (core ring buffer → oxlint rule → socket STOMP → libsql store →
boot typecheck → platform-node auth/bounds → api demo gate → telemetry →
typedoc links → docs → smol-toml override → oxfmt baseline); the full gate
ladder passes on the committed tree and the working tree is clean. Where the
wave's uncommitted work and this remediation interleave in the same files
(socket, platform-node, telemetry), the slice is the coherent feature delta;
the pure-remediation items are their own commits. Also left for later:
re-running `graft build --deep` (meaning coverage 6050/6052 symbols — two files
failed to summarize; re-running resumes from cache).
