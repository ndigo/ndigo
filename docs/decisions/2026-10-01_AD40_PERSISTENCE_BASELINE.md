# AD-40: Persistence backend baseline

**Date:** 2026-10-01
**Status:** Accepted — Phases 0–3 implemented in the [shared persistence roadmap](../plans/2026-10-01_SHARED_PERSISTENCE_ROADMAP.md); Phase 3 completed 2026-10-03.

## Decisions

- Keep capability-owned contracts. No generic store superclass or universal storage package. Keep memory defaults; external backends require explicit configuration.
- Created clients are owned. Injected clients are borrowed unless ownership is explicitly transferred. `LibSQLQueueMessageStore({ client, ownsClient: true })` transfers ownership; disposal without it leaves the client usable by other adapters. Disposal is idempotent and makes the disposed adapter unusable. Stop/drain producers before disposing; disposal itself does not guarantee pending writes complete.
- Initialization failures must not become unhandled rejections merely because first use is delayed. Queue operations await the original initialization promise and still reject on schema failure. Backend faults are never empty history or automatic memory fallback.
- Queue ordering is per destination; LibSQL uses a global AUTOINCREMENT watermark with gaps and idempotent `(destination, message_id)` append. Its fixed `blue_queue_messages` table is a database-wide namespace: isolate applications by database/destination convention until an explicit namespace is designed. Existing schema creation remains unchanged; future session schema initialization must be explicit.
- Session adapters must preserve the current contract's effective expiry and remaining TTL on rotation, not resurrect unknown/expired sessions. SQL rotation must be atomic under contention. No auth contract changes in this phase.
- Redis selection: node-redis base package **`@redis/client`**, pinned **6.3.0** after verifying the registry at introduction. Node-only `@blue/redis` owns connection/configuration/lifecycle; `/cache` uses optional cache/factory capability peers and `/pubsub` uses the optional socket peer. Root exports do not load capability contracts. Support standalone Redis **7.2+** using core cache commands and PUBLISH/SUBSCRIBE/UNSUBSCRIBE; no modules, cluster guarantees or Redis 8.4-only CAS commands. Connection errors are observed; graceful close uses close rather than deprecated QUIT.
- **Phase 2 API prerequisite landed:** all `Cache` data operations are awaitable, including `size()`, and manager handle acquisition remains synchronous. All consumers migrated under [AD-39](2026-09-30_AD39_ASYNC_BY_DEFAULT.md), without stale local snapshots or a parallel `AsyncCache` interface. Redis serialization is restricted to JSON-value trees plus a tagged whole-entry undefined; memory still accepts arbitrary values. See the [cache guide](../guides/07-caching.md) for the backend-specific policy.
- Container destruction currently recognizes destroy/close, not arbitrary dispose. External adapter integration must explicitly bridge to the supported lifecycle and prove awaited shutdown; registering a dispose-only object is not proof of cleanup. STOMP store disposal remains owner-managed, not broker-managed.

## Evidence and limits

Historical RT-2 (no LibSQL dispose method) is already resolved. Phase 0 reproduces a different shared-client defect: disposing one queue adapter closes a client used by another. The regression now checks independent store usability, disposal rejection, and direct SQL access. File-backed close/reopen coverage replaces the former same-client test that misleadingly claimed restart durability. Failure coverage uses a real invalid schema and a closed real client.

Phase 1 adds `LibSQLSessionStore` in `@blue/orm-drizzle`, leaving the auth-core
contract and memory defaults unchanged. Its fixed `blue_sessions` table is
explicitly provisioned by `initialize()` (or the equivalent application-owned
migration), never automatically migrated or dropped. Like queues, the database
is the application/environment namespace. Session payloads contain only the
contract's principal id/name/roles, token version and issue timestamp, plus
absolute expiry; reads restore `DefaultPrincipal` methods and reject malformed
fields. Injected clients require the default `intMode: 'number'`.

Rotation uses strict persisted-row decoding followed by one parameterized
conditional `UPDATE ... WHERE session_id = ? AND expires_at > ? RETURNING
expires_at`. One contender wins; failed statements leave the old identity
intact, unknown/expired ids never resurrect, and refresh reports the original
absolute expiry. Interactive local LibSQL transactions detach their native
connection, causing subsequent `:memory:` client operations to open a fresh
database; the single-statement rotation avoids that connection-lifecycle trap.
Creation purges expired rows and enforces a configurable shared live-session
cap atomically (default 512). Instances sharing a database should use the same
cap and synchronized clocks.

