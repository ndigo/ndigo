# Code Review and Mitigation — 2026-09-29 (Post-AD-38 comprehensive sweep)

**Date:** 2026-09-29
**Scope:** Comprehensive read-only review of the full repo (35 `packages/blue-*`,
7 demo apps, root package/tooling), with focus on changes since the 2026-09-27
review — the AD-26..38 wave (`db80bbfe`..`b9d60e6f`): multipart, argument
binding, static files, config completion, ORM completion, telemetry, credentials
auth + sessions, TS-native layer, MediaType hardening, OpenAPI/management,
trusted proxy, and AD-38 DTO conversion (head of tree). Cross-cutting audits
(header reuse, duplication, naming, hygiene) covered the whole repo.
**Method:** Eleven parallel read-only review slices (10 code review + 1 dedicated
security reviewer + 1 cross-cutting reuse/duplication audit) plus integrator
re-verification: every Must Fix and the headline security/correctness claims
re-read at HEAD (SEC-1/SEC-2 verified line-by-line in this execution), and the
prior-plan known-open item FOLLOW-1 re-confirmed open at HEAD with root cause.
Prior remediation claims (2026-09-25/27/28 waves) spot-verified in-tree — all
present.
**Status:** Findings recorded; **Waves 1–6 EXECUTED 2026-09-29** (all items landed,
regression-tested, full-repo gates green — see §5 Outcome).
**Legend:** `[code]` established by reading cited lines · `[exec]` reproduced by
execution · `[inference]` reasoned from code without execution.

---

## 1. Findings (slice-local → global mapping in §2)

### 1.1 Security

**SEC-1 (Should Fix, escalated to Wave 1) — `__proto__` prototype pollution on
urlencoded and multipart field records.** `[code]` (integrator-verified at HEAD)
`packages/blue-platform-node/src/http-request-limits.ts:119-124` builds the
urlencoded body over `const value: Record<string, unknown> = {}` with
`if (key in value)` + bare `value[key]` writes; `packages/blue-platform-node/src/
multipart-file.ts:137-145` `NodeMultipartContext.setField` reads `this.fields[name]`
on `{}`. For a field named `__proto__`: `'__proto__' in value` is true and
`fields['__proto__']` resolves the inherited accessor — both take the
array-wrap branch and assign an **array** through the `__proto__` setter,
installing it as the record's `[[Prototype]]`. The parsed `NodeRequest.body`
(adapter merges multipart fields into it, `node-http-server-adapter.ts:864`)
then has a junk prototype: `body.hasOwnProperty`/`body.constructor` break
(TypeError → 500 in handlers), `for...in` enumerates array indices, and any
downstream deep-merge inherits attacker-influenced values. This is the exact
class SEC-8 fixed for query/upgrade params (null-prototype maps +
`Object.hasOwn`, `node-http-server-adapter.ts:425-443`) — the body paths were
missed. **Fix:** build both records over `Object.create(null)` and guard with
`Object.hasOwn`. **Verify:** `blue-platform-node` suite + new specs posting
`__proto__=x` urlencoded and as a multipart text field, asserting the body is
a plain (null-proto) record with an ordinary `__proto__` key.

**SEC-2 (Should Fix, escalated to Wave 1) — `FixedWindowRateLimiter`'s documented
memory bound is not enforced; distinct-key flood grows the map without limit and
makes every new key an O(n) sweep.** `[code]` (integrator-verified)
`packages/blue-platform-node/src/rate-limit.ts:88-103`: at `#maxEntries` the
`#sweep` deletes only **expired** buckets then the code **still inserts**.
A botnet flooding >10 000 distinct client IPs within one window (each key a live
bucket) makes the sweep a no-op → O(n) CPU per request and unbounded heap — the
rate limiter is itself the DoS amplifier. **Fix:** at cap with no expired
buckets, refuse insertion deterministically (evict oldest / fail closed), or
bound via LRU; keep insertion ~O(1). **Verify:** spec asserting map size ≤
`maxEntries` under distinct-key flood and that a no-op sweep still evicts.

**SEC-3 (Should Fix, escalated to Wave 1) — cookie bound violations surface as
generic 500s and run unguarded in the socket upgrade path.**
`[code]` `packages/blue-platform-node/src/cookie-parser.ts:39-44` throws
`RangeError` past 50 cookies / 4 KB values; reached from
`node-http-server-adapter.ts:865` (HTTP path — `#writeErrorResponse` maps only
`RequestLimitError`/`SyntaxError`/`URIError`, everything else → 500,
`:1063-1097`) and from the `shouldHandle` upgrade path (`:446`), where only
`#assertHeaderLimits` is in try/catch — the throw can escape the handshake and
depending on ws error handling surface as an uncaught exception (remote DoS).
Both inputs fit comfortably inside Node's 16 KiB total-header cap, so the 431
path never fires. **Fix:** re-classify as `RequestLimitError(431|400)` in the
adapter; wrap the upgrade-path cookie parse in the existing try/catch.
**Verify:** 51-cookie and 4 KB-cookie specs on both HTTP and upgrade paths.

**SEC-4 (Should Fix) — default CSP `connect-src` admits bare `ws:`/`wss:` —
any XSS can open exfiltration WebSockets to arbitrary origins.**
`[code]` `packages/blue-platform-node/src/security-headers-interceptor.ts:49`
`DEFAULT_CONNECT_SRC = ["'self'", 'ws:', 'wss:']` — default-on for every Node
app. Documented open item D1 (docs commit 153562e9) rather than fixed; CSP3
`'self'` already covers same-host `ws(s):`, so the widening only serves
non-co-located socket servers, which should opt in. **Fix:** default to
`'self'`; document the `wss://<ws-host>` override. **Verify:** header spec
asserts `connect-src 'self'` by default, opt-in override honored.

**SEC-5 (Should Fix) — schema-mode binding failure echoes raw resolved values,
including decrypted secrets.** `[code]` `packages/blue-boot/src/
configuration-properties.ts:290` `Cannot bind ${ctor.name} from schema
(${JSON.stringify(raw)})` — new AD-34 code; `raw` comes from
`environment.getProperty`, which applies the secret decryptor (AD-29), so a
wrong-typed schema key over a `{cipher:...}` value lands **plaintext** in the
boot failure exception/logs. Contradicts the repo's own SEC-11 redaction posture
(`property-resolver.ts:568-573` `#diagnosticValue`). **Fix:** echo
`Object.keys(raw).join(', ')` instead of values. **Verify:** boot spec binding
a ciphertext value to a mismatched schema type, asserting the failure message
contains no plaintext.

**SEC-6 (Should Fix) — JWT refresh TOCTOU allows concurrent replay of a rotated
refresh token.** `[code]` `packages/blue-auth-server/src/jwt-adapter.ts:304-311`:
`ver` check and `incrementTokenVersion` are separate awaits; a stolen token
replayed concurrently with the legitimate client passes the check on the same
stale snapshot twice — both refreshes succeed, both families stay valid.
Defeats the documented "reuse of a rotated-out refresh is rejected by
construction" guarantee (sequential-only). **Fix:** compare-and-swap primitive on
`UserStore` (`incrementTokenVersionIfCurrent(id, expected)` backed by a
conditional UPDATE, checking affected rows); reject when it returns null.
**Verify:** concurrent-refresh spec (Promise.all of two refreshes on one token).

**SEC-7 (Should Fix) — parameterless `MediaType` intern registry is unbounded —
DSG-1 only half-fixed.** `[code]` `packages/blue-core/src/media-type.ts:115-132`:
the 2026-09-28 remediation bounded only the _parameterized_ cache (FIFO 128).
`MediaType.for`/`parseAccept` feed attacker-controlled `type/subtype` pairs
(`Accept: a/1, a/2, ...`) into `typeRegistry` with no cap; the new comment's
"finite type/subtype space" rationale is wrong for user input, and the bounds
spec only exercises the parameterized path. **Fix:** bounded FIFO for
parse-originated parameterless expressions (constants stay process-lifetime via
`registered()`). **Verify:** spec interning 10k distinct `a/N` expressions,
asserting registry size caps.

