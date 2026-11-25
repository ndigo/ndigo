# Security — Design Notes

Internal notes for maintainers. The published [Security](./security.md) page
states the posture and the layer map; this file keeps the resolved tensions and
the pre-release caveats behind them. It is not published as a concept page.

## Key Tensions and Resolutions

- **Safe defaults vs application surprise.** Headers and throttling are on by
  default because both are safe to enable. The content security policy was
  tightened to the application's own origin; a cross-host socket server widens
  it explicitly, and inline script is never the default.
- **CSRF protection is explicit vs login forgery.** Double-submit protection
  is not wired automatically, so a cookie-session application must either add
  it or keep every mutating route JSON-only. Login already accepts JSON alone,
  which a cross-site HTML form cannot send, so login is not cross-site postable
  even before the interceptor is added. Logout and other cookie-authenticated
  mutations still need the protection.
- **Trusted proxies vs spoofing.** Client-address trust is all-or-nothing per
  peer: either the peer is allowlisted and its forwarded address counts, or it
  is not and the header is ignored. There is no heuristic middle ground.
- **Strict policy vs framework sockets.** Same-origin sockets are covered by
  the default policy. A socket server on another host is an explicit addition
  to the allowlist; a bare scheme wildcard is never an admission.
- **Problem-type identity.** The framework uses a self-contained placeholder
  scheme for problem types today; real HTTPS identifiers replace it before the
  first public release. The published guides state the same caveat for readers.
