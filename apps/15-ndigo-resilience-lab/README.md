# @ndigo/resilience-lab — Ndigo Resilience Lab

> Retry, backoff and circuit breaking, driven from a control plane that shows
> every attempt, failure and state transition.

A single Node process that plays both sides of a flaky dependency. One HTTP
surface is the **upstream**: its behaviour (`ok`, always-`error`, `fail=N` then
recover, an `F`/`S` outcome `pattern`, or extra `delay` latency) is set by the
lab's **control plane**. The other surface is the **consumer**: a typed
[`@ndigo/service`](../../packages/ndigo-service/README.md) client calling that
upstream with [`@ndigo/resilience`](../../packages/ndigo-resilience/README.md)
policies woven in through [`@ndigo/proxy`](../../packages/ndigo-proxy/README.md).
A third route runs the _same_ call with no policies at all, so policy-driven and
raw behaviour can be compared side by side.

The lab is deterministic on purpose: thresholds and windows are small, the
breaker's clock is injectable, and everything worth observing is reported as
JSON by `GET /lab/state` and as counters/gauges by `GET /metrics`.

## Run

```bash
cd apps/15-ndigo-resilience-lab && pnpm start
# listening on http://127.0.0.1:3080
```

Override the port with `PORT=<n> pnpm start` (the lab's consumer transport
follows the same `PORT`, so the loopback wiring stays correct).

The lab's own `GET /health` is the boot-smoke probe (`pnpm apps:smoke`).

## Endpoints

### Upstream — the controllable flaky dependency

```text
GET  /upstream/data                 the simulated response: 200 while the mode succeeds,
                                    otherwise its configured failure status
```

### Consumer — the typed `@ndigo/service` client

```text
GET  /consumer/data                 through @retry + @circuitBreaker
GET  /consumer/direct               the same call with no policies (bypass)
```

Success answers `200` with `{ ok: true, path, policy, upstreamAttempts, data }`,
where `upstreamAttempts` is how many requests the call actually sent upstream
(retries included).

Failures are RFC 9457 `application/problem+json` documents (AD-10) carrying the
same fields as extension members:

```text
502 { status, title: "Bad Gateway", detail, ok: false, path, policy,
      upstreamAttempts, failFast: false, error: { name, message } }
      — the upstream failed and retries were exhausted (on /consumer/direct: failed immediately)

503 { status, type: "urn:ndigo:service-unavailable", title: "Service Unavailable",
      ok: false, failFast: true, upstreamAttempts: 0,
      error: { name: "CircuitOpenError", message } }
      — the circuit was open: the call never reached the upstream
```

### Control plane — drive the lab, read it back

```text
POST /lab/mode    set the upstream behaviour (JSON body, query string, or both; body wins)
GET  /lab/state   the machine-readable lab state
POST /lab/clock   move the breaker clock: {"advanceMs":2000} or {"reset":true}
POST /lab/reset   upstream back to ok, counters zeroed, clock reset
```

`POST /lab/mode` fields (all optional; ranges are validated and rejected with
`400`):

| Field     | Meaning                                                    | Default |
| --------- | ---------------------------------------------------------- | ------- |
| `mode`    | `ok` \| `error` \| `fail` \| `pattern` \| `delay`          | `ok`    |
| `status`  | failure status for `error`/`fail`/`pattern` (400–599)      | `503`   |
| `count`   | `fail` mode: consecutive failures before recovery          | `0`     |
| `pattern` | `pattern` mode: the `F`/`S` cycle, e.g. `"FFS"`            | —       |
| `delayMs` | `delay` mode: latency applied before responding (0–30 000) | `0`     |

`GET /lab/state` (the shape is asserted field-by-field in the test lane):

