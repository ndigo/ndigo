# Code Review and Mitigation — 2026-09-28 (Wave 6 / AD-34 / AD-35-36 / AD-37)

**Date:** 2026-09-28
**Scope:** Recent changes only — every commit after the 2026-09-27 review
(`docs/plans/2026-09-27_CODE_REVIEW_AND_MITIGATION.md`, which covered the AD-30..33
wave): Wave 6 MediaType hardening + adoption (`3b8fe583`), AD-34 TypeScript-native
layer (`71ab5568`), AD-35/36 OpenAPI + management hardening (`1173cd93`), AD-37
trusted-proxy client IP (`55010b4e`), dependency normalization (`1a3b1f40`), oxfmt
sweep collateral (`69aa2eb6`, `5a4ae926`), and the doc-pipeline wave
(`71e2b239`..`819fe336`, incl. `check-manifests.mjs`/`import-scanner.mjs`/
`doc-api.mjs`). Untouched older subsystems are out of scope except where an audit
is explicitly cross-cutting (header reuse).

**Method:** Six parallel read-only review slices (security ×2, architecture,
design/correctness, cross-cutting reuse audit, tooling) plus integrator
re-verification of every Must Fix and the headline Should Fins at HEAD before
recording. Prior-wave remediation claims (2026-09-25/27) spot-verified in the tree
(RETRY_AFTER constant, case-folded header reads, queue-store eviction, socket
fail-closed auth — all present).

**Status:** Findings recorded; **Waves 1–2 executed 2026-09-28** (all items landed,
regression-tested, suites green — see §5 Outcome). Waves 3–5 remain open.
**Legend:** `[code]` established by reading cited lines · `[exec]` reproduced by
execution · `[spec]` quoted from a spec/standard.

---

## 1. Findings

Slice-local IDs are mapped to the global numbering below so each finding has one
stable reference: `SecTrustedProxy` = ST, `SecOpenapiMgmt` = SO,
`ArchAd34` = A34, `DesignWave6` = W6, `ReuseHeaders` = RH, `SmellScripts` = SS.

### 1.1 AD-37 — trusted proxy

**COR-1 (Must Fix) — CIDR masking is wrong for every non-octet-aligned prefix.**
`[code]` `trusted-proxy.ts:263-277`: `const fullBytes = prefix / 8` is float
division. `/25` gives 3.125, so the byte loop compares **four** full bytes
(`byte < 3.125` runs 0..3), and the partial-bit check then reads
`network[3.125]` → `undefined`; `undefined & mask === 0 === 0` makes the
intended 1-bit mask a no-op. Every prefix not divisible by 8 silently acts as
the next octet boundary (`/25 ≡ /32`, `/9 ≡ /16`, `/1 ≡ /8`; IPv6 `/33 ≡ /48`).
Fail-closed in direction (never widens a trust range) but the headline CIDR
feature is silently inert for common subnets such as `10.0.0.0/25`: such
proxies are never trusted, XFF stays ignored, and the rate limiter collapses
all clients behind those proxies into one bucket — exactly the failure AD-37
set out to fix. The boundary spec (`test/trusted-proxy.spec.ts:40-50`) only
exercises byte-aligned prefixes (`/8`, `/32`, `/8`), so it ships green.
**Fix:** `const fullBytes = prefix >> 3`; add boundary tests for `/1`, `/7`,
`/9`, `/25`, `/31` and IPv6 `/33`, `/97` (in-range and just-out-of-range).

**COR-2 (Should Fix) — `parseIPv6` accepts non-RFC-4291 spellings, breaking
the fail-loud contract.** `[code]` `trusted-proxy.ts:141-224`: a dotted-quad is
accepted in any group (no enforcement that a v4 tail occupies only the last two
16-bit slots), and empty groups from splitting (`1:::2` → `['','2']`) parse as
zero (`parseIPv6Group('')` returns `[0]`). So operator typos like
`192.168.0.1::` or `2001:db8:::1` are silently accepted trust entries that
match nothing real — the silent-narrowing hazard AD-37 D-1 explicitly forbids.
**Fix:** reject empty groups; require any dotted-quad to be the final group;
add spec cases for both.

**DOC-1 (Should Fix) — stale "X-Forwarded-For deliberately not consulted"
claim in shipped docs.** `[code]` `rate-limit-interceptor.ts:53-58` (class JSDoc,
feeds API docs) and `docs/guides/11-authentication-and-sessions.md:116-119`
(§5) still describe the pre-AD-37 deferral; the interceptor keys on
`request.remoteAddress`, which the adapter resolves through `TrustedProxySet`
(`node-http-server-adapter.ts:870-874`). Contradicts `node-request.ts:35` and
guide 11 §9. **Fix:** align both texts with the shipped behavior.

**COV-1 (Optional) — spec gaps that shipped COR-1/COR-2 green.**
`test/trusted-proxy.spec.ts`: no non-octet-aligned prefix, no mid-chain empty
entries (`203.0.113.7,,10.0.0.3`), no uppercase-hex IPv6 equivalence pin, no
malformed IPv6 spellings. Fold the fix-specific cases into the COR-1/COR-2
fixes.

### 1.2 AD-35/36 — OpenAPI + management hardening

**SEC-1 (Must Fix) — the documented `accessGuard` is inert; endpoints remain
anonymous.** `[code]` `openapi-docs-auto-configuration.ts:113-116` and
`management-auto-configuration.ts:147-151`: the scoped wrappers call
`guard.preHandle(route, undefined)` — the real handler is discarded.
`AuthRouteGuard.preHandle` (`route-guard.ts:74-92`) derives every requirement
from handler metadata; `handler === undefined` ⇒ `requiresAuth=false`,
`requiredRoles=[]` ⇒ `return true` at `route-guard.ts:89-91` (verified at
HEAD). Even with the real handler, `/v3/api-docs`, `/health`, `/metrics`
handlers carry no `@authenticated` metadata, so a metadata-driven guard can
never protect them. Guide 13 and the option JSDoc tell operators to "wire e.g.
the auth-server's AuthRouteGuard" — they get zero protection. The management
guard spec passes only because its `denyAll` test guard ignores the handler.
**Fix:** forward the real handler; document (guide 13 + JSDoc) that only
unconditional guards (token-presence / token-adapter style) are effective for
these routes; add a regression spec wiring `AuthRouteGuard` and asserting
401/403 on `/v3/api-docs` and `/health`.

