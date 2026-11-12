# Guide 38 — Deployment & Production Readiness

Deploying a Ndigo app is mostly assembly: build the packages and app, provide
configuration and secrets, choose a process model, expose the health surface,
and make shutdown orderly. The framework deliberately keeps the runtime thin —
no hidden daemon, no required orchestrator — so the checklist is explicit.

This guide collects the production decisions that are otherwise spread across
the clustering, management, telemetry, TLS, and static-file guides.

**Audience:** Node application developers and operators · **Prerequisites:** Guides [01](01-building-a-node-api.md), [24](24-distributed-locks.md), [33](33-management-endpoints.md), and [37](37-ndigo-cli.md) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api), [apps/16-ndigo-redis-fanout](https://github.com/ndigo/ndigo/tree/main/apps/16-ndigo-redis-fanout)

## What you'll learn

- Build and start an app with the CLI or its own scripts.
- Provide environment, profiles, and secrets without baking them in.
- Choose single-process vs clustered deployment and know what changes.
- Shut down without dropping in-flight work.
- Expose health, metrics, logs, and traces to the platform.
- Terminate TLS at the edge and verify the proxy/static posture.

## 1. Build and start

The standard lifecycle is build, then serve:

```bash
pnpm install --frozen-lockfile
pnpm build                     # packages and app build targets
ndigo serve ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api) --port 3000
```

`ndigo serve` runs the app's `start` script under the supervisor (guide 37);
`ndigo dev` is the watch mode. A plain `node`/`tsx` start command is equally
valid when you do not need the supervisor. Build artifacts belong in the image
or release bundle; do not ship `node_modules` from a dev install.

The app's `package.json` `start` script should bind the port from the
environment (`PORT`) and import the built entry, not a TypeScript source file.
Set `NODE_ENV=production` and a real `NODE_OPTIONS` memory limit per slot.

## 2. Configuration and secrets

Configuration is resolved from the environment chain (guide 03): CLI args,
builder properties, `process.env`, config files, `configServer`, defaults.
Production rules:

- **Profiles** — activate `prod` explicitly (`NDIGO_PROFILES_ACTIVE=prod` or
  `--profiles.active prod`); do not rely on a default profile for production values.
- **One source of truth per key** — a config file for stable defaults, the
  environment for deploy-specific values, a config server for fleet-wide live
  values.
- **Secrets** — use `{cipher:...}` values and deliver `NDIGO_SECRET_KEY` from
  the platform's secret store, never the repo, image, or logs. A missing key
  fails at lookup, not silently.
- **Validation** — declare `@environment` schemas so a missing/malformed key
  fails at boot, before the port binds.
- **Live refresh** — `@refreshScope` rebuilds configuration-derived clients
  after `config:refresh`; verify the remote source's ETag/poll behavior before
  relying on it.

## 3. Process model

Start with one process per container/pod. For more cores or a single-host
deploy, the cluster supervisor replicates worker slots:

```bash
ndigo serve ./[apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api) --port 3000 --cluster 4
```

Each slot gets `NDIGO_CLUSTER_SLOT`, `NDIGO_CLUSTER_SIZE`, and
`PORT = base + slot` (guide 25). The supervisor relays `SIGINT`/`SIGTERM` into
each child's own graceful shutdown and restarts crashed slots with bounded
backoff; a crash loop fails closed instead of flapping forever (guide 24).

What changes under clustering:

- **In-process state is per slot.** Caches, rate-limit counters, and schedulers
  multiply unless you use the shared drivers (Guides [19](19-caching.md), [22](22-jobs-and-outbox.md), [23](23-scheduling.md), [28](28-security-hardening.md)).
- **Scheduled work needs single-executor arbitration** — `@scheduled({ lock })`
  or a cluster-wide leader; otherwise every slot runs the task.
- **WebSocket fan-out needs the Redis pub/sub bridge** when clients may land on
  different slots (guide 15).
- **Health probes** must target a single slot (the supervisor's port mapping)
  or the platform's load balancer, not an arbitrary child.

## 4. Graceful shutdown

The canonical order is stop serving, drain producers, close consumers/
transports, then close the context (guide 04 and
[Lifecycle & Ownership](../architecture/lifecycle-and-ownership.md)):

1. Stop accepting new requests (server stop).
2. `registry.close` / broker close — unsubscribe, stop heartbeat, drop
   sessions.
3. `fanout.close` / publisher close by its owner.
4. `context.close` — lifecycle `stop` in descending phase order, then entry
   `destroy`/`close`.

`createNodeApplication` and `ndigo serve` install the `SIGINT`/`SIGTERM` handler;
a second signal, a throwing close, or a teardown past `timeoutMs` (default 10s)
force-exits non-zero. Set the platform's termination grace period above your
drain time. A clustered supervisor waits for children and reaps stragglers.

## 5. Health, metrics, and traces

Expose the management surface deliberately (guide 33):

- `GET /health` — liveness/readiness groups; use a component check for the
  database/Redis when the app cannot serve without it.
- `GET /metrics` — the meter snapshot (Prometheus text if configured); scrape
  it from the platform, not the public internet.
- `GET /loggers`, `/env`, `/configprops` — opt-in operational reads; guard them
  or keep them off the public listener.
- **Probes** — point readiness at `/health/readiness` (or the group that
  includes dependencies) and liveness at a cheap `/health/liveness`.
- **Telemetry** — export traces/metrics/logs (guide 32); correlate request,
  job, and scheduled-task spans; flush on shutdown.

Do not expose the management surface on the same public listener without a
guard. If the platform supports a separate management port, prefer it.

## 6. TLS and the edge

Terminate TLS at the edge (load balancer, reverse proxy, or the Node server
itself). For the Node listener, provide the key and certificate together:

```bash
NDIGO_TLS_KEY=/run/secrets/tls.key
NDIGO_TLS_CERT=/run/secrets/tls.crt
NDIGO_TLS_CA=/run/secrets/ca.crt   # optional client/chain CA
```

The server starts an HTTP/2 secure listener with `allowHTTP1` fallback; HTTP/3
stays at the edge . A half-configured TLS pair fails at startup
rather than silently serving plaintext.

Behind a proxy, configure `trustedProxies` (guide 28) so rate limiting,
sessions, and `remoteAddress` see the real client. Forward `X-Forwarded-For`
and `X-Forwarded-Proto`; keep the proxy's hop count minimal.

## 7. Static assets and caching

- Serve precompressed twins (`.br`/`.gz`) with `Vary: Accept-Encoding`; the
  static handler negotiates them (guide 10).
- Give hashed assets a long `Cache-Control` and HTML a short/no-cache policy.
- Use a CDN in front of static assets when the app is multi-region; the
  framework's ETag/Range semantics survive a caching proxy.
- Do not serve user-uploaded files from the app's source tree; use a dedicated
  root or object storage.
- SPA history fallback belongs at the edge or the static controller, not in a
  catch-all controller that shadows 404s.

## 8. Production checklist

- [ ] `pnpm install --frozen-lockfile && pnpm build` in the release lane.
- [ ] `NODE_ENV=production`, `PORT`, memory limit, and log destination set.
- [ ] `NDIGO_PROFILES_ACTIVE=prod`, config validated at boot, secrets from the platform.
- [ ] Process model chosen; shared cache/locks/jobs/fan-out wired if clustered.
- [ ] Graceful shutdown timeout < platform termination grace period.
- [ ] `/health` readiness includes dependencies; probes configured.
- [ ] `/metrics`, `/loggers`, `/env`, `/configprops` guarded or not exposed.
- [ ] TLS at the edge or `NDIGO_TLS_*` on the listener; trusted proxies set.
- [ ] Static assets cached/precompressed; uploads on a durable volume.
- [ ] Rate limits, CORS, CSRF, and security headers verified in the deployed
      origin (guide 28).
- [ ] A rollback path exists (previous image + migration compatibility).

## 9. Pitfalls

- **A dev server in production.** `tsx src/index.ts` is fine for a demo, not a
  release; build and run the output.
- **Secrets in the image.** `{cipher:...}` values are safe; the key is not.
- **No readiness dependency check.** A pod that accepts traffic before the
  database is ready returns 500s instead of waiting.
- **Cluster without shared state.** In-memory caches/locks/rate limits multiply
  per slot.
- **Killing before draining.** A short termination grace period truncates
  in-flight requests; set it above the shutdown timeout.
- **Trusting every proxy.** Configure the exact networks (guide 28).

## See also

- [Guide 03 — Environment & Configuration](03-environment-configuration.md) — the boot-time pipeline
- [Guide 43 — Live Configuration, Secrets & Remote Config](43-live-configuration-and-secrets.md) — refresh, secrets, remote config
- [Guide 04 — Dependency Injection, Scopes & Lifecycle](04-dependency-injection-and-lifecycle.md) — shutdown hooks
- [Guide 24 — Distributed Locks](24-distributed-locks.md) — single-executor work across slots
- [Guide 25 — Clustering](25-clustering.md) — the supervisor and worker slots
- [Guide 32 — Telemetry](32-telemetry.md) — traces, metrics, logs
- [Guide 46 — Upgrading Ndigo](46-upgrading.md) — release/rollback migration path
- [Guide 45 — Performance & Scaling](45-performance-and-scaling.md) — budgets and load
- [Guide 33 — Management Endpoints](33-management-endpoints.md) — health and metrics
- [Guide 37 — The `ndigo` CLI](37-ndigo-cli.md) — `serve`, `build`, `dev`
- [Security Architecture](../architecture/security.md) — trust boundaries
- , , and — cluster, edge, and HTTP/2 decisions