```jsonc
{
    "clock": { "now": 1791386331219, "offsetMs": 2000, "iso": "…" },
    "upstream": {
        "mode": { "mode": "error", "status": 503, "count": 0, "pattern": "", "delayMs": 0 },
        "calls": 12,
        "failures": 9,
        "successes": 3,
        "lastStatus": 503,
        "remainingFailureBudget": 0,
        "patternIndex": 0,
    },
    "consumer": {
        "resilient": {
            "calls": 4,
            "successes": 1,
            "failures": 3,
            "failFast": 0,
            "upstreamAttempts": 12,
            "lastError": { "name": "IllegalStateError", "message": "…" },
        },
        "direct": {
            "calls": 0,
            "successes": 0,
            "failures": 0,
            "failFast": 0,
            "upstreamAttempts": 0,
            "lastError": null,
        },
    },
    "circuits": [
        {
            "method": "data",
            "state": "open",
            "failures": 0,
            "openedAt": 1791386331219,
            "remainingMs": 1492,
            "openCount": 1,
            "probeCount": 0,
        },
    ],
    "config": {
        "service": "upstream-lab",
        "upstreamOrigin": "http://upstream-lab.local",
        "retryAttempts": 3,
        "retryBackoff": "exponentialBackoff(initialMs=25, factor=2, maxMs=200)",
        "failureThreshold": 3,
        "resetMs": 1500,
    },
    "counters": { "upstream.calls": 12, "consumer.failFast": 1, "breaker.opened": 1, "…": 0 },
}
```

### Management — the same numbers, as health and metrics

```text
GET  /health     includes a `circuit-breakers` indicator: DOWN (503) while any circuit is open
GET  /metrics    feature `resilience-lab`: the counters above plus breaker gauges
```

`/health` returning `503` while a circuit is open is deliberate — a breaker that
is refusing calls is a degraded dependency, and the probe should see it. The
boot probe runs with every circuit closed, so it answers `200`.

## The wiring

```ts
// src/resilience-lab.ts
interceptMethods(serviceClient(UpstreamAPI, HTTP.create({ baseURL: UPSTREAM_ORIGIN, fetch: transport })), [
    breakerTracker,
    new CircuitBreakerInterceptor({ now }),
    new RetryInterceptor(),
]);
```

- **`@ndigo/proxy`** weaves the hand-built client (`interceptMethods`) — the
  service-layer registration path, since a `serviceClient` never enters the
  container. The array order is the composition AD-43 D-5 prescribes: the
  breaker _outside_ retry, so one chain pass counts one failure.
- **`@ndigo/resilience`** supplies `@retry({ attempts: 3, backoff: …. })` and
  `@circuitBreaker({ failureThreshold: 3, resetMs: 1500 })` on `data()`. The
  annotations are metadata-only; `direct()` carries just `@getCall`, so the
  weave leaves it as a target-bound pass-through.
- The breaker's `CircuitOpenError` stays the authority. `/lab/state.circuits`
  is a _projection_ maintained by the lab's own outermost interceptor
  (`src/breaker-state-tracker.ts`), mirroring the documented state machine —
  because `CircuitBreakerInterceptor` keeps its cells private. The tests assert
  both the projection and the real fail-fast error class.
- **The transport.** The consumer's service declares the logical origin
  `http://upstream-lab.local`; the lab's transport maps that onto its own
  loopback listener, so the typed client makes a real HTTP call to the same
  process. `ResilienceLab.setUpstreamFetch` swaps the transport for the
  in-process dispatcher in tests — the same seam, no socket.
- **The failure path is the documented one.** `HTTP.request` never throws a
  transport failure (it resolves `ResponseError` _values_), so the exception the
  policies observe is the service client's response-schema validation —
  `IllegalStateError` — exactly the boundary AD-43 D-8 records for v1. A failing
  upstream answers with an `{ error, … }` body, which the declared
  `responseSchema` rejects.
- **`@ndigo/management`** gets a custom `HealthIndicator` reading the breaker
  projection; **`@ndigo/telemetry`**'s `FeatureMetricAggregator` gets one counter
  per observed event plus breaker gauges, and `/metrics` serves them.
- **The clock.** `CircuitBreakerInterceptor({ now })` and the projection share
  `LabClock` (`Date.now()` + a control-plane offset), so `POST /lab/clock`
  moves the reset window instantly and the test lane never sleeps.

## Demonstrate it with curl

