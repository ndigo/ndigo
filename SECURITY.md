# Security Policy

The Ndigo framework prioritizes fail-closed authentication, bounded transport
handling, safe package boundaries, and explicit trust boundaries for
agent-facing surfaces. This policy defines how vulnerabilities are reported,
triaged, and fixed.

## Supported versions

| Version              | Supported                              |
| -------------------- | -------------------------------------- |
| `main` (development) | ✅ active remediation                  |
| Released tags        | ✅ security fixes for the latest minor |

> **Pre-1.0:** the packages are not published yet; `main` is the supported
> line. Once releases begin, the latest minor receives security fixes.

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

- Preferred: open a private security advisory on GitHub (Security →
  Advisories → “Report a vulnerability”).
- Or email the maintainer: `jeff_rose@outlook.com`
- Include:
    - the affected package(s) and version(s)
    - a minimal reproduction (code or request trace)
    - impact assessment (remote? auth bypass? data exposure? DoS?)

You will receive an acknowledgment within 72 hours and a fix timeline within
7 days. We ask that you coordinate disclosure until a patched version ships.

## Security model (what we guarantee)

The guarantees below describe the framework packages. The demo applications
under `apps/` are reference implementations, not production-hardened templates.

### Authentication and authorization

- **OIDC is fail-closed.** `@ndigo/auth-client` has no claim-only mode:
  construction without `jwksUrl`, `discovery`, or an explicit `tokenValidator`
  throws. ID tokens are signature-, issuer-, audience-, expiration-, and
  (during the code flow) nonce-verified; PKCE S256 and `state` are mandatory.
- **Authorization is explicit.** `AuthRouteGuard` validates against exactly one
  explicit authentication adapter; denials finalize as 401/403 and never leave
  requests open. Interceptor denials use the `InterceptorDenial` contract
  (`@ndigo/dispatcher`).
- **Session cookies** use the `__Host-` prefix (`Secure`, `Path=/`, no
  `Domain`), plus `HttpOnly` and `SameSite=Lax`. A `__Host-` cookie configured
  with `secure: false` fails at construction.

### Web hardening

- **Transport bounds.** Node request bodies/headers/timeouts are bounded
  (`@ndigo/platform-node` limits) with deterministic 400/408/413/431/500
  responses; malformed JSON is rejected, never reshaped; `listen()` rejects on
  bind errors.
- **Security headers** are default-on in the Node handler mapping (helmet +
  CSP). **CORS** is fail-closed by default: no origin is permitted until the
  application sets `cors.allowedOrigins`, and wildcard + credentials is
  rejected at construction. `@ndigo/platform-web`'s
  `FetchCredentialsInterceptor` is a browser helper, not a security boundary.
- **Rate limiting** is default-on for routes that declare `@rateLimit`; feature
  gates run before rate limiting.
- **CSRF** is opt-in via `CSRFInterceptor`. When enabled, unsafe methods require
  `X-CSRF-Token` (or `csrf_token`) matching the `__Host-ndigo-csrf` cookie in
  constant time; safe requests mint the cookie.
- **Trusted proxies** are opt-in; deployments behind a proxy must configure the
  trusted hops explicitly.
- **Static files** use the shared `StaticResourceResolver` (canonical base +
  prefix-with-separator containment, symlink resolution, MIME allowlist,
  `nosniff`) — no path escape.

### Secrets and management

- **At-rest secrets.** `{cipher:…}` values decrypt at lookup time when the
  application registers a cipher (AES-GCM, `NDIGO_SECRET_KEY`). Decrypted
  plaintext never appears in management output.
- **`/env` is redacted** (`<redacted>`) unless
  `management.endpoints.env.showValues: true`, and even then only the raw
  stored text is emitted — never decrypted plaintext. `/configprops` reports
  declared keys, never values.
- Never place provider keys or other secrets in client-bound files or prompts.

### Agent-facing surfaces

Tool surfaces are attack surfaces. Remote MCP surfaces run through the normal
route interceptor chain; stdio is a local trust boundary. The framework never
treats a model or a tool result as trusted.

