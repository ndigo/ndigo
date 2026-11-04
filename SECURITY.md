# Security Policy

The Ndigo framework prioritizes fail-closed authentication, bounded transport
handling, and safe package boundaries. This policy defines how vulnerabilities
are reported, triaged, and fixed.

## Supported versions

| Version              | Supported                              |
| -------------------- | -------------------------------------- |
| `main` (development) | ✅ active remediation                  |
| Released tags        | ✅ security fixes for the latest minor |

## Reporting a vulnerability

**Do not open a public GitHub issue for a security vulnerability.**

- Email the maintainer directly: `jeff_rose@outlook.com`
- Include:
    - the affected package(s) and version(s)
    - a minimal reproduction (code or request trace)
    - impact assessment (remote? auth bypass? data exposure? DoS?)

You will receive an acknowledgment within 72 hours and a fix timeline within
7 days. We ask that you coordinate disclosure until a patched version ships.

## Security model (what we guarantee)

- **Authentication**: `@ndigo/auth-client` OIDC adapter is fail-closed — no
  claim-only mode. Construction without `jwksUrl`, `discovery`, or an explicit
  `tokenValidator` throws. ID tokens are signature-, issuer-, audience-,
  expiration-, and (during the code flow) nonce-verified. PKCE S256 and `state`
  are mandatory.
- **Authorization**: `AuthRouteGuard` validates against exactly one explicit
  authentication adapter; denials finalize as 401/403 and never leave requests
  open. Interceptor denials use the `InterceptorDenial` contract
  (`@ndigo/dispatcher`).
- **Transport**: Node request bodies/headers/timeouts are bounded
  (`@ndigo/platform-node` limits) with deterministic 400/408/413/431/500
  responses; malformed JSON is rejected, never reshaped; `listen()` rejects on
  bind errors.
- **Static files**: shared `StaticResourceResolver` (canonical base +
  prefix-with-separator containment, symlink resolution, MIME allowlist,
  `nosniff`) — no path escape.
- **CORS**: server-side enforcement only in `@ndigo/platform-node`
  `CORSInterceptor`; wildcard + credentials rejected at construction.
  `@ndigo/platform-web` `FetchCredentialsInterceptor` is documented as a
  browser-only fetch helper — it is not a security boundary.

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