```bash
cd apps/15-ndigo-resilience-lab && pnpm start     # in one terminal
```

```bash
B=http://127.0.0.1:3080

# --- retry: two failures, then recovery on the third attempt -----------------
curl -s -X POST "$B/lab/mode?mode=fail&count=2" | jq -c '{applied}'
curl -s "$B/consumer/data" | jq -c '{ok, policy, upstreamAttempts, value: .data.value}'
curl -s "$B/lab/state" | jq -c '{upstreamCalls: .upstream.calls, consumer: .consumer.resilient, circuit: .circuits[0].state}'

# --- open the breaker: three failing chain passes, then fail fast -----------
curl -s -X POST "$B/lab/mode?mode=error" >/dev/null
for i in 1 2 3; do curl -s -o /dev/null -w "call $i -> %{http_code}\n" "$B/consumer/data"; done
curl -s "$B/consumer/data" | jq -c '{status, title, failFast, upstreamAttempts, error: .error.name}'
curl -s -o /dev/null -w 'health -> %{http_code}\n' "$B/health"

# --- the bypass route keeps talking to the upstream -------------------------
curl -s "$B/consumer/direct" | jq -c '{path, policy, upstreamAttempts, error: .error.name}'

# --- move the clock, then let one probe close the circuit -------------------
curl -s -X POST "$B/lab/clock" -H 'content-type: application/json' -d '{"advanceMs":2000}' >/dev/null
curl -s -X POST "$B/lab/mode?mode=ok" >/dev/null
curl -s "$B/consumer/data" | jq -c '{ok, upstreamAttempts}'
curl -s "$B/lab/state" | jq -c '{circuit: .circuits[0], closed: .counters["breaker.closed"]}'
curl -s -o /dev/null -w 'health -> %{http_code}\n' "$B/health"
```

The transcript below is that script, run against a real `pnpm start` process:

```console
$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3080/health   # boot probe
200

$ curl -s http://127.0.0.1:3080/health | jq -c '{status, breakers: .components["circuit-breakers"].status}'
{"status":"UP","breakers":"UP"}

$ curl -s -X POST 'http://127.0.0.1:3080/lab/mode?mode=fail&count=2' | jq -c '{applied}'
{"applied":{"mode":"fail","status":503,"count":2,"pattern":"","delayMs":0}}

$ curl -s http://127.0.0.1:3080/consumer/data | jq -c '{ok, policy, upstreamAttempts, value: .data.value}'
{"ok":true,"policy":"retry+circuitBreaker","upstreamAttempts":3,"value":"upstream-ok"}

$ curl -s http://127.0.0.1:3080/lab/state | jq -c '{upstreamCalls: .upstream.calls, upstreamFailures: .upstream.failures, consumer: .consumer.resilient, circuit: .circuits[0].state}'
{"upstreamCalls":3,"upstreamFailures":2,"consumer":{"calls":1,"successes":1,"failures":0,"failFast":0,"upstreamAttempts":3,"lastError":null},"circuit":"closed"}

$ curl -s -X POST 'http://127.0.0.1:3080/lab/mode?mode=error' >/dev/null   # now every call fails

$ for i in 1 2 3; do curl -s -o /dev/null -w "call $i -> %{http_code}\n" http://127.0.0.1:3080/consumer/data; done
call 1 -> 502
call 2 -> 502
call 3 -> 502

$ curl -s http://127.0.0.1:3080/lab/state | jq -c '{upstreamCalls: .upstream.calls, circuit: .circuits[0], consumer: .consumer.resilient}'
{"upstreamCalls":12,"circuit":{"method":"data","state":"open","failures":0,"openedAt":1791386410672,"remainingMs":1493,"openCount":1,"probeCount":0},"consumer":{"calls":4,"successes":1,"failures":3,"failFast":0,"upstreamAttempts":12,"lastError":{"name":"IllegalStateError","message":"Service 'upstream-lab' response validation failed: value: Invalid input: expected string, received undefined, servedAt: Invalid input: expected string, received undefined"}}}

$ curl -s -w '\n[%{http_code}]\n' http://127.0.0.1:3080/consumer/data   # fail fast, upstream untouched
{"status":503,"type":"urn:ndigo:service-unavailable","title":"Service Unavailable","detail":"circuit open for 'UpstreamAPI.data' — failing fast (reset in 1488 ms)","ok":false,"path":"resilient","policy":"retry+circuitBreaker","failFast":true,"upstreamAttempts":0,"error":{"name":"CircuitOpenError","message":"circuit open for 'UpstreamAPI.data' — failing fast (reset in 1488 ms)"}}
[503]

$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3080/health   # breaker open -> DOWN
503

$ curl -s http://127.0.0.1:3080/consumer/direct | jq -c '{path, policy, upstreamAttempts, error: .error.name}'   # bypass
{"path":"direct","policy":"none","upstreamAttempts":1,"error":"IllegalStateError"}

$ curl -s -X POST http://127.0.0.1:3080/lab/clock -H 'content-type: application/json' -d '{"advanceMs":2000}' | jq -c '{offsetMs: .clock.offsetMs, circuit: .circuits[0].state}'
{"offsetMs":2000,"circuit":"open"}

$ curl -s -X POST 'http://127.0.0.1:3080/lab/mode?mode=ok' >/dev/null

$ curl -s http://127.0.0.1:3080/consumer/data | jq -c '{ok, upstreamAttempts}'   # the single probe
{"ok":true,"upstreamAttempts":1}

$ curl -s http://127.0.0.1:3080/lab/state | jq -c '{circuit: .circuits[0], closed: .counters["breaker.closed"]}'
{"circuit":{"method":"data","state":"closed","failures":0,"openedAt":0,"remainingMs":0,"openCount":1,"probeCount":1},"closed":1}

$ curl -s -o /dev/null -w '%{http_code}\n' http://127.0.0.1:3080/health   # closed again -> UP
200

$ curl -s -X POST 'http://127.0.0.1:3080/lab/mode?mode=pattern&pattern=FFS' >/dev/null; for i in 1 2; do curl -s http://127.0.0.1:3080/consumer/data | jq -c '{ok, upstreamAttempts}'; done
{"ok":true,"upstreamAttempts":3}
{"ok":true,"upstreamAttempts":3}

$ curl -s -X POST 'http://127.0.0.1:3080/lab/mode?mode=delay&delayMs=250' >/dev/null; curl -s -o /dev/null -w 'ok in %{time_total}s\n' http://127.0.0.1:3080/consumer/data
ok in 0.252876s

$ curl -s http://127.0.0.1:3080/metrics | jq -c '.features["resilience-lab"] | {counters, gauges}'
{"counters":{"upstream.calls":21,"upstream.failures":16,"consumer.calls":9,"consumer.upstreamAttempts":20,"consumer.successes":5,"consumer.failures":4,"breaker.opened":1,"consumer.failFast":1,"consumer.direct.calls":1,"consumer.direct.upstreamAttempts":1,"consumer.direct.failures":1,"breaker.probes":1,"breaker.closed":1},"gauges":{"breaker.state.data":0,"breaker.open":0}}

$ curl -s -X POST http://127.0.0.1:3080/lab/reset | jq -c '{mode: .upstream.mode.mode, calls: .upstream.calls, offsetMs: .clock.offsetMs}'
{"mode":"ok","calls":0,"offsetMs":0}
```

Read the middle of that transcript top to bottom and the full cycle is visible:
two transient failures absorbed by retry (3 upstream attempts for one successful
call), three failing chain passes opening the circuit (`state: "open"`,
`openCount: 1`), a `503 CircuitOpenError` with `upstreamAttempts: 0` proving the
upstream was not touched, `/health` dropping to `503` with the circuit,
`/consumer/direct` still reaching the upstream while the advised route fails
fast, then the clock advance + `ok` mode turning the next call into the single
probe that closes the circuit (`probeCount: 1`, `breaker.closed: 1`, health back
to `200`). `/lab/reset` zeroes the counters but cannot close a circuit early —
that belongs to `CircuitBreakerInterceptor`.

## Demonstrates