**SEC-8 (Should Fix) — `CacheInterceptor` stores POST responses under `GET:<url>`
keys and ignores auth headers — cross-user cache hits.** `[code]`
`packages/blue-http/src/interceptors/cache-interceptor.ts:102-103`: recovers the
method from the `X-HTTP-Method` response header (a mock-harness convention real
servers never echo), so every 200 with a URL — POST included — is cached under
`GET:<url>`; key `:135-137` is `${method}:${url}` with no header component.
A later GET gets the POST body with no network call; an authenticated
`GET /api/me` cached for user A is served to user B. **Fix:** derive the method
from the request (thread it through preRequest), and either refuse to cache
credentialed requests or fold an Authorization/Cookie discriminator into the
key. **Verify:** GET-after-POST and user-A→user-B specs.

**SEC-9 (Optional) — CSRF double-submit token compared with `===`.**
`[code]` `packages/blue-platform-node/src/csrf-interceptor.ts:108` — use
`crypto.timingSafeEqual` with a length guard. Standard practice for bearer
secrets; SameSite=Lax already blocks the mainstream class.

**SEC-10 (Optional, known gap) — `StringTemplateView` interpolates model values
unescaped.** `[code]` `packages/blue-view/src/view.ts:335-345`; documented open
(`docs/migrations/Wave_3_Content_Negotiation_and_Template_View_Contract.md:41-44`).
At minimum warn in the TSDoc; preferably default-escape with a raw-slot opt-out
mirroring EJS.

### 1.2 Correctness

**COR-1 (Must Fix) — `parseModel` double-decodes HTML entities on the hydration
path, corrupting island models to null.** `[exec]` (proven end-to-end with a
jsdom innerHTML round-trip) `packages/blue-view/src/island-view.ts:38-47`
decodes `&quot;/&lt;/&gt;/&amp;` after `serializeModel` escaped once; the
browser's HTML parser already decodes attribute values, so
`hydrate.ts:43` `parseModel(live.getAttribute('data-blue-model'))` decodes a
second time. Model `{html:"<b>&amp; &lt;b&gt;</b>"}` hydrates to `null`; text
meant as literal `&lt;script&gt;` becomes live `<script>` content in the
hydrated DOM. Unit tests only cover the raw-string path, which is not the
production path. **Fix:** `JSON.parse` directly (the DOM delivers one-level-decoded
text); update the two unit tests to feed DOM-decoded input; add a regression
test through real markup. **Verify:** island/blue-view-webcomponent suites +
jsdom hydration check.

**COR-2 (Should Fix) — Accept-header negotiation parses only the first media
range and never honors q-values or client preference order.**
`[code]` `packages/blue-view/src/content-negotiation-view-resolver.ts:217-231`
(`hint.split(';')[0]`), selection at `:461-466`. Multi-range headers
(`application/json, text/plain, */*`) match nothing and the resolver serves the
first registered representation; `Accept: application/json;q=0.5, text/html;q=1`
serves JSON despite the client's HTML preference; no-candidate requests get the
default instead of 406. **Fix:** parse ranges (split ',', trim, q-sort stable)
before hinting; pick the first candidate matching the highest-priority range;
return null/406 when nothing matches. **Verify:** multi-range + q-value specs
in the view suite.

**COR-3 (Should Fix) — RadixTree greedy fallback records the live `params`
reference; backtracking leaks sibling params into the fallback match.**
`[code]` `packages/blue-core/src/radix-tree.ts:305,313,325,332,346`: with
`/u/{x}/a/**` + `/u/{x}/a/{p}/b` registered, `/u/9/a/42/zzz` matches `/**` with
`params = { x: '9', p: '42', rest: '42/zzz' }` — a phantom `p` the matched
pattern doesn't declare. Introduced with greedy backtracking (ac863b9e).
**Fix:** snapshot `{ ...params }` at every greedy record site. **Verify:**
radix-tree spec with the two-pattern overlap.

**COR-4 (Should Fix) — `HTTPHeader` write paths don't fold case and array-valued
Node records break `get()/has()` after the `HeaderRecord` widening.**
`[code]` `packages/blue-http/src/http-header.ts:76-85,99-135`: reads retry
`name.toLowerCase()`, but `setHeader`/`deleteHeader` use exact case
(`SET_COOKIE.delete(req.headers)` on a lowercased Node record silently no-ops;
`set()` creates a second key), and `getHeader` casts `string[]` → `string`, so
`has()` is false and `get()` returns an array for multi-value headers
(`set-cookie`) — the input `getJoined` claims to support. **Fix:** fold in the
tuple/record write paths; treat array values as present (`join(', ')` or a
non-undefined has-check). **Verify:** header-module spec with lowercased records
and `set-cookie` arrays.

**COR-5 (Should Fix) — `TimeoutInterceptor` shares one `#timeoutId` across
concurrent requests.** `[code]` `packages/blue-http/src/interceptors/
timeout-interceptor.ts:36,70,92-101`: whichever request settles first clears the
other's timer → the survivor can hang past its timeout; orphaned timers keep the
event loop alive. The only timeout specs are `describe.skip`'d
(`test/interceptors/timeout-interceptor.spec.ts:44-58`). **Fix:** per-request
timers (Map/WeakMap keyed by signal). **Verify:** enable two concurrent-request
specs; assert both timeouts fire.

**COR-6 (Should Fix) — `TimeoutInterceptor` mislabels every transport failure as
408, and the first-error-wins chain makes retry and timeout mutually exclusive
by ordering.** `[code]` `timeout-interceptor.ts:80-85` +
`http-execution-chain.ts:129-131`: DNS/TLS/CORS/TypeError failures become 408
(and retry spins on phantom statuses); `[Timeout, Retry]` swallows failures
before Retry runs, `[Retry, Timeout]` never produces the 408. **Fix:**
`postError` returns the 408 only for `AbortError`; let error-aware interceptors
fall through on `undefined` instead of first-wins-swallow. **Verify:** spec
for both orderings asserting DNS-failure propagation and retry-after-timeout.

**COR-7 (Should Fix) — `RetryInterceptor` re-issues retries without the request
body.** `[code]` `packages/blue-http/src/interceptors/retry-interceptor.ts:
117-137`: the retried request copies every init key except `body` — a POST retry
sends an empty payload to a create/update endpoint. **Fix:** rebuild from
`request.clone()` preserving the body stream. **Verify:** POST-with-body retry
spec asserting the retried request carries the payload.

**COR-8 (Should Fix) — `streamCall` yields inside `finally`, parking the
generator forever on consumer disposal; `reader.releaseLock()` and `span.end()`
never run.** `[exec]` `packages/blue-service/src/service-client.ts:144-161`:
`for await ... break` → `return()` resumes the generator, `parser.finish()`
yields inside the inner finally, generator never resumes — leaked OTel span and
held body reader per abandoned stream. **Fix:** collect finish events without
yielding in the finally; cancel the reader on early disposal. **Verify:** spec
with `iterator.return()` asserting reader cancelled + span ended.

**COR-9 (Should Fix) — `TransformInterceptor` rebuilds requests with only
method/headers/body, dropping signal, credentials, mode, redirect, cache,
integrity.** `[code]` `packages/blue-http/src/interceptors/transform-interceptor.
ts:53-60` — a slow POST is never aborted at its deadline and credentialed
requests degrade to defaults. **Fix:** `new Request(request, { body })`
forwarding the original. **Verify:** spec asserting the signal survives a
transform.