- **MCP tools.** `@toolMapping` opts a handler in; arguments bind through the
  same resolvers and validators as the HTTP route. A read-only registry omits
  mutating tools from `tools/list` **and** rejects them on call. `@whenFeature`
  removes gated tools entirely (fail closed without an evaluator). Bearer
  validation, `@authorized` role checks, and `@authorizedScopes` scope checks
  run in the route interceptor chain before the transport;
  `protectedResourceMetadata` publishes RFC 9728 metadata. Each call emits one
  `execute_tool` span.
- **MCP Apps.** `createUiResource` escapes `body` by default;
  `trustedMarkup: true` is reserved for markup the application authored.
  CSS/script breakout sequences are rejected, CSP domains must be
  `http(s)`/`ws(s)` URLs without spaces, `;`, or control characters, and
  wildcard origins are not supported. The host renders the document in a
  sandboxed iframe and enforces the declared CSP.
- **A2UI.** The surface renders only components the application installed
  (`ndigo.ui.json` + `ui.lock.json`); unknown components are rejected with
  `data-error` and `nd-a2ui-error`. Props are allowlisted: `on*` keys,
  `__proto__`/`constructor`/`prototype`, `style`, and `srcdoc` are refused, and
  URL-valued attributes accept only `http(s)` URLs. The installed catalog is
  the security model.
- **WebMCP.** Tool arguments are validated against the same Zod schema the HTTP
  route binds before the handler runs; invalid arguments reject with a
  `TypeError`. `exposedTo` limits cross-origin callers, and registration is a
  no-op without `document.modelContext`. The browser's WebMCP implementation
  remains the boundary.
- **Model calls.** Provider keys travel through configuration (`{cipher:…}`),
  never client-bound files. Tool results and model output are untrusted data,
  not instructions: applications must not place secrets in prompts and must
  treat model-proposed tool calls as untrusted until the registry policy allows
  them. Per-model rate limits throw `AIRateLimitError`; the rollout flag is
  fail-closed (`AIModelDisabledError`). Only `@ndigo/ai-sdk` imports the Vercel
  AI SDK.

### Local tooling

- **`ndigo mcp`** runs with the invoking developer's privileges. Its static
  profile exposes the application manifest, routes, configuration keys
  (presence only — never values), doctor output, and logs. `run_target` and
  `record_rule` are mutating and are omitted with `--readOnly`; use that flag
  when the client is not fully trusted.
- **`ndigo ai:init`** writes `AGENTS.md`, `.agents/skills/`, and (with `--mcp`)
  merges `.mcp.json`. Generated content is version-matched, not a security
  boundary.
- **Remote registry and config URLs are untrusted input.** The CLI contains
  paths, validates schemes/hosts, and bounds fetch sizes and timeouts.

## Dependency advisories

- Every PR runs `pnpm audit --prod`; the production dependency set must have
  zero known advisories.
- A fix is due:
    - **High/critical**: within 14 days of the advisory's publication.
    - **Moderate/low**: with the next dependency-update cycle (≤ 60 days).
- Unavoidable exceptions (e.g. an advisory with no patched release) must be
  documented here with a reachability analysis and an expiry date. There are
  currently **no** open exceptions.

## CI security controls

CI runs on every PR (see `.github/workflows/ci.yml`):

- zero-warning lint (Oxlint), zero-diff formatting on maintained files
- production dependency audit (clean)
- strict type-check per package
- manifest conformance
- unit/integration suites + browser E2E (Chromium, todo app)

Workflow permissions are minimal (`contents: read`); third-party actions are
pinned to commit SHAs.

## Coordinated disclosure

We prefer Coordinated Disclosure (CVD): reporters get advance notice of the
fix, and details are published a reasonable window after the patch ships.
Credit is given in the advisory unless anonymity is requested.

## See also

- [Guide 28 — Security Hardening](docs/guides/28-security-hardening.md)
- [Guide 43 — Live Configuration, Secrets & Remote Config](docs/guides/43-live-configuration-and-secrets.md)
- [Guide 33 — Management Endpoints](docs/guides/33-management-endpoints.md)
- [Guide 47 — AI Agents, Model Loops & Streaming](docs/guides/47-ai-agents.md)
- [Guide 48 — Agent-Facing Surfaces](docs/guides/48-agent-facing-surfaces.md)
- AD-76 (management redaction), AD-96…AD-102 (agent integration)
