# Guide Renumbering Map (2026-11-08)

The guides were renumbered from the historical 01–30 sequence into the current
application curriculum: **00–50** for application guides and **90–91** for
contributor guides. This file is the bridge for historical records: ADRs,
plans, audits, and dated migrations written before 2026-11-08 still cite the
old numbers and old filenames.

Every old guide path remains on disk as a one-line redirect stub, so links in
historical records keep resolving. Do not rewrite those records; use this table
instead.

## Old to new

| Old | New | Guide                                       |
| --: | --: | :------------------------------------------ |
|  01 |  01 | Building a Node API                         |
|  30 |  02 | Building a Browser App                      |
|  03 |  03 | Environment & Configuration                 |
|   — |  00 | Core Concepts & Mental Model                |
|   — |  04 | Dependency Injection, Scopes & Lifecycle    |
|   — |  05 | Routing & Route Conditions                  |
|  09 |  06 | Argument Binding                            |
|  02 |  07 | Request Validation                          |
|   — |  08 | Errors & Problem Details                    |
|   — |  09 | Views, Targets & Content Negotiation        |
|  17 |  10 | Static Files                                |
|  20 |  11 | The HTTP Client                             |
|  13 |  12 | OpenAPI & API Docs                          |
|  14 |  13 | DTO & Conversion                            |
|  08 |  14 | Multipart & File Upload                     |
|  06 |  15 | WebSockets                                  |
|   — |  16 | Typed Service Clients & SSE                 |
|  04 |  17 | Internationalization & Content              |
|   — |  18 | Forms End-to-End                            |
|  07 |  19 | Caching                                     |
|  27 |  20 | ORM & Migrations                            |
|  16 |  21 | Persistence & Shared Stores                 |
|  22 |  22 | Jobs & the Transactional Outbox             |
|  05 |  23 | Scheduling                                  |
|  23 |  24 | Distributed Locks                           |
|  24 |  25 | Clustering                                  |
|  11 |  26 | Authentication & Sessions                   |
|   — |  27 | Browser Authentication & OIDC               |
|   — |  28 | Security Hardening                          |
|  18 |  29 | Signals & Islands                           |
|  21 |  30 | Component Integration                       |
|   — |  31 | Micro Frontends with `@ndigo/host`          |
|  10 |  32 | Telemetry                                   |
|  26 |  33 | Management Endpoints                        |
|  28 |  34 | Feature Flags                               |
|  15 |  35 | Method Interception & Resilience            |
|  19 |  36 | Testing with `@ndigo/test`                  |
|  25 |  37 | The `ndigo` CLI                             |
|   — |  38 | Deployment & Production Readiness           |
|   — |  39 | Quality Guardrails                          |
|   — |  40 | Troubleshooting & FAQ                       |
|   — |  41 | Custom View Engines                         |
|   — |  42 | STOMP & Cross-Node Fan-Out                  |
|   — |  43 | Live Configuration, Secrets & Remote Config |
|   — |  44 | Accessibility                               |
|   — |  45 | Performance & Scaling                       |
|   — |  46 | Upgrading Ndigo                             |
|  12 |  90 | Package Documentation                       |
|  29 |  91 | Application Conventions                     |

## Notes

- The three guides that kept both number and slug are 01, 03, and 22.
- The old slugs are redirect stubs, not live guides. The guides index links only
  the new files.
- Guide titles were normalized to `# Guide NN — Title` during the move.
- Planned numbers are reserved for the M2–M5 batches of the guide overhaul; they
  have no file until the guide lands.