**COR-10 (Should Fix) — explicit HEAD mappings are shadowed by the HEAD→GET
fallback (registration-order dependent).** `[code]` `packages/blue-dispatcher/src/
http-method-condition.ts:79-82,93-100` + `radix-metadata-handler-mapping.ts:122`:
with `@requestMapping({method:'HEAD'})` and `@getMapping` both on `/x`, HEAD
requests tie at `compareTo 0` and the first-registered mapping wins — the GET
handler can run on every HEAD probe. RFC 9110 §9.3.2 requires the explicit HEAD
mapping to win. **Fix:** `compareTo` prefers exact HEAD over the GET fallback.
**Verify:** registration-order spec for both orders.

**COR-11 (Should Fix) — `asNumber`/`as*`/`withConversion` wrappers silently
no-op on the dispatcher's default resolvers.** `[code]`
`packages/blue-dispatcher/src/argument-resolver.ts:72-80` (base resolver runs
only the Zod `convert` hook; `convertType` is never consulted) — attribute and
matrix params on every platform, query/path on browser, receive raw strings
(`asNumber(matrixValue('size'))` → `'42'`). Only
`AbstractPlatformArgumentResolver` converts, so the same handler code behaves
differently per platform. **Fix:** thread a convert step (identity default)
through the shared named-value base pipeline. **Verify:** per-platform specs
for query/path/matrix/attribute.

**COR-12 (Should Fix) — `DrizzleEntityManager.persist` masks non-conflict INSERT
failures, silently discarding saves.** `[code]` `packages/blue-orm-drizzle/src/
drizzle-entity-manager.ts:71-83`: the upsert fallback treats _every_ INSERT error
as duplicate-row and retries as UPDATE; a UNIQUE violation on another column
held by a different row leaves the UPDATE matching zero rows — `save()` resolves,
nothing was written (silent data loss), `rowsAffected` never inspected.
**Fix:** rethrow the original error when the UPDATE affects zero rows (or use
`INSERT ... ON CONFLICT DO UPDATE`). **Verify:** duplicate-username and
conflicting-insert specs.

**COR-13 (Should Fix) — `CredentialsAuthAdapter.refresh` advertises a full TTL
while the session store preserves the remaining TTL.** `[code]`
`packages/blue-auth-server/src/credentials-auth-adapter.ts:117-124` returns
`expiresAt = issuedAt + sessionTtlMs`; `in-memory-session-store.ts:70-77`
rotates with `expiresAt - Date.now()`. A session refreshed at 29:59 of 30 min is
reported valid for another 30 minutes and expires ~1 s later — clients deriving
Max-Age/re-auth from `AuthResult.expiresAt` act on a lie. **Fix:** rotate/create
return the effective `expiresAt`; report it. **Verify:** refresh-near-expiry
spec asserting the reported expiry matches the store's.

**COR-14 (Should Fix) — graceful-shutdown drain timer is dead code; `close()`
hangs on open SSE/streaming connections.** `[code]` `packages/blue-platform-node/
src/node-http-server-adapter.ts:837-844`: `server.close(cb)` resolves only after
every connection ends, so the `closeAllConnections` deadline is scheduled
_after_ the wait it should bound — it always runs on an already-closed server.
With an open SSE stream, a slow download, or a stalled request, `close()` never
resolves. **Fix:** arm the timer before the await and race it against
`server.close()`. **Verify:** spec with an open SSE stream + short
`shutdownTimeoutMs`, asserting `close()` resolves within the deadline.

**COR-15 (Should Fix) — multipart `maxRequestSize` is double-counted; the
effective cap is ~half the configured value.** `[code]` `packages/blue-platform-node/
src/parse-multipart.ts:237-238,258,293,381`: the counting gate sees every body
byte once, then file chunks (`onByte`) and field values are counted again —
an all-file upload fails at ~half the cap while the Content-Length precheck
admits the full cap, so mid-stream 413s are the result. **Fix:** count each byte
once (gate alone is sufficient). **Verify:** all-file upload at 0.75×cap
succeeds, >cap fails.

**COR-16 (Should Fix) — multipart temp spill files and WriteStreams leak on
aborted/stalled uploads.** `[inference]` `parse-multipart.ts:403-410` (`ws.end()`
only on part `'end'`), `:332` (`cleanup()` only on busboy `'close'`), `:242-246`
(mid-part `bb.destroy(...)` skips `ws.end()`), adapter cleanup in `finally`
after resolve only; no `req.once('aborted')` wiring on the multipart path. A
client abort mid-upload never unlinks `blue-upload-*` or ends the fd.
**Fix:** mirror `#readBody`'s abort wiring; end the WriteStream on part
`'error'/'close'` too. **Verify:** abort-mid-upload spec asserting temp cleanup
(and fd count on POSIX).

**COR-17 (Should Fix) — `HostManager` activation discards `mountLazy`
rejections as unhandled promise rejections.** `[code]` `packages/blue-host/src/
host-manager.ts:132-138` `void this.mountLazy(...)`; `feature-context-mount-
manager.ts:203-207` rethrows the loader failure; the routing registry has
already marked the feature active. Browser `unhandledrejection`, Node crash
under `--unhandled-rejections=throw`, activation error invisible to the host's
metric channel. **Fix:** `.catch(...)` → report via the host's metrics/warn
sink. **Verify:** spec with a failing loader asserting a recorded activation
error and no unhandled rejection.

**COR-18 (Optional) — in-memory inverse-side relation fetch skips `@postLoad`
hooks.** `[code]` `packages/blue-orm/src/entity-manager.ts:213-222` vs the
owning side `:204-208` (goes through `find`). Run hooks on the inverse branch.

**COR-19 (Optional) — SPA fallback responses omit `Vary: Accept`.**
`[code]` `static-resource-handler.ts:206-224,250`: a shared cache can replay
the HTML fallback to clients that never accepted HTML. Add `Vary: Accept`.

**COR-20 (Optional) — `If-Range` is ignored on static range requests.**
`[code]` `static-resource-handler.ts:272-286`: RFC 7233 §3.2 — a stale
validator must yield a full 200, not a misaligned 206.

**COR-21 (Optional) — `EJSView` silently drops array/scalar models in favor of
the locale helpers.** `[code]` `packages/blue-view-ejs/src/ejs-view.ts:154-158`
— spread model first, or reject arrays explicitly.

**COR-22 (Optional) — package-generator template still emits the string
`exports` form, failing the manifest gate the 2026-09-28 fix enforced.**
`[code]` `packages/blue-generators/src/generators/package/files/package.json.
template:8` vs `scripts/check-manifests.mjs:79-80` — any generated package fails
CI and ships without a `types` condition. Fix to the `{ ".": { types, default } }`
shape.

**COR-23 (Optional) — `canConvert` disagrees with `convert`'s String fallback
under AD-38 source-aware lookup.** `[code]` `packages/blue-core/src/converter.ts:
355-356,367-369`: `canConvert(Number, Date)` is false while `convert(42, Date)`
succeeds; the dispatcher's `resolveTypeConverter` peeks the registry directly
and drops the fallback. Mirror the fallback or document exact-pair semantics.

**COR-24 (Optional) — `AbstractWebComponent.on()` registers duplicate DOM
listeners for a re-registered handler; `off()` can't remove the first.**
`[code]` `packages/blue-view-webcomponent/src/abstract-web-component.ts:176-184`
— guard with `typeMap.has(...)` before `addEventListener`.

**COR-25 (Optional) — `CryptoRequestIdCorrelation` reuses one id for the service
lifetime; concurrent requests share a correlation id.** `[code]`
`packages/blue-service/src/request-id-correlation.ts:33-48` +
`service.ts:434-437`. Generate per call (or per request context) instead of
lazy-once.

### 1.3 Design / architecture

**DSG-1 (Should Fix) — `configureBrowserTelemetry` with `useConsoleExporters:
false` silently disables OTLP export too.** `[code]` `packages/blue-telemetry-web/
src/browser-config.ts:45-53,61-68,74-79`: the OTLP exporter is only constructed
inside the console-enabled branch; `{ traceUrl, useConsoleExporters: false }`
exports nothing at all, contradicting the `traceUrl` doc. **Fix:** gate console
only when there is no OTLP target. **Verify:** browser-config spec asserting
OTLP processors exist with `false`.