`close()` bridges `dispose()` to the container's supported `Closeable` teardown.
The real-client lifecycle regression proves context shutdown closes a
transferred client exactly once and leaves borrowed clients usable. LibSQL close
is synchronous; callers stop/drain consumers first, with no promise of draining
in-flight store operations. Real file close/reopen, independent-client rotation
contention, expiry/purge, corrupt rows, invalid schema, closed clients and
SQL-trigger failures are covered. `CredentialsAuthAdapter` tests exercise
validate, remaining-expiry refresh and cross-client logout without a backend
mock. Parent verification observed 99 tests passing, auth-core and orm-drizzle
builds passing, and the real-file runtime smoke passing restart validation,
two-client rotation, refresh/logout and container close. No Redis or scheduler
adapter was introduced.

### Phase 3 — live cross-node fan-out contract

`SocketFanout` remains capability-owned in `@blue/socket`:
`subscribe(scope, callback): Promise<() => Promise<void>>` and
`publish(scope, { key, body, headers? }): Promise<void>`, for
`path | room | topic`, serialized `string | Uint8Array` bodies and optional
string-record headers. Publish completion means backend acceptance, not client
delivery. Consumers deliver locally once after acceptance; the transport excludes
its own subscriptions. Redis uses a random origin per transport to suppress echo,
not a general duplicate/retry ledger. Live at-most-once delivery has no replay,
reconnect, offline queue, global ordering or exactly-once guarantee.

`RedisSocketFanout` in `@blue/redis/pubsub` borrows a `RedisConnection` publisher
and creates its own subscriber from an explicit URL. Construction opens no
sockets. Await publisher `connect()`, fanout `connect()`, and consumer
`connect()` before serving: registry subscribes `path`/`room`, broker subscribes
`topic`. One consumer per scope per transport; additional consumers require
separate transports. Use `new HTTPServer(dispatcher, { socketRegistry: registry })`
for its default adapter, or pass the registry to a custom adapter directly.
No bean registration or external auto-configuration is implied.

Registry broadcasts are awaitable. Configured fanout failure rejects before
local delivery; inbound STOMP topic SEND fails with ERROR then `1011`, never
local-only fallback. Only `/topic/*` crosses brokers; `/queue/*`, `/user/*`,
room membership, socket ownership, MESSAGE/ACK IDs and store replay are local
or independently persisted. LibSQL queue persistence is not distributed queue
consumption or durable Pub/Sub.

Stop/drain producers and serving, then await registry/broker `close()` to
unsubscribe consumers, fanout `close()` to unsubscribe/close its owned subscriber,
and publisher `close()` by its owner before synchronous `context.close()`.
Use failure-safe cleanup during startup and shutdown. Consumer close does not
own transport/store close; fanout never closes its borrowed publisher. Close
is idempotent and faults remain observable. Replace/connect failed resources
explicitly rather than assuming reconnect.

Namespaces match `[A-Za-z0-9][A-Za-z0-9._-]{0,127}`; nodes agree namespace and
version-1 schema. Default `maxMessageBytes` is 1,048,576 bytes for the complete
UTF-8 JSON envelope, including base64 expansion and headers. Keys are 1–1024
characters; headers have at most 128 entries, names 1–1024 characters and string
values at most 8192 characters. Outbound invalid envelopes reject before I/O;
inbound malformed envelopes are dropped and exposed via `lastError`. Redis ACLs
and trusted network/TLS access protect channels; namespace is not authorization.

Parent verification observed 311 tests passing, socket/platform-node/Redis
builds and scoped type-aware lint/manifests green. Real two-node HTTP/WebSocket
smoke against Redis 7.2.16 reported `PHASE3_FANOUT_SMOKE_OK` with 13 PASS results
for origin/remote path/room text/binary, unknown-key isolation, STOMP topic
SEND/binary, node-local queues, closed-publisher rejection, inbound ERROR/1011
without fallback and idempotent closure. Proof program removed and server stopped.
No scheduler adapter was added. Phase 1's no-Redis statement above records that
earlier checkpoint, not the current completed inventory.

## Sources

- [Redis recommended Node client](https://redis.io/docs/latest/develop/clients/nodejs/)
- [node-redis base packages and lifecycle](https://github.com/redis/node-redis)
- [Supported Redis versions](https://github.com/redis/node-redis/blob/master/SUPPORTED_REDIS_VERSIONS.md)
- [Observed client release](https://registry.npmjs.org/@redis/client/latest)