- **`@ndigo/resilience`** — `@retry` with `exponentialBackoff`, and
  `@circuitBreaker` across the full cycle: closed → open (fail fast with
  `CircuitOpenError`) → half-open probe → closed, including a failed probe
  re-opening with a fresh window.
- **`@ndigo/proxy`** — `interceptMethods` weaving a hand-built
  `serviceClient`, with interceptor `order` deciding that the policy chain runs
  outermost-to-innermost (`tracker → circuitBreaker → retry → method`) and an
  unadvised sibling method staying a pass-through.
- **`@ndigo/service`** — a `@service`-decorated typed client with `@getCall`,
  a Zod `responseSchema`, and a path-slot-free `baseUrl`, driven by a
  per-method metadata contract.
- **`@ndigo/management`** — a custom `HealthIndicator` over breaker state and the
  aggregate `/health` status code; `/metrics` serving the live feature metrics.
- **`@ndigo/telemetry`** — `FeatureMetricAggregator` counters per
  attempt/success/failure/fail-fast/open/probe/close, breaker gauges, and
  per-path duration summaries.
- `@ndigo/platform-node` controllers (`@requestMapping`, `@getMapping`,
  `@postMapping`, `@parameters`, `queryValue`, `bodyValue`),
  `ResponseEntity`, and RFC 9457 problem documents with extension members.
- A lab-owned virtual clock (`{ now }`) that replaces sleeping in tests, and a
  transport seam that makes an in-process client/server boundary testable
  without a socket.

## Tests

```bash
pnpm --filter @ndigo/resilience-lab test
```

The `@ndigo/test` `MockHTTP` lane boots the real context once per test and drives
`/lab/*`, `/consumer/*`, `/health` and `/metrics` in-process. The consumer's
typed client is pointed at the same in-process dispatcher through
`ResilienceLab.setUpstreamFetch`, so a `/consumer/data` request really performs
the weave → HTTP → upstream → validation round trip. The cases cover:

| Case               | What it pins down                                                                       |
| ------------------ | --------------------------------------------------------------------------------------- |
| boot health        | `/health` `200` with the `circuit-breakers` component `UP`                              |
| upstream modes     | `ok` body, `error` problem document, `lastStatus`                                       |
| transient recovery | `fail=2` → `200` with `upstreamAttempts: 3`, circuit still closed                       |
| retry exhaustion   | `502`, `IllegalStateError` naming the validation failure, `upstreamAttempts: 3`         |
| breaker opens      | three failing passes → `open`, `breaker.opened: 1`, gauge `2`, `/health` `503`          |
| fail fast          | `503` `CircuitOpenError`, `upstreamAttempts: 0`, upstream counter unchanged             |
| reset window       | advancing half the window still fails fast                                              |
| probe closes       | clock advance + recovery → `200`, `probeCount: 1`, `breaker.closed: 1`, `/health` `200` |
| failed probe       | probe failure re-opens (`openCount: 2`) with a fresh window                             |
| direct bypass      | `policy: "none"`, one attempt, and the circuit stays open                               |
| pattern mode       | `FFFFS` → per-call attempts of 3 then 2, `patternIndex` advancing                       |
| metrics            | `/metrics` counters/gauges equal `/lab/state`'s numbers                                 |
| control plane      | invalid mode/count/pattern/clock all rejected with `400`                                |
| reset              | `/lab/reset` restores `ok`, zero counters and a zero clock offset                       |

No test sleeps: the breaker's reset window is crossed with
`POST /lab/clock`, and the retry backoff is 25 ms/50 ms.

## See Also

- [apps/README](../README.md) — the applications progression and the port registry
- [04-ndigo-api](../04-ndigo-api/README.md) — the canonical Node app reference (management wiring)
- [Guide 15 — Method Interception & Resilience](../../docs/guides/15-method-interception.md)
- [@ndigo/resilience](../../packages/ndigo-resilience/README.md) · [@ndigo/proxy](../../packages/ndigo-proxy/README.md) · [@ndigo/service](../../packages/ndigo-service/README.md) · [@ndigo/management](../../packages/ndigo-management/README.md)

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