**DSG-2 (Nit) — `MultipartFile.bytes()` returns an aliasing view of the parser's
buffer despite the documented copy-out contract.** `[code]`
`packages/blue-platform-node/src/multipart-file.ts:90-97` — return a real copy.

**ARC-1 (Optional) — root `@blue/js` package is a dead umbrella: commented-out
re-exports (`src/index.ts:6-8`), `exports` pointing at a never-built `lib/`, no
consumers anywhere.** `[code]` — either wire it (re-enable, build lib, consume)
or reduce the root package to workspace/dev-scripts carrier. Folds in
S-APPS-HYG-2.

### 1.4 Reuse

**REUSE-1 (Should Fix) — `StaticResourceHandler` reads five request headers via
raw lowercase literals despite the `@blue/http` dep.**
`[code]` `packages/blue-platform-node/src/static-resource-handler.ts:75,90,203,208,
272-273` (`if-none-match`, `if-modified-since`, `accept-encoding`, `accept`,
`range`) — the same file uses constants on the write side; all five constants
exist (`IF_NONE_MATCH`, `IF_MODIFIED_SINCE`, `ACCEPT_ENCODING`, `ACCEPT`,
`RANGE`). In-window file (AD-28) that the 2026-09-28 header remediation flew
past. **Verify:** repo grep for the five literals + platform-node suite.

**REUSE-2 (Should Fix) — blue-api reads `Authorization` via raw literals next
to the constant it already imports.**
`[code]` `apps/blue-api/src/node-app-configuration.ts:50` and
`apps/blue-api/src/secure-docs-configuration.ts:36` (the second inside the
remediation commit itself) → `HTTPHeaders.AUTHORIZATION.get(...)`.

**REUSE-3 (Should Fix) — blue-test reads headers via raw literals and has no
`@blue/http` dep.** `[code]` `packages/blue-test/src/mock-http.ts:249`
(`'content-type'`) and `request-builder.ts:139` (`'accept-language'`, added by
the remediation commit). Add the leaf dep (no cycle) and use
`CONTENT_TYPE.get`/`ACCEPT_LANGUAGE.get`; this also de-duplicates the
accept-language leaf with `node-http-server-adapter.ts:577` (DUP-2).

**REUSE-4 (Should Fix) — adapter writes `Location`/`Allow`/`WWW-Authenticate` via
raw literals though the constants exist.**
`[code]` `packages/blue-platform-node/src/node-http-server-adapter.ts:940,1010,
1028` → `HTTPHeaders.LOCATION/ALLOW/WWW_AUTHENTICATE`.

**REUSE-5 (Optional) — `blue-context` reads `etag` via a literal on Fetch
Headers.** `[code]` `packages/blue-context/src/remote-property-source.ts:303` —
spec-safe (Headers.get is case-insensitive); either adopt the constant with a
new dep or record as a documented no-dep exception.

**DUP-1 (Should Fix) — random-token generation implemented three times.**
`[code]` `packages/blue-auth-client/src/oidc-adapter.ts:188-196` (local
`randomToken`), `packages/blue-auth-server/src/in-memory-session-store.ts:60`,
`packages/blue-platform-node/src/csrf-interceptor.ts:120` — all
`randomBytes → base64url`. Add `randomToken(bytes)` to `@blue/util`; three call
sites. **Verify:** identical-byte behavior spec + three suites.

**MTC-1 (Optional) — `RouteDefinition.matches`, `PathRoute.matches`,
`RouteCondition.match` are Matchable-shaped but don't declare
`implements Matchable<T>`; the AD-37 precedent (`TrustedProxySet`) and
`MediaType` do.** `[code]` `packages/blue-router/src/route-definition.ts:68`,
`path-route.ts:317`, `packages/blue-dispatcher/src/route-condition.ts:119` —
additive, structural. Adds the matcher family a single name.

### 1.5 Naming

**NAME-1 (Should Fix) — `ScheduleRegistry` still uses a string-keyed bean
lookup; the AD-34 token rule can't catch it.**
`[code]` `packages/blue-scheduler/src/schedule-registry.ts:34,116-121`
(`TASK_SCHEDULER_BEAN = 'taskScheduler'` + `getValue(TASK_SCHEDULER_BEAN)`);
the `@blue/no-string-registry-lookup` lint only flags string _literals_, so an
identifier constant passes silently — the exact ADR-34 gap. **Fix:** export
`const TASK_SCHEDULER = new ContextToken<TaskScheduler>('taskScheduler')` (the
description matches the `@entry taskScheduler()` bean); optionally extend the
lint rule to constant references. **Verify:** schedulder suite + lint still 0.

**NAME-2 (Optional) — public API typo `getAllFileExtenstions`.**
`[code]` `packages/blue-view/src/content-negotiation-view-resolver.ts:51-66`
(+ implementations, guard, spec, generated docs). Mechanical rename in one
commit (breaking; schedule deliberately).

**NAME-3 (Nit) — `blue-management` token files use the pre-AD-34 singular
spelling** (`health-registry-token.ts`, `metric-aggregator-token.ts` vs the
`*-tokens.ts` convention) — rename on next touch.

### 1.6 Docs

**DOC-1 (Should Fix) — guide 14's create-handler example converts an entity
through a schema it cannot satisfy.** `[code]` `docs/guides/14-dto-conversion.md:
83` uses `noteResponseSchema` (requires `summary`) on an entity that has no
`summary`; the demo itself converts through `noteDtoSchema`
(`note-controller.ts:70`). Copy-paste → guaranteed ZodError 500 on every POST.
Fix the snippet to match the demo.

**DOC-2 (Should Fix) — blue-api README teaches the pre-AD-33 JWT model.**
`[code]` `apps/blue-api/README.md:3,5,22,37` ("JWT auth" → opaque session
tokens); endpoint table omits ~10 current endpoints. Refresh against
`apps/blue-api/src/index.ts:69-89` + guide 11.

**DOC-3 (Optional) — blue-island README ports 3001 vs the app's 3200.**
`[code]` `apps/blue-island/README.md:12-13` vs `src/index.ts:16`.

**DOC-4 (Nit) — blue-hello-node README claims "without a full boot" but the app
runs `ApplicationBuilder`.**
`[code]` `apps/blue-hello-node/README.md:17` vs `src/index.ts:10-23`.

**DOC-5 (Optional) — `fileValue()`/`requestPart()` cannot express a required
part; the documented missing-part semantics are unreachable.**
`[code]` `packages/blue-dispatcher/src/parameter-factories.ts:271-276,306-321`
(hardcoded `required: false`): missing uploads bind `undefined` → late TypeError
instead of the promised 400 `MissingParameterError`. Add an options bag and
thread `required` into the extractor.

**DOC-6 (Nit) — `parseSecretMarker` version-segment comment contradicts the
regex.** `[code]` `packages/blue-context/src/secret-cipher.ts:45,98`: "Only
digits qualify as the version segment" vs `/^[a-z][a-z0-9.]*$/` — a
`{cipher:1:payload}` marker folds `1:` into the payload instead of failing
loud. Align comment and fail-loud behavior.

### 1.7 Hygiene

**HYG-1 (Optional) — committed scratch files, build artifacts and `.DS_Store`s;
`archive/` tracked despite its `.gitignore` rule.**
`[exec]` `git ls-files`: `.scratch/dec.ts` + inputs + `.scratch/dist/*`;
root `src/index.js` + `src/index.d.ts.map` (ignored by `**/src/**/*.js` rules
yet tracked); `apps/blue-todo/.DS_Store` ×2, `archive/blue-domain/.DS_Store`;
16 `archive/blue-domain` files still tracked against the `archive` ignore.
**Fix:** `git rm` the artifacts; either `git rm -r --cached archive/` (finish
the ignore intent) or drop the ignore line.