**SEC-2 (Should Fix) — docs endpoints bypass the default security headers;
the interceptor's "every HTTP response" contract is false.**
`[code]` Only the winning mapping's interceptors run
(`route-handler-mapping-strategy.ts:74-82`), and the docs mapping carries only
the (inert) access guard — the default-on `SecurityHeadersInterceptor`
(`node-auto-configuration.ts:85-89`, contract at
`security-headers-interceptor.ts:50-63`) never sees `/v3/api-docs`,
`/swagger-ui/*` or the assets. The Swagger UI page's inline bootstrap executes
only because no CSP arrives; the served `swagger-ui-bundle.js` has no
nosniff. `X-Content-Type-Options` also never reaches **any** static response:
`static-resource-resolver.ts:99-100` defines `NOSNIFF_HEADER` but nothing
emits it (`static-resource-handler.ts:231-234` omits it from success headers).
**Fix:** attach a `SecurityHeadersInterceptor` to the docs mapping (CSP
configured for the UI's inline script — nonce or external asset), emit
`NOSNIFF_HEADER` in static success headers, assert CSP presence on
`/swagger-ui/` in the integration spec.

**SEC-3 (Should Fix) — `swagger-ui-dist` floats on `^5.33.0` with no
integrity; served bundle is same-origin executable JS.**
`[code]` peer range `packages/ndigo-platform-node/package.json:78-80` (+ app
dep) allows silent 5.x drift of the bundle served at `/swagger-ui/` with no
SRI/CSP/nosniff (SEC-2). Lockfile resolves 5.33.0 with `@scarf/scarf@1.4.0`
(install-time machine-fingerprinting telemetry) in the dep graph. The
controller resolves the peer via `createRequire` **at construction**
(`swagger-ui-controller.ts:90-94`), so a missing peer hard-fails boot of the
whole docs auto-configuration. **Fix:** pin an exact version in both
manifests; document the served-bundle integrity decision; make resolution
lazy/guarded so a missing peer fails only the docs endpoint.

**SEC-4 (Should Fix) — anonymous spec discloses the full route table of
in-handler-protected endpoints.** `[code]` `spec.ts:183-185` excludes only
`accessCondition === 'private'` and `@apiDocs({hidden:true})`; routes
protected merely in-handler (`/api/config/secrets`, `/notes`,
`/drizzle/notes` — no accessCondition) are emitted with their
`authorization` header parameters (`spec.ts:277-298`,
`locationOf`/`parameterOf`). Documented default-open posture, but the demo
registers the docs with no guard at all (`apps/ndigo-api/src/index.ts:29-36`)
and guide 13 does not call out the disclosure. **Fix:** wire a guard in the
demo, add an explicit guide-13 disclosure note, and recommend
`@apiDocs({hidden:true})` for sensitive endpoints.

**COR-3 (Should Fix) — management/docs guard wrappers scope only
`preHandle`.** `[code]` `management-auto-configuration.ts:149-156`: `postHandle`/
`completeHandle` forward to the user guard for **every** route the shared
mapping dispatches (only `preHandle` path-gates). `AuthRouteGuard`'s
post-hooks are no-ops today, which masks the hazard; another guard with
post-handle side effects (header injection, error capture) applies
repository-wide. `openapi-docs-auto-configuration.ts:117-119` has the same
shape and is safe only by accident of its three-route mapping. **Fix:** scope
all three hooks on the route check; add a spec proving non-management routes
are untouched.

**COR-4 (Should Fix) — spec generation has no failure path.**
`[code]` `openapi-docs-controller.ts:66-70`: `generate()` runs zod's
`toJSONSchema` unguarded (`spec.ts:94-100`) and memoizes only after success;
a dev-supplied non-serializable schema (cyclic `z.lazy`, `z.custom` payload)
turns the first `/v3/api-docs` request into a 500, repeated per request.
**Fix:** wrap generation, emit a problem+json error, or validate schemas at
configuration time.

**DOC-2 (Should Fix) — `accessCondition('private')` is documentation-only
in live dispatch.** `[code]` Guide 13 §2 says docs endpoints "mark themselves
hidden" (`docs/guides/13-openapi-and-api-docs.md:92-94`); the implementation
uses the `private` access condition as an OpenAPI-exclusion marker
(`openapi-docs-auto-configuration.ts:126-129,148-151`), and the radix fast
path never evaluates access conditions (`radix-metadata-handler-mapping.ts:
75-99`) while `route-mapping-info-model.ts:137-141` and
`access-control-condition.ts:29-33` claim dispatcher enforcement. **Fix:**
align guide 13 with the marker semantics and put one authoritative statement
in the dispatcher docs that dispatch never enforces access conditions.

### 1.3 Wave 6 — MediaType hardening

**COR-5 (Should Fix) — "round-trip safe" parameter quoting is broken for
`;` and `"`.** `[code]` `media-type.ts:68`: `stringifyParameters` quotes
values containing separators, escaping `"` as `\"` without escaping
backslashes; the parser splits on `;` **before** unquoting
(`media-type.ts:155,171-173`) and unquoting strips only outer quotes with no
unescape. `[exec]` `MediaType.for('text/html','x',{v:'a;b'})` serializes to
`text/html/x;v="a;b"` and re-parses as `{v:'"a'}` — value corrupted.
Reachable today via multipart-boundary/session-style parameters. **Fix:**
scan parameters quote-aware (split on `;` outside quoted strings) and
unescape `\"`/`\\` in `unquote`; add registry round-trip tests for `;`, `"`,
`\`.

**DSG-1 (Should Fix) — `typeRegistry` interns unboundedly on
attacker-controlled header values.** `[code]` `media-type.ts:36`: bare `Map`,
keyed on the full serialized expression including parameters, never evicted.
`MediaType.for()`/`parseAccept()` run on attacker-supplied `Accept`/
`Content-Type` values on every request path (node-dispatcher,
content-type-header, http-request-limits, static-resource-handler,
transform-interceptor). `[exec]` every unique parameter set/value retains an
instance for process lifetime; parameter order also diverges
(`text/html;charset=utf-8;x=1` vs `;x=1;charset=utf-8` are distinct keys and
`compareTo`-unequal — a second bug inside the same line). **Fix:** intern
only parameterless expressions and/or cap the registry (per-parse params,
LRU), and canonicalize parameter order before keying.

**DSG-2 (Should Fix) — the component form `MediaType.for(type, subtype,
params)` bypasses normalization, contradicting the convergence contract.**
`[code]` `media-type.ts:281`: the three-arg path keys and constructs on raw
arguments. `[exec]` `MediaType.for('Text','HTML')` yields a `Text/HTML`
instance `===`-distinct from interned `text/html`, and
`MediaType.for('application','Problem+JSON').isJSON === false` while the
string path is JSON. Nothing in-repo breaks (constants are lowercase), but
the public API silently fabricates case-sensitive duplicates with wrong
`isJSON`. **Fix:** fold type/subtype and parameter names in the component
path before keying.

**COR-6 (Optional) — garbage expressions are interned, not rejected.**
`[code]` `media-type.ts:288-293`: any expression without `/` (or with an
empty type) becomes a "type-only, wildcard subtype" instance —
`[exec]` `MediaType.for(' /foo')` yields ` /foo/*`; type is never validated
against `SupportedMediaType`. `registered('','')` likewise returns the
`/`-keyed entry despite the "throws when empty" JSDoc (`media-type.ts:323-337`).
**Fix:** return `null` for empty type; validate type in the constructor path.

**COR-7 (Optional) — malformed `q` silently means "excluded" in
negotiation.** `[code]` `media-type.ts:196-207` uses bare `parseFloat`:
`q=abc` → `NaN`, and every consumer's `q > 0` test drops the entry, while the
same wave's `negotiateEncoding` (`static-resource-resolver.ts:129`) guards
`Number.isFinite`. **Fix:** normalize invalid q (RFC-consistent) or drop the
entry, mirroring the finite-check.

**REUSE-7 (Should Fix) — residual raw content-type string handling remains
where Wave 6 could have adopted.** Grep-confirmed sites still doing
`startsWith`/`includes`/`split` on content-type-ish strings or literal
`'text/plain'`/`'charset=utf-8'` concatenation (e.g.
`problem-details.ts` writes `'application/problem+json'` — see REUSE-2;
view/EJS engines concatenate `; charset=utf-8`). Consolidate into the Wave 6
adoption list.

### 1.4 AD-34 — TypeScript-native layer

**COR-8 (Should Fix) — `Environment.getRawProperty` silently lost its
"raw" semantics.** `[code]` `environment.ts:311-312` now returns
`#propertyResolver.getProperty(key)` — placeholder-resolved **and
secret-decrypted** — instead of delegating to `getRawProperty` (raw index
lookup; contract at `property-resolver.ts:88-93`). Change landed inside the
AD-34 commit with no test. The AD-29 at-rest-secrets flow relies on raw
markers being distinguishable; no in-repo callers today (contained blast
radius), but the escape hatch is a public API. **Fix:** revert the delegation
or rename/redocument the method with a pinning spec.

**DSG-3 (Should Fix) — two schema-binding paths with divergent semantics
despite the "one module, one behavior" claim.** `[code]`
`configuration-properties.ts:259-285` (`resolveFromSchema`, relaxed
`valueAt` fallback for kebab/snake) vs `schema-config.ts:51-73`
(`resolveSchemaConfig`, exact-path `getProperty` only). A class bound with
`{relaxed:true, schema}` reads different values through boot binding than
through `Environment.typedConfig` for the same prefix. ADR D-3 and the module
docstring claim single-source behavior. **Fix:** drive `resolveFromSchema`
through `resolveSchemaConfig` with a resolver adapter (or a `relaxed`
option), and correct the docstring.

**COR-9 (Should Fix) — condition-builder round-trip validation never
compares the parsed value.** `[code]` `condition-builders.ts:50-56`: the
guard checks `parsed.name !== name || parsed.isNegated !== negate` only; the
parser splits on the first `=`, so `queryParamCondition('filter','a=b')`
round-trips legally while the module doc and error claim values with `=`/`!`
fail at build time. **Fix:** add `parsed.value !== value`; reword the error
to state exactly what is rejected.

**DOC-3 (Should Fix) — schema-mode demo documents a key the code never
binds.** `[code]` `apps/ndigo-api/src/server-config.ts:57,61`: doc claims
`api.secret-token`/`NDIGO_API_SECRET_TOKEN` resolve; schema mode binds
`${prefix}.${key}` → **`api.secretToken`** (what `config-secrets.spec.ts:27,43`
seeds). The documented kebab key never probes (`camelize` of a camelCase key
is identity). An operator following the doc silently gets the `'unset'`
default instead of the secret — fail-open on a security-adjacent contract.
**Fix:** correct the docstring and env-var claim.

**DOC-4 (Optional) — oxlint rule ships wider than the plan's v1 scope.**
`no-string-registry-lookup.ts:53-72` flags any string literal to
`getValue`/`getInstance`/`hasValue`/`destroyValue` with no receiver check and
no declared-token scan (plan v1 scoped to same-module token declarations;
the scope was dropped — the ADR already reflects shipped behavior, the plan
and its D7 mitigation note do not). One justified disable already exists in
`typedoc-tags-plugin.mjs:6`; static template-literal args are not flagged.
Zero live FPs in the tree. **Fix:** align plan text with the shipped rule;
v2: receiver/declaration awareness + template literals.

**SMELL-1 (Optional) — dead branch + double work in AD-34 code.**
`configuration.ts:440-445`: both branches of the name/token `if` call
`this.registry.setValue(nameOrToken, result)` identically. `profile.ts:100-116`:
`asTerm(value)` runs twice per term. Fold both.

**DOC-5 (Optional) — bench "disable" comments claim a token axis that does
not exist.** `bench/context-lookup.bench.ts:13-15` (context) and
`:161-163` (dispatcher): the justified-disable text says the bench "benches
both handles"; neither file contains any `ContextToken` scenario. Add a
token-lookup bench or correct the comment.

**NAME-1 (Optional) — one concept, three module names.**
`ndigo-cache/src/tokens.ts`, `ndigo-dispatcher|platform-node|*/context-tokens.ts`,
`ndigo-factory/src/context-token.ts`, apps `context-tokens.ts`. Pick one
conventional name per repository.

**NAME-2 (Optional) — `refreshed`/`refreshes` typos (missing `e`) in the
typed-events compile-gate spec.** `test/typed-events.spec.ts:22,24-25,89,93,98,101`
(nine occurrences). Internally consistent (byte-verified, compiles) but the
file is the canonical event example.

### 1.5 Cross-cutting reuse audit

**REUSE-1 (Should Fix) — CSRF interceptor hand-builds `Set-Cookie`.**
`[code]` `csrf-interceptor.ts:123` string-concatenates the cookie while
`HTTPHeaders.SET_COOKIE.buildValue(...)` exists and is already used
(`session-cookie.ts:31-33,50-52`). Emit via the module.

**REUSE-2 (Should Fix) — `writeProblem` emits header names as raw
strings.** `[code]` `problem-details.ts:85-88`: `'Content-Type'`,
`'Cache-Control'`, `'Vary'` literals; `HTTPHeaders.CONTENT_TYPE/
CACHE_CONTROL/VARY` exist. Key with the constants.

**REUSE-3 (Should Fix) — node adapter reads headers via literal lowercase
record keys.** `[code]` `node-http-server-adapter.ts:447,855,867,907,1106,1205`,
`parse-multipart.ts:116,166`: `req.headers['cookie'|'content-type'|
'accept-language'|'host'|'content-length']`. `HTTPHeader.get()` case-folds
against Node's lowercase records by design. Route through the constants; the
missing `ACCEPT_LANGUAGE` constant (`http-headers.ts`) is itself a module
gap — add it and the five read sites converge. `#assertHeaderLimits`
(`:1119`, raw `rawHeaders` scan) has no module equivalent — defensible.

**REUSE-4 (Should Fix) — AD-35 controllers emit header names as literals.**
`[code]` `openapi-docs-controller.ts:55`, `swagger-ui-controller.ts:108,127`
while `node-view-target.ts:46,58` already uses `HTTPHeaders.CONTENT_TYPE.name`.
Use the constants.

**REUSE-5 (Should Fix) — `@ndigo/http`'s own interceptor reads Content-Type
via literal string.** `[code]` `transform-interceptor.ts:55,87,101,127`:
`headers.get('content-type')`. Use `HTTPHeaders.CONTENT_TYPE.get(...)`.

**REUSE-6 (Optional) — remaining literal reads.** `oidc-adapter.ts:345`
(`content-length`), `cors-interceptor.ts:108,115,139` (read side;
emission side already uses constants).

**Defensible non-findings:** `'X-HTTP-Method'` custom header
(cache-interceptor, retry-on-offline — no constant; add once if it stays);
`ndigo-view`/`ndigo-content` Accept/Accept-Language reads (packages do not
depend on `@ndigo/http`; `parseAcceptLanguage` is properly shared);
`trusted-proxy.ts:318` reads XFF through `X_FORWARDED_FOR.getJoined` and only
then splits the chain — correct split point (reported as such by the
security slice).

### 1.6 Tooling / manifests / docs pipeline

**COR-10 (Should Fix) — `doc-api.mjs` leaks temp dirs on every failure
path.** `[code]` `scripts/doc-api.mjs:159-170`: `mkdtempSync` under OS tmp,
`rmSync` (line 167) only on success; any throw (typedoc non-zero, JSON
parse, coverage read) leaves `ndigo-doc-*` dirs behind. `71e2b239` fixed the
in-tree variant but not failure-path cleanup. **Fix:** `try/finally`.

**DSG-4 (Should Fix) — manifest/import gate is blind to `.js`/CJS bench
files — a live violation.** `[code]` `import-scanner.mjs:115-130` collects
only `/\.(ts|mjs)$/` with no `require()` support;
`packages/ndigo-context/benchmark/emitting.js:1-3` requires `'benchmark'`
(declared only at root), so the gate exits 0 while its own rule 3 ("every
test/bench/config import declared") is violated. Root config scan
(`:133-142`) misses committed `vitest.config.js` variants
(ndigo-oxlint-plugin, ndigo-router). **Fix:** scan `require()` in `.js`
bench/scripts without `.ts` twins; cover other root config spellings.
(Verified running the gate: exit 0 — the violation is real and passing.)

**COR-11 (Should Fix) — `ndigo-generators` manifest points at entrypoints
the tarball never ships.** `[code]` `packages/ndigo-generators/package.json:
13-24`: `main`/`types`/`exports` → `./src/index.js|.d.ts`, but `files` ships
only `src` + `generators.json` (TypeScript sources, no build artifacts —
`lib/` exists but is excluded by the check-manifests special case,
`check-manifests.mjs:101-103`). A registry install cannot resolve the
package; rule 6 checks export shape, not that targets exist in `files`.
**Fix:** point entrypoints at `./lib/*`, ship `lib`, or extend the gate.

**SMELL-2 (Should Fix) — stray `"'"` line and duplicated graft-ignore block
in `.gitignore`.** `[code]` `.gitignore:77-82` (verified at HEAD):
line 80 is a literal `"'"` — an editing accident between two identical
graft-ignore blocks (`**/graft/` vs `/graft/`). Committed junk in a
gate-adjacent file. Delete line 80; keep one block.

**DSG-5 (Optional) — `TOOLING` free-pass lets undeclared dev imports
through silently.** `[code]` `check-manifests.mjs:47-58,147`: `debug`/`glob`/
`cross-env` are exempt from any declaration; no current offender (greps
clean), but the carve-out is broader than toolchain config imports.

**SMELL-3 (Optional) — `doc-api.mjs:128` ownership check is a string
prefix, not a path segment** (sibling `ndigo-xy` would pass `ndigo-x`'s
guard). One-char fix: `pkgDir + '/'`.

**SMELL-4 (Optional) — `check-manifests.mjs:29` uses `.pathname` instead of
`fileURLToPath`** (Windows-unfriendly; `doc-api.mjs:26` does it right).
Linux-only today; consistency fix.

### 1.7 Docs cross-checks (integrator)

**DOC-6 (Should Fix) — gap analysis contradicts itself on rate limiting.**
`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §2.1 Security-headers row
still reads "Rate limiting itself remains **open** (SEC-6)" while the
Rate-limiting row directly above records "IMPLEMENTED 2026-09-27 (AD-33
Wave 3) — Closes SEC-6". Fix the stale sentence.

**DOC-7 (Optional) — relaxed-fallback overclaim.** Guide 03 / ADR D-3 /
boot docstring state the camelized fallback "applies to schema keys";
`camelize` of an already-camelCase schema key is identity, so kebab env keys
(`api.secret-token`) are never probed in schema mode
(`configuration-properties.ts:146-153`). Either probe the kebabized form or
reword the claims.

### 1.8 Integration findings (this execution)

**BUILD-1 (Must Fix — was red at HEAD) — `ndigo-platform-node` has not compiled
since AD-37.** `[exec]` `tsc -b tsconfig.build.json` fails at HEAD with
`trusted-proxy.ts:318: getJoined(headers) — Record<string, string|string[]|undefined>
not assignable to HeadersInit`. The module's own contract documents Node-record
support (case-folded reads; the runtime handles arrays — the e2e join test
passes) but every `HTTPHeader` helper and method typed its parameter as
`HeadersInit` only; `trusted-proxy.ts` was the first caller passing a node-shaped
record. **Fixed:** `http-header.ts` gained the `HeaderRecord` alias and all nine
signatures widened to `HeadersInit | HeaderRecord` (additive; no behavioral
change — `ndigo-http` 369 passed/12 skipped). The `33/33 build` claims in commit
messages predate AD-37; the nx/`tsc -b` lane has been red since.

**BUILD-2 (Must Fix — was red at HEAD) — `apps/ndigo-api` does not compile since
AD-34.** `[exec]` `cached-report-controller.ts:18` declares
`ContextToken<Cache<string, {invocations, value}>>` — two type arguments for the
single-parameter `Cache<V>` contract. **Fixed:** token typed
`Cache<{invocations: number; value: string}>` (string keys are the contract's
default). ndigo-api 64/64 green after the fix.

**FMT-1 (Should Fix — was red at HEAD) — `oxfmt --check .` fails on eight files
since the 09-26..28 waves** (docs/plans/2026-09-26_AUTH_COMPLETION.md,
2026-09-18_SECURITY_HEADERS.md, 2026-09-28_TRUSTED_PROXY.md,
docs/decisions/2026-09-28_AD37_TRUSTED_PROXY.md, gap analysis,
docs/guides/13, ndigo-management/src/index.ts, and this plan): the 09-27 sweep
missed them. **Fixed:** `oxfmt --write` applied; `git diff -w` confirms zero
content change (line-wrap, table alignment, emphasis-syntax normalization).
`format:check` green repo-wide again.

**ENV-1 (RESOLVED 2026-09-28) — `pnpm 11.4` hard-failed every run**
(`verify-deps-before-run` triggered `pnpm install`) with
`ERR_PNPM_IGNORED_BUILDS: @scarf/scarf@1.4.0`. Fixed as part of SEC-3:
`allowBuilds: {'@scarf/scarf': false}` in `pnpm-workspace.yaml` (the
postinstall is `node ./report.js` — machine fingerprinting; deliberately
never executed) + exact `swagger-ui-dist` pins → `pnpm install` green
(6.8s), lockfile updated to `5.33.0` exact. Note: `CI=true` makes pnpm
treat installs as frozen-lockfile — intentional for CI, harmless now that
the lockfile matches.

**Graph note (info):** `graft build --deep` meaning tier is incomplete for
3 files (`ndigo-orm/src/repository.ts`, `ndigo-test/src/mock-http.ts`, +1);
structure tier is in sync; `graft/` is intentionally untracked (regenerable),
so no tree collateral. Re-run `graft build --deep` before the next wave and
re-check freshness if those files land on a review path.

### 1.9 Findings from this execution (Waves 3–5)

**FOLLOW-1 (open, Medium) — `@entry` factories on subclassed
auto-configurations register silently.** `[code]` discovered while wiring the
demo's `SecureDocsConfiguration extends OpenAPIDocsAutoConfiguration`:
`@entry` initializers are only enumerable on the _defining_ class's
prototype, so a subclass that adds no factories registers **zero** beans
(docs mapping 404) unless a base-class instance was constructed earlier in
the same worker (test order masks it — all prior subclass usages were
shielded accidentally). The demo re-declares the three `@entry` factories
with forwarding bodies as a workaround. **Fix candidate:** entry discovery
should walk the prototype chain (`Object.getOwnPropertyDescriptors` per
level) or record factory metadata on the subclass at decoration time; add
a spec constructing a bare subclass. Home: `@ndigo/context` decorators /
`MetadataConfigApplicationContext` entry scan.

**DOC-8 (retraction) — NAME-11/NAME-2 was a false positive.** The claimed
`refreshed`/`refreshes` misspellings in `typed-events.spec.ts`
(:22,24-25,89,93,98,101) are all spelled correctly (verified identifier by
identifier at 2026-09-28). No edit; the original review claim is
withdrawn. SMELL-7 (configuration.ts `processEntry` dead branch) is also
**closed as by-design**: `setValue` overloads on `string` vs
`ContextToken<T>`, and TypeScript overload resolution needs the `typeof`
narrowing — the two calls are the type-safe dispatch, not duplication
(reverted the collapsed version after `tsc` rejected the union).

---

## 2. Mapping (slice-local → global)

| Global     | Slice ID       | Global     | Slice ID      |
| ---------- | -------------- | ---------- | ------------- |
| SEC-1      | SO SEC-1       | COR-7      | W6 COR-3      |
| SEC-2      | SO SEC-3       | COR-8      | A34 COR-1     |
| SEC-3      | SO SEC-4       | COR-9      | A34 COR-3     |
| SEC-4      | SO SEC-2       | COR-10     | SS COR-1      |
| COR-1      | ST COR-1       | COR-11     | SS COR-2      |
| COR-2      | ST COR-2       | DSG-1      | W6 DSG-1      |
| COR-3      | SO COR-1       | DSG-2      | W6 DSG-2      |
| COR-4      | SO COR-2       | DSG-3      | A34 DSG-2     |
| COR-5      | W6 COR-1       | DSG-4      | SS SMELL-1    |
| COR-6      | W6 COR-2       | DSG-5      | SS DSG-1      |
| REUSE-1..6 | RH 1..6        | SMELL-1    | A34 SMELL-7/8 |
| REUSE-7    | W6 REUSE-1     | SMELL-2..4 | SS SMELL-2..4 |
| NAME-1/2   | A34 NAME-10/11 | DOC-1      | ST DOC-1      |
| COV-1      | ST COV-1       | DOC-2      | SO DOC-1      |
| DOC-3      | A34 DOC-4      | DOC-4      | A34 DOC-6     |
| DOC-5      | A34 DOC-9      | DOC-6/7    | integrator    |

---

## 3. Remediation plan

### Wave 1 — Must Fix (immediate)

1. **COR-1 — CIDR masking.** `trusted-proxy.ts`: `prefix >> 3`; byte-boundary
   tests `/1 /7 /9 /25 /31` + IPv6 `/33 /97`, in-range and just-out-of-range.
    - Acceptance: `10.0.0.5` inside `10.0.0.0/25`; `10.0.1.0` outside; values
      previously misclassified (e.g. a `/25`-trusted proxy now yields XFF)
      asserted in `trusted-proxy.spec.ts`.
    - Verify: `cd packages/ndigo-platform-node && pnpm test` (trusted-proxy +
      rate-limit e2e suites).

2. **SEC-1 — accessGuard effectiveness.** Forward the real handler through
   the docs/management scoped wrappers (chain already supplies it — the
   wrappers discard it); document in guide 13 and both option JSDocs that
   only unconditional (token-presence) guards protect these routes, since
   the handlers carry no auth metadata.
    - Acceptance: new spec wires `AuthRouteGuard` via `accessGuard` on the
      docs auto-config and asserts 401 on `/v3/api-docs` and `/health`
      without a token; guide 13 names an effective guard type.
    - Verify: `ndigo-platform-node` + `ndigo-management` + `ndigo-api` suites.

### Wave 2 — Correctness (Should Fix)

3. **COR-5 + DSG-1 + DSG-2 — MediaType.** Quote-aware parameter scanning +
   unescape (`;`/`"`/`\` round-trip registry tests); intern only
   parameterless expressions (or bounded LRU) + canonical parameter order;
   fold case in the component-arg path (isJSON + convergence tests).
    - Verify: `ndigo-core` media-type suite (+ new round-trip specs).

4. **COR-8 — `getRawProperty`.** Revert `environment.ts` to the raw
   delegation; pin semantics with a spec (ciphertext marker survives
   `getRawProperty`, plaintext from `getProperty`).
    - Verify: `ndigo-context` suite (environment + secrets specs).

5. **COR-9 — condition round-trip value check.** Add `parsed.value` to the
   guard; reword the error; spec `queryParamCondition('filter','a=b')`
   rejection.
    - Verify: `ndigo-dispatcher` condition-builders suite.

6. **COR-2 — IPv6 grammar.** Reject empty groups; dotted-quad only as final
   group; malformed-spelling specs.
    - Verify: `trusted-proxy.spec.ts`.

7. **COR-4 — spec-generation failure path.** problem+json on generation
   failure (or boot-time validation).
    - Verify: openapi-generator suite + a throwable-schema case.

8. **COR-3 — scope all guard hooks.** Path-gate `postHandle`/`completeHandle`
   in both wrappers; regression spec with a side-effecting guard.
    - Verify: management + openapi-docs suites.

9. **DOC-1 + DOC-6 + DOC-2 + DOC-3 — docs truth.** Rate-limit JSDoc + guide
   11 §5 (AD-37 semantics); gap-analysis security-headers row (SEC-6 closed);
   guide 13 §2 (private marker + dispatch never enforces); `server-config.ts`
   key claim (`api.secretToken`).

### Wave 3 — Security posture (Should Fix)

10. **SEC-2 — security headers on docs routes.** Attach
    `SecurityHeadersInterceptor` (CSP with nonce or externalized UI script)
    to the docs mapping; emit `NOSNIFF_HEADER` in static success headers;
    assert CSP on `/swagger-ui/` in the integration spec.
11. **SEC-3 — swagger-ui-dist.** Exact-version pin in
    `ndigo-platform-node` + `ndigo-api`; document bundle-integrity decision;
    lazy/guarded peer resolution (missing peer fails only the docs
    endpoint, via the problem+json machinery).
12. **SEC-4 — disclosure scope.** Demo wires the Wave-1 guard; guide 13
    documents that in-handler-only-protected routes appear in the anonymous
    spec (+ `@apiDocs({hidden:true})` recommendation).

### Wave 4 — Tooling, manifests, reuse (Should Fix)

13. **COR-10 — `doc-api.mjs` try/finally cleanup** (+ failure-injection
    check).
14. **DSG-4 — `import-scanner.mjs`:** `require()` support, `.js` bench
    files without `.ts` twins, `vitest.config.js` spellings; acceptance
    probe `require('made-up-pkg')` in a `.js` bench fails the gate.
15. **COR-11 — `ndigo-generators` manifest** → `lib/*` entrypoints (+ `files`),
    or gate rule that `files` covers every export target;
    `npm pack --dry-run` verification.
16. **SMELL-2 — `.gitignore` stray line + dedupe block.**
17. **REUSE-1..5 + REUSE-7 — header constants adoption** (CSRF Set-Cookie,
    problem-details, node adapter + multipart reads, docs controllers,
    transform-interceptor; add `ACCEPT_LANGUAGE` constant; residual
    content-type literals list from REUSE-7).
    - Verify: repo-wide `grep` for the removed literal patterns; affected
      package suites.

### Wave 5 — Optional backlog

18. COR-6/COR-7 (MediaType edge strictness), COV-1 (proxy corner specs),
    DOC-4 (rule scope text), DOC-5 (bench truth), DOC-7 (relaxed-fallback
    wording), REUSE-6, NAME-1/2, SMELL-1 (dead branches), SMELL-3/4,
    DSG-5 (TOOLING carve-out). Each is a one-shot change with a local spec
    or doc edit; no cross-package blast radius.

---

## 4. Verified clean (checked and sound)

- **AD-37 core walk:** XFF read via `@ndigo/http` `X_FORWARDED_FOR.getJoined`
  (no raw header parsing anywhere in the file); `TrustedProxySet` implements
  `Matchable<string>`; empty set = trust nobody with the header never read;
  option→env precedence with empty-env → trust-nobody; rightmost-first walk,
  peer fallback, IPv4-mapped IPv6 both directions; malformed config fails
  loud at adapter construction; e2e spec proves default posture ignores
  spoofed headers and trusted peers split per-client buckets.
- **OpenAPI assets:** exact 4-name whitelist before any FS access (traversal,
  encoded slashes, null bytes fail); whitelisted names pass through the
  hardened `StaticResourceResolver` (realpath containment, symlink checks);
  spec generation is metadata-only reflection; health redaction default-on,
  consistent, no header/log leak path.
- **AD-34:** typed-event `on/off/emit` overloads match every emit site
  (verified all four `ContextEvents` + `CONFIG_REFRESH_EVENT`); profile
  grammar precedence/parenthesization correct; parse→String→parse stable;
  single `ContextToken` kind (no cache-store/bean split); zero remaining
  string-literal registry lookups in `packages/*/src` and `apps/*/src`
  (migration complete); schema-mode fail-loud boot path spec'd.
- **Prior remediations re-verified in tree** (2026-09-25/27): `RETRY_AFTER`
  constant, case-folded header reads, queue-store destination eviction,
  socket dispatch fail-closed auth (SEC-3) — all present.
- **Dependency normalization (`1a3b1f40`):** actual gate run — exit 0, all
  36 manifests conform; no removed dep still imported; `import-scanner`
  corpus sanity over the oxlint rule + apps index + bench files.
- `graft check` (structure tier): in sync after the rebuild.

---

## 5. Outcome (2026-09-28)

### Wave 1 — Must Fix ✅

- **COR-1 (CIDR):** `trusted-proxy.ts:259` `prefix >> 3`; new board
  `matches non-octet-aligned CIDR prefixes with exact bit semantics`
  covers `/1 /9 /25 /31` IPv4 + `/33 /97` IPv6 (in/out of range). Old code
  proven to fail the board (revert probe: 1 failed), fix passes.
- **SEC-1 (accessGuard):** both scoped wrappers forward the real handler on
  all three hooks; specs (`openapi-docs.spec.ts`, `management-endpoints.spec.ts`)
  assert the forwarded handler is the route's `RouteHandlerMethod` (never
  `undefined`) and that no hook runs for non-docs/non-management routes.
  Guide 13 §1 + both options JSDocs now state metadata-driven guards
  (`AuthRouteGuard`) cannot protect these metadata-less endpoints; an
  unconditional token-presence guard is required. (Adjusted acceptance:
  the planned AuthRouteGuard-401 assertion is impossible — the endpoints
  carry no `@authenticated` metadata; recorded in §1.2.)

### Wave 2 — Correctness ✅

- **COR-5/DSG-1/DSG-2 (MediaType):** quote-aware parameter scanning +
  unescape + backslash escaping; canonical parameter ordering;
  bounded FIFO intern cache (128) for parameterized expressions with
  `registrySize` observability; component-arg `for()` folds case and
  converges with the expression path. 6 new specs; ndigo-core 308/308.
- **COR-8 (`getRawProperty`):** reverted to the raw index delegation;
  2 pins in `secret-cipher.spec.ts` (raw marker survives, `getProperty`
  decrypts/resolves). ndigo-context 355/355.
- **COR-9 (condition builders):** the value round-trip guard is enforced
  via an explicit `=`/`!` character scan (`parsed.value` comparison alone
  cannot fire — the parser's `parseValue` is identity); error + module doc
  reworded to state exactly what is rejected; obsolete contradictory test
  removed. ndigo-dispatcher 277 passed/2 skipped.
- **COR-2 (IPv6 grammar):** empty groups and non-final dotted-quads
  rejected; 6 malformed spellings added to the fail-loud board; mid-chain
  empty-entry walk pinned. trusted-proxy 27/27; ndigo-platform-node 445/445.
- **COR-4 (spec generation):** generation wrapped; failure → server-side
  log + 500 `urn:ndigo:internal-error` problem doc (adapter generic shape),
  never memoized; 2-request regression spec. 28 docs/boundary specs green.
- **COR-3 (hook scoping):** all three guard hooks path-gated in both
  wrappers; side-effect regression specs (no hooks on `/api/notes`, `/app/probe`).
- **DOC-1/6/3 (docs truth):** rate-limit JSDoc + guide 11 §5 (AD-37
  semantics); gap-analysis SEC-6 row; `server-config.ts` `api.secretToken`
  key claim. Stale-phrase grep: 0 hits in edited files.

### Integration

- **BUILD-1/BUILD-2 fixed** (see §1.8): full repo `tsc -b` sweep over all
  packages + apps — **ALL-BUILD-OK**.
- Suites: ndigo-http 369/12 skipped · ndigo-api 64 · ndigo-platform-node 445 ·
  ndigo-management 18 · ndigo-dispatcher 277/2 skipped · ndigo-context 355 ·
  ndigo-core 308.
- `oxlint --type-aware --deny-warnings .` — 0 findings; `oxfmt --check .` —
  green repo-wide (8 historical files swept, content-identical).
- **ENV-1 open** (pnpm verify-deps hard-fail on `@scarf/scarf`) — Wave 3
  prerequisite.

### Waves 3–5 — pending

W3: security headers on docs routes; swagger-ui-dist pin + scarf removal
(clears ENV-1); demo guard + guide 13 disclosure. W4: tooling/manifests
(doc-api cleanup, import-scanner `.js`, generators manifest, `.gitignore`),
REUSE-1..7 header-constant adoption. W5: Optional backlog (COR-6/7, COV-1
remaining, DOC-4/5/7, REUSE-6, NAME-1/2, SMELL-1, SMELL-3/4, DSG-5).

### Waves 3–5 — executed 2026-09-28 ✅

#### Wave 3 — Security posture

- **SEC-2 (headers on docs routes):** docs mapping now carries a
  `SecurityHeadersInterceptor` (before the scoped guard) — spec/page/assets
  get the default CSP/nosniff/XFO/HSTS set. The UI bootstrap was
  **externalized** (`swagger-ui-init.js`, same-origin asset; page has zero
  inline scripts; `script-src 'self'`, no `unsafe-inline`). `NOSNIFF_HEADER`
  emitted on every successful static representation (200/206/304/416 +
  listings); `X-Content-Type-Options` asserted on plain + generated files.
  Specs: SEC-2 trio (CSP + nosniff + XFO/HSTS on `/v3/api-docs`,
  `/swagger-ui/`, `swagger-ui-init.js`) — platform-node 451/451.
- **SEC-3 (swagger-ui-dist):** exact `5.33.0` pins in
  `ndigo-platform-node` + `ndigo-api`; `allowBuilds: {'@scarf/scarf': false}`
  in `pnpm-workspace.yaml` (scarf's postinstall is telemetry; deliberately
  never executed); controller peer resolution made **lazy** — a missing
  peer fails only the docs endpoints with a 500 problem document
  (`urn:ndigo:internal-error` naming the peer), never boot. **ENV-1
  resolved**: `pnpm install` green, lockfile updated.
- **SEC-4 (demo disclosure):** ndigo-api registers a Bearer-gated docs
  config (`SecureDocsConfiguration` + unconditional `docsAccessGuard`
  using the config-secrets token pattern, `urn:ndigo:unauthorized` problem
    - `WWW-Authenticate: Bearer`, MockHTTP/live parity verified); app spec:
      anonymous `/v3/api-docs` + `/swagger-ui/` → 401, token → 200 spec/page/
      bundle (5 new specs; app suite 66/66); live smoke over real HTTP. Guide
      13 §2 gains the disclosure blockquote (`@apiDocs({hidden:true})`
      recommendation; in-handler-only routes stay visible anonymously).

#### Wave 4 — Tooling, manifests, reuse

- **COR-10:** `doc-api.mjs` temp dir now cleaned in `finally`
  (failure-injection probe: zero `ndigo-doc-*` leaks across a 35-package
  failing run).
- **DSG-4:** `import-scanner.mjs` captures `require()`/`require.resolve()`
  (inline + split-token), scans `.js`/`.cjs` without `.ts` twins in
  bench/benchmark/scripts (+ `benchmark` dir), and covers
  `vitest.config.{ts,js,mjs,cjs}` spellings; `'benchmark': ~2.1.4`
  declared in ndigo-context (the previously invisible violation). Probe:
  undeclared `require('made-up-pkg-xyz')` in a bench `.js` now fails the
  gate (exit 1), removed after.
- **COR-11:** `ndigo-generators` entrypoints → `./lib/index.{js,d.ts}`,
  `files` ships `lib`; check-manifests exemption branch removed (package
  now passes the generic rule). `npm pack --dry-run` lists `lib/index.js`;
  gate exit 0.
- **SMELL-2:** `.gitignore` stray `"'"` deleted; graft block deduped to one.
- **REUSE-1..7:** constants adopted at 9 sites — CSRF `Set-Cookie` via
  `SET_COOKIE.buildValue` (byte-identical, 8/8 interceptor specs),
  `problem-details` keys + `MediaTypes.APPLICATION_PROBLEM_JSON` (new
  ndigo-core constant), node adapter + multipart literal reads,
  `transform-interceptor` (`CONTENT_TYPE.get`), docs controllers
  (REUSE-4, done with SEC-2), `oidc-adapter`, `cors-interceptor` reads;
  **`ACCEPT_LANGUAGE` constant added** to `@ndigo/http` (the module gap).
  Residual literals audited defensible (auth-scheme parsing, byte-identity
  constraints, no-dep packages). ndigo-http 369/12 skipped, ndigo-auth-client
  70/70.

#### Wave 5 — Optional backlog

- **COR-6:** garbage type tokens (`' /foo'`, `'a;b'`, `'a b/c'`, `'   '`)
  rejected — whitespace/semicolon/slash token rule in both the no-slash
  fallback and normalize (type + subtype); type-only expressions trim/fold
  case and converge. 2 specs.
- **COR-7:** malformed `q` → default 1 (RFC 7231 §5.3.1), never
  NaN-exclusion; `q=0` semantics preserved; `parseAccept` malformed-q
  entries keep default weight. 1 spec. ndigo-core 311/311.
- **DOC-4/DOC-7:** plan/ADR/guide claims aligned with shipped rule scope
  and schema-mode key resolution (no kebab probing).
- **DOC-5:** context bench gains a real `ContextToken` case (pins the D1
  same-cost claim); both bench disable comments corrected.
- **NAME-1:** token modules standardized to `context-tokens.ts`
  (`ndigo-cache/tokens.ts`, `ndigo-factory/context-token.ts` renamed;
  imports updated; suites green: cache 49/49, factory 74/74).
- **SMELL-3/4:** doc-api ownership check is path-segment exact;
  check-manifests uses `fileURLToPath`.
- **DSG-5:** `debug`/`cross-env`/`glob` removed from the TOOLING
  free-pass (gate exit 0 — no offenders).
- **DOC-8:** NAME-11 retracted (false positive), SMELL-7 closed as
  by-design (see §1.9).

#### Integration (Waves 3–5)

- **Build:** full `tsc -b` sweep all packages + apps — **ALL-BUILD-OK**.
- Suites: ndigo-platform-node 451 · ndigo-api 66 · ndigo-context 355 ·
  ndigo-dispatcher 277/2 skipped · ndigo-core 311 · ndigo-http 369/12 skipped
  · ndigo-auth-client 70 · ndigo-cache 49 · ndigo-factory 74 ·
  ndigo-management 18 · ndigo-openapi 9.
- Lint `--type-aware --deny-warnings` 0 findings; `oxfmt --check` green
  repo-wide; `check-manifests` exit 0; doc-api/import-scanner syntax
  checked; stray temp probe file removed.
- **FOLLOW-1 open** (entry-inheritance latent bug, see §1.9) — tracked for
  a follow-up fix in `@ndigo/context`.

## References

- Framework gap analysis: `docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md`
- Prior reviews: `docs/plans/2026-09-25_CODE_REVIEW_AND_MITIGATION.md`,
  `docs/plans/2026-09-27_CODE_REVIEW_AND_MITIGATION.md`
- ADRs: AD-34 (`2026-09-27_AD34_TYPESCRIPT_NATIVE_LAYER.md`), AD-35/36
  (`2026-09-28_AD35_OPENAPI_DOCS.md`, `2026-09-28_AD36_MANAGEMENT_HARDENING.md`),
  AD-37 (`2026-09-28_AD37_TRUSTED_PROXY.md`)
- Plans: `2026-09-27_TYPESCRIPT_NATIVE_LAYER.md`,
  `2026-09-28_OPENAPI_AND_MANAGEMENT_HARDENING.md`,
  `2026-09-28_TRUSTED_PROXY.md`