**HYG-2 (Nit) — stale `lib/tokens.{js,d.ts}` survives the `tokens.ts →
context-tokens.ts` rename and ships in the tarball.**
`[exec]` `packages/blue-cache/lib/` — add `rm -rf lib` to `build:lib` or delete.

**HYG-3 (Nit/FYI) — console output in library code.** 20 pre-window sites
(`node-http-server-adapter.ts:781,812,1092`, `openapi-docs-controller.ts:67` —
the socket `console.log` at `:781` emits handler error text at info level,
log-noise/leak-adjacent) plus one new `console.error` in the boot failure path
(`packages/blue-boot/src/application.ts:417`, defensible — no logger exists at
that point; record the choice, route through a logging seam if one ships).

### 1.8 Performance

**PERF-1 (Optional) — offline retry queue is unbounded; queued promises never
settle while offline; fixed 3 s cadence with no backoff.**
`[code]` `packages/blue-platform-web/src/retry-on-offline-interceptor.ts:
72-80,100-110,145-169` — add a cap with a documented overflow policy and
per-entry backoff.

### 1.9 FOLLOW-1 (Should Fix, verified OPEN at HEAD — 4 slices concur)

**`@entry` factories on subclassed auto-configurations still register zero
beans.** `[code]` root cause at `packages/blue-context/src/configuration.ts:
293-304`: the decorator's `addInitializer` upgrades enumerability via
`getOwnPropertyDescriptor(instance, name) || getOwnPropertyDescriptor(Object
.getPrototypeOf(instance), name)` — for an inherited method both miss (the
descriptor lives on the base prototype, two levels up), so the initializer
silently does nothing and the parser's `for...in` (`:400`) never sees the bean.
Carried since 2026-09-28 (d9dba13f commit message) with the only workaround in
the demo (`apps/blue-api/src/secure-docs-configuration.ts:69-93` re-declares
three forwarding factories). **Fix:** walk the prototype chain
(`Object.getOwnPropertyDescriptors` per level) in the initializer, then delete
the demo workaround. **Verify:** new `blue-context` spec constructing a bare
subclass of a `@configuration` class with base-only `@entry` methods, asserting
all beans register; blue-api suite still green with the re-declarations removed.

---

## 2. Mapping (slice-local → global)

| Global | Slice ID(s)               | Global   | Slice ID(s)                                                  |
| ------ | ------------------------- | -------- | ------------------------------------------------------------ |
| SEC-1  | SecPlatformNode SEC-PP-1  | COR-14   | S-NODE-COR-1                                                 |
| SEC-2  | SecPlatformNode SEC-DOS-1 | COR-15   | S-NODE-COR-2                                                 |
| SEC-3  | SecPlatformNode SEC-ERR-1 | COR-16   | S-NODE-COR-3                                                 |
| SEC-4  | SecPlatformNode SEC-CSP-1 | COR-17   | S-SAT-COR-1                                                  |
| SEC-5  | S-CTX-SEC-1               | COR-18   | S-DATA-COR-3                                                 |
| SEC-6  | S-DATA-SEC-1              | COR-19   | S-NODE-COR-4                                                 |
| SEC-7  | S-CORE-SEC-2              | COR-20   | S-NODE-COR-5                                                 |
| SEC-8  | S-HTTP-SEC-05             | COR-21   | S-VIEW-COR-05                                                |
| SEC-9  | SecPlatformNode SEC-TIM-1 | COR-22   | S-SAT-COR-3                                                  |
| SEC-10 | S-VIEW-SEC-03             | COR-23   | S-CORE-DSG-3                                                 |
| COR-1  | S-VIEW-COR-01             | COR-24   | S-VIEW-HYG-04                                                |
| COR-2  | S-VIEW-COR-02             | COR-25   | S-HTTP-ARC-08                                                |
| COR-3  | S-CORE-COR-1              | DSG-1    | S-SAT-DSG-2                                                  |
| COR-4  | S-HTTP-COR-01             | DSG-2    | S-NODE-DSG-1                                                 |
| COR-5  | S-HTTP-COR-02             | ARC-1    | S-APPS-HYG-2                                                 |
| COR-6  | S-HTTP-COR-03             | REUSE-1  | S-XCUT-REUSE-01                                              |
| COR-7  | S-HTTP-COR-04             | REUSE-2  | S-XCUT-REUSE-02, S-APPS-REUSE-1                              |
| COR-8  | S-HTTP-COR-06             | REUSE-3  | S-XCUT-REUSE-03                                              |
| COR-9  | S-HTTP-COR-07             | REUSE-4  | SecPlatformNode SEC-REUSE-1                                  |
| COR-10 | S-DISP-COR-1              | REUSE-5  | S-XCUT-REUSE-04                                              |
| COR-11 | S-DISP-COR-2              | DUP-1    | S-XCUT-DUP-01                                                |
| COR-12 | S-DATA-COR-1              | DUP-2    | S-XCUT-DUP-02 (item 1)                                       |
| COR-13 | S-DATA-COR-2              | MTC-1    | S-XCUT-MTC-01                                                |
| NAME-1 | S-SAT-NAME-1              | NAME-2   | S-VIEW-NAME-06                                               |
| NAME-3 | S-XCUT-NM-01              | DOC-1    | S-APPS-DOC-1                                                 |
| DOC-2  | S-APPS-DOC-2              | DOC-3    | S-APPS-DOC-3                                                 |
| DOC-4  | S-APPS-DOC-4              | DOC-5    | S-DISP-DOC-1                                                 |
| DOC-6  | S-CTX-NIT-1               | HYG-1    | S-APPS-HYG-1                                                 |
| HYG-2  | S-SAT-HYG-4               | HYG-3    | S-XCUT-HYG-01, SecPlatformNode SEC-HYG-1                     |
| PERF-1 | S-WEB-PERF-1              | FOLLOW-1 | S-CTX-FOLLOW-1, S-NODE-ARC-1, S-XCUT-FOLLOW-01, S-APPS-ARC-1 |

---

## 3. Remediation plan

### Wave 1 — Must Fix + immediate security (run first)

1. **COR-1 — island model double-decode.** `parseModel` → direct `JSON.parse`;
   DOM-decoded unit tests + jsdom markup regression (model containing
   `&quot;`/`&amp;`/`&lt;` literals).
    - Verify: `blue-view` + `blue-view-webcomponent` suites.
2. **SEC-1 — `__proto__` pollution.** Null-prototype records +
   `Object.hasOwn` in `http-request-limits.ts` urlencoded path and
   `multipart-file.ts` `setField`.
    - Acceptance: urlencoded and multipart `__proto__` fields produce an
      ordinary key on a null-proto record; `JSON.parse` bodies still object.
    - Verify: `blue-platform-node` suite (+4 specs).
3. **SEC-2 — rate-limiter bound.** Refuse insertion (or LRU-evict) at
   `#maxEntries` when the sweep no-ops.
    - Acceptance: `consume` over ≥ maxEntries distinct keys keeps `size ≤
maxEntries`; insertion stays bounded-cost.
    - Verify: `blue-platform-node` rate-limit suite.
4. **SEC-3 — cookie bound classification.** Re-throw as
   `RequestLimitError(431/400)` from the adapter; wrap the upgrade-path
   `parseCookies` in the existing try/catch.
    - Verify: HTTP + upgrade specs with 51 cookies / oversized value.
5. **COR-14 — shutdown drain timer.** Arm before `server.close`, race.
    - Acceptance: `HTTPServer.close({ shutdownTimeoutMs: 200 })` resolves with
      an open SSE stream.
    - Verify: `blue-platform-node` lifecycle spec.
6. **COR-15 — multipart double-count.** Single count path (gate only).
    - Acceptance: 0.75×cap all-file upload succeeds; >cap → 413.
    - Verify: `blue-platform-node` multipart suite.
7. **COR-16 — multipart temp/stream leaks.** Abort wiring on `req.once
('aborted'|'close')` → destroy gate (cleanup runs); WriteStream ended on
   part `error`/`close` as well as `end`. (Re-verify the claim with a failing
   probe before/after.)
    - Verify: abort-mid-upload spec asserting temp dir empty; fd count on POSIX.

### Wave 2 — Security posture (Should Fix)

8. **SEC-4 — CSP default `connect-src 'self'`** (+ doc note for WS opt-in).
9. **SEC-5 — schema binding failure redaction** (key names, not values) +
   plaintext-leak regression spec.
10. **SEC-6 — refresh-token CAS** (`incrementTokenVersionIfCurrent` +
    concurrent-replay spec).
11. **SEC-7 — bounded parameterless MediaType intern** (+ spec over 10k
    distinct expressions).
12. **SEC-8 — cache interceptor method/auth keying** (method from request,
    credentialed requests uncacheable or keyed) + GET-after-POST and
    cross-user specs.
13. **SEC-9 (Optional) — CSRF `timingSafeEqual`** + length guard.

### Wave 3 — Correctness (Should Fix)

14. **COR-2** — Accept negotiation: full range parse, q-order, 406 on no
    match.
15. **COR-3** — radix greedy `params` snapshot (5 sites) + overlap spec.
16. **COR-4** — `HTTPHeader` write-path case folding + array-valued has/get +
    spec.
17. **COR-5** — per-request timeout timers; un-skip the timeout specs.
18. **COR-6** — timeout 408 only on `AbortError`; error-aware chain
    fall-through; both-orderings spec.
19. **COR-7** — retry from `request.clone()` preserving body + spec.
20. **COR-8** — no yield in `streamCall` finally; cancel on early disposal +
    spec.
21. **COR-9** — transform rebuild via `new Request(request, { body })` +
    signal spec.
22. **COR-10** — explicit HEAD beats GET fallback in `compareTo` + both-order
    specs.
23. **COR-11** — convertType through the shared named-value resolver +
    per-platform specs.
24. **COR-12** — persist: rethrow when fallback UPDATE affects 0 rows (or
    ON CONFLICT) + spec.
25. **COR-13** — refresh reports the store's effective `expiresAt` + spec.
26. **COR-17** — host activation error handling (`.catch` → metrics/warn) +
    spec.
27. **DSG-1** — `useConsoleExporters:false` with `traceUrl` still configures
    OTLP + spec.

### Wave 4 — Framework gap

28. **FOLLOW-1** — prototype-chain walk in the `@entry` initializer (or
    metadata-based discovery); delete the three forwarding factories in
    `SecureDocsConfiguration`; bare-subclass registration spec.
    - Verify: `blue-context` + `blue-api` suites.

### Wave 5 — Reuse and naming

29. **REUSE-1** — static handler five literal reads → constants (grep-verify
    residuals).
30. **REUSE-2** — blue-api `authorization` literals → `AUTHORIZATION.get`.
31. **REUSE-3** — blue-test: add `@blue/http` dep; `CONTENT_TYPE.get`/
    `ACCEPT_LANGUAGE.get` (folds DUP-2; delete the adapter/mock ad-hoc copy).
32. **REUSE-4** — adapter `Location`/`Allow`/`WWW-Authenticate` constants.
33. **DUP-1** — `randomToken(bytes)` in `@blue/util`; three call sites.
34. **NAME-1** — `TASK_SCHEDULER` ContextToken in blue-scheduler;
    (optional) lint extension for constant-referenced lookups.
35. **MTC-1, REUSE-5, NAME-2/3** — Matchable declarations; etag constant or
    documented exception; `getAllFileExtenstions` rename; management token
    files rename.

### Wave 6 — Docs, hygiene, optional backlog

36. **DOC-1** — guide 14 example → `noteDtoSchema` (matches controller).
37. **DOC-2** — blue-api README: opaque sessions + endpoint table refresh.
38. **DOC-3/DOC-4** — blue-island port 3200; blue-hello-node
    ApplicationBuilder wording.
39. **DOC-5** — `fileValue`/`requestPart` `required` option (threads to
    `MissingParameterError`).
40. **DOC-6** — `parseSecretMarker` comment/regex alignment + numeric-version
    fail-loud.
41. **HYG-1** — `git rm` `.scratch/`, root `src/index.js` +
    `src/index.d.ts.map`, `.DS_Store`s; resolve the `archive/` ignore
    contradiction (cached-rm or drop ignore line).
42. **HYG-2** — delete stale `lib/tokens.*` in blue-cache (or clean step).
43. **HYG-3 + ARC-1** — console policy note (`application.ts:417` recorded as
    intentional); @blue/js umbrella decision (wire or strip).
44. **PERF-1, SEC-10, COR-18..25, DSG-2** — optional backlog, each a
    one-shot change with a local spec/doc edit.

---

## 4. Verified clean (checked and sound)

- **AD-38 converter** (`converter.ts:363-364`, overloads, AD-38 spec block:
  identity/pick/transform/defaults/nested/coerce/arrays/fail-fast/canConvert/
  source-aware, error naming) — implementation matches contract; the
  cross-boundary consumers (`property-resolver.ts:605-618`,
  `argument-value-converter.ts:123-129`) keep String-source semantics.
- **Trusted proxy (AD-37):** IPv4 leading-zero rejection, IPv6 single-`::` +
  quad placement + group counts, CIDR exact bit semantics, fail-loud
  construction, rightmost-first trusted walk with peer fallback, empty
  allowlist = trust nobody; `remoteAddress` feeds rate limiting with a shared
  'unknown' fallback; 429 problem doc + `Retry-After`; denial finalizer never
  double-writes.
- **Request pipeline bounds:** 1 MiB body / 16 KiB cookie cap / 30s-10s-5s
  timeouts / 100 req per socket; `#readBody` enforces mid-stream; deterministic
  400/408/413/431/500 mapping, internals logged but never sent.
- **Socket surface:** header bound re-run on upgrade, connection cap after
  accepted upgrade, authenticate hook awaited under a 10 s unref'd timer
  (null → 1008, throw/timeout → 1011), Origin allowlist fail-closed,
  `@authenticated/@authorized` enforced on dispatch, bounded STOMP frames and
  per-session limits (1 MiB frames / 1024 msgs / 4 MiB inbound / 1 MiB
  outbound → 1013).
- **Static serving:** realpath containment with symlink checks on candidate
  and resolved path, MIME allowlist, size caps, raw undecoded paths, escaped
  listings, streamed (no whole-file buffering), nosniff on all successes,
  single-range + 416 correctness, problem-doc errors.
- **OpenAPI/docs:** asset-name allowlist gates every asset; lazy pinned peer
  (exact 5.33.0) with 500 problem doc on missing; title escaped, URL
  stringified; generation failure → 500 + server log, successes only memoized;
  private access condition so the spec never self-references.
- **Management:** `redactHealthErrors` default-on; guard seam scoped to
  `MANAGEMENT_PATHS`; wrapper never denies non-management routes.
- **Cookies/CSRF:** HttpOnly + SameSite=Lax + Path=/ + Secure defaults;
  `tokenBytes` validated 16-1024; mutating-methods-only enforcement; parser
  caps 50 entries / 4 KB values (only the throw _classification_ is open —
  SEC-3).
- **Multipart:** Content-Length pre-check before any byte, streaming gate for
  chunked, per-file/field/parts/fields limits, filename traversal rejected
  before FS touch, random 8-byte temp names (leak paths are COR-16).
- **AESGCMCipher:** 32-byte key enforced, fresh 96-bit nonce, key-path AAD,
  tag verified before plaintext, fail-loud everywhere.
- **Auth core:** scrypt cost caps + `timingSafeEqual` + loud unknown-scheme
  error; no `{noop}` fallthrough; dummy-hash timing equalization before any
  null/disabled check; single generic `InvalidCredentialsError`;
  `InMemorySessionStore` expiry-on-read + fixation-safe rotate + capacity
  sweep; `DrizzleMigrator` validates before SQL, journal-after-success,
  forward-only; `PageRequest` allowlist validated on both backends before any
  interpolation; OIDC PKCE/nonce/state fail-closed and the in-window header
  change (`CONTENT_LENGTH.get`) correct.
- **Views:** EJS `<%=` remains HTML-escaped (no escape override); island
  locale contract escaped with breakout test; CSV RFC 4180 quoting; JSON/Text/
  OctetStream branches consistent; `setCurrentRequest`/`clearCurrentRequest`
  bracketed with try/finally (no stale-request leak even on throw);
  hydrateIslands upgrades only registered elements; EJS template cache bounded
  (64) with documented reset.
- **Prior remediations re-verified in tree** (2026-09-25/27/28): header
  constants at the nine adopted sites, `RETRY_AFTER`, `ACCEPT_LANGUAGE`,
  NOSNIFF on statics, CSP on docs, guard hook scoping, CIDR/IPv6 grammar,
  doc-api finally, manifest gate — all present; no regression of COR-1..9 /
  SEC-1..4 / REUSE-1..7 found in this sweep (REUSE residual sites above are
  _new_ additions or missed sites, not regressions).

---

## 5. Outcome

Executed 2026-09-29 by eleven parallel slices (review) + 22 remediation agents
across three waves + integrator gates. All items landed with regression specs;
full-repo gates green at HEAD.

### Wave 1 — Must Fix + immediate security ✅

- **COR-1 (island model double-decode):** `parseModel` parses JSON directly —
  no entity-decode pass (the DOM already delivers one-level-decoded attribute
  text). Unit tests feed DOM-decoded input; jsdom end-to-end regression proves
  `&quot;/&amp;/&lt;` literals survive and a literal `&lt;script&gt;` stays
  inert. blue-view 106/106, blue-view-webcomponent 68/68.
- **SEC-1 (`__proto__` pollution):** urlencoded body record +
  `NodeMultipartContext.fields` built over `Object.create(null)` with
  `Object.hasOwn` guards. 5 new specs (urlencoded + multipart + repeated-key
  array accumulation + JSON body + HTTP round trip).
- **SEC-2 (rate-limiter bound):** at `#maxEntries` with no expired buckets the
  oldest live bucket is evicted deterministically — size never exceeds
  `maxEntries`, insertion ~O(1). 2 new specs including a distinct-key flood.
- **SEC-3 (cookie bounds):** adapter maps `parseCookies` RangeError →
  `RequestLimitError(431, 'headers_too_large')` on both HTTP and socket-upgrade
  paths (upgrade wring inside the `#assertHeaderLimits` try/catch); 3 new specs
  (HTTP 431 ×2, upgrade abort with `uncaughtExceptionMonitor`).
- **COR-14 (shutdown drain):** deadline armed before `server.close()` and raced
  against it; close() resolves within `shutdownTimeoutMs` with open SSE. New
  lifecycle spec.
- **COR-15 (multipart double-count):** the counting gate is the single byte
  counter; duplicate field/file additions removed. 0.75×cap succeeds, >cap 413.
- **COR-16 (multipart leaks):** `req.once('aborted'|'close')` wiring settles the
  parse so busboy `'close'` runs temp cleanup; spill WriteStreams ended on part
  `'error'/'close'` too. Spec verified failing pre-fix via `git stash`, passing
  post-fix; temp dir empty + POSIX fd released.

### Wave 2 — Security posture ✅

- **SEC-4 (CSP):** default `connect-src 'self'` (CSP3 covers same-host ws);
  D1 note + TSDoc updated to the opt-in `wss://<ws-host>` pattern; blue-api
  bootstrap spec assertion updated to the new default.
- **SEC-5 (boot redaction):** schema-mode bind failures expose key names only —
  no plaintext/ciphertext. New redaction spec.
- **SEC-6 (JWT refresh CAS):** `incrementTokenVersionIfCurrent(id, expected)`
  added to `UserStore` + in-memory impl; refresh rejects on CAS null.
  Concurrent-refresh spec: exactly one succeeds.
- **SEC-7 (MediaType intern):** parameterless parse-originated expressions
  intern into a bounded 256-entry FIFO; `registered()` entries stay
  process-lifetime; `registrySize` reports all tiers. 10k-flood spec (delta
  exactly 256).
- **SEC-8 (cache interceptor):** method derived from the request (never the
  `X-HTTP-Method` response header); only 200 GET/HEAD cached; credentialed
  requests never cached nor served. GET-after-POST and cross-user specs.
  _Consequence:_ apps/blue-views refresh test updated — a Bearer-token request
  now legitimately re-fetches (SEC-8 semantics documented in the spec).
- **SEC-9 (CSRF compare):** `timingSafeEqual` behind an explicit length guard;
  length-mismatch spec.

### Wave 3 — Correctness ✅

- **COR-2 (Accept negotiation):** full-range parse (`parseAccept`), stable
  q-value ordering (RFC 9110 §12.4.2), highest-priority match wins, `null`/406
  on no match. Multi-range + q-value + 406 specs; two strategy-level specs
  updated to the accepted-range contract.
- **COR-3 (radix greedy snapshot):** all 5 greedy record sites snapshot
  `{ ...params }`; 3 overlap specs (plan example, static-branch, wildcard).
- **COR-4 (header write folding + arrays):** tuple/record write paths fold case;
  array-valued records present for `get`/`has` (join), `getJoined` raw. 3 new
  specs.
- **COR-5 (per-request timeouts):** `Map<AbortSignal, timer>`; un-skipped both
  previously `describe.skip`'d timeout specs + concurrent-requests isolation
  spec.
- **COR-6 (408 only on abort):** `postError` returns 408 solely for
  `AbortError`; error-aware chain falls through on `undefined` (no
  first-wins-swallow). DNS-propagation + both-orderings specs.
- **COR-7 (retry keeps body):** `RequestAwareHTTPInterceptor` stores an
  undisturbed `request.clone()` per live request; retries rebuild from it with
  `body` + `duplex: 'half'` (plan's literal postError clone is impossible —
  `Request.clone()` throws on a disturbed stream; verified). POST 503→200 retry
  carries the payload.
- **COR-8 (streamCall):** no yields inside finally; early disposal cancels the
  reader; `span.end()` always runs. Consumer-break + trailing-event specs.
- **COR-9 (transform forwards init):** rebuild via `new Request(request, …)`
  preserving signal/credentials/mode/redirect/cache; GET/HEAD omit `body`
  (lint rule). Signal-survives-transform spec.
- **COR-10 (HEAD mapping wins):** `compareTo` prefers exact HEAD over the GET
  fallback; both registration orders spec'd.
- _*COR-11 (as*/withConversion):_* `convertValue` hook threaded through the
  shared named-value pipeline (identity default); matrix/attribute/query/path
  all convert on every platform. 7 new specs.
- **COR-12 (persist honesty):** fallback UPDATE `rowsAffected === 0` rethrows
  the original INSERT error. Duplicate-PK upsert + non-PK UNIQUE-violation
  specs (unique index created raw; `createTableStatements` emits no UNIQUE
  constraints from `@column` metadata — noted for ORM follow-up).
- **COR-13 (refresh TTL truth):** `SessionStore.rotate` returns `{ id,
expiresAt }`; adapter reports the store's effective expiry. Refresh-near-
  expiry ±5ms spec; blue-platform-node test stub updated for the contract.
- **COR-17 (host activation):** lazy activation rejects report via
  `onActivationError` sink + `metricRecorder` counter — no unhandled
  rejection. 2 specs.
- **DSG-1 (browser telemetry):** `useConsoleExporters:false` gates console
  only; `traceUrl` always configures OTLP. 3 exporter-gating specs.

### Wave 4 — Framework gap ✅

- **FOLLOW-1:** the `@entry` initializer walks the full prototype chain and
  defines the enumerable descriptor on the owning prototype. Two bare-subclass
  specs (base-declared entries register; subclass entries coexist, exactly
  once). The `SecureDocsConfiguration` forwarding workaround is **deleted**;
  blue-api 67/67 with inheritance-only registration.

### Wave 5 — Reuse and naming ✅

- **REUSE-1:** static-handler five literal reads → `IF_NONE_MATCH` /
  `IF_MODIFIED_SINCE` / `ACCEPT_ENCODING` / `ACCEPT` / `RANGE` constants.
- **REUSE-2:** blue-api `authorization` literals → `AUTHORIZATION.get` +
  `bearerToken` (both sites).
- **REUSE-3:** `@blue/http` dependency added to blue-test; `CONTENT_TYPE.get` /
  `ACCEPT_LANGUAGE.get` adopted (DUP-2 fold). Lockfile regenerated.
- **REUSE-4:** adapter `Allow`/`Location`/`WWW-Authenticate` → constants.
  (Integrator also folded the remaining socket-path `'accept-language'`
  literal at `node-http-server-adapter.ts:581`.)
- **REUSE-5:** documented no-dep exception comment (Fetch `Headers.get` is
  case-insensitive; no base-package dependency added).
- **DUP-1:** `randomToken(bytes)` added to @blue/util (`crypto/random-token`,
  RFC 4648 §5 unpadded base64url, fail-closed without Web Crypto); three call
  sites adopted (oidc adapter, in-memory session store, CSRF — csrf site by
  integrator, platform-node already depended on @blue/util).
- **NAME-1:** `TASK_SCHEDULER` ContextToken in blue-scheduler
  `context-tokens.ts`; `TASK_SCHEDULER_BEAN` kept as deprecated alias
  (documented public export). Oxlint rule extended to flag identifier-backed
  string lookups (lexical scope stack; conservative — tokens/aliases/shadowing
  never flagged; 10 new rule cases).
- **MTC-1:** `RouteCondition`/`RouteDefinition`/`PathRoute` declare
  `implements Matchable<…>` (typed-conformance specs).
- **NAME-3:** management token modules renamed to `*-tokens.ts`; no
  cross-package importers.
- **COR-23 (+ dispatcher ripple):** `canConvert` mirrors the String fallback;
  `resolveTypeConverter` resolves `getConverter(source, target) ??
getConverter(String, target)` so gated pairs convert (String-fallback spec).

### Wave 6 — Docs, hygiene, optional backlog ✅

- **DOC-1..4:** guide 14 example → `noteDtoSchema`; blue-api README
  JWT→opaque-session + full endpoint table (verified against route
  registrations); blue-island port 3200; blue-hello-node ApplicationBuilder
  wording.
- **DOC-5:** `fileValue`/`requestPart` accept `{ required?: boolean }`,
  threaded to the existing `MissingParameterError` 400 path (optional missing
  binds the extractor default `null`, matching pre-existing behavior).
- **DOC-6:** `parseSecretMarker` comment aligned with the regex; non-conforming
  version segments throw `FrameworkError` (fail-loud spec; letter-first parses).
- **HYG-1:** `.scratch/` (5 files incl. dist), 13 `.DS_Store` files, root
  `src/index.js` + `src/index.d.ts.map`, and all 16 `archive/blue-domain`
  files `git rm`'d (archived = untracked, matching the `.gitignore` intent);
  `.scratch/` added to `.gitignore`.
- **HYG-2:** stale `blue-cache/lib/tokens.*` deleted; build artifacts verified
  gone.
- **HYG-3:** `application.ts:417` boot console.error recorded as an intentional
  choice (no logger exists at that point); socket `console.log` remains a
  pre-window Nit.
- **PERF-1:** offline retry queue bounded (`queueCap` 100, fail-fast overflow
  rejects the newest with `FrameworkError`) + per-entry exponential backoff
  (`retryInterval × 2^attempt`, capped 30 s). 3 specs.
- **SEC-10:** `StringTemplateView` TSDoc carries the RAW-interpolation warning
  (rendering semantics untouched; document-only branch per plan).
- **COR-18:** inverse-side relation fetch runs `@postLoad` (parity spec).
- **COR-19:** SPA fallback emits `Vary: Accept` (extended value).
- **COR-20:** `If-Range` honored (matching ETag → 206, stale → full 200;
  HTTP-date fallback).
- **COR-21:** EJSView spreads array/scalar models before helpers (2 specs;
  no-data-loss variant per the item's own acceptance).
- **COR-22:** generator template emits the map-form `exports` with `types`;
  pinned generator spec updated.
- **COR-24:** `AbstractWebComponent.on()` dedupes DOM listeners (2 specs).
- **COR-25:** `Service.call` stamps a fresh correlation id per call
  (restored after); standalone `getCorrelationId`/`setCorrelationId` API
  unchanged; per-call specs added (plan's cited reuse-pin block did not exist —
  standalone behavior spec kept).
- **DSG-2:** `MultipartFile.bytes()` returns a true copy.
- **NAME-2:** `getAllFileExtenstions` → `getAllFileExtensions` (+ guard)
  repo-wide; generated doc pages refreshed via `pnpm doc:api`.
- **ARC-1:** deferred by decision (user): record only; re-evaluate if/when the
  umbrella returns — BlueJS is intentionally modular.

### Integration

- **Build:** `pnpm build` 34/34 (`tsc -b` per package). One fix required:
  orm-drizzle `rowsAffected === 0n || === 0` (number/bigint overlap) →
  `Number(...) === 0`.
- **Tests:** `pnpm test` — all 39 targets green (incl. @blue/todo, blue-island,
  blue-views; a blue-scheduler `@blue/factory` missing-dep link error was the
  cause of the first 3-app failure — `pnpm install --no-frozen-lockfile`
  regenerated importer entries). Suite totals include blue-platform-node
  471/471, blue-http 382/10-skip, blue-dispatcher 296/2-skip, blue-context 359,
  blue-core 328, blue-service 66, blue-util 110, blue-view 106.
- **Lint:** `oxlint --type-aware --deny-warnings .` — 0 findings (integrated
  fixes: 6 non-null assertions + 2 upper-case regexp constants in new specs,
  `smoke-core.ts` probe deleted, transform-interceptor GET-body lint).
- **Format:** `oxfmt --check .` — green repo-wide.
- **Manifest:** `check-manifests.mjs` — all conform.
- **Docs:** `doc-api.mjs` — 0 errors/0 warnings (3 link-mapping additions:
  `FrameworkError`, `Matchable`; `HeaderRecord` exported — it is a public
  signature type; `@warning` block tag replaced with inline markdown).
- **Graft:** structure rebuilt (`graft build --deep`).
- **Follow-ups recorded (not bugs, deliberate):**
    - `createTableStatements` emits no UNIQUE constraints from `@column`
      metadata (COR-12 spec constructs its unique index raw) — ORM follow-up.
    - `InMemorySessionStore.rotate` per-signal console exporters for
      metrics/logs remain console-only (no OTLP targets exist for those signals;
      documented on the config type).
    - Lint rule extension is conservative by design: computed lookups and
      name-typed constants remain out of scope (soundness over recall).
    - `@entry` metadata scan still keyed on `for...in` enumerability; prototype
      walk fixed the subclass case — a metadata-based rewrite stays a future
      option.

---

## References

- Prior reviews: `docs/plans/2026-09-25_CODE_REVIEW_AND_MITIGATION.md`,
  `docs/plans/2026-09-27_CODE_REVIEW_AND_MITIGATION.md`,
  `docs/plans/2026-09-28_CODE_REVIEW_AND_MITIGATION.md`
- ADRs: AD-26..38 (`docs/decisions/2026-09-2x_AD*.md`), AD-34
  (`2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md`), AD-38
  (`2026-09-29_AD38_DTO_MAPPING.md`)
- Plans: `2026-09-29_DTO_MAPPING.md`, `2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md`,
  `2026-09-26_AUTH_COMPLETION.md`, `2026-09-26_ORM_COMPLETION.md`
- Guides: 03 (config), 04 (i18n), 09 (argument binding), 11 (auth/sessions),
  13 (OpenAPI), 14 (DTO conversion)
